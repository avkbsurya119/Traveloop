import { Router } from 'express';
import prisma from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import { uploadDocument } from '../config/multer.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import { uploadRateLimiter } from '../middleware/security.js';

const router = Router();

/**
 * @swagger
 * /trips/{tripId}/documents:
 *   get:
 *     summary: Get all documents for a trip
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of documents
 */
router.get('/trips/:tripId/documents', authenticate, async (req, res, next) => {
  try {
    const { tripId } = req.params;

    // Check trip access
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        OR: [
          { userId: req.user.id },
          { collaborators: { some: { userId: req.user.id } } }
        ]
      }
    });

    if (!trip) return res.status(404).json({ error: 'Trip not found or access denied' });

    const documents = await prisma.tripDocument.findMany({
      where: { tripId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(documents);
  } catch (error) { next(error); }
});

/**
 * @swagger
 * /trips/{tripId}/documents:
 *   post:
 *     summary: Upload a document to a trip
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               type:
 *                 type: string
 *                 enum: [passport, visa, ticket, hotel_confirmation, insurance, other]
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Document uploaded
 */
router.post('/trips/:tripId/documents', authenticate, uploadRateLimiter, uploadDocument.single('file'), async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { type = 'other', name } = req.body;

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // Check trip access (owner or editor)
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        OR: [
          { userId: req.user.id },
          { collaborators: { some: { userId: req.user.id, role: { in: ['editor', 'admin'] } } } }
        ]
      }
    });

    if (!trip) return res.status(404).json({ error: 'Trip not found or access denied' });

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: `traveloop/trips/${tripId}/documents`,
      resource_type: 'auto'
    });

    const document = await prisma.tripDocument.create({
      data: {
        tripId,
        userId: req.user.id,
        type,
        name: name || req.file.originalname,
        url: result.secure_url,
        cloudinaryId: result.public_id,
        size: req.file.size,
        mimeType: req.file.mimetype
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } }
      }
    });

    res.status(201).json(document);
  } catch (error) { next(error); }
});

/**
 * @swagger
 * /documents/{id}:
 *   delete:
 *     summary: Delete a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document deleted
 */
router.delete('/documents/:id', authenticate, async (req, res, next) => {
  try {
    const document = await prisma.tripDocument.findUnique({
      where: { id: req.params.id },
      include: { trip: { select: { userId: true } } }
    });

    if (!document) return res.status(404).json({ error: 'Document not found' });

    // Only document uploader or trip owner can delete
    if (document.userId !== req.user.id && document.trip.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this document' });
    }

    // Delete from Cloudinary
    if (document.cloudinaryId) {
      await deleteFromCloudinary(document.cloudinaryId).catch(() => {});
    }

    await prisma.tripDocument.delete({ where: { id: req.params.id } });

    res.json({ message: 'Document deleted' });
  } catch (error) { next(error); }
});

/**
 * @swagger
 * /documents/{id}:
 *   patch:
 *     summary: Update document metadata
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/documents/:id', authenticate, async (req, res, next) => {
  try {
    const { name, type } = req.body;

    const document = await prisma.tripDocument.findUnique({
      where: { id: req.params.id },
      include: { trip: { select: { userId: true } } }
    });

    if (!document) return res.status(404).json({ error: 'Document not found' });

    if (document.userId !== req.user.id && document.trip.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.tripDocument.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(type && { type })
      }
    });

    res.json(updated);
  } catch (error) { next(error); }
});

export default router;

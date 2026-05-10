import { useState, useEffect } from 'react'
import { Card, CardTitle, CardContent } from '../common/Card'
import { Button } from '../common/Button'
import { Modal, ModalContent } from '../common/Modal'
import { Skeleton } from '../common/Skeleton'
import { toast } from '../common/Toast'
import { documentsApi } from '../../api/documents'
import DocumentUploader from './DocumentUploader'
import {
  FileText, Image, File, Trash2, Download, Plus,
  Passport, Plane, Hotel, Shield, MoreHorizontal
} from 'lucide-react'
import { format } from 'date-fns'

const TYPE_ICONS = {
  passport: Passport,
  visa: FileText,
  ticket: Plane,
  hotel_confirmation: Hotel,
  insurance: Shield,
  other: File
}

const TYPE_COLORS = {
  passport: 'text-blue-400 bg-blue-500/10',
  visa: 'text-purple-400 bg-purple-500/10',
  ticket: 'text-emerald-400 bg-emerald-500/10',
  hotel_confirmation: 'text-orange-400 bg-orange-500/10',
  insurance: 'text-red-400 bg-red-500/10',
  other: 'text-gray-400 bg-gray-500/10'
}

const TYPE_LABELS = {
  passport: 'Passport',
  visa: 'Visa',
  ticket: 'Ticket',
  hotel_confirmation: 'Hotel',
  insurance: 'Insurance',
  other: 'Other'
}

export default function DocumentList({ tripId }) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const { data } = await documentsApi.getByTrip(tripId)
      setDocuments(data)
    } catch (err) {
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [tripId])

  const handleDelete = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    setDeletingId(docId)
    try {
      await documentsApi.delete(docId)
      setDocuments(documents.filter(d => d.id !== docId))
      toast.success('Document deleted')
    } catch (err) {
      toast.error('Failed to delete document')
    } finally {
      setDeletingId(null)
    }
  }

  const handleUploadComplete = (newDoc) => {
    setDocuments([newDoc, ...documents])
    setUploadModalOpen(false)
  }

  const getFileIcon = (doc) => {
    if (doc.mimeType?.startsWith('image/')) {
      return Image
    }
    return TYPE_ICONS[doc.type] || File
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }

  // Group documents by type
  const groupedDocs = documents.reduce((acc, doc) => {
    const type = doc.type || 'other'
    if (!acc[type]) acc[type] = []
    acc[type].push(doc)
    return acc
  }, {})

  if (loading) {
    return (
      <Card>
        <CardTitle className="mb-4">Documents</CardTitle>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Documents</CardTitle>
          <Button size="sm" onClick={() => setUploadModalOpen(true)}>
            <Plus size={16} className="mr-1" />
            Add
          </Button>
        </div>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-10">
              <FileText size={48} className="mx-auto text-muted mb-3" />
              <p className="text-white font-medium">No documents yet</p>
              <p className="text-muted text-sm mt-1">
                Upload passports, tickets, confirmations, and more
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={() => setUploadModalOpen(true)}
              >
                <Plus size={16} className="mr-1" />
                Upload First Document
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedDocs).map(([type, docs]) => {
                const Icon = TYPE_ICONS[type] || File
                return (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`p-1.5 rounded-lg ${TYPE_COLORS[type]}`}>
                        <Icon size={16} />
                      </div>
                      <span className="text-sm font-medium text-white">
                        {TYPE_LABELS[type]}
                      </span>
                      <span className="text-xs text-muted">({docs.length})</span>
                    </div>
                    <div className="space-y-2">
                      {docs.map(doc => {
                        const FileIcon = getFileIcon(doc)
                        return (
                          <div
                            key={doc.id}
                            className="flex items-center gap-3 p-3 bg-dark rounded-xl border border-border hover:border-primary/30 transition-colors group"
                          >
                            {doc.mimeType?.startsWith('image/') ? (
                              <img
                                src={doc.url}
                                alt={doc.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className={`p-2 rounded-lg ${TYPE_COLORS[doc.type]}`}>
                                <FileIcon size={20} />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">
                                {doc.name}
                              </p>
                              <p className="text-muted text-xs">
                                {formatFileSize(doc.size)} • {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                              </p>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 hover:bg-surface rounded-lg text-muted hover:text-white transition-colors"
                              >
                                <Download size={16} />
                              </a>
                              <button
                                onClick={() => handleDelete(doc.id)}
                                disabled={deletingId === doc.id}
                                className="p-2 hover:bg-danger/20 rounded-lg text-muted hover:text-danger transition-colors disabled:opacity-50"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <ModalContent title="Upload Document" description="Add a document to your trip">
          <DocumentUploader tripId={tripId} onUploadComplete={handleUploadComplete} />
        </ModalContent>
      </Modal>
    </>
  )
}

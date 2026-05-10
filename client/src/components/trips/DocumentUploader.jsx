import { useState, useRef } from 'react'
import { Button } from '../common/Button'
import { toast } from '../common/Toast'
import { documentsApi } from '../../api/documents'
import { Upload, FileText, X } from 'lucide-react'

const DOCUMENT_TYPES = [
  { value: 'passport', label: 'Passport' },
  { value: 'visa', label: 'Visa' },
  { value: 'ticket', label: 'Ticket' },
  { value: 'hotel_confirmation', label: 'Hotel Confirmation' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'other', label: 'Other' }
]

export default function DocumentUploader({ tripId, onUploadComplete }) {
  const [file, setFile] = useState(null)
  const [type, setType] = useState('other')
  const [name, setName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFile = (f) => {
    if (f.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }
    setFile(f)
    if (!name) setName(f.name)
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file')
      return
    }

    setUploading(true)
    try {
      const { data } = await documentsApi.upload(tripId, file, type, name)
      toast.success('Document uploaded successfully')
      setFile(null)
      setName('')
      setType('other')
      onUploadComplete?.(data)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const clearFile = () => {
    setFile(null)
    setName('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="space-y-4">
      {/* Drag and drop zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
          ${dragActive
            ? 'border-primary bg-primary/10'
            : 'border-border hover:border-primary/50 hover:bg-dark/50'
          }
          ${file ? 'border-success bg-success/10' : ''}
        `}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
        />

        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="w-10 h-10 text-success" />
            <div className="text-left">
              <p className="text-white font-medium truncate max-w-xs">{file.name}</p>
              <p className="text-muted text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); clearFile() }}
              className="p-1 hover:bg-dark rounded-lg text-muted hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <>
            <Upload className="w-12 h-12 text-muted mx-auto mb-3" />
            <p className="text-white font-medium">Drag & drop a file here</p>
            <p className="text-muted text-sm mt-1">or click to browse</p>
            <p className="text-muted text-xs mt-2">PDF, DOC, DOCX, JPG, PNG (max 10MB)</p>
          </>
        )}
      </div>

      {file && (
        <>
          {/* Document type */}
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1">
              Document Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2.5 bg-dark border border-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/60"
            >
              {DOCUMENT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Document name */}
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1">
              Document Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter document name"
              className="w-full px-4 py-2.5 bg-dark border border-border rounded-xl text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/60"
            />
          </div>

          {/* Upload button */}
          <Button onClick={handleUpload} isLoading={uploading} className="w-full">
            <Upload size={16} className="mr-2" />
            Upload Document
          </Button>
        </>
      )}
    </div>
  )
}

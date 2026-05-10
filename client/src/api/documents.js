import client from './client'

export const documentsApi = {
  getByTrip: (tripId) => client.get(`/trips/${tripId}/documents`),

  upload: (tripId, file, type = 'other', name) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    if (name) formData.append('name', name)

    return client.post(`/trips/${tripId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  delete: (documentId) => client.delete(`/documents/${documentId}`),

  update: (documentId, data) => client.patch(`/documents/${documentId}`, data),
}

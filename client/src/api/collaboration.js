import client from './client'

export const collaborationApi = {
  getCollaborators: (tripId) => client.get(`/trips/${tripId}/collaborators`),

  inviteCollaborator: (tripId, email, role = 'viewer') =>
    client.post(`/trips/${tripId}/collaborators`, { email, role }),

  updateRole: (tripId, userId, role) =>
    client.patch(`/trips/${tripId}/collaborators/${userId}`, { role }),

  removeCollaborator: (tripId, userId) =>
    client.delete(`/trips/${tripId}/collaborators/${userId}`),

  getEditHistory: (tripId, limit = 50, offset = 0) =>
    client.get(`/trips/${tripId}/history?limit=${limit}&offset=${offset}`),
}

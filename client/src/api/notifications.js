import client from './client'

export const notificationsApi = {
  getAll: () => client.get('/notifications'),
}

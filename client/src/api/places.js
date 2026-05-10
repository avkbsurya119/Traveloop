import client from './client'

export const placesApi = {
  citySearch: (q) => client.get('/places/city-search', { params: { q } }),
  getAttractions: (lat, lon, city) => client.get('/places/attractions', { params: { lat, lon, city } }),
}

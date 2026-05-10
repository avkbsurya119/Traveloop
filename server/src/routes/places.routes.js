import { Router } from 'express';

const router = Router();

const NOMINATIM_UA = 'Traveloop/1.0 (contact@traveloop.app)';

// Cache to respect Nominatim 1 req/sec limit
const cache = new Map();
function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < 300_000) return entry.data; // 5 min TTL
  return null;
}
function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

// GET /api/places/city-search?q=Tokyo
router.get('/city-search', async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) return res.json([]);

  const key = `city:${q.toLowerCase().trim()}`;
  const cached = getCached(key);
  if (cached) return res.json(cached);

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=1&accept-language=en`;
    const resp = await fetch(url, {
      headers: { 'User-Agent': NOMINATIM_UA },
    });
    if (!resp.ok) return res.json([]);
    const raw = await resp.json();

    const cities = raw
      .filter(item =>
        ['city', 'town', 'municipality', 'administrative', 'village', 'suburb', 'region'].includes(item.type) ||
        item.class === 'place' || item.class === 'boundary'
      )
      .map(item => {
        const name = item.name || item.display_name.split(',')[0].trim();
        const country = item.address?.country || '';
        return {
          id: `ext_${item.place_id}`,
          name,
          country,
          state: item.address?.state || item.address?.county || '',
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          displayName: item.display_name,
          // Picsum gives a consistent image per city name (free, no key)
          imageUrl: `https://picsum.photos/seed/${encodeURIComponent(name)}/600/400`,
          isExternal: true,
        };
      });

    setCache(key, cities);
    res.json(cities);
  } catch {
    res.json([]);
  }
});

// GET /api/places/attractions?lat=35.68&lon=139.69&city=Tokyo
router.get('/attractions', async (req, res) => {
  const { lat, lon, city } = req.query;
  if (!lat || !lon) return res.json([]);

  const key = `att:${parseFloat(lat).toFixed(2)},${parseFloat(lon).toFixed(2)}`;
  const cached = getCached(key);
  if (cached) return res.json(cached);

  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lon}&gsradius=15000&gslimit=40&format=json`;
    const resp = await fetch(url, {
      headers: { 'User-Agent': NOMINATIM_UA },
    });
    if (!resp.ok) return res.json([]);
    const data = await resp.json();

    const places = (data?.query?.geosearch || []).map(p => ({
      id: `wiki_${p.pageid}`,
      name: p.title,
      lat: p.lat,
      lon: p.lon,
      dist: Math.round(p.dist),
      wikiUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(p.title)}`,
    }));

    setCache(key, places);
    res.json(places);
  } catch {
    res.json([]);
  }
});

export default router;

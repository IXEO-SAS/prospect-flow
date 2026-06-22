// Haversine formula pour calculer distance entre deux points
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Géocodage via Nominatim (OpenStreetMap) - GRATUIT
export const geocodeAddress = async (address) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
      { headers: { 'User-Agent': 'Prospect-App' } }
    );
    const results = await response.json();
    
    if (results.length > 0) {
      return {
        lat: parseFloat(results[0].lat),
        lon: parseFloat(results[0].lon),
        address: results[0].display_name,
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// Batch géocodage avec rate limiting (max 1 req/sec)
export const geocodeBatch = async (addresses, onProgress) => {
  const results = [];
  for (let i = 0; i < addresses.length; i++) {
    const geo = await geocodeAddress(addresses[i]);
    results.push(geo);
    if (onProgress) onProgress((i + 1) / addresses.length);
    // Rate limiting Nominatim: 1 req/sec
    if (i < addresses.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1100));
    }
  }
  return results;
};

// Parser d'adresse simple (extrait CP et ville)
export const parseAddress = (fullAddress) => {
  // Format typique: "123 Rue X, 75001 Paris"
  const codePostalMatch = fullAddress.match(/\b(\d{5})\b/);
  const codePosta = codePostalMatch ? codePostalMatch[1] : '';
  
  // Ville = dernier mot après CP
  const parts = fullAddress.split(',');
  const ville = parts[parts.length - 1]?.trim() || '';
  
  return { codePosta, ville };
};

// Contacts dans un rayon
export const getContactsInRadius = (contacts, centerLat, centerLon, radiusKm) => {
  return contacts
    .map(contact => ({
      ...contact,
      distance: calculateDistance(centerLat, centerLon, contact.lat, contact.lon),
    }))
    .filter(contact => contact.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
};

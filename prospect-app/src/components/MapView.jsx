import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapView({ contacts, onSelectContact }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Créer la carte
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([46.2276, 2.2137], 6); // Centre France
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(mapInstance.current);
    }

    const map = mapInstance.current;

    // Nettoyer les marqueurs précédents
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];

    // Ajouter les marqueurs
    const contactsWithGeo = contacts.filter(c => c.lat && c.lon);
    
    if (contactsWithGeo.length === 0) return;

    contactsWithGeo.forEach(contact => {
      const statusColors = {
        new: '#ef4444', // red
        contacted: '#f59e0b', // yellow
        action: '#10b981', // green
      };

      const color = statusColors[contact.status] || '#8b5cf6';

      // Custom icon
      const html = `
        <div style="
          width: 32px;
          height: 32px;
          background-color: ${color};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          cursor: pointer;
        " title="${contact.raisonSociale}">
          <span style="font-size: 14px; font-weight: bold; color: white;">📌</span>
        </div>
      `;

      const icon = L.divIcon({
        html,
        iconSize: [32, 32],
        className: '',
      });

      const marker = L.marker([contact.lat, contact.lon], { icon })
        .bindPopup(`
          <div style="max-width: 250px;">
            <p style="font-weight: bold; margin: 0 0 8px 0;">${contact.raisonSociale}</p>
            <p style="margin: 0 0 4px 0; font-size: 12px;">${contact.dirigeant}</p>
            <p style="margin: 0 0 4px 0; font-size: 12px;">${contact.adresse}</p>
            ${contact.telephone ? `<p style="margin: 0 0 8px 0; font-size: 12px;">📞 ${contact.telephone}</p>` : ''}
            <button onclick="window.openContactDetail('${contact.id}')" style="
              width: 100%;
              padding: 6px;
              background-color: #8b5cf6;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-weight: bold;
              font-size: 12px;
            ">Ouvrir fiche</button>
          </div>
        `)
        .addTo(map);

      markersRef.current.push(marker);

      marker.on('click', () => {
        onSelectContact(contact);
      });
    });

    // Adapter la vue aux marqueurs
    if (contactsWithGeo.length > 0) {
      const group = new L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [contacts, onSelectContact]);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '600px',
        }}
      />
      <style>{`
        .leaflet-popup {
          z-index: 9999 !important;
        }
        .leaflet-popup-content-wrapper {
          z-index: 9999 !important;
        }
        .leaflet-popup-tip {
          z-index: 9999 !important;
        }
      `}</style>
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#ef4444' }}></div>
            <span>Non contacté ({contacts.filter(c => c.status === 'new').length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#f59e0b' }}></div>
            <span>Contacté ({contacts.filter(c => c.status === 'contacted').length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#10b981' }}></div>
            <span>Action ({contacts.filter(c => c.status === 'action').length})</span>
          </div>
        </div>
      </div>
    </div>
  );
}

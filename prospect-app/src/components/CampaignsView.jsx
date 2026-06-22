import React, { useState, useMemo } from 'react';
import { useProspectStore } from '../store';
import { MapPin, CheckCircle, ChevronDown } from 'lucide-react';

export default function CampaignsView({ onSelectContact }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' ou 'desc'
  
  const campaigns = useProspectStore(s => s.campaigns);
  const currentUser = useProspectStore(s => s.currentUser);
  const contacts = useProspectStore(s => s.contacts);
  const updateCampaign = useProspectStore(s => s.updateCampaign);

  // Campagnes du commercial
  const userCampaigns = campaigns.filter(c => c.commercialId === currentUser?.id);

  // Campagnes filtrées et triées
  const filteredAndSortedCampaigns = useMemo(() => {
    let filtered = userCampaigns.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.startContactId && contacts.find(ct => ct.id === c.startContactId)?.raisonSociale.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Trier par date de création
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [userCampaigns, searchQuery, sortOrder, contacts]);

  if (userCampaigns.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Aucune campagne lancée</p>
        <p className="text-sm text-gray-400 mt-1">Créez une nouvelle campagne pour commencer</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Contrôles : Recherche et Tri */}
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs text-gray-600 font-semibold mb-1">🔍 Rechercher</label>
          <input
            type="text"
            placeholder="Nom de campagne ou contact de départ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 font-semibold mb-1">Trier par date</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 bg-white"
          >
            <option value="desc">📅 Plus récentes</option>
            <option value="asc">📅 Plus anciennes</option>
          </select>
        </div>
      </div>

      {/* Message si aucun résultat de recherche */}
      {filteredAndSortedCampaigns.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500">Aucune campagne ne correspond à votre recherche</p>
        </div>
      ) : (
        filteredAndSortedCampaigns.map(campaign => {
        const startContact = contacts.find(c => c.id === campaign.startContactId);
        const campaignContacts = campaign.contacts.length;
        const createdDate = new Date(campaign.createdAt);
        const formattedDate = createdDate.toLocaleDateString('fr-FR');
        const formattedTime = createdDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        return (
          <div key={campaign.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition">
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {campaign.name || `Campagne du ${formattedDate}`}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    📅 Créée le {formattedDate} à {formattedTime}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span>📍 {campaign.radius} km</span>
                    <span>🎯 {campaignContacts} contacts</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      campaign.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : campaign.status === 'paused'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {campaign.status === 'active' ? '🟢 Active' : campaign.status === 'paused' ? '⏸️ Pausée' : '✅ Complétée'}
                    </span>
                  </div>
                </div>
              </div>

              {startContact && (
                <div className="bg-gray-50 p-3 rounded-lg mb-3 text-sm">
                  <p className="text-gray-600">
                    <strong>Point de départ :</strong> {startContact.raisonSociale}
                  </p>
                </div>
              )}

              <div className="space-y-2 max-h-48 overflow-auto">
                {campaign.contacts.map((ct, idx) => {
                  const contact = contacts.find(c => c.id === ct.id);
                  if (!contact) return null;
                  return (
                    <div
                      key={ct.id}
                      onClick={() => onSelectContact && onSelectContact(contact)}
                      className="flex items-center justify-between text-sm py-2 px-3 bg-gray-50 rounded cursor-pointer hover:bg-primary-50 hover:border-l-4 hover:border-l-primary-500 transition"
                    >
                      <div>
                        <p className="font-semibold text-gray-700">
                          {idx + 1}. {contact.raisonSociale}
                        </p>
                        <p className="text-xs text-gray-500">
                          {ct.distance.toFixed(1)} km • {contact.libelleNaf}
                        </p>
                      </div>
                      {contact.status === 'action' && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex gap-2">
                {campaign.status === 'active' && (
                  <button
                    onClick={() => updateCampaign(campaign.id, { status: 'paused' })}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition text-sm font-semibold"
                  >
                    ⏸️ Mettre en pause
                  </button>
                )}
                {campaign.status === 'paused' && (
                  <button
                    onClick={() => updateCampaign(campaign.id, { status: 'active' })}
                    className="flex-1 bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition text-sm font-semibold"
                  >
                    ▶️ Reprendre
                  </button>
                )}
              </div>
            </div>
          </div>
        );
        })
      )}
    </div>
  );
}

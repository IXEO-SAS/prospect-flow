import React from 'react';
import { X, MapPin, Users } from 'lucide-react';
import { useProspectStore } from '../store';

export default function CampaignDetail({ campaign, onClose }) {
  const contacts = useProspectStore(s => s.contacts);
  const users = useProspectStore(s => s.users);

  // Récupérer tous les contacts de la campagne
  const campaignContacts = campaign.contacts
    .map(cc => {
      const contact = contacts.find(c => c.id === cc.id);
      return {
        ...contact,
        distance: cc.distance || 0,
      };
    })
    .filter(c => c);

  // Commercial responsable
  const commercial = users.find(u => u.id === campaign.commercialId);

  // Statistiques
  const stats = {
    total: campaignContacts.length,
    new: campaignContacts.filter(c => c.status === 'new').length,
    contacted: campaignContacts.filter(c => c.status === 'contacted').length,
    action: campaignContacts.filter(c => c.status === 'action').length,
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[10000]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-nocr text-white p-6 flex justify-between items-start sticky top-0">
          <div>
            <h2 className="text-2xl font-bold">{campaign.name}</h2>
            <p className="text-sm text-white/80 mt-2">
              📍 Rayon : {campaign.radius} km • Commercial : {commercial?.name || 'N/A'}
            </p>
            <p className="text-sm text-white/80">
              Statut : {campaign.status === 'active' ? '🟢 Actif' : '⏸️ Pausé'}
            </p>
          </div>
          <button onClick={onClose} className="text-white hover:opacity-80">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 p-4 bg-gray-50 border-b border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-600">Contacts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-500">{stats.new}</p>
            <p className="text-xs text-gray-600">Non contactés</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-500">{stats.contacted}</p>
            <p className="text-xs text-gray-600">Contactés</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">{stats.action}</p>
            <p className="text-xs text-gray-600">En action</p>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {campaignContacts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun contact dans cette campagne</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 text-lg mb-4">Contacts de la campagne</h3>
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Entreprise</th>
                    <th className="px-4 py-3 text-left font-semibold">Dirigeant</th>
                    <th className="px-4 py-3 text-center font-semibold">Distance</th>
                    <th className="px-4 py-3 text-center font-semibold">Statut</th>
                    <th className="px-4 py-3 text-center font-semibold">Téléphone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {campaignContacts.map((contact, idx) => (
                    <tr key={contact.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-semibold text-gray-900">{contact.raisonSociale}</td>
                      <td className="px-4 py-3 text-gray-600">{contact.dirigeant}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-gray-600">
                          {contact.distance ? `${contact.distance.toFixed(1)} km` : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                            contact.status === 'new'
                              ? 'bg-red-100 text-red-700'
                              : contact.status === 'contacted'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {contact.status === 'new'
                            ? '🔴 Non contacté'
                            : contact.status === 'contacted'
                            ? '🟡 Contacté'
                            : '🟢 Action'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {contact.telephone || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="border-t border-gray-200 p-6 sticky bottom-0 bg-white">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-semibold text-gray-700">
              <span>Progression</span>
              <span>
                {stats.contacted + stats.action} / {stats.total} contactés (
                {stats.total > 0 ? Math.round(((stats.contacted + stats.action) / stats.total) * 100) : 0}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-nocr transition-all duration-300"
                style={{
                  width: `${
                    stats.total > 0 ? ((stats.contacted + stats.action) / stats.total) * 100 : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

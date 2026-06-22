import React, { useState, useMemo } from 'react';
import { MapPin, Navigation, Loader, ChevronRight, X } from 'lucide-react';
import { useProspectStore } from '../store';
import { getContactsInRadius } from '../utils';

export default function ProspectionCampaign({ onClose }) {
  const [step, setStep] = useState(1); // 1: select start, 2: set radius, 3: review
  const [selectedContact, setSelectedContact] = useState(null);
  const [radius, setRadius] = useState(5);
  const [campaignName, setCampaignName] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // NOUVEAU

  const contacts = useProspectStore(s => s.contacts);
  const currentUser = useProspectStore(s => s.currentUser);
  const addCampaign = useProspectStore(s => s.addCampaign);
  const addNotification = useProspectStore(s => s.addNotification);

  // Contacts valides (avec géolocalisation ET affectés au commercial)
  const validContacts = useMemo(() => {
    return contacts.filter(c => c.lat && c.lon && c.assignedTo === currentUser?.id);
  }, [contacts, currentUser?.id]);

  // Contacts filtrés par recherche
  const filteredContacts = useMemo(() => {
    if (!searchQuery) return validContacts;
    const q = searchQuery.toLowerCase();
    return validContacts.filter(c =>
      c.raisonSociale.toLowerCase().includes(q) ||
      c.dirigeant.toLowerCase().includes(q) ||
      c.adresse.toLowerCase().includes(q)
    );
  }, [validContacts, searchQuery]);

  // Contacts dans le rayon
  const contactsInRadius = useMemo(() => {
    if (!selectedContact || !selectedContact.lat) return [];
    return getContactsInRadius(
      validContacts,
      selectedContact.lat,
      selectedContact.lon,
      radius
    );
  }, [selectedContact, radius, validContacts]);

  const handleStartCampaign = () => {
    if (!selectedContact) {
      alert('Sélectionnez un contact de départ');
      return;
    }

    const campaign = {
      commercialId: currentUser.id,
      name: campaignName,
      startContactId: selectedContact.id,
      radius,
      contacts: contactsInRadius.map(c => ({ id: c.id, distance: c.distance })),
      currentIndex: 0,
    };

    addCampaign(campaign);
    addNotification({
      type: 'success',
      message: `Campagne ${campaignName ? `"${campaignName}"` : ''} lancée: ${contactsInRadius.length} contacts trouvés`,
      duration: 3000,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="bg-gradient-nocr text-white p-6 sticky top-0 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Navigation className="w-6 h-6" />
              Nouvelle campagne de prospection
            </h2>
            <p className="text-white/80">Étape {step} sur 3</p>
          </div>
          <button
            onClick={onClose}
            className="hover:opacity-80 transition flex-shrink-0"
            title="Annuler"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* STEP 1: Select start contact */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">
                Sélectionnez votre point de départ
              </h3>

              {/* Barre de recherche */}
              <input
                type="text"
                placeholder="🔍 Rechercher par nom, dirigeant, adresse..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              />

              {validContacts.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700 text-sm">
                  ❌ Aucun contact avec géolocalisation trouvé. Importez d'abord des contacts.
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-600 text-sm">
                  ❌ Aucun contact ne correspond à votre recherche
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-auto">
                  {filteredContacts.map(contact => (
                    <button
                      key={contact.id}
                      onClick={() => {
                        setSelectedContact(contact);
                        setStep(2);
                      }}
                      className={`w-full text-left p-3 rounded-lg border-2 transition ${
                        selectedContact?.id === contact.id
                          ? 'bg-primary-50 border-primary-500'
                          : 'bg-gray-50 border-gray-200 hover:border-primary-500'
                      }`}
                    >
                      <p className="font-semibold text-gray-700">{contact.raisonSociale}</p>
                      <p className="text-xs text-gray-600">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {contact.adresse}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {selectedContact && (
                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-gradient-nocr text-white py-3 rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  Continuer <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* STEP 2: Set radius */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  Point de départ
                </h3>
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <p className="font-semibold text-gray-700">{selectedContact.raisonSociale}</p>
                  <p className="text-sm text-gray-600">{selectedContact.adresse}</p>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Nom de la campagne (optionnel)
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="ex: Prospection Paris Q3"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Rayon de prospection : {radius} km
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1 km</span>
                    <span>50 km</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700 font-semibold">
                  📍 {contactsInRadius.length} contacts trouvés dans ce rayon
                </p>
              </div>

              <button
                onClick={() => setStep(3)}
                className="w-full bg-gradient-nocr text-white py-3 rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                Valider <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 3: Review & Start */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">
                Récapitulatif et ordre de prospection
              </h3>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg mb-4">
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-1">
                    Point de départ
                  </p>
                  <p className="font-semibold text-gray-700">
                    {selectedContact.raisonSociale}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-1">
                    Rayon
                  </p>
                  <p className="font-semibold text-gray-700">{radius} km</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase mb-2">
                  Contacts à prospecter ({contactsInRadius.length})
                </p>
                <div className="space-y-2 max-h-48 overflow-auto bg-gray-50 p-3 rounded-lg">
                  {contactsInRadius.map((contact, idx) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between py-2 px-3 bg-white rounded border border-gray-200"
                    >
                      <div>
                        <p className="font-semibold text-gray-700 text-sm">
                          {idx + 1}. {contact.raisonSociale}
                        </p>
                        <p className="text-xs text-gray-600">
                          {contact.distance.toFixed(1)} km • {contact.libelleNaf}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStartCampaign}
                className="w-full bg-gradient-nocr text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
              >
                🚀 Lancer la campagne
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {step > 1 && (
          <div className="border-t border-gray-200 p-4 flex justify-between">
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              ← Retour
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-50 transition rounded-lg"
            >
              Annuler
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

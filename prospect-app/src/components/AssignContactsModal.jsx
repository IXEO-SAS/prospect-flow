import React, { useState } from 'react';
import { useProspectStore } from '../store';
import { X, Check } from 'lucide-react';

export default function AssignContactsModal({ onClose }) {
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [selectedCommercial, setSelectedCommercial] = useState('');
  const [step, setStep] = useState(1); // 1: select contacts, 2: select commercial, 3: confirm
  const [filterUnassigned, setFilterUnassigned] = useState(false); // NOUVEAU

  const contacts = useProspectStore(s => s.contacts);
  const users = useProspectStore(s => s.users);
  const updateContact = useProspectStore(s => s.updateContact);
  const addNotification = useProspectStore(s => s.addNotification);
  const currentUser = useProspectStore(s => s.currentUser);

  const commercials = users.filter(u => u.role === 'commercial');
  
  // Afficher TOUS les contacts ou seulement les non affectés
  const availableContacts = filterUnassigned
    ? contacts.filter(c => !c.assignedTo)
    : contacts;

  const handleToggleContact = (contactId) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleAssign = () => {
    if (!selectedCommercial || selectedContacts.length === 0) {
      addNotification({
        type: 'error',
        message: 'Sélectionnez un commercial et des contacts',
        duration: 2000,
      });
      return;
    }

    // Affecter les contacts
    selectedContacts.forEach(contactId => {
      updateContact(contactId, { assignedTo: selectedCommercial });
    });

    const commercial = commercials.find(c => c.id === selectedCommercial);
    addNotification({
      type: 'success',
      message: `${selectedContacts.length} contact(s) affectés à ${commercial?.name}`,
      duration: 2000,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto">
        {/* Header */}
        <div className="bg-gradient-nocr text-white p-6 sticky top-0 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Affecter des contacts</h2>
          <button onClick={onClose} className="hover:opacity-80 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* STEP 1: Select contacts */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-700">
                  Sélectionnez les contacts ({selectedContacts.length} choisi(s))
                </h3>
                <label className="flex items-center gap-2 cursor-pointer bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 hover:bg-blue-100 transition">
                  <input
                    type="checkbox"
                    checked={filterUnassigned}
                    onChange={(e) => {
                      setFilterUnassigned(e.target.checked);
                      setSelectedContacts([]); // Réinitialise la sélection
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-blue-700">
                    📌 Sans affectation
                  </span>
                </label>
              </div>

              {availableContacts.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700 text-sm">
                  ⚠️ Aucun contact disponible
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-auto">
                  {availableContacts.map(contact => (
                    <label
                      key={contact.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${
                        selectedContacts.includes(contact.id)
                          ? 'bg-primary-50 border-primary-500'
                          : 'bg-gray-50 border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => handleToggleContact(contact.id)}
                        className="w-4 h-4 rounded"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-700">{contact.raisonSociale}</p>
                        <p className="text-xs text-gray-600">{contact.dirigeant}</p>
                        {contact.assignedTo && (
                          <p className="text-xs text-blue-600 mt-1">
                            Actuellement: {users.find(u => u.id === contact.assignedTo)?.name || 'inconnu'}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <div className="flex gap-2 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    if (selectedContacts.length === 0) {
                      addNotification({
                        type: 'error',
                        message: 'Sélectionnez au moins un contact',
                        duration: 2000,
                      });
                      return;
                    }
                    setStep(2);
                  }}
                  className="flex-1 bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition font-semibold"
                >
                  Continuer →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Select commercial */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 mb-4">
                Choisissez un commercial
              </h3>

              <p className="text-sm text-gray-600 mb-3">
                Affectation de <strong>{selectedContacts.length} contact(s)</strong>
              </p>

              {commercials.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700 text-sm">
                  ⚠️ Aucun commercial. Créez-en un d'abord.
                </div>
              ) : (
                <div className="space-y-2">
                  {commercials.map(commercial => (
                    <label
                      key={commercial.id}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${
                        selectedCommercial === commercial.id.toString()
                          ? 'bg-primary-50 border-primary-500'
                          : 'bg-gray-50 border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="commercial"
                        value={commercial.id}
                        checked={selectedCommercial === commercial.id.toString()}
                        onChange={(e) => setSelectedCommercial(e.target.value)}
                        className="w-4 h-4"
                      />
                      <div
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: commercial.color }}
                      ></div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-700">{commercial.name}</p>
                        <p className="text-xs text-gray-600">{commercial.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  ← Retour
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition font-semibold"
                >
                  Confirmer
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Confirm */}
          {step === 3 && (
            <div className="space-y-4 text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">
                Confirmer l'affectation
              </h3>
              <p className="text-gray-600">
                Vous êtes sur le point d'affecter <strong>{selectedContacts.length} contact(s)</strong> à{' '}
                <strong>
                  {commercials.find(c => c.id === selectedCommercial)?.name}
                </strong>
              </p>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  Retour
                </button>
                <button
                  onClick={handleAssign}
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition font-semibold"
                >
                  ✅ Affecter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

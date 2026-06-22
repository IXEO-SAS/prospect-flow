import React, { useState } from 'react';
import { useProspectStore } from '../store';
import { geocodeAddress } from '../utils';
import { X, Loader } from 'lucide-react';

export default function AddContactModal({ onClose }) {
  const [step, setStep] = useState(1); // 1: form, 2: geocoding
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    raisonSociale: '',
    dirigeant: '',
    adresse: '',
    telephone: '',
    codeNaf: '',
    libelleNaf: '',
  });

  const addContact = useProspectStore(s => s.addContact);
  const addNotification = useProspectStore(s => s.addNotification);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.raisonSociale || !formData.dirigeant || !formData.adresse) {
      addNotification({
        type: 'error',
        message: 'Raison sociale, dirigeant et adresse sont obligatoires',
        duration: 2000,
      });
      return;
    }

    setStep(2);
    setLoading(true);

    try {
      const geo = await geocodeAddress(formData.adresse);

      if (!geo) {
        addNotification({
          type: 'error',
          message: 'Géocodage échoué. Vérifiez l\'adresse',
          duration: 3000,
        });
        setStep(1);
        setLoading(false);
        return;
      }

      addContact({
        ...formData,
        lat: geo.lat,
        lon: geo.lon,
        status: 'new',
        interests: {},
      });

      addNotification({
        type: 'success',
        message: `${formData.raisonSociale} ajouté !`,
        duration: 2000,
      });

      onClose();
    } catch (err) {
      addNotification({
        type: 'error',
        message: 'Erreur lors du géocodage',
        duration: 2000,
      });
      setStep(1);
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-nocr text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Ajouter un contact</h2>
          <button onClick={onClose} className="hover:opacity-80 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Raison Sociale *
                </label>
                <input
                  type="text"
                  value={formData.raisonSociale}
                  onChange={(e) => setFormData({ ...formData, raisonSociale: e.target.value })}
                  placeholder="ex: Acme Corp"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Dirigeant/Contact *
                </label>
                <input
                  type="text"
                  value={formData.dirigeant}
                  onChange={(e) => setFormData({ ...formData, dirigeant: e.target.value })}
                  placeholder="ex: Jean Doe"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Adresse *
                </label>
                <input
                  type="text"
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  placeholder="ex: 123 Rue X, 75001 Paris"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  placeholder="ex: 01.23.45.67.89"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Secteur d'activité
                </label>
                <input
                  type="text"
                  value={formData.libelleNaf}
                  onChange={(e) => setFormData({ ...formData, libelleNaf: e.target.value })}
                  placeholder="ex: Informatique"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-nocr text-white py-3 rounded-lg font-semibold hover:opacity-90 transition mt-6"
              >
                Créer le contact
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <Loader className="w-12 h-12 text-primary-500 mx-auto mb-3 animate-spin" />
              <h3 className="font-semibold text-gray-700">
                Géocodage en cours...
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Localisation de l'adresse
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

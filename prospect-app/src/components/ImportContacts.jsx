import React, { useState } from 'react';
import { Upload, ChevronRight, Loader } from 'lucide-react';
import { readXlsxFile, mapContactsFromXlsx, suggestMapping, getTemplateFields } from '../xlsxUtils';
import { geocodeBatch } from '../utils';
import { useProspectStore } from '../store';

export default function ImportContacts({ onClose }) {
  const [step, setStep] = useState(1); // 1: upload, 2: mapping, 3: review, 4: geocoding
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [data, setData] = useState([]);
  const [mapping, setMapping] = useState({});
  const [geocoding, setGeocoding] = useState(0);
  const [error, setError] = useState('');
  
  const addContact = useProspectStore(s => s.addContact);
  const addNotification = useProspectStore(s => s.addNotification);

  // Étape 1: Upload
  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    try {
      setError('');
      const { headers: h, data: d } = await readXlsxFile(selectedFile);
      setFile(selectedFile);
      setHeaders(h);
      setData(d);
      
      // Suggestions automatiques
      const suggestions = suggestMapping(h);
      setMapping(suggestions);
      setStep(2);
    } catch (err) {
      setError('Erreur lecture fichier: ' + err.message);
    }
  };

  // Étape 2: Mapping
  const handleMappingChange = (field, value) => {
    setMapping({
      ...mapping,
      [value]: field,
    });
  };

  const isValidMapping = () => {
    const required = ['raisonSociale', 'dirigeant', 'adresse'];
    return required.every(f => Object.values(mapping).includes(f));
  };

  const proceedToReview = () => {
    if (isValidMapping()) {
      setStep(3);
    } else {
      setError('Veuillez mapper les champs obligatoires: Raison Sociale, Dirigeant, Adresse');
    }
  };

  // Étape 3: Review
  const handleGeocodeAndImport = async () => {
    setStep(4);
    const mapped = mapContactsFromXlsx(data, mapping);
    const addresses = mapped.map(c => c.adresse);

    try {
      const geoResults = await geocodeBatch(addresses, (progress) => {
        setGeocoding(Math.round(progress * 100));
      });

      // Créer les contacts avec géolocalisation et IDs UNIQUES
      let importedCount = 0;
      let failedGeocoding = [];
      
      mapped.forEach((contact, idx) => {
        const geo = geoResults[idx];
        
        // Importer même sans géolocalisation
        addContact({
          ...contact,
          id: `contact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${idx}`,
          lat: geo?.lat || null,
          lon: geo?.lon || null,
          status: 'new',
          interests: {},
        });
        importedCount++;
        
        // Tracker les adresses non géocodées
        if (!geo) {
          failedGeocoding.push(contact.raisonSociale);
        }
      });

      // Message de succès avec avertissements
      const message = failedGeocoding.length > 0
        ? `${importedCount} contact(s) importé(s) • ⚠️ ${failedGeocoding.length} sans géolocalisation`
        : `${importedCount} contact(s) importé(s) avec succès !`;

      addNotification({
        type: failedGeocoding.length > 0 ? 'warning' : 'success',
        message: message,
        duration: 5000,
      });

      // Afficher les contacts non géocodés dans la console
      if (failedGeocoding.length > 0) {
        console.warn('❌ Contacts sans géolocalisation (ajouter adresse complète + code postal + ville):');
        failedGeocoding.forEach(name => console.warn(`   • ${name}`));
      }

      onClose();
    } catch (err) {
      setError('Erreur géocodage: ' + err.message);
      setStep(3);
    }
  };

  const templates = getTemplateFields();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="bg-gradient-nocr text-white p-6 sticky top-0">
          <h2 className="text-2xl font-bold">Importer des contacts</h2>
          <p className="text-white/80">Étape {step} sur 4</p>
        </div>

        <div className="p-6">
          {/* STEP 1: Upload */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition cursor-pointer"
                onClick={() => document.getElementById('file-input').click()}>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-700 mb-1">
                  Sélectionnez votre fichier XLSX
                </h3>
                <p className="text-sm text-gray-500">
                  Format: Excel (.xlsx) ou CSV convertis en Excel
                </p>
                <input
                  id="file-input"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Mapping */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">
                Mappez les colonnes de votre fichier
              </h3>
              <p className="text-sm text-gray-600">
                Nous avons trouvé {headers.length} colonnes. Indiquez leurs correspondances :
              </p>

              <div className="space-y-3">
                {templates.map(template => (
                  <div key={template.id} className="flex items-center gap-3">
                    <label className="flex-shrink-0 w-40">
                      <span className="font-semibold text-gray-700">
                        {template.label}
                      </span>
                      {template.required && <span className="text-red-500">*</span>}
                    </label>
                    <select
                      value={Object.keys(mapping).find(k => mapping[k] === template.id) || ''}
                      onChange={(e) => handleMappingChange(template.id, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">-- Sélectionnez --</option>
                      {headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={proceedToReview}
                className="w-full bg-gradient-nocr text-white py-3 rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                Continuer <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 3: Review */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">
                Aperçu des données ({data.length} contacts)
              </h3>

              <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-semibold text-gray-700">
                        Raison Sociale
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700">
                        Dirigeant
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700">
                        Adresse
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 5).map((row, idx) => {
                      const sourceRS = Object.keys(mapping).find(k => mapping[k] === 'raisonSociale');
                      const sourceDir = Object.keys(mapping).find(k => mapping[k] === 'dirigeant');
                      const sourceAdr = Object.keys(mapping).find(k => mapping[k] === 'adresse');
                      return (
                        <tr key={idx} className="border-b hover:bg-white transition">
                          <td className="py-2 px-3 text-gray-700">{row[sourceRS]}</td>
                          <td className="py-2 px-3 text-gray-700">{row[sourceDir]}</td>
                          <td className="py-2 px-3 text-gray-600 text-xs truncate">
                            {row[sourceAdr]}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {data.length > 5 && (
                <p className="text-xs text-gray-500">
                  ... et {data.length - 5} autres contacts
                </p>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                ⚠️ Les contacts vont être géocodés (conversion adresse → latitude/longitude).
                Cela peut prendre quelques minutes.
              </div>

              <button
                onClick={handleGeocodeAndImport}
                className="w-full bg-gradient-nocr text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
              >
                Importer et géocoder
              </button>
            </div>
          )}

          {/* STEP 4: Geocoding */}
          {step === 4 && (
            <div className="space-y-4 text-center">
              <Loader className="w-12 h-12 text-primary-500 mx-auto animate-spin" />
              <h3 className="font-semibold text-gray-700">
                Géocodage en cours...
              </h3>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-nocr h-2 rounded-full transition-all duration-300"
                  style={{ width: `${geocoding}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">{geocoding}%</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 4 && (
          <div className="border-t border-gray-200 p-4 flex justify-between">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                Retour
              </button>
            )}
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

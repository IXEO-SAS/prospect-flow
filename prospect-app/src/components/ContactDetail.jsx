import React, { useState } from 'react';
import { X, Plus, Trash2, Phone, MapPin, Briefcase, MapPinPlus } from 'lucide-react';
import { useProspectStore } from '../store';
import { geocodeAddress } from '../geocodeUtils';

const InterestList = [
  'Impression', 'Informatique', 'Sauvegarde', 'Microsoft 365',
  'GED', 'Affichage dynamique', 'Écran tactile interactif'
];

const statusLabels = {
  new: 'Non contacté',
  contacted: 'Contacté - Sans suite',
  action: 'Action commerciale',
};

export default function ContactDetail({ contact, onClose }) {
  const [tab, setTab] = useState('info');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(contact);
  const [selectedInterlocutors, setSelectedInterlocutors] = useState([]);
  const [selectedNextActions, setSelectedNextActions] = useState([]);
  const [newAction, setNewAction] = useState({ type: 'call', note: '' });
  const [geoLoading, setGeoLoading] = useState(false);

  const updateContact = useProspectStore(s => s.updateContact);
  const getContactActions = useProspectStore(s => s.getContactActions);
  const addAction = useProspectStore(s => s.addAction);
  const addNotification = useProspectStore(s => s.addNotification);
  const users = useProspectStore(s => s.users);

  const actions = getContactActions(contact.id);

  const handleGeocodeAddress = async () => {
    if (!formData.adresse || formData.adresse.trim() === '') {
      addNotification({
        type: 'error',
        message: 'Veuillez entrer une adresse',
        duration: 2000,
      });
      return;
    }

    setGeoLoading(true);
    const geo = await geocodeAddress(formData.adresse);
    setGeoLoading(false);

    if (geo) {
      setFormData({
        ...formData,
        lat: geo.lat,
        lon: geo.lon,
      });
      addNotification({
        type: 'success',
        message: `✅ Adresse géolocalisée (${geo.displayName.substring(0, 60)}...)`,
        duration: 3000,
      });
    } else {
      addNotification({
        type: 'error',
        message: '❌ Adresse non trouvée. Vérifiez le format: numéro rue, code postal, ville',
        duration: 3000,
      });
    }
  };

  const handleSave = () => {
    updateContact(contact.id, formData);
    setEditMode(false);
    addNotification({
      type: 'success',
      message: 'Contact mis à jour',
      duration: 2000,
    });
  };

  const handleAddAction = () => {
    if (!newAction.note) return;
    addAction({
      contactId: contact.id,
      type: newAction.type,
      note: newAction.note,
      timestamp: new Date().toISOString(),
    });
    setNewAction({ type: 'call', note: '' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-nocr text-white p-6 flex justify-between items-start sticky top-0">
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{formData.raisonSociale}</h2>
            <p className="text-sm text-white/80">{contact.assignedTo ? users.find(u => u.id === contact.assignedTo)?.name : 'Non assigné'}</p>
            
            {/* STATUS SELECTOR */}
            <div className="mt-3 flex items-center gap-3">
              <label className="text-sm font-semibold">Statut :</label>
              <select
                value={formData.status || 'new'}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className={`px-3 py-1 rounded-lg text-sm font-semibold text-white border-0 cursor-pointer ${
                  (formData.status || 'new') === 'new' ? 'bg-red-500 hover:bg-red-600' :
                  (formData.status || 'new') === 'contacted' ? 'bg-yellow-500 hover:bg-yellow-600' :
                  'bg-green-500 hover:bg-green-600'
                }`}
              >
                <option value="new">🔴 Non contacté</option>
                <option value="contacted">🟡 Contacté</option>
                <option value="action">🟢 Action</option>
              </select>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:opacity-80">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 sticky top-16 bg-white">
          {[
            { id: 'info', label: 'Infos', icon: '📋' },
            { id: 'interests', label: 'Intérêts', icon: '⭐' },
            { id: 'contacts', label: 'Contacts', icon: '👥' },
            { id: 'actions', label: 'Actions', icon: '✅' },
            { id: 'next', label: 'Next', icon: '📅' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 px-4 border-b-2 transition font-semibold ${
                tab === t.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-700'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {/* INFO */}
          {tab === 'info' && (
            <div className="space-y-4">
              {/* Indicateur géolocalisation */}
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                formData.lat && formData.lon
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <span className={formData.lat && formData.lon ? 'text-green-600' : 'text-red-600'}>
                  {formData.lat && formData.lon ? '🟢 Géolocalisé' : '🔴 Non géolocalisé'}
                </span>
                {editMode && (
                  <button
                    onClick={handleGeocodeAddress}
                    disabled={geoLoading}
                    className="ml-auto px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {geoLoading ? '⏳ Géolocalisation...' : '🔄 Relancer'}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 font-semibold uppercase">Dirigeant</label>
                  {editMode ? (
                    <input type="text" value={formData.dirigeant} onChange={(e) => setFormData({...formData, dirigeant: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mt-1" />
                  ) : (
                    <p className="text-gray-700 font-semibold mt-1">{formData.dirigeant}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-semibold uppercase">Téléphone</label>
                  {editMode ? (
                    <input type="tel" value={formData.telephone} onChange={(e) => setFormData({...formData, telephone: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mt-1" />
                  ) : (
                    <p className="text-gray-700 flex items-center gap-2 mt-1"><Phone className="w-4 h-4" />{formData.telephone || 'N/A'}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-semibold uppercase">Adresse</label>
                {editMode ? (
                  <input type="text" value={formData.adresse} onChange={(e) => setFormData({...formData, adresse: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mt-1" />
                ) : (
                  <p className="text-gray-700 flex items-center gap-2 mt-1"><MapPin className="w-4 h-4" />{formData.adresse}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 font-semibold uppercase">Code NAF</label>
                  <p className="text-gray-700 mt-1">{formData.codeNaf || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-semibold uppercase">Libellé NAF</label>
                  <p className="text-gray-700 mt-1">{formData.libelleNaf || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* INTERESTS */}
          {tab === 'interests' && (
            <div className="space-y-2">
              {InterestList.map(interest => (
                <label key={interest} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input type="checkbox" checked={formData.interests?.[interest] || false} onChange={(e) => setFormData({...formData, interests: {...formData.interests, [interest]: e.target.checked}})} className="w-4 h-4 rounded" />
                  <span className="text-gray-700">{interest}</span>
                </label>
              ))}
            </div>
          )}

          {/* CONTACTS */}
          {tab === 'contacts' && (
            <div className="space-y-4">
              <button onClick={() => { setFormData({...formData, interlocutors: [...(formData.interlocutors || []), { name: '', title: '', phone: '', email: '', files: [] }]}); }} className="w-10 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold flex items-center justify-center">+</button>

              {selectedInterlocutors.length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-sm text-red-700">{selectedInterlocutors.length} sélectionnée(s)</span>
                  <button onClick={() => { const updated = {...formData, interlocutors: formData.interlocutors.filter((_, idx) => !selectedInterlocutors.includes(idx))}; setFormData(updated); setSelectedInterlocutors([]); }} className="ml-auto px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm">🗑️ Supprimer</button>
                </div>
              )}

              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-3 py-2 text-center w-10"><input type="checkbox" checked={selectedInterlocutors.length === (formData.interlocutors || []).length && (formData.interlocutors || []).length > 0} onChange={(e) => setSelectedInterlocutors(e.target.checked ? (formData.interlocutors || []).map((_, idx) => idx) : [])} className="w-4 h-4" /></th>
                    <th className="px-4 py-2 text-left font-semibold">Nom</th>
                    <th className="px-4 py-2 text-left font-semibold">Fonction</th>
                    <th className="px-4 py-2 text-left font-semibold">Tél.</th>
                    <th className="px-4 py-2 text-left font-semibold">Email</th>
                    <th className="px-4 py-2 text-center font-semibold">Fichiers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(formData.interlocutors || []).map((person, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-3 py-3 text-center"><input type="checkbox" checked={selectedInterlocutors.includes(idx)} onChange={(e) => setSelectedInterlocutors(e.target.checked ? [...selectedInterlocutors, idx] : selectedInterlocutors.filter(i => i !== idx))} className="w-4 h-4" /></td>
                      <td className="px-4 py-3">{editMode ? <input type="text" value={person.name} onChange={(e) => { const u = [...formData.interlocutors]; u[idx].name = e.target.value; setFormData({...formData, interlocutors: u}); }} className="w-full px-2 py-1 border border-gray-200 rounded text-sm" /> : <span>{person.name}</span>}</td>
                      <td className="px-4 py-3">{editMode ? <input type="text" value={person.title} onChange={(e) => { const u = [...formData.interlocutors]; u[idx].title = e.target.value; setFormData({...formData, interlocutors: u}); }} className="w-full px-2 py-1 border border-gray-200 rounded text-sm" /> : <span>{person.title}</span>}</td>
                      <td className="px-4 py-3">{editMode ? <input type="tel" value={person.phone} onChange={(e) => { const u = [...formData.interlocutors]; u[idx].phone = e.target.value; setFormData({...formData, interlocutors: u}); }} className="w-full px-2 py-1 border border-gray-200 rounded text-sm" /> : <span>{person.phone}</span>}</td>
                      <td className="px-4 py-3">{editMode ? <input type="email" value={person.email || ''} onChange={(e) => { const u = [...formData.interlocutors]; u[idx].email = e.target.value; setFormData({...formData, interlocutors: u}); }} className="w-full px-2 py-1 border border-gray-200 rounded text-sm" /> : <span>{person.email || '-'}</span>}</td>
                      <td className="px-4 py-3 text-center space-x-2 flex justify-center items-center">
                        {(person.files || []).length > 0 && (
                          <div className="flex gap-1">
                            {person.files.map((file, fileIdx) => (
                              <button
                                key={fileIdx}
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = file.data;
                                  link.download = file.name;
                                  link.click();
                                }}
                                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition"
                                title={file.name}
                              >
                                📥
                              </button>
                            ))}
                          </div>
                        )}
                        <button onClick={() => { const input = document.createElement('input'); input.type = 'file'; input.onchange = (e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = () => { const u = [...formData.interlocutors]; if (!u[idx].files) u[idx].files = []; u[idx].files.push({name: file.name, type: file.type, size: file.size, data: reader.result}); setFormData({...formData, interlocutors: u}); addNotification({type: 'success', message: `"${file.name}" ajouté`, duration: 2000}); }; reader.readAsDataURL(file); } }; input.click(); }} className="text-blue-600 hover:bg-blue-50 p-2 rounded transition">📎</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ACTIONS */}
          {tab === 'actions' && (
            <div className="space-y-4">
              <div className="space-y-2">
                {actions.length > 0 ? (
                  actions.map(action => (
                    <div key={action.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold text-primary-600 uppercase">{action.type === 'call' ? '📞' : action.type === 'visit' ? '🏢' : '📧'} {action.type}</span>
                        <span className="text-xs text-gray-500">{new Date(action.timestamp).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <p className="text-gray-700">{action.note}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">Aucune action</p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-blue-900">Ajouter une action</h4>
                <select value={newAction.type} onChange={(e) => setNewAction({...newAction, type: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  <option value="call">📞 Appel</option>
                  <option value="visit">🏢 Visite</option>
                  <option value="email">📧 Email</option>
                </select>
                <textarea value={newAction.note} onChange={(e) => setNewAction({...newAction, note: e.target.value})} placeholder="Notes" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" rows="2" />
                <button onClick={handleAddAction} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold text-sm">Ajouter</button>
              </div>
            </div>
          )}

          {/* NEXT */}
          {tab === 'next' && (
            <div className="space-y-4">
              <button onClick={() => { setFormData({...formData, nextActions: [...(formData.nextActions || []), { type: 'call', date: '', details: '', action: 'call' }]}); }} className="w-10 h-10 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold flex items-center justify-center">+</button>

              {selectedNextActions.length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-sm text-red-700">{selectedNextActions.length} sélectionnée(s)</span>
                  <button onClick={() => { const updated = {...formData, nextActions: formData.nextActions.filter((_, idx) => !selectedNextActions.includes(idx))}; setFormData(updated); setSelectedNextActions([]); }} className="ml-auto px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm">🗑️ Supprimer</button>
                </div>
              )}

              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-3 py-2 text-center w-10"><input type="checkbox" checked={selectedNextActions.length === (formData.nextActions || []).length && (formData.nextActions || []).length > 0} onChange={(e) => setSelectedNextActions(e.target.checked ? (formData.nextActions || []).map((_, idx) => idx) : [])} className="w-4 h-4" /></th>
                    <th className="px-4 py-2 text-left font-semibold">Type</th>
                    <th className="px-4 py-2 text-left font-semibold">Date</th>
                    <th className="px-4 py-2 text-left font-semibold">Détails</th>
                    <th className="px-4 py-2 text-left font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(formData.nextActions || []).map((action, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-3 py-3 text-center"><input type="checkbox" checked={selectedNextActions.includes(idx)} onChange={(e) => setSelectedNextActions(e.target.checked ? [...selectedNextActions, idx] : selectedNextActions.filter(i => i !== idx))} className="w-4 h-4" /></td>
                      <td className="px-4 py-3"><select value={action.type || 'call'} onChange={(e) => { const u = [...formData.nextActions]; u[idx].type = e.target.value; setFormData({...formData, nextActions: u}); }} className="w-full px-2 py-1 border border-gray-200 rounded text-sm"><option value="call">📞 Appel</option><option value="relance">🔄 Relance</option><option value="rdv">📌 Rendez-vous</option><option value="doc">📄 Doc</option><option value="suivi">🔍 Suivi</option></select></td>
                      <td className="px-4 py-3"><input type="date" value={action.date || ''} onChange={(e) => { const u = [...formData.nextActions]; u[idx].date = e.target.value; setFormData({...formData, nextActions: u}); }} className="w-full px-2 py-1 border border-gray-200 rounded text-sm" /></td>
                      <td className="px-4 py-3"><input type="text" value={action.details || ''} onChange={(e) => { const u = [...formData.nextActions]; u[idx].details = e.target.value; setFormData({...formData, nextActions: u}); }} className="w-full px-2 py-1 border border-gray-200 rounded text-sm" /></td>
                      <td className="px-4 py-3"><select value={action.action || 'call'} onChange={(e) => { const u = [...formData.nextActions]; u[idx].action = e.target.value; setFormData({...formData, nextActions: u}); }} className="w-full px-2 py-1 border border-gray-200 rounded text-sm"><option value="call">📞</option><option value="visit">🏢</option><option value="email">📧</option></select></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex gap-2 sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-semibold">Fermer</button>
          {!editMode ? (
            <button onClick={() => setEditMode(true)} className="ml-auto px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-semibold">Éditer</button>
          ) : (
            <>
              <button onClick={() => setEditMode(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-semibold">Annuler</button>
              <button onClick={handleSave} className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold">Enregistrer</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

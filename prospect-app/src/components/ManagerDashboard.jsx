import React, { useState, useMemo } from 'react';
import { BarChart3, Users, Activity, LogOut, Plus, TrendingUp, Lock, Settings, Eye } from 'lucide-react';
import { useProspectStore } from '../store';
import ImportContacts from './ImportContacts';
import ContactDetail from './ContactDetail';
import CampaignDetail from './CampaignDetail';
import AddCommercialForm from './AddCommercialForm';
import AssignContactsModal from './AssignContactsModal';
import AdminApproval from './AdminApproval';
import AdminSettingsModal from './AdminSettingsModal';

export default function ManagerDashboard() {
  const [showImport, setShowImport] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [tab, setTab] = useState('stats');
  const [showUserForm, setShowUserForm] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedContactsForDelete, setSelectedContactsForDelete] = useState([]);
  const [showSettings, setShowSettings] = useState(false); // NOUVEAU

  const currentUser = useProspectStore(s => s.currentUser);
  const viewMode = useProspectStore(s => s.viewMode);
  const setViewMode = useProspectStore(s => s.setViewMode);
  const contacts = useProspectStore(s => s.contacts);
  const deleteContact = useProspectStore(s => s.deleteContact);
  const addNotification = useProspectStore(s => s.addNotification);
  const campaigns = useProspectStore(s => s.campaigns);
  const actions = useProspectStore(s => s.actions);
  const users = useProspectStore(s => s.users);
  const setCurrentUser = useProspectStore(s => s.setCurrentUser);
  const removeUser = useProspectStore(s => s.removeUser);
  const removeContact = useProspectStore(s => s.removeContact);
  const removeCampaign = useProspectStore(s => s.removeCampaign);
  const updateContact = useProspectStore(s => s.updateContact);

  // Statistiques par commercial
  const stats = useMemo(() => {
    const commercials = users.filter(u => u.role === 'commercial');
    return commercials.map(user => {
      // Actions passées (historique)
      const userActions = actions.filter(a => a.userId === user.id);
      
      // Contacts du commercial
      const userContacts = contacts.filter(c => c.assignedTo === user.id);
      
      // Next actions (plans futurs)
      const userNextActions = userContacts.flatMap(c => c.nextActions || []);
      
      // Compter par type
      const calls = userActions.filter(a => a.type === 'call').length + 
                    userNextActions.filter(a => a.type === 'call').length;
      const visits = userActions.filter(a => a.type === 'visit').length + 
                     userNextActions.filter(a => a.action === 'visit').length;
      const emails = userActions.filter(a => a.type === 'email').length + 
                     userNextActions.filter(a => a.action === 'email').length;
      
      const userCampaigns = campaigns.filter(c => c.commercialId === user.id);

      return {
        user,
        calls,
        visits,
        emails,
        totalActions: calls + visits + emails,
        activeCampaigns: userCampaigns.filter(c => c.status === 'active').length,
        totalCampaigns: userCampaigns.length,
      };
    });
  }, [actions, users, campaigns, contacts]);

  const handleToggleContact = (contactId) => {
    setSelectedContactsForDelete(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedContactsForDelete.length === 0) {
      addNotification({
        type: 'error',
        message: 'Sélectionnez des contacts à supprimer',
        duration: 2000,
      });
      return;
    }

    if (confirm(`Supprimer ${selectedContactsForDelete.length} contact(s) ? Cette action est irréversible.`)) {
      selectedContactsForDelete.forEach(id => deleteContact(id));
      setSelectedContactsForDelete([]);
      addNotification({
        type: 'success',
        message: `${selectedContactsForDelete.length} contact(s) supprimé(s)`,
        duration: 2000,
      });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Statistiques globales
  const globalStats = useMemo(() => {
    return {
      totalContacts: contacts.length,
      newContacts: contacts.filter(c => c.status === 'new').length,
      contactedContacts: contacts.filter(c => c.status === 'contacted').length,
      actionContacts: contacts.filter(c => c.status === 'action').length,
      totalActions: actions.length,
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    };
  }, [contacts, actions, campaigns]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ProspectFlow</h1>
            <p className="text-gray-600">Manager • {currentUser?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'manager' ? 'commercial' : 'manager')}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              title={viewMode === 'manager' ? 'Voir la vue commerciale' : 'Retour à la vue manager'}
            >
              <Eye className="w-5 h-5" />
              {viewMode === 'manager' ? '👁️ Vue Commercial' : '👁️ Vue Manager'}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              title="Paramètres et outils d'administration"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPIs globaux */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Contacts totaux</p>
            <p className="text-3xl font-bold text-gray-900">{globalStats.totalContacts}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">À prospecter</p>
            <p className="text-3xl font-bold text-red-500">{globalStats.newContacts}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Interactions totales</p>
            <p className="text-3xl font-bold text-blue-500">{globalStats.totalActions}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Campagnes actives</p>
            <p className="text-3xl font-bold text-primary-600">{globalStats.activeCampaigns}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('stats')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              tab === 'stats'
                ? 'bg-gradient-nocr text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Statistiques
          </button>
          <button
            onClick={() => setTab('contacts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              tab === 'contacts'
                ? 'bg-gradient-nocr text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Users className="w-5 h-5" />
            Contacts ({contacts.length})
          </button>
          <button
            onClick={() => setTab('teams')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              tab === 'teams'
                ? 'bg-gradient-nocr text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Activity className="w-5 h-5" />
            Équipes
          </button>
          <button
            onClick={() => setTab('approvals')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              tab === 'approvals'
                ? 'bg-red-600 text-white'
                : 'bg-white border border-red-200 text-red-600 hover:bg-red-50'
            }`}
          >
            <Lock className="w-5 h-5" />
            🔐 Approbations
            {users.filter(u => u.approvalStatus === 'pending').length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                {users.filter(u => u.approvalStatus === 'pending').length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        {tab === 'stats' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Performance commerciale</h2>
              <div className="space-y-4">
                {stats.map(stat => (
                  <div key={stat.user.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{stat.user.name}</h3>
                      <span className="text-xs font-semibold text-white px-3 py-1 rounded-full" style={{ backgroundColor: stat.user.color }}>
                        Commercial
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Appels</p>
                        <p className="text-2xl font-bold text-blue-500">{stat.calls}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Visites</p>
                        <p className="text-2xl font-bold text-green-500">{stat.visits}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Emails</p>
                        <p className="text-2xl font-bold text-purple-500">{stat.emails}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total</p>
                        <p className="text-2xl font-bold text-primary-600">{stat.totalActions}</p>
                      </div>
                    </div>
                    {stat.activeCampaigns > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-600">
                          📍 <span className="font-semibold">{stat.activeCampaigns}</span> campagne(s) active(s)
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'contacts' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Gestion des contacts</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setShowAssignModal(true)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#06b6d4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  👥 Affecter contacts
                </button>
                <button
                  onClick={() => setShowImport(true)}
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #a78bfa 0%, #06b6d4 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  ➕ Importer contacts
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-gray-600 text-sm">Nouveaux</p>
                <p className="text-3xl font-bold text-red-500">{globalStats.newContacts}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-gray-600 text-sm">Contactés (sans suite)</p>
                <p className="text-3xl font-bold text-yellow-500">{globalStats.contactedContacts}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-gray-600 text-sm">En action</p>
                <p className="text-3xl font-bold text-green-500">{globalStats.actionContacts}</p>
              </div>
            </div>

            {selectedContactsForDelete.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex justify-between items-center">
                <p className="text-sm font-semibold text-red-700">
                  {selectedContactsForDelete.length} contact(s) sélectionné(s)
                </p>
                <button
                  onClick={handleDeleteSelected}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-sm"
                >
                  🗑️ Supprimer les contacts
                </button>
              </div>
            )}

            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Liste des contacts</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedContactsForDelete.length === contacts.length && contacts.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedContactsForDelete(contacts.map(c => c.id));
                            } else {
                              setSelectedContactsForDelete([]);
                            }
                          }}
                          className="w-4 h-4"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Raison Sociale
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Dirigeant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Téléphone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Assigné à
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                        Géoloc.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {contacts.slice(0, 10).map(contact => {
                      const assignedUser = users.find(u => u.id === contact.assignedTo);
                      return (
                        <tr key={contact.id} className={`hover:bg-gray-50 transition ${selectedContactsForDelete.includes(contact.id) ? 'bg-blue-50' : ''}`}>
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedContactsForDelete.includes(contact.id)}
                              onChange={() => handleToggleContact(contact.id)}
                              className="w-4 h-4"
                            />
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            {contact.raisonSociale}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{contact.dirigeant}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{contact.telephone || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm">
                            {assignedUser ? (
                              <span className="flex items-center gap-2 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 w-fit">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: assignedUser.color }}
                                ></div>
                                {assignedUser.name}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400 font-semibold">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                contact.status === 'new'
                                  ? 'bg-red-100 text-red-700'
                                  : contact.status === 'contacted'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {contact.status === 'new' ? 'Nouveau' : contact.status === 'contacted' ? 'Contacté' : 'Action'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {contact.lat && contact.lon ? (
                              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                🟢 OK
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                                🔴 NOK
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => setSelectedContact(contact)}
                              className="text-primary-600 hover:underline font-semibold"
                            >
                              Voir fiche
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {contacts.length > 10 && (
                <div className="px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
                  Affichage de 10 sur {contacts.length} contacts
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'teams' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Gestion équipes</h2>
              <button
                onClick={() => setShowUserForm(!showUserForm)}
                className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition font-semibold"
              >
                <Plus className="w-5 h-5" />
                Ajouter commercial
              </button>
            </div>

            {/* Form ajouter commercial */}
            {showUserForm && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-4">Créer un nouveau commercial</h3>
                <AddCommercialForm onClose={() => setShowUserForm(false)} />
              </div>
            )}

            <h2 className="text-lg font-bold text-gray-900 mt-6">Commerciaux actifs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {users.filter(u => u.role === 'commercial').map(user => {
                const stat = stats.find(s => s.user.id === user.id);
                const userCampaigns = campaigns.filter(c => c.commercialId === user.id && c.status === 'active');
                return (
                  <div key={user.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-12 h-12 rounded-full"
                        style={{ backgroundColor: user.color }}
                      ></div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>

                    {userCampaigns.length > 0 ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 space-y-2">
                        <p className="text-sm font-semibold text-blue-900">
                          📍 {userCampaigns.length} campagne(s) en cours
                        </p>
                        <div className="space-y-1">
                          {userCampaigns.map(camp => (
                            <button
                              key={camp.id}
                              onClick={() => setSelectedCampaign(camp)}
                              className="block w-full text-left px-2 py-1 bg-white rounded hover:bg-blue-100 transition text-xs font-semibold text-blue-700"
                            >
                              • {camp.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-600">
                          Aucune campagne active
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Appels</p>
                        <p className="text-xl font-bold text-blue-500">{stat?.calls || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Visites</p>
                        <p className="text-xl font-bold text-green-500">{stat?.visits || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Totals</p>
                        <p className="text-xl font-bold text-primary-600">{stat?.totalActions || 0}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`Supprimer ${user.name} ? (Les contacts resteront)`)) {
                          removeUser(user.id);
                          addNotification({
                            type: 'success',
                            message: `${user.name} supprimé`,
                            duration: 2000,
                          });
                        }
                      }}
                      className="mt-4 w-full border border-red-300 text-red-600 py-2 rounded-lg hover:bg-red-50 transition text-sm font-semibold"
                    >
                      Supprimer commercial
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* TAB: APPROBATIONS */}
      {tab === 'approvals' && (
        <div className="bg-white rounded-lg shadow p-6">
          <AdminApproval />
        </div>
      )}

      {/* Modals */}
      {showImport && (
        <ImportContacts onClose={() => setShowImport(false)} />
      )}
      {selectedContact && (
        <ContactDetail contact={selectedContact} onClose={() => setSelectedContact(null)} />
      )}
      {selectedCampaign && (
        <CampaignDetail campaign={selectedCampaign} onClose={() => setSelectedCampaign(null)} />
      )}
      {showAssignModal && (
        <AssignContactsModal onClose={() => setShowAssignModal(false)} />
      )}
      {showSettings && (
        <AdminSettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

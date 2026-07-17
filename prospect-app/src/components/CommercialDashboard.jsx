import React, { useState, useMemo } from 'react';
import { MapPin, Phone, LogOut, Plus, Map, List, ChevronDown, CheckCircle, Circle, Download, Eye, Search } from 'lucide-react';
import { useProspectStore } from '../store';
import { exportContactsToCSV } from '../csvUtils';
import ContactDetail from './ContactDetail';
import ProspectionCampaign from './ProspectionCampaign';
import MapView from './MapView';
import AddContactModal from './AddContactModal';
import CampaignsView from './CampaignsView';
import CalendarView from './CalendarView';

const statusColors = {
  new: 'bg-red-100 text-red-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  action: 'bg-green-100 text-green-700',
};

export default function CommercialDashboard({ onSwitchToManager }) {
  const [viewMode, setViewMode] = useState('list'); // 'list', 'map', 'campaigns'
  const [selectedContact, setSelectedContact] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [expandedContact, setExpandedContact] = useState(null);
  
  // ✅ PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // ✅ RECHERCHE
  const [searchQuery, setSearchQuery] = useState('');

  const currentUser = useProspectStore(s => s.currentUser);
  const contacts = useProspectStore(s => s.contacts);
  const campaigns = useProspectStore(s => s.campaigns);
  const setCurrentUser = useProspectStore(s => s.setCurrentUser);
  const updateContact = useProspectStore(s => s.updateContact);

  // Campagne active du commercial
  const activeCampaign = campaigns.find(
    c => c.commercialId === currentUser?.id && c.status === 'active'
  );

  // Contacts à prospecter (si campagne active) ou ses contacts affectés
  const contactsToShow = useMemo(() => {
    // ✅ Si manager : voir TOUS les contacts
    // ❌ Si commercial : voir seulement ses contacts affectés
    const visibleContacts = currentUser?.role === 'manager' 
      ? contacts 
      : contacts.filter(c => c.assignedTo === currentUser?.id);
    
    if (activeCampaign) {
      const campaignContactIds = activeCampaign.contacts.map(c => c.id);
      return visibleContacts
        .filter(c => campaignContactIds.includes(c.id))
        .sort((a, b) => {
          const distA = activeCampaign.contacts.find(c => c.id === a.id)?.distance || 0;
          const distB = activeCampaign.contacts.find(c => c.id === b.id)?.distance || 0;
          return distA - distB;
        });
    }
    return visibleContacts;
  }, [contacts, activeCampaign, currentUser?.id, currentUser?.role]);

  // ✅ FILTRE RECHERCHE (après contactsToShow)
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) {
      return contactsToShow;
    }
    
    const query = searchQuery.toLowerCase();
    return contactsToShow.filter(contact => {
      // Chercher dans : raison sociale, dirigeant, téléphone, email, adresse, code postal, ville, secteur NAF
      return (
        (contact.raisonSociale?.toLowerCase().includes(query)) ||
        (contact.dirigeant?.toLowerCase().includes(query)) ||
        (contact.telephone?.toLowerCase().includes(query)) ||
        (contact.email?.toLowerCase().includes(query)) ||
        (contact.adresse?.toLowerCase().includes(query)) ||
        (contact.codePostal?.toLowerCase().includes(query)) ||
        (contact.ville?.toLowerCase().includes(query)) ||
        (contact.libelleNaf?.toLowerCase().includes(query))
      );
    });
  }, [contactsToShow, searchQuery]);

  // ✅ PAGINATION (utilise filteredContacts au lieu de contactsToShow)
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const contactsToDisplay = filteredContacts.slice(startIndex, endIndex);

  // Réinitialiser à la page 1 si recherche change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Réinitialiser à la page 1 si itemsPerPage change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  // Gérer les changements de page
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleCyclestatus = (contact) => {
    const statuses = ['new', 'contacted', 'action'];
    const currentIndex = statuses.indexOf(contact.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    updateContact(contact.id, { status: nextStatus });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ProspectFlow</h1>
            <p className="text-gray-600">Bienvenue, {currentUser?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            {onSwitchToManager && (
              <button
                onClick={onSwitchToManager}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                title="Retour à la vue Manager"
              >
                <Eye className="w-5 h-5" />
                👁️ Vue Manager
              </button>
            )}
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
        {/* Stats et actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Total contacts</p>
            <p className="text-3xl font-bold text-gray-900">{contactsToShow.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Non contactés</p>
            <p className="text-3xl font-bold text-red-500">
              {contactsToShow.filter(c => c.status === 'new').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Actions en cours</p>
            <p className="text-3xl font-bold text-green-500">
              {contactsToShow.filter(c => c.status === 'action').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            {activeCampaign ? (
              <>
                <p className="text-gray-600 text-sm">Campagne active</p>
                <p className="text-sm font-semibold text-primary-600">
                  📍 Rayon: {activeCampaign.radius} km
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-600 text-sm">Campagne</p>
                <button
                  onClick={() => setShowCampaignModal(true)}
                  className="mt-2 w-full bg-gradient-nocr text-white py-2 rounded-lg font-semibold hover:opacity-90 transition text-sm flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Nouvelle
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mode selection + Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                viewMode === 'list'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <List className="w-5 h-5" />
              Liste
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                viewMode === 'map'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Map className="w-5 h-5" />
              Carte
            </button>
            <button
              onClick={() => setViewMode('campaigns')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                viewMode === 'campaigns'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              📍 Campagnes
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                viewMode === 'calendar'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              📅 Calendrier
            </button>
          </div>
          
          <button
            onClick={() => setShowAddContactModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-nocr text-white rounded-lg hover:opacity-90 transition font-semibold ml-auto"
          >
            <Plus className="w-5 h-5" />
            Ajouter contact
          </button>

          <button
            onClick={() => exportContactsToCSV(filteredContacts, `contacts-${new Date().toISOString().split('T')[0]}.csv`)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
          >
            <Download className="w-5 h-5" />
            Exporter
          </button>
        </div>

        {/* ✅ BARRE DE RECHERCHE */}
        {viewMode === 'list' && (
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="🔍 Rechercher dans les contacts... (nom, téléphone, adresse, secteur...)"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Content */}
        {viewMode === 'list' ? (
          <div className="space-y-2">
            {filteredContacts.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  {searchQuery 
                    ? `Aucun contact ne correspond à la recherche "${searchQuery}"` 
                    : 'Aucun contact'}
                </p>
              </div>
            ) : (
              contactsToDisplay.map(contact => (
                <div key={contact.id} className="bg-white rounded-lg shadow hover:shadow-md transition">
                  <div
                    onClick={() => setExpandedContact(expandedContact === contact.id ? null : contact.id)}
                    className="p-4 cursor-pointer flex items-start justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCyclestatus(contact);
                          }}
                          className={`flex-shrink-0 rounded-full p-1 transition ${statusColors[contact.status]}`}
                        >
                          <Circle className="w-5 h-5" />
                        </button>
                        <h3 className="font-semibold text-gray-900">{contact.raisonSociale}</h3>
                        {/* Badge géolocalisation */}
                        {contact.lat && contact.lon ? (
                          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            🟢 OK
                          </span>
                        ) : (
                          <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                            🔴 NOK
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 ml-8">{contact.dirigeant}</p>
                      <p className="text-xs text-gray-500 ml-8 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {contact.adresse}
                      </p>
                      {activeCampaign && (
                        <p className="text-xs text-primary-600 ml-8 mt-1">
                          📍 {(activeCampaign.contacts.find(c => c.id === contact.id)?.distance || 0).toFixed(1)} km
                        </p>
                      )}
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition ${expandedContact === contact.id ? 'rotate-180' : ''}`} />
                  </div>

                  {expandedContact === contact.id && (
                    <div className="border-t border-gray-200 px-4 py-4 bg-gray-50 space-y-3">
                      {contact.telephone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-600" />
                          <a href={`tel:${contact.telephone}`} className="text-primary-600 hover:underline">
                            {contact.telephone}
                          </a>
                        </div>
                      )}
                      {contact.libelleNaf && (
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase">Secteur</p>
                          <p className="text-sm text-gray-700">{contact.libelleNaf}</p>
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => setSelectedContact(contact)}
                          className="flex-1 bg-primary-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-primary-600 transition"
                        >
                          Ouvrir fiche
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            
            {/* ✅ FOOTER PAGINATION */}
            {contactsToShow.length > 0 && totalPages > 1 && (
              <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between flex-wrap gap-4 mt-4">
                {/* Menu déroulant - Nombre de résultats */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-gray-700">Résultats par page:</label>
                  <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:border-gray-400 transition"
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>

                {/* Info pagination */}
                <div className="text-sm text-gray-600 font-semibold">
                  Affichage {startIndex + 1} à {Math.min(endIndex, contactsToShow.length)} sur {contactsToShow.length} contacts
                </div>

                {/* Boutons pagination */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-semibold"
                  >
                    ← Précédent
                  </button>

                  {/* Numéros de page - PAGINATION INTELLIGENTE */}
                  <div className="flex items-center gap-1">
                    {(() => {
                      const pages = [];
                      const maxPagesToShow = 5;
                      const halfPages = Math.floor(maxPagesToShow / 2);
                      
                      let startPage = Math.max(1, currentPage - halfPages);
                      let endPage = Math.min(totalPages, currentPage + halfPages);
                      
                      if (currentPage <= halfPages) {
                        endPage = Math.min(totalPages, maxPagesToShow);
                      }
                      
                      if (currentPage > totalPages - halfPages) {
                        startPage = Math.max(1, totalPages - maxPagesToShow + 1);
                      }

                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(i);
                      }

                      return (
                        <>
                          {startPage > 1 && (
                            <>
                              <button
                                onClick={() => handlePageChange(1)}
                                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-semibold transition"
                              >
                                1
                              </button>
                              {startPage > 2 && <span className="px-2 text-gray-500">...</span>}
                            </>
                          )}

                          {pages.map(page => (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                                currentPage === page
                                  ? 'bg-primary-500 text-white'
                                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          ))}

                          {endPage < totalPages && (
                            <>
                              {endPage < totalPages - 1 && <span className="px-2 text-gray-500">...</span>}
                              <button
                                onClick={() => handlePageChange(totalPages)}
                                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-semibold transition"
                              >
                                {totalPages}
                              </button>
                            </>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-semibold"
                  >
                    Suivant →
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : viewMode === 'map' ? (
          <MapView contacts={filteredContacts} onSelectContact={setSelectedContact} />
        ) : viewMode === 'campaigns' ? (
          <CampaignsView onSelectContact={setSelectedContact} />
        ) : (
          <CalendarView />
        )}
      </div>

      {/* Modals */}
      {selectedContact && (
        <ContactDetail contact={selectedContact} onClose={() => setSelectedContact(null)} />
      )}
      {showCampaignModal && (
        <ProspectionCampaign onClose={() => setShowCampaignModal(false)} />
      )}
      {showAddContactModal && (
        <AddContactModal onClose={() => setShowAddContactModal(false)} />
      )}
    </div>
  );
}

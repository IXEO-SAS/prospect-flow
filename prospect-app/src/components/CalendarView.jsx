import React, { useMemo, useState } from 'react';
import { useProspectStore } from '../store';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import ContactDetail from './ContactDetail';
import { exportCalendarActionsToCSV } from '../csvUtils';

export default function CalendarView() {
  const [dateRange, setDateRange] = useState({
    from: new Date().toISOString().split('T')[0],
    to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [selectedContact, setSelectedContact] = useState(null);

  const contacts = useProspectStore(s => s.contacts);
  const currentUser = useProspectStore(s => s.currentUser);
  const users = useProspectStore(s => s.users);

  // Collecter toutes les actions à venir du commercial
  const allNextActions = useMemo(() => {
    const userContacts = contacts.filter(c => c.assignedTo === currentUser?.id);
    const actions = [];

    userContacts.forEach(contact => {
      (contact.nextActions || []).forEach(action => {
        const actionDate = new Date(action.date).toISOString().split('T')[0];
        if (actionDate >= dateRange.from && actionDate <= dateRange.to) {
          actions.push({
            id: `${contact.id}-${action.date}`,
            contactId: contact.id,
            contactName: contact.raisonSociale,
            type: action.action || action.type || 'call', // Utilise action (moyen de contact) en priorité
            date: action.date,
            details: action.details,
          });
        }
      });
    });

    return actions.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [contacts, currentUser, dateRange]);

  // Grouper par date
  const actionsByDate = useMemo(() => {
    const grouped = {};
    allNextActions.forEach(action => {
      if (!grouped[action.date]) grouped[action.date] = [];
      grouped[action.date].push(action);
    });
    return grouped;
  }, [allNextActions]);

  const typeLabel = (type) => {
    return type === 'call' ? '📞 Appel' : type === 'visit' ? '🏢 Visite' : type === 'email' ? '📧 Email' : '❓ Autre';
  };

  return (
    <div className="space-y-4">
      {/* Filtre de date */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-gray-600 font-semibold mb-1">Du</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-gray-600 font-semibold mb-1">Au</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Bouton export */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => exportCalendarActionsToCSV(allNextActions, contacts, `actions-calendrier-${dateRange.from}-${dateRange.to}.csv`)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
        >
          <Download className="w-4 h-4" />
          Exporter
        </button>
      </div>

      {/* Tableau des actions par date */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {Object.keys(actionsByDate).length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Aucune action prévue dans cette période</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b-2 border-gray-300">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Contact</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.keys(actionsByDate)
                  .sort()
                  .map(date => (
                    <React.Fragment key={date}>
                      {actionsByDate[date].map((action, idx) => (
                        <tr
                          key={action.id}
                          className={`cursor-pointer transition ${idx === 0 ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-100'}`}
                          onClick={() => setSelectedContact(contacts.find(c => c.id === action.contactId))}
                        >
                          {idx === 0 && (
                            <td
                              rowSpan={actionsByDate[date].length}
                              className="px-6 py-3 font-semibold text-gray-700 bg-blue-50 border-r-4 border-r-primary-500"
                            >
                              {new Date(date).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </td>
                          )}
                          <td className="px-6 py-3">
                            <span className="font-semibold">{typeLabel(action.type)}</span>
                          </td>
                          <td className="px-6 py-3 text-gray-700 font-semibold">{action.contactName}</td>
                          <td className="px-6 py-3 text-gray-600">{action.details || '-'}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedContact && (
        <ContactDetail
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
        />
      )}
    </div>
  );
}

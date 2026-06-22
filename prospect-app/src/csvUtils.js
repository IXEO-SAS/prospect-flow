// Export CSV utilities
export const exportContactsToCSV = (contacts, filename = 'contacts.csv') => {
  if (!contacts || contacts.length === 0) {
    alert('Aucun contact à exporter');
    return;
  }

  const headers = [
    'Raison Sociale',
    'Dirigeant',
    'Adresse',
    'Téléphone',
    'Email',
    'Code NAF',
    'Libellé NAF',
    'Statut',
    'Assigné à',
    'Date création',
  ];

  const rows = contacts.map(c => [
    c.raisonSociale || '',
    c.dirigeant || '',
    c.adresse || '',
    c.telephone || '',
    c.email || '',
    c.codeNaf || '',
    c.libelleNaf || '',
    c.status === 'new' ? 'Non contacté' : c.status === 'contacted' ? 'Contacté' : 'Action',
    c.assignedTo || '',
    c.createdAt ? new Date(c.createdAt).toLocaleDateString('fr-FR') : '',
  ]);

  downloadCSV(headers, rows, filename);
};

export const exportCampaignContactsToCSV = (campaign, contacts, filename) => {
  if (!campaign.contacts || campaign.contacts.length === 0) {
    alert('Aucun contact dans cette campagne');
    return;
  }

  const campaignContacts = campaign.contacts
    .map(cc => {
      const contact = contacts.find(c => c.id === cc.id);
      return contact ? { ...contact, distance: cc.distance || 0 } : null;
    })
    .filter(c => c);

  const headers = [
    'Raison Sociale',
    'Dirigeant',
    'Adresse',
    'Téléphone',
    'Distance (km)',
    'Statut',
  ];

  const rows = campaignContacts.map(c => [
    c.raisonSociale || '',
    c.dirigeant || '',
    c.adresse || '',
    c.telephone || '',
    c.distance ? c.distance.toFixed(1) : '0',
    c.status === 'new' ? 'Non contacté' : c.status === 'contacted' ? 'Contacté' : 'Action',
  ]);

  downloadCSV(headers, rows, filename || `campagne-${campaign.name}.csv`);
};

export const exportCalendarActionsToCSV = (actions, contacts, filename = 'actions-calendrier.csv') => {
  if (!actions || actions.length === 0) {
    alert('Aucune action à exporter');
    return;
  }

  const headers = [
    'Date',
    'Type',
    'Entreprise',
    'Détails',
    'Action',
  ];

  const rows = actions.map(a => {
    const contact = contacts.find(c => c.id === a.contactId);
    return [
      a.date || '',
      a.type === 'call' ? 'Appel' : a.type === 'relance' ? 'Relance' : a.type === 'rdv' ? 'Rendez-vous' : a.type === 'doc' ? 'Document' : 'Suivi',
      contact?.raisonSociale || '',
      a.details || '',
      a.action === 'call' ? '📞' : a.action === 'visit' ? '🏢' : '📧',
    ];
  });

  downloadCSV(headers, rows, filename);
};

// Fonction utilitaire pour créer et télécharger le CSV
const downloadCSV = (headers, rows, filename) => {
  // Échapper les guillemets et les virgules dans les données
  const escapedRows = rows.map(row =>
    row.map(cell => {
      const str = String(cell || '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    })
  );

  // Créer le contenu CSV
  const csv = [
    headers.join(','),
    ...escapedRows.map(row => row.join(',')),
  ].join('\n');

  // Ajouter BOM pour UTF-8
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });

  // Créer et déclencher le téléchargement
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

import * as XLSX from 'xlsx';

// Lire un fichier XLSX et retourner données + en-têtes
export const readXlsxFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
        const headers = Object.keys(data[0] || {});
        resolve({ headers, data });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
};

// Mapper les colonnes source vers champs cibles
// mapping = { 'RAISON_SOCIALE': 'raisonSociale', 'TEL': 'telephone', ... }
export const mapContactsFromXlsx = (data, mapping) => {
  return data.map(row => {
    const contact = {};
    Object.entries(mapping).forEach(([sourceField, targetField]) => {
      if (sourceField in row) {
        contact[targetField] = row[sourceField];
      }
    });
    return contact;
  });
};

// Suggestions de mapping automatique (fuzzy matching sur noms colonnes)
export const suggestMapping = (headers) => {
  const suggestions = {};
  
  const commonPatterns = {
    raisonSociale: ['raison social', 'entreprise', 'company', 'nom', 'societe'],
    dirigeant: ['dirigeant', 'contact', 'nom contact', 'interlocuteur', 'personne'],
    adresse: ['adresse', 'address', 'rue'],
    telephone: ['tel', 'telephone', 'phone', 'tél'],
    codeNaf: ['code naf', 'naf', 'ape'],
    libelleNaf: ['libelle naf', 'secteur', 'activité', 'sector'],
    email: ['email', 'mail', 'e-mail'],
  };
  
  headers.forEach(header => {
    const normalized = header.toLowerCase().trim();
    Object.entries(commonPatterns).forEach(([target, patterns]) => {
      patterns.forEach(pattern => {
        if (normalized.includes(pattern)) {
          suggestions[header] = target;
        }
      });
    });
  });
  
  return suggestions;
};

// Template pour interface mapping
export const getTemplateFields = () => [
  { id: 'raisonSociale', label: 'Raison Sociale', required: true },
  { id: 'dirigeant', label: 'Dirigeant/Contact', required: true },
  { id: 'adresse', label: 'Adresse', required: true },
  { id: 'telephone', label: 'Téléphone', required: false },
  { id: 'codeNaf', label: 'Code NAF', required: false },
  { id: 'libelleNaf', label: 'Libellé NAF/Secteur', required: false },
  { id: 'email', label: 'Email', required: false },
];

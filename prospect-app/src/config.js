// Configuration application
const isDevelopment = import.meta.env.MODE === 'development';

export const APP_CONFIG = {
  isDevelopment,
  showDemoButtons: isDevelopment, // Affiche les boutons de démo seulement en dev
  appName: 'ProspectFlow',
  appVersion: '1.0.0',
  
  // Approbation TOUJOURS active (boutons démo auto-approuvés)
  requireApproval: true,
};

export default APP_CONFIG;

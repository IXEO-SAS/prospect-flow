import React from 'react';
import { useProspectStore } from '../store';
import ManagerDashboard from './ManagerDashboard';
import CommercialDashboard from './CommercialDashboard';

export default function ManagerDashboardWrapper() {
  const viewMode = useProspectStore(s => s.viewMode);
  const setViewMode = useProspectStore(s => s.setViewMode);

  // ✅ Le wrapper choisit quel composant afficher
  // Les composants enfants peuvent avoir leurs propres hooks sans problème
  
  if (viewMode === 'commercial') {
    return <CommercialDashboard onSwitchToManager={() => setViewMode('manager')} />;
  }

  return <ManagerDashboard />;
}

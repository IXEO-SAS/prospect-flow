import React, { useEffect } from 'react';
import { useProspectStore } from './store';
import LoginPage from './components/LoginPage';
import CommercialDashboard from './components/CommercialDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import Notifications from './components/Notifications';

function App() {
  const currentUser = useProspectStore(s => s.currentUser);
  const loadState = useProspectStore(s => s.loadState);

  // Charger l'état au démarrage
  useEffect(() => {
    loadState();
    
    // Charger depuis Supabase (fusion avec données locales)
    const initSupabase = async () => {
      const initializeFromSupabase = useProspectStore.getState().initializeFromSupabase;
      await initializeFromSupabase();
    };
    
    initSupabase();
  }, []);

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <>
      {currentUser.role === 'commercial' ? (
        <CommercialDashboard />
      ) : (
        <ManagerDashboard />
      )}
      <Notifications />
    </>
  );
}

export default App;

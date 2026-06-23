import React, { useEffect } from 'react';
import { useProspectStore } from './store';
import { useSupabaseRealtime } from './hooks/useSupabaseRealtime';
import LoginPage from './components/LoginPage';
import CommercialDashboard from './components/CommercialDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import Notifications from './components/Notifications';

function App() {
  const currentUser = useProspectStore(s => s.currentUser);

  // ✅ ACTIVER REALTIME
  useSupabaseRealtime();

  // Charger UNIQUEMENT depuis Supabase au démarrage
  useEffect(() => {
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

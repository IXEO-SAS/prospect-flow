import { create } from 'zustand';
import { fetchAllUsers, addUserSupabase, approveUserSupabase, rejectUserSupabase } from './services/supabaseUsers';
import { fetchAllContacts, addContactSupabase, updateContactSupabase, deleteContactSupabase } from './services/supabaseContacts';
import { fetchAllCampaigns, addCampaignSupabase, updateCampaignSupabase, deleteCampaignSupabase } from './services/supabaseCampaigns';
import { fetchAllActions, addActionSupabase, deleteActionSupabase } from './services/supabaseActions';

// Générateur d'ID VRAIMENT unique (UUID v4 simplifié)
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`;
};

// Store principal
export const useProspectStore = create((set, get) => ({
  // Auth & Users
  currentUser: null,
  users: [], // {id, name, email, role, color, approvalStatus: 'pending'|'approved'|'rejected'}
  
  setCurrentUser: (user) => set({ currentUser: user }),
  addUser: (user) => {
    // Ajouter en local
    set((state) => ({ 
      users: [...state.users, { ...user, approvalStatus: 'pending' }] 
    }));
    
    // Envoyer à Supabase (async, pas bloquant)
    addUserSupabase({ ...user, approvalStatus: 'pending' }).catch(err => 
      console.error('❌ Supabase addUser error:', err)
    );
  },
  removeUser: (userId) => set((state) => ({
    users: state.users.filter(u => u.id !== userId),
    // Réaffecter tous les contacts de cet utilisateur à null
    contacts: state.contacts.map(c => 
      c.assignedTo === userId ? { ...c, assignedTo: null } : c
    ),
  })),
  
  // Approbation des comptes
  approveUser: (userId) => {
    set((state) => ({
      users: state.users.map(u => u.id === userId ? { ...u, approvalStatus: 'approved' } : u),
    }));
    
    approveUserSupabase(userId).catch(err => 
      console.error('❌ Supabase approveUser error:', err)
    );
  },
  rejectUser: (userId) => {
    set((state) => ({
      users: state.users.filter(u => u.id !== userId),
    }));
    
    rejectUserSupabase(userId).catch(err => 
      console.error('❌ Supabase rejectUser error:', err)
    );
  },
  
  // Contacts
  contacts: [],
  addContact: (contact) => {
    const newContact = {
      id: contact.id || generateId(),
      createdAt: new Date().toISOString(),
      assignedTo: null,
      nextActions: [],
      ...contact,
    };
    
    set((state) => ({
      contacts: [...state.contacts, newContact],
    }));
    
    addContactSupabase(newContact).catch(err => 
      console.error('❌ Supabase addContact error:', err)
    );
  },
  updateContact: (id, updates) => {
    set((state) => ({
      contacts: state.contacts.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
    
    updateContactSupabase(id, updates).catch(err => 
      console.error('❌ Supabase updateContact error:', err)
    );
  },
  deleteContact: (id) => {
    set((state) => ({
      contacts: state.contacts.filter(c => c.id !== id),
    }));
    deleteContactSupabase(id).catch(err => console.error('❌ Supabase deleteContact error:', err));
  },
  setContacts: (contacts) => set({ contacts }),
  
  // Campagnes de prospection
  campaigns: [],
  addCampaign: (campaign) => set((state) => ({
    campaigns: [...state.campaigns, {
      id: generateId(),
      createdAt: new Date().toISOString(),
      status: 'active', // 'active', 'paused', 'completed'
      name: '', // Nom optionnel de la campagne
      ...campaign,
    }],
  })),
  updateCampaign: (id, updates) => set((state) => ({
    campaigns: state.campaigns.map(c => c.id === id ? { ...c, ...updates } : c),
  })),
  removeCampaign: (id) => set((state) => ({
    campaigns: state.campaigns.filter(c => c.id !== id),
  })),
  
  // Contacts
  removeContact: (id) => {
    set((state) => ({
      contacts: state.contacts.filter(c => c.id !== id),
    }));
    deleteContactSupabase(id).catch(err => console.error('❌ Supabase removeContact error:', err));
  },
  
  // Historique actions
  actions: [],
  addAction: (action) => set((state) => ({
    actions: [...state.actions, {
      id: generateId(),
      timestamp: new Date().toISOString(),
      ...action,
    }],
  })),
  getContactActions: (contactId) => {
    const { actions } = get();
    return actions.filter(a => a.contactId === contactId).sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  },
  
  // Notifications
  notifications: [],
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, {
      id: generateId(),
      ...notification,
    }],
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id),
  })),
  
  // Persistence localStorage
  persistState: () => {
    const state = get();
    localStorage.setItem('prospect-app-state', JSON.stringify({
      contacts: state.contacts,
      campaigns: state.campaigns,
      actions: state.actions,
      users: state.users,
    }));
  },
  
  loadState: () => {
    const saved = localStorage.getItem('prospect-app-state');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        
        // Fonction pour fixer les IDs dupliqués
        const fixDuplicateIds = (items) => {
          if (!items || !Array.isArray(items)) return [];
          
          const seenIds = new Set();
          let counter = Date.now();
          
          return items.map((item, idx) => {
            let newId = item.id;
            
            // Si l'ID existe déjà ou est invalide, génère un nouveau (STRING)
            if (seenIds.has(newId) || !newId) {
              newId = `${counter}-${idx}-${Math.random().toString(36).substr(2, 9)}`;
            }
            
            seenIds.add(newId);
            return { ...item, id: newId };
          });
        };
        
        const cleanContacts = fixDuplicateIds(data.contacts || []);
        const cleanCampaigns = fixDuplicateIds(data.campaigns || []);
        const cleanActions = fixDuplicateIds(data.actions || []);
        const cleanUsers = fixDuplicateIds(data.users || []);
        
        set({
          contacts: cleanContacts,
          campaigns: cleanCampaigns,
          actions: cleanActions,
          users: cleanUsers,
        });
      } catch (e) {
        console.error('Erreur chargement état:', e);
        // Clear corrupted data
        localStorage.removeItem('prospect-app-state');
      }
    }
  },

  // Charger les données depuis Supabase (appelé au démarrage)
  initializeFromSupabase: async () => {
    console.log('🔄 Chargement des données depuis Supabase...');
    
    try {
      const [users, contacts, campaigns, actions] = await Promise.all([
        fetchAllUsers(),
        fetchAllContacts(),
        fetchAllCampaigns(),
        fetchAllActions(),
      ]);

      set({
        users: users.length > 0 ? users : [],
        contacts: contacts.length > 0 ? contacts : [],
        campaigns: campaigns.length > 0 ? campaigns : [],
        actions: actions.length > 0 ? actions : [],
      });

      console.log('✅ Données chargées depuis Supabase');
      console.log(`   Users: ${users.length}, Contacts: ${contacts.length}, Campaigns: ${campaigns.length}`);
    } catch (err) {
      console.error('❌ Erreur chargement Supabase:', err.message);
      console.log('⚠️ Utilisation des données locales (localStorage)');
    }
  },
}));

// Persister après chaque changement
useProspectStore.subscribe((state) => {
  state.persistState();
});

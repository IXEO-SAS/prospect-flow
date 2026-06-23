import { create } from 'zustand';
import { fetchAllUsers, addUserSupabase, approveUserSupabase, rejectUserSupabase, deleteUserSupabase } from './services/supabaseUsers';
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
  removeUser: (userId) => {
    set((state) => ({
      users: state.users.filter(u => u.id !== userId),
      // Réaffecter tous les contacts de cet utilisateur à null
      contacts: state.contacts.map(c => 
        c.assignedTo === userId ? { ...c, assignedTo: null } : c
      ),
    }));
    
    // ✅ Supprimer aussi dans Supabase
    deleteUserSupabase(userId).catch(err => 
      console.error('❌ Supabase removeUser error:', err)
    );
  },
  
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
    const state = get();
    const currentUser = state.currentUser;
    
    const newContact = {
      id: contact.id || generateId(),
      createdAt: new Date().toISOString(),
      // ✅ Si c'est un commercial qui crée, auto-affectation
      assignedTo: currentUser && currentUser.role === 'commercial' ? currentUser.id : null,
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
  addCampaign: (campaign) => {
    const newCampaign = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      status: 'active',
      name: '',
      ...campaign,
    };
    
    set((state) => ({
      campaigns: [...state.campaigns, newCampaign],
    }));
    
    addCampaignSupabase(newCampaign).catch(err => 
      console.error('❌ Supabase addCampaign error:', err)
    );
  },
  updateCampaign: (id, updates) => {
    set((state) => ({
      campaigns: state.campaigns.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
    
    updateCampaignSupabase(id, updates).catch(err => 
      console.error('❌ Supabase updateCampaign error:', err)
    );
  },
  removeCampaign: (id) => {
    set((state) => ({
      campaigns: state.campaigns.filter(c => c.id !== id),
    }));
    
    deleteCampaignSupabase(id).catch(err => 
      console.error('❌ Supabase removeCampaign error:', err)
    );
  },
  
  // Contacts
  removeContact: (id) => {
    set((state) => ({
      contacts: state.contacts.filter(c => c.id !== id),
    }));
    deleteContactSupabase(id).catch(err => console.error('❌ Supabase removeContact error:', err));
  },
  
  // Historique actions
  actions: [],
  addAction: (action) => {
    const newAction = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      ...action,
    };
    
    set((state) => ({
      actions: [...state.actions, newAction],
    }));
    
    addActionSupabase(newAction).catch(err => 
      console.error('❌ Supabase addAction error:', err)
    );
  },
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

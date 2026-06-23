import { useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useProspectStore } from '../store';

export const useSupabaseRealtime = () => {
  const {
    addContactLocal,
    updateContact,
    deleteContact,
    addCampaignLocal,
    updateCampaign,
    removeCampaign,
    addActionLocal,
    addNotification,
  } = useProspectStore();

  useEffect(() => {
    console.log('📡 Setting up Realtime listeners...');

    // ====== CONTACTS REALTIME ======
    const contactsChannel = supabase
      .channel('public:contacts:*')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'contacts',
        },
        (payload) => {
          console.log('✅ New contact added (realtime):', payload.new);
          const contact = {
            id: payload.new.id,
            raisonSociale: payload.new.raison_sociale,
            dirigeant: payload.new.dirigeant,
            adresse: payload.new.adresse,
            telephone: payload.new.telephone,
            email: payload.new.email,
            codeNaf: payload.new.code_naf,
            libelleNaf: payload.new.libelle_naf,
            lat: payload.new.lat,
            lon: payload.new.lon,
            assignedTo: payload.new.assigned_to,
            status: payload.new.status,
            interests: payload.new.interests || {},
            interlocutors: payload.new.interlocutors || [],
            history: payload.new.history || [],
            actions: payload.new.actions || [],
            nextActions: payload.new.next_actions || [],
            createdAt: payload.new.created_at,
          };
          addContactLocal(contact);
          addNotification({
            type: 'success',
            message: `🔄 Nouveau contact: ${contact.raisonSociale}`,
            duration: 3000,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'contacts',
        },
        (payload) => {
          console.log('✅ Contact updated (realtime):', payload.new);
          const updates = {
            raisonSociale: payload.new.raison_sociale,
            dirigeant: payload.new.dirigeant,
            adresse: payload.new.adresse,
            telephone: payload.new.telephone,
            email: payload.new.email,
            codeNaf: payload.new.code_naf,
            libelleNaf: payload.new.libelle_naf,
            lat: payload.new.lat,
            lon: payload.new.lon,
            assignedTo: payload.new.assigned_to,
            status: payload.new.status,
            interests: payload.new.interests,
            interlocutors: payload.new.interlocutors,
            history: payload.new.history,
            actions: payload.new.actions,
            nextActions: payload.new.next_actions,
          };
          updateContact(payload.new.id, updates);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'contacts',
        },
        (payload) => {
          console.log('✅ Contact deleted (realtime):', payload.old);
          deleteContact(payload.old.id);
        }
      )
      .subscribe((status) => {
        console.log('📡 Contacts channel status:', status);
      });

    // ====== CAMPAIGNS REALTIME ======
    const campaignsChannel = supabase
      .channel('public:campaigns:*')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'campaigns',
        },
        (payload) => {
          console.log('✅ New campaign added (realtime):', payload.new);
          const campaign = {
            id: payload.new.id,
            commercialId: payload.new.commercial_id,
            name: payload.new.name,
            startContactId: payload.new.start_contact_id,
            radius: payload.new.radius,
            contacts: payload.new.contacts || [],
            currentIndex: payload.new.current_index,
            status: payload.new.status,
            createdAt: payload.new.created_at,
          };
          addCampaignLocal(campaign);
          addNotification({
            type: 'success',
            message: `🔄 Nouvelle campagne: ${campaign.name}`,
            duration: 3000,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'campaigns',
        },
        (payload) => {
          console.log('✅ Campaign updated (realtime):', payload.new);
          const updates = {
            name: payload.new.name,
            radius: payload.new.radius,
            contacts: payload.new.contacts,
            currentIndex: payload.new.current_index,
            status: payload.new.status,
          };
          updateCampaign(payload.new.id, updates);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'campaigns',
        },
        (payload) => {
          console.log('✅ Campaign deleted (realtime):', payload.old);
          removeCampaign(payload.old.id);
        }
      )
      .subscribe((status) => {
        console.log('📡 Campaigns channel status:', status);
      });

    // ====== ACTIONS REALTIME ======
    const actionsChannel = supabase
      .channel('public:actions:*')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'actions',
        },
        (payload) => {
          console.log('✅ New action added (realtime):', payload.new);
          const action = {
            id: payload.new.id,
            contactId: payload.new.contact_id,
            type: payload.new.type,
            details: payload.new.details,
            createdAt: payload.new.created_at,
          };
          addActionLocal(action);
        }
      )
      .subscribe((status) => {
        console.log('📡 Actions channel status:', status);
      });

    return () => {
      console.log('📡 Cleaning up Realtime listeners...');
      contactsChannel.unsubscribe();
      campaignsChannel.unsubscribe();
      actionsChannel.unsubscribe();
    };
  }, []);
};


import { supabase } from '../supabaseClient';

// Récupérer tous les contacts (avec pagination pour > 1000)
export const fetchAllContacts = async () => {
  try {
    // ✅ REQUÊTE 1 : Premiers 1000 contacts
    const { data: data1, error: error1 } = await supabase
      .from('contacts')
      .select('*')
      .order('id', { ascending: true })
      .range(0, 999); // 0-999 = 1000 contacts
    
    if (error1) throw error1;

    // ✅ REQUÊTE 2 : Contacts suivants (offset 1000)
    const { data: data2, error: error2 } = await supabase
      .from('contacts')
      .select('*')
      .order('id', { ascending: true })
      .range(1000, 9999); // À partir de 1000 (cherche jusqu'à 10k par sécurité)
    
    if (error2) throw error2;

    // ✅ COMBINER LES DEUX
    const allData = [...(data1 || []), ...(data2 || [])];
    
    // ✅ LOG DE DEBUG
    console.log('📊 Contacts reçus (requête 1):', data1?.length || 0);
    console.log('📊 Contacts reçus (requête 2):', data2?.length || 0);
    console.log('📊 TOTAL Contacts chargés:', allData.length);
    
    return allData.map(c => ({
      id: c.id,
      raisonSociale: c.raison_sociale,
      dirigeant: c.dirigeant,
      adresse: c.adresse,
      telephone: c.telephone,
      email: c.email,
      codeNaf: c.code_naf,
      libelleNaf: c.libelle_naf,
      lat: c.lat,
      lon: c.lon,
      assignedTo: c.assigned_to,
      status: c.status,
      interests: c.interests || {},
      interlocutors: c.interlocutors || [],
      history: c.history || [],
      actions: c.actions || [],
      nextActions: c.next_actions || [],
      createdAt: c.created_at,
    }));
  } catch (err) {
    console.error('❌ Error fetching contacts:', err.message);
    return [];
  }
};

// Ajouter un contact
export const addContactSupabase = async (contact) => {
  try {
    const { error } = await supabase
      .from('contacts')
      .insert([{
        id: contact.id,
        raison_sociale: contact.raisonSociale,
        dirigeant: contact.dirigeant,
        adresse: contact.adresse,
        telephone: contact.telephone,
        email: contact.email,
        code_naf: contact.codeNaf,
        libelle_naf: contact.libelleNaf,
        lat: contact.lat,
        lon: contact.lon,
        assigned_to: contact.assignedTo,
        status: contact.status,
        interests: contact.interests,
        interlocutors: contact.interlocutors,
        history: contact.history,
        actions: contact.actions,
        next_actions: contact.nextActions,
      }]);
    
    if (error) throw error;
    console.log('✅ Contact added');
    return true;
  } catch (err) {
    console.error('❌ Error adding contact:', err.message);
    return false;
  }
};

// Mettre à jour un contact
export const updateContactSupabase = async (contactId, updates) => {
  try {
    const mapped = {};
    Object.entries(updates).forEach(([key, value]) => {
      // Mapper camelCase → snake_case
      const snakeCase = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      mapped[snakeCase] = value;
    });

    const { error } = await supabase
      .from('contacts')
      .update(mapped)
      .eq('id', contactId);
    
    if (error) throw error;
    console.log('✅ Contact updated');
    return true;
  } catch (err) {
    console.error('❌ Error updating contact:', err.message);
    return false;
  }
};

// Supprimer UN contact
export const deleteContactSupabase = async (contactId) => {
  try {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', contactId);
    
    if (error) throw error;
    console.log('✅ Contact deleted');
    return true;
  } catch (err) {
    console.error('❌ Error deleting contact:', err.message);
    return false;
  }
};

// Supprimer TOUS les contacts
export const deleteAllContactsSupabase = async () => {
  try {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .neq('id', ''); // Supprime tous (neq = not equal)
    
    if (error) throw error;
    console.log('✅ All contacts deleted from Supabase');
    return true;
  } catch (err) {
    console.error('❌ Error deleting all contacts:', err.message);
    return false;
  }
};
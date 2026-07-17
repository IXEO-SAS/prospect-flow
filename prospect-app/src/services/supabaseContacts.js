import { supabase } from '../supabaseClient';

// Récupérer tous les contacts (avec pagination dynamique pour > 1000)
export const fetchAllContacts = async () => {
  try {
    const allData = [];
    let offset = 0;
    const pageSize = 1000;
    let hasMore = true;

    // ✅ BOUCLE DYNAMIQUE : charger par chunks jusqu'à ce qu'il n'y ait plus de données
    while (hasMore) {
      const rangeStart = offset;
      const rangeEnd = offset + pageSize - 1;

      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('id', { ascending: true })
        .range(rangeStart, rangeEnd);

      if (error) throw error;

      if (!data || data.length === 0) {
        // Pas plus de données, on arrête
        hasMore = false;
        console.log('✅ Fin de pagination atteinte');
      } else {
        // Ajouter les données et continuer
        allData.push(...data);
        console.log(`📊 Requête ${Math.floor(offset / pageSize) + 1}: ${data.length} contacts (offset: ${rangeStart})`);
        offset += pageSize;
      }
    }

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
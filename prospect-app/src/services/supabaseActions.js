import { supabase } from '../supabaseClient';

// Récupérer toutes les actions
export const fetchAllActions = async () => {
  try {
    const { data, error } = await supabase
      .from('actions')
      .select('*');
    
    if (error) throw error;
    
    return data.map(a => ({
      id: a.id,
      contactId: a.contact_id,
      type: a.type,
      details: a.details,
      createdAt: a.created_at,
    }));
  } catch (err) {
    console.error('❌ Error fetching actions:', err.message);
    return [];
  }
};

// Ajouter une action
export const addActionSupabase = async (action) => {
  try {
    const { error } = await supabase
      .from('actions')
      .insert([{
        id: action.id,
        contact_id: action.contactId,
        type: action.type,
        details: action.details,
      }]);
    
    if (error) throw error;
    console.log('✅ Action added');
    return true;
  } catch (err) {
    console.error('❌ Error adding action:', err.message);
    return false;
  }
};

// Supprimer UNE action
export const deleteActionSupabase = async (actionId) => {
  try {
    const { error } = await supabase
      .from('actions')
      .delete()
      .eq('id', actionId);
    
    if (error) throw error;
    console.log('✅ Action deleted');
    return true;
  } catch (err) {
    console.error('❌ Error deleting action:', err.message);
    return false;
  }
};

// Supprimer TOUTES les actions
export const deleteAllActionsSupabase = async () => {
  try {
    const { error } = await supabase
      .from('actions')
      .delete()
      .neq('id', '');
    
    if (error) throw error;
    console.log('✅ All actions deleted from Supabase');
    return true;
  } catch (err) {
    console.error('❌ Error deleting all actions:', err.message);
    return false;
  }
};

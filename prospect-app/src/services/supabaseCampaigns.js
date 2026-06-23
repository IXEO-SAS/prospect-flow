import { supabase } from '../supabaseClient';

// Récupérer toutes les campaigns
export const fetchAllCampaigns = async () => {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*');
    
    if (error) throw error;
    
    return data.map(c => ({
      id: c.id,
      commercialId: c.commercial_id,
      name: c.name,
      startContactId: c.start_contact_id,
      radius: c.radius,
      contacts: c.contacts || [],
      currentIndex: c.current_index,
      status: c.status,
      createdAt: c.created_at,
    }));
  } catch (err) {
    console.error('❌ Error fetching campaigns:', err.message);
    return [];
  }
};

// Ajouter une campaign
export const addCampaignSupabase = async (campaign) => {
  try {
    const { error } = await supabase
      .from('campaigns')
      .insert([{
        id: campaign.id,
        commercial_id: campaign.commercialId,
        name: campaign.name,
        start_contact_id: campaign.startContactId,
        radius: campaign.radius,
        contacts: campaign.contacts,
        current_index: campaign.currentIndex,
        status: campaign.status,
      }]);
    
    if (error) throw error;
    console.log('✅ Campaign added');
    return true;
  } catch (err) {
    console.error('❌ Error adding campaign:', err.message);
    return false;
  }
};

// Mettre à jour une campaign
export const updateCampaignSupabase = async (campaignId, updates) => {
  try {
    const mapped = {};
    Object.entries(updates).forEach(([key, value]) => {
      const snakeCase = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      mapped[snakeCase] = value;
    });

    const { error } = await supabase
      .from('campaigns')
      .update(mapped)
      .eq('id', campaignId);
    
    if (error) throw error;
    console.log('✅ Campaign updated');
    return true;
  } catch (err) {
    console.error('❌ Error updating campaign:', err.message);
    return false;
  }
};

// Supprimer une campaign
export const deleteCampaignSupabase = async (campaignId) => {
  try {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', campaignId);
    
    if (error) throw error;
    console.log('✅ Campaign deleted');
    return true;
  } catch (err) {
    console.error('❌ Error deleting campaign:', err.message);
    return false;
  }
};

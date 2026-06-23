import { supabase } from '../supabaseClient';

// Récupérer tous les users
export const fetchAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) throw error;
    
    // Mapper Supabase → format app
    return data.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      password: u.password,
      role: u.role,
      color: u.color,
      approvalStatus: u.approval_status,
      permissions: u.permissions,
    }));
  } catch (err) {
    console.error('❌ Error fetching users:', err.message);
    return [];
  }
};

// Ajouter un user
export const addUserSupabase = async (user) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: user.id,
        email: user.email,
        name: user.name,
        password: user.password,
        role: user.role,
        color: user.color,
        approval_status: user.approvalStatus || 'pending',
        permissions: user.permissions,
      }])
      .select();
    
    if (error) throw error;
    
    console.log('✅ User added to Supabase');
    return data[0];
  } catch (err) {
    console.error('❌ Error adding user:', err.message);
    return null;
  }
};

// Approuver un user
export const approveUserSupabase = async (userId) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ approval_status: 'approved' })
      .eq('id', userId);
    
    if (error) throw error;
    
    console.log('✅ User approved');
    return true;
  } catch (err) {
    console.error('❌ Error approving user:', err.message);
    return false;
  }
};

// Rejeter un user
export const rejectUserSupabase = async (userId) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (error) throw error;
    
    console.log('✅ User rejected');
    return true;
  } catch (err) {
    console.error('❌ Error rejecting user:', err.message);
    return false;
  }
};

// Supprimer un user
export const deleteUserSupabase = async (userId) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (error) throw error;
    
    console.log('✅ User deleted');
    return true;
  } catch (err) {
    console.error('❌ Error deleting user:', err.message);
    return false;
  }
};

// Connecter un user (vérifier email + password)
export const loginUserSupabase = async (email, password) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();
    
    if (error) throw error;
    
    // Mapper
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      password: data.password,
      role: data.role,
      color: data.color,
      approvalStatus: data.approval_status,
      permissions: data.permissions,
    };
  } catch (err) {
    console.error('❌ Error login:', err.message);
    return null;
  }
};

import { supabase } from './client';

// ==========================================
// CUSTOMER API
// ==========================================

export const fetchCustomers = async () => {
  const { data, error } = await supabase
    .from('customer')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
  return data || [];
};

export const createCustomer = async (customerData) => {
  // Generate a random ID if not provided (e.g. CUST-xxxx)
  const customer_id = customerData.customer_id || `CUST-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

  const { data, error } = await supabase
    .from('customer')
    .insert([
      {
        customer_id,
        last_name: customerData.last_name,
        first_name: customerData.first_name,
        phone: customerData.phone,
        email: customerData.email,
        is_account_activated: customerData.is_account_activated !== undefined ? customerData.is_account_activated : true,
        total_spent: customerData.total_spent || 0,
        password_hash: customerData.password_hash || 'hash' // mock password
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
  return data;
};

export const updateCustomer = async (customer_id, customerData) => {
  const { data, error } = await supabase
    .from('customer')
    .update({
      last_name: customerData.last_name,
      first_name: customerData.first_name,
      phone: customerData.phone,
      email: customerData.email,
      is_account_activated: customerData.is_account_activated
    })
    .eq('customer_id', customer_id)
    .select()
    .single();

  if (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
  return data;
};

export const deleteCustomer = async (customer_id) => {
  // Try to delete. Might fail if there are foreign key constraints (pets/bookings)
  const { error } = await supabase
    .from('customer')
    .delete()
    .eq('customer_id', customer_id);

  if (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
  return true;
};

// ==========================================
// PET API
// ==========================================

export const fetchPets = async () => {
  const { data, error } = await supabase
    .from('pet')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pets:', error);
    throw error;
  }
  return data || [];
};

export const createPet = async (petData) => {
  const pet_id = petData.pet_id || `PET-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

  const { data, error } = await supabase
    .from('pet')
    .insert([
      {
        pet_id,
        customer_id: petData.customer_id,
        pet_name: petData.pet_name,
        species: petData.species,
        size: petData.size,
        breed: petData.breed,
        weight: petData.weight || 0,
        dob: petData.dob || '2020-01-01',
        gender: petData.gender,
        behavior_notes: petData.behavior_notes,
        allergy_notes: petData.allergy_notes,
        special_notes: petData.special_notes
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating pet:', error);
    throw error;
  }
  return data;
};

export const updatePet = async (pet_id, petData) => {
  const { data, error } = await supabase
    .from('pet')
    .update({
      pet_name: petData.pet_name,
      species: petData.species,
      size: petData.size,
      breed: petData.breed,
      weight: petData.weight,
      dob: petData.dob,
      gender: petData.gender,
      behavior_notes: petData.behavior_notes,
      allergy_notes: petData.allergy_notes,
      special_notes: petData.special_notes
    })
    .eq('pet_id', pet_id)
    .select()
    .single();

  if (error) {
    console.error('Error updating pet:', error);
    throw error;
  }
  return data;
};

export const deletePet = async (pet_id) => {
  const { error } = await supabase
    .from('pet')
    .delete()
    .eq('pet_id', pet_id);

  if (error) {
    console.error('Error deleting pet:', error);
    throw error;
  }
  return true;
};

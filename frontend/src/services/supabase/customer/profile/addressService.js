import { supabase } from '../../client';

export async function getAddresses(customerId) {
  const { data, error } = await supabase
    .from('customer_address')
    .select('*')
    .eq('customer_id', customerId)
    .order('is_default', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addAddress({ customerId, recipientName, recipientPhone, streetAddress, ward, district, province, deliveryNote, isDefault }) {
  if (isDefault) await clearDefaultAddress(customerId);

  const { data, error } = await supabase
    .from('customer_address')
    .insert({
      address_id: `ADR-${Date.now().toString(36).toUpperCase()}`,
      customer_id: customerId,
      recipient_name: recipientName,
      recipient_phone: recipientPhone,
      street_address: streetAddress,
      ward,
      district,
      province,
      delivery_note: deliveryNote || null,
      is_default: Boolean(isDefault),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function setDefaultAddress(customerId, addressId) {
  await clearDefaultAddress(customerId);
  const { error } = await supabase.from('customer_address').update({ is_default: true }).eq('address_id', addressId);
  if (error) throw error;
}

export async function deleteAddress(addressId) {
  const { error } = await supabase.from('customer_address').delete().eq('address_id', addressId);
  if (error) throw error;
}

async function clearDefaultAddress(customerId) {
  const { error } = await supabase.from('customer_address').update({ is_default: false }).eq('customer_id', customerId);
  if (error) throw error;
}
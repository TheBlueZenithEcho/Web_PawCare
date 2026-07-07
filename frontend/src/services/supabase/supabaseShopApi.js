import { supabase } from './client';

export const fetchCategories = async () => {
  const { data, error } = await supabase
    .from('category')
    .select('*')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
  return data;
};

export const fetchProducts = async (filters = {}) => {
  // Lấy dữ liệu sản phẩm kèm theo variant và hình ảnh
  let query = supabase
    .from('product')
    .select(`
      product_id, 
      category_id, 
      brand, 
      name, 
      description, 
      is_active,
      category:category_id (category_name),
      product_variant (variant_id, sku, capacity_label, price, stock_quantity),
      product_image (image_url)
    `)
    .eq('is_active', true);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  // Chuyển đổi dữ liệu về dạng mà component đang sử dụng
  let result = data.map(p => {
    const variants = p.product_variant || [];
    const images = p.product_image || [];

    // Tìm giá thấp nhất để hiển thị làm giá đại diện
    const minPrice = variants.length > 0
      ? Math.min(...variants.map(v => Number(v.price)))
      : 0;

    // Tổng số lượng kho
    const totalStock = variants.reduce((sum, v) => sum + Number(v.stock_quantity), 0);

    return {
      id: p.product_id,
      name: p.name,
      brand: p.brand || 'Khác',
      category: p.category?.category_name || 'Khác',
      pet_type: 'Chó, Mèo', // Tạm thời hardcode do CSDL chưa có trường pet_type cho product
      price: minPrice,
      stock: totalStock,
      image: images.length > 0 ? images[0].image_url : 'https://placehold.co/400?text=No+Image',
      variants: variants.map(v => v.capacity_label),
      full_variants: variants
    };
  });

  // Áp dụng filters ở client (tương tự như cũ)
  if (filters.category && filters.category !== 'Tất cả') {
    result = result.filter(p => p.category === filters.category);
  }
  if (filters.pet_type && filters.pet_type !== 'Tất cả') {
    result = result.filter(p => p.pet_type.includes(filters.pet_type));
  }
  if (filters.search) {
    const term = filters.search.toLowerCase();
    result = result.filter(p => p.name.toLowerCase().includes(term) || p.brand.toLowerCase().includes(term));
  }

  return result;
};

// Cập nhật lại logic chọn Variant phù hợp nhất khi Add to Cart
export const getVariantDetails = (product, selectedVariantLabel) => {
  if (!product || !product.full_variants) return null;
  return product.full_variants.find(v => v.capacity_label === selectedVariantLabel) || product.full_variants[0];
};

export const createOrder = async (orderData) => {
  // Tạo ID ngẫu nhiên cho order (vd: ORD-123456)
  const order_id = `ORD-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

  // 1. Tạo bản ghi Order
  const { data: newOrder, error: orderError } = await supabase
    .from('orders')
    .insert([
      {
        order_id: order_id,
        status: orderData.status || 'COMPLETED',
        subtotal: orderData.total_amount, // Giả sử subtotal = total_amount
        total_amount: orderData.total_amount,
        shipping_fee: 0,
        discount_amount: 0,
        // Nếu có customer_id, có thể truyền vào đây
      }
    ])
    .select()
    .single();

  if (orderError) throw orderError;

  // 2. Tạo Order Items
  if (orderData.items && orderData.items.length > 0) {
    const orderItems = orderData.items.map(item => ({
      order_item_id: `OI-${Math.random().toString(36).substr(2, 9)}`,
      order_id: order_id,
      variant_id: item.variant_id, // Cần variant_id thật
      quantity: item.quantity,
      unit_price: item.price,
      subtotal: item.price * item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('order_item')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Cập nhật trừ số lượng kho (Tùy chọn: Có thể viết thêm vòng lặp trừ kho ở đây)
  }

  // 3. Tạo Shipment (nếu giao hàng)
  if (orderData.shipping_info && orderData.shipping_info.street !== 'Tại quầy') {
    const { error: shipmentError } = await supabase
      .from('shipment')
      .insert([
        {
          shipment_id: `SHP-${Math.random().toString(36).substr(2, 9)}`,
          order_id: order_id,
          shipment_status: 'PENDING',
          // Lẽ ra phải link tới customer_address, nhưng đây là order nhanh tại quầy
        }
      ]);

    if (shipmentError) console.error("Shipment error:", shipmentError);
  }

  return newOrder;
};

export const fetchOrders = async (filters = {}) => {
  // Lấy danh sách order kêt hợp order_item
  let query = supabase
    .from('orders')
    .select(`
      *,
      order_item (
        quantity, unit_price, subtotal, variant_id,
        product_variant (capacity_label, product (name))
      ),
      customer (first_name, last_name, phone)
    `)
    .order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) throw error;

  // Map dữ liệu về UI format
  return data.map(o => ({
    order_id: o.order_id,
    customer_name: o.customer ? `${o.customer.last_name} ${o.customer.first_name}` : 'Khách mua tại quầy',
    customer_phone: o.customer?.phone || '',
    status: o.status,
    total_amount: o.total_amount,
    created_at: new Date(o.created_at).toLocaleString('vi-VN'),
    shipping_info: {
      street: 'Tại quầy',
      ward: '',
      district: '',
      province: ''
    },
    items: (o.order_item || []).map(i => ({
      name: i.product_variant?.product?.name || 'Sản phẩm',
      variant: i.product_variant?.capacity_label || '',
      quantity: i.quantity,
      price: i.unit_price
    })),
    history: [] // Tạm thời rỗng
  }));
};

export const updateOrderStatus = async (order_id, newStatus) => {
  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('order_id', order_id);

  if (error) throw error;
  return true;
};

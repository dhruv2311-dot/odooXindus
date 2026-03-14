import { supabase } from '../config/supabase.js';

export const getReceipts = async (req, res) => {
  const { data, error } = await supabase.from('receipts').select(`
    *,
    receipt_items (*, products (name, sku))
  `);
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
};

export const createReceipt = async (req, res) => {
  const { reference, supplier, date, items } = req.body;
  // items: [{ product_id, quantity }]
  
  const { data: receipt, error: receiptError } = await supabase
    .from('receipts')
    .insert([{ reference, supplier, date, status: 'Draft' }])
    .select()
    .single();
    
  if (receiptError) return res.status(500).json({ error: receiptError.message });
  
  if (items && items.length > 0) {
    const receiptItems = items.map(item => ({
      receipt_id: receipt.id,
      product_id: item.product_id,
      quantity: item.quantity
    }));
    const { error: itemsError } = await supabase.from('receipt_items').insert(receiptItems);
    if (itemsError) return res.status(500).json({ error: itemsError.message });
  }
  
  res.status(201).json(receipt);
};

export const getReceiptById = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('receipts')
    .select(`
      *,
      receipt_items (*, products (name, sku))
    `)
    .eq('id', id)
    .single();
    
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
};

export const validateReceipt = async (req, res) => {
  const { id } = req.params;
  
  // 1. Get receipt items
  const { data: receiptItems, error: itemsError } = await supabase
    .from('receipt_items')
    .select('*')
    .eq('receipt_id', id);
    
  if (itemsError) return res.status(500).json({ error: itemsError.message });
  
  // Default Warehouse Location ID for receiving (mocked or assume a main one)
  // Let's assume we have a way to find a default location, or we just insert into 'stock' table 
  // For simplicity, let's just create stock_moves and update stock
  
  for (const item of receiptItems) {
    // Check existing stock in a default location 'LOC-1' or similar
    // We'll leave location handling to simple generic logic for now
    
    const { data: existingStock } = await supabase
      .from('stock')
      .select('*')
      .eq('product_id', item.product_id)
      // .eq('location_id', defaultLocationId)
      .limit(1)
      .single();
      
    if (existingStock) {
      await supabase
        .from('stock')
        .update({ quantity: existingStock.quantity + item.quantity })
        .eq('id', existingStock.id);
    } else {
      await supabase
        .from('stock')
        .insert([{ product_id: item.product_id, quantity: item.quantity }]);
    }
    
    // Create stock move
    await supabase.from('stock_moves').insert([{
      product_id: item.product_id,
      quantity: item.quantity,
      type: 'Receipt',
      date: new Date().toISOString()
    }]);
  }
  
  const { data, error } = await supabase
    .from('receipts')
    .update({ status: 'Done' })
    .eq('id', id)
    .select();
    
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data[0]);
};

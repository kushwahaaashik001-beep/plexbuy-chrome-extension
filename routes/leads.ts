import { Router } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

router.get('/', async (req, res) => {
  const { category } = req.query;

  let query = supabase.from('leads').select('*').order('created_at', { ascending: false });

  if (category && category !== 'All') {
    query = query.eq('category', category);
  }

  const { data, error } = await query.limit(50);
  
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
});

export default router;

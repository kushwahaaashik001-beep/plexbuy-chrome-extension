import { Router } from 'express';
import { Groq } from 'groq-sdk';
import { supabase } from '../lib/supabase';

const router = Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/process', async (req, res) => {
  const { rawText, sourceUrl } = req.body;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "You are an expert lead classifier. Categorize into: Freelancer, Influencer, Job, or Internship. Extract: title, budget, and sub_category. Return ONLY JSON." 
        },
        { role: "user", content: rawText }
      ],
      model: "llama3-8b-8192",
      response_format: { type: "json_object" }
    });

    const leadInfo = JSON.parse(chatCompletion.choices[0].message.content);
    
    // Insert into Supabase
    const { data, error } = await supabase
      .from('leads')
      .insert([{ ...leadInfo, source_url: sourceUrl }]);

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: "AI Processing Failed" });
  }
});

export default router;

import os
import json
from duckduckgo_search import DDGS
from groq import Groq
from supabase import create_client

# 1. Setup Clients
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def get_leads():
    # Google Dorking style query for DuckDuckGo
    # Search for latest Video Editing leads on Twitter & Reddit
    query = 'site:twitter.com OR site:reddit.com "hiring" "video editor" "budget" after:2024-01-01'
    
    with DDGS() as ddgs:
        results = [r for r in ddgs.text(query, max_results=10)]
    return results

def filter_with_groq(raw_data):
    prompt = f"""
    You are a professional lead filter. Analyze this data: {raw_data}
    Extract only REAL job/freelance leads. 
    Format as JSON: 
    {{ "title": "...", "category": "Freelancer", "sub_category": "Video Editing", "budget": "...", "source_url": "..." }}
    If it's spam, return null.
    """
    completion = groq_client.chat.completions.create(
        model="llama3-70b-8192",
        messages=[{"role": "user", "content": prompt}],
        response_format={ "type": "json_object" }
    )
    return json.loads(completion.choices[0].message.content)

# Logic: Search -> Filter -> Save
raw_leads = get_leads()
for lead in raw_leads:
    clean_lead = filter_with_groq(lead['body'])
    if clean_lead:
        clean_lead['source_url'] = lead['href'] # Asli link add karo
        # Supabase mein insert karo
        supabase.table("leads").upsert(clean_lead).execute()

print("Mission Successful: Leads updated!")

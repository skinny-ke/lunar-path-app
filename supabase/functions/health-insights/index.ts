import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id } = await req.json();
    
    if (!user_id) {
      return new Response(JSON.stringify({ error: 'user_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user's cycle data
    const { data: cycles } = await supabase
      .from('cycles')
      .select('*')
      .eq('user_id', user_id)
      .order('start_date', { ascending: false })
      .limit(6);

    // Fetch user's symptoms
    const { data: symptoms } = await supabase
      .from('symptoms')
      .select('*')
      .eq('user_id', user_id)
      .order('date', { ascending: false })
      .limit(30);

    // Fetch user's daily check-ins
    const { data: checkins } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('user_id', user_id)
      .order('date', { ascending: false })
      .limit(30);

    // Fetch user profile for context
    const { data: profile } = await supabase
      .from('profiles')
      .select('average_cycle_length, average_period_length')
      .eq('id', user_id)
      .single();

    // Prepare data summary for AI
    const dataSummary = {
      profile: profile || {},
      recentCycles: cycles || [],
      recentSymptoms: symptoms || [],
      recentCheckins: checkins || []
    };

    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a compassionate women's health advisor specializing in menstrual cycle analysis. 
            Analyze the user's cycle patterns, symptoms, and mood data to provide personalized, actionable health insights.
            Focus on:
            1. Pattern recognition in cycle regularity
            2. Common symptoms and their frequency
            3. Mood and energy level trends
            4. Lifestyle factors (sleep, water intake)
            5. Gentle recommendations for improving wellbeing
            
            Keep insights warm, supportive, and non-medical. Always encourage consulting healthcare providers for medical concerns.
            Format your response with clear sections and bullet points for readability.`
          },
          {
            role: 'user',
            content: `Please analyze this menstrual health data and provide personalized insights:

**Profile:**
- Average cycle length: ${dataSummary.profile.average_cycle_length || 28} days
- Average period length: ${dataSummary.profile.average_period_length || 5} days

**Recent Cycles (last ${cycles?.length || 0} periods):**
${cycles?.map(c => `- Started ${c.start_date}${c.end_date ? `, ended ${c.end_date}` : ''}`).join('\n') || 'No cycle data available'}

**Recent Symptoms (last ${symptoms?.length || 0} entries):**
${symptoms?.map(s => `- ${s.date}: ${s.symptoms?.join(', ') || 'None'} (Mood: ${s.mood || 'Not recorded'})`).join('\n') || 'No symptom data available'}

**Recent Daily Check-ins (last ${checkins?.length || 0} entries):**
${checkins?.map(c => `- ${c.date}: Sleep ${c.sleep_hours || 0}h, Water ${c.water_intake || 0} glasses, Energy ${c.energy_level || 0}/10, Mood: ${c.mood || 'Not recorded'}`).join('\n') || 'No check-in data available'}

Please provide:
1. **Cycle Pattern Insights**: Analysis of cycle regularity and trends
2. **Symptom Patterns**: Common symptoms and their timing
3. **Lifestyle Observations**: Sleep, hydration, and energy patterns
4. **Personalized Tips**: 3-5 actionable recommendations for better wellbeing
5. **What to Watch**: Any patterns that might benefit from tracking or discussing with a healthcare provider

Keep the tone supportive and empowering.`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again in a moment.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI credits exhausted. Please add credits to continue.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const insights = aiData.choices[0].message.content;

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in health-insights function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

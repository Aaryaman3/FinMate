import { generateText } from 'ai';
import { Opik } from 'opik';
import { getBankData, Bank } from '@/lib/bank-data';
import { openai } from '@/lib/echo';

// Initialize Opik client (only if configured with real key AND workspace)
const isOpikConfigured = 
  process.env.OPIK_API_KEY && 
  !process.env.OPIK_API_KEY.includes('your_') &&
  process.env.OPIK_API_KEY.length > 10 &&
  process.env.OPIK_WORKSPACE &&
  !process.env.OPIK_WORKSPACE.includes('your_') &&
  process.env.OPIK_WORKSPACE.length > 2;

let opik: Opik | null = null;

if (isOpikConfigured) {
  try {
    opik = new Opik({
      apiKey: process.env.OPIK_API_KEY!,
      workspaceName: process.env.OPIK_WORKSPACE!,
      projectName: 'finmate',
      apiUrl: 'https://www.comet.com/opik/api',
    });
    console.log('✅ Opik tracing enabled for bank recommendations');
  } catch (error) {
    console.error('❌ Failed to initialize Opik:', error);
  }
}

export async function POST(req: Request) {
  const startTime = Date.now();
  const profile = await req.json();
  
  const trace = opik?.trace({
    name: 'bank_recommendation',
    input: profile,
    projectName: 'finmate',
    tags: [
      'bank-recommendation',
      `country:${profile.country || 'unknown'}`,
      `visa:${profile.visa_type || 'unknown'}`,
      `has_ssn:${profile.has_ssn}`,
      'production'
    ],
    metadata: {
      user_country: profile.country || 'unknown',
      visa_type: profile.visa_type || 'unknown',
      has_ssn: profile.has_ssn,
      monthly_income: profile.monthly_income || 0,
      feature: 'bank_finder',
      user_type: 'international_student',
    }
  });

  try {
    // Get filtered banks based on profile
    const filterStartTime = Date.now();
    const banks = getBankData(profile);
    const filterLatency = Date.now() - filterStartTime;
    
    // Add span for bank filtering
    const filterSpan = trace?.span({
      name: 'bank_filtering',
      input: { 
        profile,
        total_banks_available: 10,
      },
      output: { 
        filtered_banks: banks.length,
        top_banks: banks.slice(0, 3).map((b: Bank) => b.name),
      },
      metadata: {
        filter_latency_ms: filterLatency,
        filtering_criteria: ['country_support', 'ssn_requirement', 'fees', 'features'],
        banks_filtered: banks.length,
      }
    });
    filterSpan?.end();
    
    // Generate personalized recommendations using Echo
    const llmStartTime = Date.now();
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `
You are a financial advisor helping an international student choose a bank account in the United States.

Student Profile:
- Country: ${profile.country || 'Not specified'}
- Visa Type: ${profile.visa_type || 'Not specified'}
- Has SSN: ${profile.has_ssn}
- Monthly Income: $${profile.monthly_income || 0}

Available Banks: ${banks.map((b: Bank) => b.name).join(', ')}

Generate a clear, well-structured recommendation report without using markdown symbols, emojis, or hashtags.

Your response must include:
1. A title (one line
2. A ranked list of the top 3 recommended banks (1, 2, 3)
3. For each bank:
   - Name
   - Why it suits the student (contextualized to the student's profile)
   - Key benefits (listed as simple bullet points)
4. Make sure to use a new line for every bullet point.

Tone: Professional, concise, and helpful. Write in complete sentences.`,
    });
    
    const llmLatency = Date.now() - llmStartTime;
    const totalLatency = Date.now() - startTime;
    const tokens = result.usage?.totalTokens || 0;
    const cost = (tokens / 1000) * 0.00015;

    if (trace) {
      // Add LLM generation span
      const llmSpan = trace.span({
        name: 'recommendation_generation',
        input: {
          model: 'gpt-4o-mini',
          prompt_type: 'bank_recommendation',
          banks_considered: banks.slice(0, 3).length,
        },
        output: { 
          banks: banks.slice(0, 3).map((b: Bank) => ({
            name: b.name,
            requires_ssn: b.requiresSSN,
            monthly_fee: b.monthlyFee,
          })),
          explanation_length: result.text.length,
        },
        metadata: {
          latency_ms: llmLatency,
          tokens_used: tokens,
          cost_usd: cost,
          model: 'gpt-4o-mini',
          provider: 'openai',
        }
      });
      llmSpan.end();
      
      // Update main trace
      trace.update({
        output: {
          recommended_banks: banks.slice(0, 3).map((b: Bank) => b.name),
          explanation: result.text,
        },
        tags: [
          'bank-recommendation',
          `country:${profile.country || 'unknown'}`,
          `banks_found:${banks.length}`,
          `latency:${totalLatency < 1000 ? 'fast' : 'slow'}`,
          'production'
        ],
        metadata: {
          status: 'success',
          total_latency_ms: totalLatency,
          filter_latency_ms: filterLatency,
          llm_latency_ms: llmLatency,
          banks_matched: banks.length,
          banks_recommended: 3,
          tokens_used: tokens,
          cost_usd: cost,
          recommendation_quality: banks.length >= 3 ? 'good' : 'limited',
        }
      });
      
      trace.end();
    }

    console.log('🏦 Bank recommendation:', {
      country: profile.country,
      banks_found: banks.length,
      latency_ms: totalLatency,
      tokens,
      cost_usd: cost.toFixed(6),
    });

    return Response.json({
      banks: banks.slice(0, 3),
      explanation: result.text,
    });
  } catch (error) {
    trace?.update({ 
      metadata: { 
        status: 'error', 
        error: String(error),
        total_latency_ms: Date.now() - startTime,
      } 
    });
    trace?.end();
    throw error;
  }
}

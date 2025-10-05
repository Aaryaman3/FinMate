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

const opik = isOpikConfigured ? new Opik() : null;

export async function POST(req: Request) {
  const profile = await req.json();
  
  const trace = opik?.trace({
    name: 'bank_recommendation',
    input: profile,
    projectName: 'finmate'
  });

  try {
    // Get filtered banks based on profile
    const banks = getBankData(profile);
    
    // Generate personalized recommendations using Echo
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `Student profile:
- Country: ${profile.country || 'Not specified'}
- Visa: ${profile.visa_type || 'Not specified'}
- Has SSN: ${profile.has_ssn}
- Monthly income: $${profile.monthly_income || 0}

Available banks: ${banks.map((b: Bank) => b.name).join(', ')}

Recommend the top 3 banks for this student and explain why each is suitable. 
Be friendly and helpful. Focus on their specific situation.`,
    });

    if (trace) {
      trace.span({
        name: 'recommendation_generation',
        output: { 
          banks: banks.slice(0, 3),
          explanation: result.text 
        }
      }).end();
      
      trace.end();
    }

    return Response.json({
      banks: banks.slice(0, 3),
      explanation: result.text,
    });
  } catch (error) {
    trace?.end();
    throw error;
  }
}

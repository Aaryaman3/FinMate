import { streamText, convertToModelMessages } from 'ai';
import { openai } from '@ai-sdk/openai';
import { Opik } from 'opik';

// Initialize Opik client (only if configured with real key AND workspace)
const isOpikConfigured = 
  process.env.OPIK_API_KEY && 
  !process.env.OPIK_API_KEY.includes('your_') &&
  process.env.OPIK_API_KEY.length > 10 &&
  process.env.OPIK_WORKSPACE &&
  !process.env.OPIK_WORKSPACE.includes('your_') &&
  process.env.OPIK_WORKSPACE.length > 2;

const opikClient = isOpikConfigured ? new Opik() : null;

if (!isOpikConfigured) {
  console.log('ℹ️  Opik tracing disabled (not configured)');
}

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  // Create Opik trace for observability (if configured)
  const trace = opikClient?.trace({
    name: 'chat_mentor',
    input: { messages },
    projectName: 'finmate'
  });

  try {
    // Convert UI messages to model messages
    const modelMessages = convertToModelMessages(messages);
    
    // Use OpenAI directly (no Echo wrapper for testing)
    const result = await streamText({
      model: openai('gpt-4o-mini'),
      system: `You are FinMate, an AI financial advisor for international students in the U.S.
          
Your role:
- Explain U.S. banking, taxes, credit, and financial concepts simply
- Be empathetic and supportive
- Use examples and analogies
- Keep responses concise (2-3 paragraphs)

Topics you help with:
- Opening bank accounts without SSN
- Building credit history
- Understanding taxes (1040-NR, FICA)
- International money transfers
- Budgeting and financial literacy`,
      messages: modelMessages,
      temperature: 0.7,
    });

    // Log completion to Opik (if configured)
    if (trace) {
      trace.span({
        name: 'openai_response',
        input: { messages: modelMessages },
        output: { stream: true }
      }).end();
      
      trace.end();
    }

    return result.toTextStreamResponse();
  } catch (error) {
    trace?.end();
    console.error('Chat error:', error);
    throw error;
  }
}

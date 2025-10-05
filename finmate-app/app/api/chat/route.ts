import { streamText } from 'ai';
import { Opik } from 'opik';
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

if (!isOpikConfigured) {
  console.log('ℹ️  Opik tracing disabled (not configured)');
}

export async function POST(req: Request) {
  const body = await req.json();
  const messages = body.messages || [];
  
  // Validate messages
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response('Invalid messages', { status: 400 });
  }
  
  // Create Opik trace for observability (if configured)
  const trace = opik?.trace({
    name: 'chat_mentor',
    input: { messages },
    projectName: 'finmate'
  });

  try {
    // Use OpenAI through Echo (handles billing automatically)
    // The openai() function automatically gets the user's auth from request context
    const result = streamText({
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
      messages: messages,
      temperature: 0.7,
    });

    // Log completion to Opik (if configured)
    if (trace) {
      trace.span({
        name: 'openai_response',
        input: { messages: messages },
        output: { stream: true }
      }).end();
      
      trace.end();
    }

    // Create a simple text stream response using fullStream for better control
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const part of result.fullStream) {
          // Only send text deltas, ignore other parts
          if (part.type === 'text-delta') {
            controller.enqueue(encoder.encode(part.text));
          }
        }
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      }
    });
  } catch (error) {
    trace?.end();
    throw error;
  }
}

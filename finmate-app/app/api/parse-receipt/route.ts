import { generateText } from 'ai';
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

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('receipt') as File;
  
  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 });
  }

  const trace = opik?.trace({
    name: 'parse_receipt',
    input: { filename: file.name },
    projectName: 'finmate'
  });

  try {
    // Convert image to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    
    // Use GPT-4 Vision for OCR + Analysis through Echo
    const result = await generateText({
      model: openai('gpt-4o'),
      messages: [
        {
          role: 'user',
          content: [
            { 
              type: 'text', 
              text: `Analyze this receipt and extract:
1. Payer name
2. Amount paid (with currency)
3. Purpose (tuition/rent/other)
4. Date
5. Any exchange rate or fees visible

Then suggest cheaper payment alternatives (Wise, Remitly, etc.) if applicable.
Format response as JSON with keys: payer, amount, currency, purpose, date, fees, suggestions` 
            },
            {
              type: 'image',
              image: `data:${file.type};base64,${base64}`
            }
          ]
        }
      ]
    });

    let analysis;
    try {
      analysis = JSON.parse(result.text);
    } catch (e) {
      // If not valid JSON, wrap the text response
      analysis = {
        raw_response: result.text
      };
    }

    if (trace) {
      trace.span({
        name: 'vision_analysis',
        output: analysis
      }).end();
      
      trace.end();
    }

    return Response.json({
      analysis,
    });
  } catch (error) {
    trace?.end();
    console.error('Receipt parsing error:', error);
    return Response.json({ 
      error: 'Failed to parse receipt',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

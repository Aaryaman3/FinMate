import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import { openai } from '@/lib/echo';
import { SUPPORTED_CURRENCIES } from '@/lib/forex';

export async function POST(req: NextRequest) {
  try {
    const { amount, toCurrency, urgency, calculations, analysis } = await req.json();

    const currencyInfo = SUPPORTED_CURRENCIES[toCurrency as keyof typeof SUPPORTED_CURRENCIES];
    const bestOption = calculations.find((c: any) => c.recommended) || calculations[0];
    
    // Create AI prompt for optimization advice with structured output
    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: `You are FinMate, an expert financial advisor for international students sending money home.

CRITICAL: Format your response EXACTLY like this structure:

Best Choice: [Service Name]
[1-2 sentences explaining why this is optimal]

Next Steps:
• [Step 1 - be specific with links/actions]
• [Step 2]
• [Step 3]
• [Step 4 - include timeline]

Pro Tips:
• [Actionable tip 1 about timing/rates]
• [Actionable tip 2 about saving more]
• [Actionable tip 3 about compliance/documentation]

Alternative Options:
• For instant delivery: [Service] - [brief note]
• For larger amounts ($5000+): [Service] - [brief note]
• If rates improve: [Specific recommendation]

Important for International Students:
• [Tax/compliance reminder relevant to their situation]
• [Documentation to keep]

Keep each section concise. Use bullet points. Be specific and actionable.`,
      messages: [
        {
          role: 'user',
          content: `Help me send $${amount} USD to ${currencyInfo?.country} (${toCurrency}).

**My situation:**
- Urgency: ${urgency}
- Sending to: ${currencyInfo?.country}

**Available services:**
${calculations.map((c: any) => `- ${c.serviceName}: Fee $${c.fee.toFixed(2)}, Rate: ${c.exchangeRate.toFixed(2)}, You get: ${currencyInfo?.symbol}${c.amountReceived.toFixed(0)}, Speed: ${c.transferSpeed}`).join('\n')}

**Market conditions:**
- Trend: ${analysis?.trend || 'stable'} (${analysis?.percentageChange?.toFixed(2) || '0.00'}% change)
- ${analysis?.insight || 'Rates are currently stable'}

Provide structured, actionable advice following your format exactly.`,
        },
      ],
      temperature: 0.7,
    });

    // Create a simple text stream response using fullStream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const part of result.fullStream) {
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
    console.error('Error optimizing remittance:', error);
    return NextResponse.json(
      { error: 'Failed to generate optimization advice' },
      { status: 500 }
    );
  }
}

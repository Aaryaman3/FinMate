import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const range = searchParams.get('range') || '24h';

  // Calculate time range
  const now = new Date();
  const startTime = new Date();
  
  switch (range) {
    case '1h':
      startTime.setHours(now.getHours() - 1);
      break;
    case '24h':
      startTime.setHours(now.getHours() - 24);
      break;
    case '7d':
      startTime.setDate(now.getDate() - 7);
      break;
    case '30d':
      startTime.setDate(now.getDate() - 30);
      break;
  }

  try {
    // For now, return empty data - the frontend will use demo mode
    // In production, you would fetch from Opik API here
    const opikApiKey = process.env.OPIK_API_KEY;
    const opikWorkspace = process.env.OPIK_WORKSPACE;

    if (!opikApiKey || !opikWorkspace) {
      throw new Error('Opik not configured');
    }

    // Placeholder for actual Opik API call
    // const response = await fetch(`https://www.comet.com/opik/api/v1/traces?...`)
    
    return NextResponse.json({ 
      traces: [], 
      stats: null,
      error: 'Using demo data - Opik API integration pending'
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching Opik data:', error);
    
    return NextResponse.json({ 
      traces: [], 
      stats: null,
      error: 'Unable to fetch real-time data'
    }, { status: 200 });
  }
}

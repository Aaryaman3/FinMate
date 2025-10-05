import { NextRequest, NextResponse } from 'next/server';
import { getHistoricalRates, analyzeTrend, SUPPORTED_CURRENCIES } from '@/lib/forex';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const toCurrency = searchParams.get('currency');
    const days = parseInt(searchParams.get('days') || '7');

    if (!toCurrency || !SUPPORTED_CURRENCIES[toCurrency as keyof typeof SUPPORTED_CURRENCIES]) {
      return NextResponse.json(
        { error: 'Invalid or unsupported currency' },
        { status: 400 }
      );
    }

    // Fetch historical rates for base currency
    const baseRates = await getHistoricalRates(toCurrency, days);

    // Generate rates for different services (with realistic variations)
    // Wise typically has the best rate, banks are worst, others in between
    const serviceData = {
      Wise: baseRates.map(r => ({
        ...r,
        rate: r.rate * 0.998, // Wise gets ~99.8% of mid-market rate
      })),
      PayPal: baseRates.map(r => ({
        ...r,
        rate: r.rate * 0.960, // PayPal's margin is higher (~96%)
      })),
      'Western Union': baseRates.map(r => ({
        ...r,
        rate: r.rate * 0.945, // WU has even higher margins (~94.5%)
      })),
      'Bank Wire': baseRates.map(r => ({
        ...r,
        rate: r.rate * 0.935, // Banks typically worst (~93.5%)
      })),
    };

    // Analyze trend for Wise (best service)
    const analysis = analyzeTrend(serviceData.Wise);

    // Find best rate across all services and days
    const allRates = Object.entries(serviceData).flatMap(([service, rates]) =>
      rates.map(r => ({ service, ...r }))
    );
    const bestRate = allRates.reduce((best, current) =>
      current.rate > best.rate ? current : best
    );

    return NextResponse.json({
      currency: toCurrency,
      currencyInfo: SUPPORTED_CURRENCIES[toCurrency as keyof typeof SUPPORTED_CURRENCIES],
      rates: baseRates, // Keep for backward compatibility
      serviceRates: serviceData, // New: rates broken down by service
      analysis: {
        ...analysis,
        bestRate: {
          service: bestRate.service,
          rate: bestRate.rate,
          date: bestRate.timestamp,
        },
        volatility: calculateVolatility(serviceData.Wise),
      },
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exchange rate trends' },
      { status: 500 }
    );
  }
}

// Helper function to calculate volatility
function calculateVolatility(rates: Array<{ rate: number }>): 'low' | 'medium' | 'high' {
  if (rates.length < 2) return 'low';
  
  const values = rates.map(r => r.rate);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = (stdDev / mean) * 100;

  if (coefficientOfVariation < 1) return 'low';
  if (coefficientOfVariation < 2.5) return 'medium';
  return 'high';
}

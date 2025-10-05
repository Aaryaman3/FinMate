import { NextRequest, NextResponse } from 'next/server';
import { calculateTransfers, SUPPORTED_CURRENCIES } from '@/lib/forex';

export async function POST(req: NextRequest) {
  try {
    const { amount, toCurrency } = await req.json();

    // Validate inputs
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    if (!toCurrency || !SUPPORTED_CURRENCIES[toCurrency as keyof typeof SUPPORTED_CURRENCIES]) {
      return NextResponse.json(
        { error: 'Invalid or unsupported currency' },
        { status: 400 }
      );
    }

    // Calculate transfers for all services
    const calculations = await calculateTransfers(amount, toCurrency);

    // Find best and worst options
    const best = calculations[0];
    const worst = calculations[calculations.length - 1];
    const savings = worst.totalCost - best.totalCost;

    return NextResponse.json({
      calculations,
      summary: {
        amount,
        toCurrency,
        currencyInfo: SUPPORTED_CURRENCIES[toCurrency as keyof typeof SUPPORTED_CURRENCIES],
        best: best.serviceName,
        savings: Math.round(savings * 100) / 100,
      },
    });
  } catch (error) {
    console.error('Error calculating remittance:', error);
    return NextResponse.json(
      { error: 'Failed to calculate remittance' },
      { status: 500 }
    );
  }
}

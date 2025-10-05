import axios from 'axios';

export interface ExchangeRate {
  rate: number;
  timestamp: Date;
}

export interface RemittanceService {
  name: string;
  fee: number;
  feeType: 'fixed' | 'percentage';
  exchangeRateMarkup: number; // percentage markup on mid-market rate
  transferSpeed: string;
  recommended?: boolean;
}

// Popular remittance services with typical fee structures
export const REMITTANCE_SERVICES: Record<string, RemittanceService> = {
  wise: {
    name: 'Wise',
    fee: 12,
    feeType: 'fixed',
    exchangeRateMarkup: 0, // Wise uses mid-market rate
    transferSpeed: '1-3 days',
    recommended: true,
  },
  westernUnion: {
    name: 'Western Union',
    fee: 45,
    feeType: 'fixed',
    exchangeRateMarkup: 3.5, // 3.5% markup
    transferSpeed: 'Instant - 24 hours',
  },
  paypal: {
    name: 'PayPal',
    fee: 0,
    feeType: 'percentage',
    exchangeRateMarkup: 4, // 4% markup on exchange rate
    transferSpeed: 'Instant',
  },
  bankWire: {
    name: 'Bank Wire',
    fee: 50,
    feeType: 'fixed',
    exchangeRateMarkup: 2.5, // 2.5% markup
    transferSpeed: '3-5 days',
  },
};

// Supported currencies with their symbols and countries
export const SUPPORTED_CURRENCIES = {
  INR: { symbol: '₹', country: 'India', flag: '🇮🇳' },
  CNY: { symbol: '¥', country: 'China', flag: '🇨🇳' },
  EUR: { symbol: '€', country: 'Europe', flag: '🇪🇺' },
  GBP: { symbol: '£', country: 'UK', flag: '🇬🇧' },
  MXN: { symbol: '$', country: 'Mexico', flag: '🇲🇽' },
  BRL: { symbol: 'R$', country: 'Brazil', flag: '🇧🇷' },
  KRW: { symbol: '₩', country: 'South Korea', flag: '🇰🇷' },
  JPY: { symbol: '¥', country: 'Japan', flag: '🇯🇵' },
  VND: { symbol: '₫', country: 'Vietnam', flag: '🇻🇳' },
  NGN: { symbol: '₦', country: 'Nigeria', flag: '🇳🇬' },
};

/**
 * Fetch current exchange rate from USD to target currency
 */
export async function getExchangeRate(toCurrency: string): Promise<number> {
  try {
    const response = await axios.get(
      `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json`
    );
    const rate = response.data.usd[toCurrency.toLowerCase()];
    if (!rate) {
      throw new Error(`Currency ${toCurrency} not found`);
    }
    return rate;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    throw new Error('Failed to fetch exchange rate');
  }
}

/**
 * Fetch historical exchange rates for the last 7 days
 */
export async function getHistoricalRates(
  toCurrency: string,
  days: number = 7
): Promise<ExchangeRate[]> {
  try {
    const rates: ExchangeRate[] = [];
    const today = new Date();

    // Fetch rates for each day
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      try {
        const response = await axios.get(
          `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${dateStr}/v1/currencies/usd.json`
        );
        const rate = response.data.usd[toCurrency.toLowerCase()];
        if (rate) {
          rates.push({ rate, timestamp: date });
        }
      } catch (err) {
        // If historical date not available, skip
        console.warn(`No data for ${dateStr}`);
      }
    }

    // If we couldn't get historical data, use current rate
    if (rates.length === 0) {
      const currentRate = await getExchangeRate(toCurrency);
      rates.push({ rate: currentRate, timestamp: today });
    }

    return rates;
  } catch (error) {
    console.error('Error fetching historical rates:', error);
    throw new Error('Failed to fetch historical rates');
  }
}

/**
 * Calculate transfer details for all services
 */
export interface TransferCalculation {
  serviceName: string;
  fee: number;
  exchangeRate: number;
  amountReceived: number;
  totalCost: number;
  transferSpeed: string;
  recommended?: boolean;
}

export async function calculateTransfers(
  amountUSD: number,
  toCurrency: string
): Promise<TransferCalculation[]> {
  const midMarketRate = await getExchangeRate(toCurrency);
  const calculations: TransferCalculation[] = [];

  for (const [key, service] of Object.entries(REMITTANCE_SERVICES)) {
    // Calculate the exchange rate this service offers (mid-market rate minus markup)
    const serviceRate = midMarketRate * (1 - service.exchangeRateMarkup / 100);

    // Calculate fee
    let fee = service.fee;
    if (service.feeType === 'percentage') {
      fee = amountUSD * (service.fee / 100);
    }

    // Amount after fee
    const amountAfterFee = amountUSD - fee;

    // Amount received in foreign currency
    const amountReceived = amountAfterFee * serviceRate;

    // Total cost (how much you're "losing" vs perfect mid-market rate)
    const idealAmount = amountUSD * midMarketRate;
    const totalCost = idealAmount - amountReceived;

    calculations.push({
      serviceName: service.name,
      fee,
      exchangeRate: serviceRate,
      amountReceived,
      totalCost,
      transferSpeed: service.transferSpeed,
      recommended: service.recommended,
    });
  }

  // Sort by amount received (highest first)
  return calculations.sort((a, b) => b.amountReceived - a.amountReceived);
}

/**
 * Analyze rate trends and provide insights
 */
export function analyzeTrend(rates: ExchangeRate[]): {
  trend: 'up' | 'down' | 'stable';
  percentageChange: number;
  insight: string;
} {
  if (rates.length < 2) {
    return {
      trend: 'stable',
      percentageChange: 0,
      insight: 'Not enough data to analyze trend',
    };
  }

  const oldestRate = rates[0].rate;
  const latestRate = rates[rates.length - 1].rate;
  const percentageChange = ((latestRate - oldestRate) / oldestRate) * 100;

  let trend: 'up' | 'down' | 'stable';
  let insight: string;

  if (Math.abs(percentageChange) < 0.5) {
    trend = 'stable';
    insight = `Exchange rate has been stable over the past ${rates.length} days. No immediate rush to transfer.`;
  } else if (percentageChange > 0) {
    trend = 'up';
    insight = `Currency has strengthened ${percentageChange.toFixed(
      2
    )}% this week. Good time to send money - you'll get more for your dollars!`;
  } else {
    trend = 'down';
    insight = `Currency has weakened ${Math.abs(percentageChange).toFixed(
      2
    )}% this week. Consider waiting a few days for a better rate if not urgent.`;
  }

  return { trend, percentageChange, insight };
}

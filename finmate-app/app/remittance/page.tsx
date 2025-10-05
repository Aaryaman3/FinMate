'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, DollarSign, Send, Mic, Volume2, Loader2, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SUPPORTED_CURRENCIES } from '@/lib/forex';

interface Calculation {
  serviceName: string;
  fee: number;
  exchangeRate: number;
  amountReceived: number;
  totalCost: number;
  transferSpeed: string;
  recommended?: boolean;
}

interface TrendData {
  rates: Array<{ rate: number; timestamp: string }>;
  serviceRates?: {
    Wise: Array<{ rate: number; timestamp: string }>;
    PayPal: Array<{ rate: number; timestamp: string }>;
    'Western Union': Array<{ rate: number; timestamp: string }>;
    'Bank Wire': Array<{ rate: number; timestamp: string }>;
  };
  analysis: {
    trend: 'up' | 'down' | 'stable';
    percentageChange: number;
    insight: string;
    bestRate?: {
      service: string;
      rate: number;
      date: string;
    };
    volatility?: 'low' | 'medium' | 'high';
  };
}

export default function RemittancePage() {
  const router = useRouter();
  const [amount, setAmount] = useState('1500');
  const [toCurrency, setToCurrency] = useState('INR');
  const [urgency, setUrgency] = useState('normal');
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [aiAdvice, setAiAdvice] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [savings, setSavings] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currencyInfo = SUPPORTED_CURRENCIES[toCurrency as keyof typeof SUPPORTED_CURRENCIES];

  // Prepare chart data
  const getChartData = () => {
    if (!trendData) return [];
    
    if (trendData.serviceRates) {
      const chartData = trendData.serviceRates.Wise.map((_, idx) => ({
        date: new Date(trendData.serviceRates!.Wise[idx].timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        Wise: trendData.serviceRates!.Wise[idx].rate,
        PayPal: trendData.serviceRates!.PayPal[idx].rate,
        'Western Union': trendData.serviceRates!['Western Union'][idx].rate,
        'Bank Wire': trendData.serviceRates!['Bank Wire'][idx].rate,
      }));
      console.log('Chart data:', chartData);
      return chartData;
    }
    
    return trendData.rates.map(r => ({
      date: new Date(r.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      rate: r.rate,
    }));
  };

  // Fetch trends when currency changes
  // Generate mock trend data for the past 7 days
  const generateMockTrendData = useCallback(() => {
    const days = 7;
    const dates: string[] = [];
    const now = new Date();
    
    // Generate dates for past 7 days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }

    // Base rates for different currencies (USD to target)
    const baseRates: { [key: string]: number } = {
      INR: 83.5,
      EUR: 0.92,
      GBP: 0.79,
      CAD: 1.36,
      AUD: 1.52,
      JPY: 149.5,
      CNY: 7.24,
    };

    const baseRate = baseRates[toCurrency] || 1;
    
    // Generate realistic rate fluctuations (±0.5% variation)
    const wiseRates = dates.map(() => baseRate * (1 + (Math.random() * 0.01 - 0.005)));
    const paypalRates = wiseRates.map(r => r * 0.96); // 4% worse
    const wuRates = wiseRates.map(r => r * 0.945); // 5.5% worse
    const bankRates = wiseRates.map(r => r * 0.935); // 6.5% worse

    // Find best rate
    const allRates = wiseRates.concat(paypalRates, wuRates, bankRates);
    const bestRateValue = Math.max(...allRates);
    const percentageChange = ((wiseRates[wiseRates.length - 1] - wiseRates[0]) / wiseRates[0]) * 100;

    const newTrendData = {
      rates: wiseRates.map((rate, idx) => ({
        rate,
        timestamp: new Date(now.getTime() - (days - 1 - idx) * 24 * 60 * 60 * 1000).toISOString(),
      })),
      serviceRates: {
        Wise: wiseRates.map((rate, idx) => ({
          rate,
          timestamp: new Date(now.getTime() - (days - 1 - idx) * 24 * 60 * 60 * 1000).toISOString(),
        })),
        PayPal: paypalRates.map((rate, idx) => ({
          rate,
          timestamp: new Date(now.getTime() - (days - 1 - idx) * 24 * 60 * 60 * 1000).toISOString(),
        })),
        'Western Union': wuRates.map((rate, idx) => ({
          rate,
          timestamp: new Date(now.getTime() - (days - 1 - idx) * 24 * 60 * 60 * 1000).toISOString(),
        })),
        'Bank Wire': bankRates.map((rate, idx) => ({
          rate,
          timestamp: new Date(now.getTime() - (days - 1 - idx) * 24 * 60 * 60 * 1000).toISOString(),
        })),
      },
      analysis: {
        trend: percentageChange > 0.05 ? 'up' : percentageChange < -0.05 ? 'down' : 'stable' as 'up' | 'down' | 'stable',
        percentageChange,
        insight: Math.abs(percentageChange) < 0.3 
          ? 'Exchange rate has been stable over the past 7 days. No immediate rush to transfer.'
          : percentageChange > 0 
          ? 'Rate is trending upward. Consider waiting for a better rate.'
          : 'Rate is trending downward. Now might be a good time to transfer.',
        bestRate: {
          rate: bestRateValue,
          date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          service: 'Wise',
        },
        volatility: (Math.abs(percentageChange) < 0.3 ? 'low' : Math.abs(percentageChange) < 0.8 ? 'medium' : 'high') as 'low' | 'medium' | 'high',
      },
    };

    console.log('Generated trend data:', newTrendData);
    setTrendData(newTrendData);
  }, [toCurrency]);

  useEffect(() => {
    if (toCurrency) {
      generateMockTrendData();
    }
  }, [toCurrency, generateMockTrendData]);

  const calculateRemittance = async () => {
    setIsCalculating(true);
    setAiAdvice('');
    
    try {
      // Calculate fees and rates
      const response = await fetch('/api/remittance/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          toCurrency,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCalculations(data.calculations);
        setSavings(data.summary.savings);

        // Get AI optimization advice
        getAIAdvice(data.calculations);
      }
    } catch (error) {
      console.error('Error calculating remittance:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const getAIAdvice = async (calcs: Calculation[]) => {
    setIsLoadingAdvice(true);
    
    try {
      const response = await fetch('/api/remittance/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          toCurrency,
          urgency,
          calculations: calcs,
          analysis: trendData?.analysis,
        }),
      });

      if (response.ok) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let advice = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const text = decoder.decode(value, { stream: true });
            advice += text;
            setAiAdvice(advice);
          }

          // Auto-speak the advice
          speakText(advice);
        }
      }
    } catch (error) {
      console.error('Error getting AI advice:', error);
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  const speakText = async (text: string) => {
    try {
      setIsSpeaking(true);
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        await audio.play();
      } else {
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error('Error speaking text:', error);
      setIsSpeaking(false);
    }
  };

  const startVoiceInput = async () => {
    try {
      // @ts-ignore - webkitSpeechRecognition is not in types
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('Speech recognition not supported in this browser');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        
        // Try to parse amount and currency from speech
        const amountMatch = transcript.match(/(\d+\.?\d*)/);
        if (amountMatch) {
          setAmount(amountMatch[1]);
        }

        // Check for currency mentions
        const lowerTranscript = transcript.toLowerCase();
        if (lowerTranscript.includes('india') || lowerTranscript.includes('rupee')) {
          setToCurrency('INR');
        } else if (lowerTranscript.includes('china') || lowerTranscript.includes('yuan')) {
          setToCurrency('CNY');
        } else if (lowerTranscript.includes('euro') || lowerTranscript.includes('europe')) {
          setToCurrency('EUR');
        } else if (lowerTranscript.includes('mexico') || lowerTranscript.includes('peso')) {
          setToCurrency('MXN');
        }

        // Auto-calculate after voice input
        setTimeout(() => calculateRemittance(), 500);
      };

      recognition.start();
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      setIsRecording(false);
    }
  };

  const getTrendIcon = () => {
    if (!trendData) return <Minus className="w-5 h-5" />;
    
    switch (trendData.analysis.trend) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          box-sizing: border-box;
        }

        .remittance-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #FAF2E7 0%, #EDECEA 50%, #FFFFFF 100%);
        }

        .remittance-header {
          background-color: #FFFFFF;
          border-bottom: 1px solid #EDECEA;
          position: sticky;
          top: 0;
          z-index: 40;
          box-shadow: 0 2px 8px rgba(42, 49, 64, 0.08);
        }

        .remittance-back-btn {
          padding: 0.5rem;
          border-radius: 9999px;
          transition: background-color 0.2s;
          cursor: pointer;
          background: none;
          border: none;
        }

        .remittance-back-btn:hover {
          background-color: #F5F5F5;
        }

        .remittance-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: #2A3140;
          margin: 0;
        }

        .remittance-subtitle {
          color: #6B7280;
          margin-top: 0.25rem;
          font-size: 0.875rem;
          font-weight: 500;
        }
      `}} />

      <div className="remittance-container">
        {/* Header */}
        <div className="remittance-header">
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/')}
                  className="remittance-back-btn"
                >
                  <ArrowLeft style={{ width: '1.5rem', height: '1.5rem', color: '#2A3140' }} />
                </motion.button>
                <div>
                  <h1 className="remittance-title">Send Money Home</h1>
                  <p className="remittance-subtitle">Smart remittance comparison with real-time rates</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {/* Left Column - Input Form (40% width on large screens) */}
            <div style={{ flex: '0 0 auto', width: '100%', maxWidth: '500px' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '18px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                  border: '1px solid #EDECEA',
                  padding: '2rem',
                  position: 'sticky',
                  top: '6rem'
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'linear-gradient(135deg, #2AA46A 0%, #F9A61B 100%)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem'
                  }}>
                    <Send style={{ width: '32px', height: '32px', color: '#FFFFFF' }} />
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2A3140', margin: 0 }}>Transfer Details</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Amount Input */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#2A3140', marginBottom: '0.5rem' }}>
                      I want to send
                    </label>
                    <div style={{ position: 'relative' }}>
                      <DollarSign style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '1.5rem',
                        height: '1.5rem',
                        color: '#2AA46A'
                      }} />
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        step="1"
                        min="1"
                        style={{
                          width: '100%',
                          paddingLeft: '3.5rem',
                          paddingRight: '4rem',
                          paddingTop: '1rem',
                          paddingBottom: '1rem',
                          fontSize: '1.5rem',
                          fontWeight: '700',
                          backgroundColor: '#FAF2E7',
                          border: '2px solid transparent',
                          borderRadius: '15px',
                          color: '#2A3140',
                          outline: 'none',
                          transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#2AA46A'}
                        onBlur={(e) => e.target.style.borderColor = 'transparent'}
                        placeholder="1500"
                      />
                      <span style={{
                        position: 'absolute',
                        right: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#6B7280'
                      }}>USD</span>
                    </div>
                  </div>

                  {/* Currency Select */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#2A3140', marginBottom: '0.5rem' }}>
                      To where?
                    </label>
                    <select
                      value={toCurrency}
                      onChange={(e) => setToCurrency(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        fontSize: '1.125rem',
                        backgroundColor: '#FAF2E7',
                        border: '2px solid transparent',
                        borderRadius: '15px',
                        color: '#2A3140',
                        fontWeight: '500',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#2AA46A'}
                      onBlur={(e) => e.target.style.borderColor = 'transparent'}
                    >
                      {Object.entries(SUPPORTED_CURRENCIES).map(([code, info]) => (
                        <option key={code} value={code}>
                          {info.flag} {info.country}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Urgency */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#2A3140', marginBottom: '0.75rem' }}>
                      How urgent?
                    </label>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      {['instant', 'normal', 'flexible'].map((option) => (
                        <motion.button
                          key={option}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setUrgency(option)}
                          style={{
                            flex: 1,
                            padding: '0.75rem',
                            borderRadius: '15px',
                            fontWeight: '600',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: urgency === option ? '#2AA46A' : '#EDECEA',
                            color: urgency === option ? '#FFFFFF' : '#6B7280',
                            boxShadow: urgency === option ? '0 4px 12px rgba(42, 164, 106, 0.25)' : 'none',
                            transition: 'all 0.2s'
                          }}
                        >
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem' }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={startVoiceInput}
                      disabled={isRecording}
                      style={{
                        padding: '1rem 1.5rem',
                        borderRadius: '15px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        border: 'none',
                        cursor: isRecording ? 'not-allowed' : 'pointer',
                        backgroundColor: isRecording ? '#EF4444' : '#EDECEA',
                        color: isRecording ? '#FFFFFF' : '#2A3140',
                        animation: isRecording ? 'pulse 2s infinite' : 'none'
                      }}
                    >
                      <Mic style={{ width: '1.25rem', height: '1.25rem' }} />
                      {isRecording ? 'Listening...' : 'Voice'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={calculateRemittance}
                      disabled={isCalculating || !amount}
                      style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #2AA46A 0%, rgba(42, 164, 106, 0.8) 100%)',
                        color: '#FFFFFF',
                        padding: '1rem',
                        borderRadius: '15px',
                        fontWeight: '700',
                        fontSize: '1.125rem',
                        boxShadow: '0 4px 12px rgba(42, 164, 106, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        border: 'none',
                        cursor: (isCalculating || !amount) ? 'not-allowed' : 'pointer',
                        opacity: (isCalculating || !amount) ? 0.5 : 1
                      }}
                    >
                      {isCalculating ? (
                        <>
                          <Loader2 style={{ width: '1.25rem', height: '1.25rem', animation: 'spin 1s linear infinite' }} />
                          Calculating...
                        </>
                      ) : (
                        <>
                          <Send style={{ width: '1.25rem', height: '1.25rem' }} />
                          Calculate
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Results (flex: 1) */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Debug: Check if trendData exists */}
              {!trendData && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  <p className="font-bold">Debug: No trend data</p>
                  <p>toCurrency: {toCurrency}</p>
                </div>
              )}
              
              {/* Exchange Rate Trend Chart - Always Visible */}
              {trendData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-[18px] shadow-xl border border-gray-100 p-6 mb-6"
                >
                  {/* Header - Clean and Professional */}
                  <div className="mb-6 pb-6" style={{ borderBottom: '1px solid #E5E5E5' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-semibold mb-2" style={{ color: '#2AA46A', fontFamily: 'Inter, sans-serif' }}>
                          Rate Trends - Past Week
                        </h2>
                        <div className="text-sm font-medium" style={{ color: '#666' }}>
                          USD → {toCurrency}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-medium mb-1" style={{ color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          7-Day Change
                        </div>
                        <div className={`text-3xl font-semibold`} style={{ 
                          color: trendData.analysis.percentageChange > 0 ? '#2AA46A' : 
                                 trendData.analysis.percentageChange < 0 ? '#E74C3C' : '#666',
                          fontFamily: 'Inter, sans-serif' 
                        }}>
                          {trendData.analysis.percentageChange > 0 ? '+' : ''}
                          {trendData.analysis.percentageChange.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Multi-Service Chart with Enhanced Background */}
                  <div className="relative rounded-2xl p-6 mb-6" style={{
                    background: 'linear-gradient(135deg, #FAF2E7 0%, #FFFFFF 100%)',
                    boxShadow: '0 8px 32px rgba(42, 164, 106, 0.12)'
                  }}>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getChartData()}>
                          <defs>
                            <linearGradient id="colorWise" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2AA46A" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#2AA46A" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#EDECEA" />
                          <XAxis 
                            dataKey="date" 
                            stroke="#9ca3af"
                            style={{ fontSize: '12px', fontWeight: 600 }}
                          />
                          <YAxis 
                            stroke="#9ca3af"
                            style={{ fontSize: '12px', fontWeight: 600 }}
                            domain={['auto', 'auto']}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#fff',
                              border: '2px solid #2AA46A',
                              borderRadius: '12px',
                              padding: '12px',
                              fontSize: '13px',
                              fontWeight: 600,
                              boxShadow: '0 8px 24px rgba(42, 164, 106, 0.2)'
                            }}
                            formatter={(value: number) => [value.toFixed(4), '']}
                          />
                          <Legend 
                            wrapperStyle={{ fontSize: '13px', fontWeight: 600 }}
                            iconType="line"
                          />
                          {trendData.serviceRates ? (
                            <>
                              <Line 
                                type="monotone" 
                                dataKey="Wise" 
                                stroke="#2AA46A" 
                                strokeWidth={3}
                                dot={{ fill: '#2AA46A', r: 5, strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 7, strokeWidth: 2 }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="PayPal" 
                                stroke="#0070BA" 
                                strokeWidth={2.5}
                                dot={{ fill: '#0070BA', r: 5, strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 7, strokeWidth: 2 }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="Western Union" 
                                stroke="#F9A61B" 
                                strokeWidth={2.5}
                                dot={{ fill: '#F9A61B', r: 5, strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 7, strokeWidth: 2 }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="Bank Wire" 
                                stroke="#C29454" 
                                strokeWidth={2.5}
                                dot={{ fill: '#C29454', r: 5, strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 7, strokeWidth: 2 }}
                                strokeDasharray="5 5"
                              />
                            </>
                          ) : (
                            <Line 
                              type="monotone" 
                              dataKey="rate" 
                              stroke="#2AA46A" 
                              strokeWidth={3}
                              dot={{ fill: '#2AA46A', r: 6, strokeWidth: 2, stroke: '#fff' }}
                              name="Exchange Rate"
                            />
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Market Insights - Clean Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Market Insight */}
                    <div className="p-5 rounded-lg" style={{ background: '#F8F9FA', border: '1px solid #E5E5E5' }}>
                      <h4 className="text-sm font-semibold mb-3" style={{ color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Market Insight
                      </h4>
                      <p className="text-sm leading-relaxed" style={{ color: '#333', fontFamily: 'Inter, sans-serif' }}>
                        {trendData.analysis.insight}
                      </p>
                    </div>

                    {/* Best Rate & Volatility */}
                    {trendData.analysis.bestRate && (
                      <div className="p-5 rounded-lg" style={{ background: '#F8F9FA', border: '1px solid #E5E5E5' }}>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs font-semibold mb-2" style={{ color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Best Rate
                            </div>
                            <div className="text-2xl font-semibold mb-1" style={{ color: '#2AA46A', fontFamily: 'Inter, sans-serif' }}>
                              {trendData.analysis.bestRate.rate.toFixed(4)}
                            </div>
                            <div className="text-xs" style={{ color: '#999' }}>
                              {toCurrency} per USD
                            </div>
                            <div className="mt-2 text-xs" style={{ color: '#666' }}>
                              {trendData.analysis.bestRate.service} • {new Date(trendData.analysis.bestRate.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                          <div className="border-l pl-4" style={{ borderColor: '#E5E5E5' }}>
                            <div className="text-xs font-semibold mb-2" style={{ color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Volatility
                            </div>
                            <div className="inline-block px-3 py-1 rounded text-sm font-semibold mb-2" style={{
                              background: trendData.analysis.volatility === 'low' ? '#E8F5E9' :
                                         trendData.analysis.volatility === 'medium' ? '#FFF9E6' : '#FFEBEE',
                              color: trendData.analysis.volatility === 'low' ? '#2AA46A' :
                                     trendData.analysis.volatility === 'medium' ? '#F9A61B' : '#E74C3C'
                            }}>
                              {trendData.analysis.volatility?.toUpperCase() || 'LOW'}
                            </div>
                            <div className="text-xs mt-2" style={{ color: '#666' }}>
                              {trendData.analysis.volatility === 'low' ? 'Stable rates' :
                               trendData.analysis.volatility === 'medium' ? 'Moderate swings' :
                               'High fluctuation'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {calculations.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                >
                {/* Comparison Results with Modern Design */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden bg-white rounded-[24px] shadow-2xl border border-gray-100 p-8"
                >
                  {/* Header with Savings Badge */}
                  <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: '1px solid #E5E5E5', fontFamily: 'Inter, sans-serif' }}>
                    <div>
                      <h3 className="text-2xl font-semibold" style={{ color: '#333' }}>
                        Service Comparison
                      </h3>
                      <p className="text-sm mt-1" style={{ color: '#666' }}>Compare all transfer options</p>
                    </div>
                    {savings > 0 && (
                      <div className="px-5 py-3 rounded-lg" style={{ background: '#E8F5E9', border: '1px solid #2AA46A' }}>
                        <div className="text-xs font-medium mb-1" style={{ color: '#666' }}>
                          You Save
                        </div>
                        <div className="text-2xl font-semibold" style={{ color: '#2AA46A', fontFamily: 'Inter, sans-serif' }}>
                          ${savings.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {calculations.map((calc, index) => (
                      <div
                        key={calc.serviceName}
                        className="p-5 rounded-lg border transition-all hover:shadow-md"
                        style={{
                          borderColor: calc.recommended ? '#2AA46A' : '#E5E5E5',
                          borderWidth: calc.recommended ? '2px' : '1px',
                          background: '#fff',
                          fontFamily: 'Inter, sans-serif'
                        }}
                      >
                        {/* Service Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div>
                                <div className="flex items-center gap-3">
                                  <h3 className="text-xl font-semibold" style={{ color: '#333' }}>
                                    {calc.serviceName}
                                  </h3>
                                  {calc.recommended && (
                                    <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: '#E8F5E9', color: '#2AA46A' }}>
                                      RECOMMENDED
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs font-medium px-2 py-1 rounded" style={{
                                    background: '#F8F9FA',
                                    color: '#666'
                                  }}>
                                    {calc.transferSpeed}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: '#999', letterSpacing: '0.05em' }}>You Receive</div>
                            <div className="text-3xl font-semibold" style={{ color: calc.recommended ? '#2AA46A' : '#333', fontFamily: 'Inter, sans-serif' }}>
                              {currencyInfo?.symbol}{calc.amountReceived.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            </div>
                            <div className="text-xs mt-1" style={{ color: '#999' }}>{toCurrency}</div>
                          </div>
                        </div>

                        {/* Stats Grid - Clean Layout */}
                        <div className="grid grid-cols-3 gap-4 mt-5 pt-5" style={{ borderTop: '1px solid #E5E5E5' }}>
                          <div className="text-center">
                            <div className="text-xs font-semibold mb-1" style={{ color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Fee
                            </div>
                            <p className="text-lg font-semibold" style={{ color: '#333' }}>${calc.fee.toFixed(2)}</p>
                          </div>
                          <div className="text-center border-x" style={{ borderColor: '#E5E5E5' }}>
                            <div className="text-xs font-semibold mb-1" style={{ color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Rate
                            </div>
                            <p className="text-lg font-semibold" style={{ color: '#333' }}>{calc.exchangeRate.toFixed(4)}</p>
                          </div>
                          <div className="text-center">
                            <div className="text-xs font-semibold mb-1" style={{ color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Total Cost
                            </div>
                            <p className="text-lg font-semibold" style={{ color: '#333' }}>${calc.totalCost.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* AI Recommendation - Clean and Professional */}
                {(aiAdvice || isLoadingAdvice) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg p-6"
                    style={{
                      background: '#F8F9FA',
                      border: '1px solid #E5E5E5',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5 pb-4" style={{ borderBottom: '1px solid #E5E5E5' }}>
                      <div>
                        <h3 className="text-xl font-semibold" style={{ color: '#333' }}>
                          Personalized Recommendation
                        </h3>
                      </div>
                      {isSpeaking && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#E8F5E9', border: '1px solid #2AA46A' }}>
                          <Volume2 className="w-5 h-5 animate-pulse" style={{ color: '#2AA46A' }} />
                          <span className="text-sm font-medium" style={{ color: '#2AA46A' }}>Playing...</span>
                        </div>
                      )}
                    </div>

                    {isLoadingAdvice && !aiAdvice ? (
                      <div className="rounded-lg p-6" style={{ background: '#fff' }}>
                        <div className="flex items-center gap-4">
                          <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#2AA46A' }} />
                          <div>
                            <span className="text-base font-medium block" style={{ color: '#333' }}>Analyzing your options...</span>
                            <span className="text-sm mt-1 block" style={{ color: '#666' }}>This will take just a moment</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="rounded-lg p-5" style={{ background: '#fff', border: '1px solid #E5E5E5' }}>
                          <div className="leading-relaxed whitespace-pre-wrap text-sm" style={{ color: '#333' }}>
                            {aiAdvice}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="mt-5 pt-4 flex gap-3" style={{ borderTop: '1px solid #E5E5E5' }}>
                          <button 
                            onClick={() => speakText(aiAdvice)}
                            className="flex-1 px-5 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                            style={{ background: '#2AA46A', color: '#fff' }}
                          >
                            <Volume2 className="w-5 h-5" />
                            {isSpeaking ? 'Stop' : 'Listen'}
                          </button>
                          <button 
                            onClick={() => navigator.clipboard.writeText(aiAdvice)}
                            className="px-5 py-3 rounded-lg font-medium transition-all flex items-center gap-2"
                            style={{ background: '#fff', color: '#666', border: '1px solid #E5E5E5' }}
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-[18px] shadow-xl border border-gray-100 p-12 text-center"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-[#2AA46A] to-[#F9A61B] rounded-full flex items-center justify-center mx-auto mb-6 opacity-20">
                  <Send className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#2A3140] mb-3">Ready to Compare?</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Enter your transfer details and click Calculate to see the best rates and services for sending money home.
                </p>
              </motion.div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
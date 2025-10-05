import { streamText } from 'ai';
import { Opik } from 'opik';
import { openai } from '@/lib/echo';

// ============================================
// GUARDRAIL FUNCTIONS
// ============================================

// PII Detection - Protects user privacy
function containsPII(text: string): { detected: boolean; types: string[] } {
  const patterns = {
    ssn: /\b\d{3}-\d{2}-\d{4}\b|\b\d{9}\b/,
    credit_card: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/,
    password: /\b(password|passwd|pwd)[\s:=]+\S+/i,
    account_number: /\b(account\s*#?|acct\s*#?)[\s:]*\d{6,}\b/i,
    routing_number: /\b\d{9}\b/,
  };
  
  const detected: string[] = [];
  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) {
      detected.push(type);
    }
  }
  
  return { detected: detected.length > 0, types: detected };
}

// Financial Safety Scorer - Detects risky advice
function evaluateFinancialSafety(response: string): { score: number; flags: string[] } {
  const riskyPhrases = {
    'payday loan': 'Suggests predatory lending',
    'max out': 'Encourages excessive debt',
    'invest in crypto': 'High-risk investment for students',
    'avoid paying taxes': 'Tax evasion advice',
    'lie on application': 'Fraud encouragement',
    'send via untraceable': 'Unsafe money transfer',
    'wire money to stranger': 'Scam risk',
    'guaranteed returns': 'Unrealistic promises',
  };
  
  const flags: string[] = [];
  for (const [phrase, reason] of Object.entries(riskyPhrases)) {
    if (response.toLowerCase().includes(phrase)) {
      flags.push(`${phrase} (${reason})`);
    }
  }
  
  const score = Math.max(0, 1 - (flags.length * 0.25));
  return { score, flags };
}

// Question Category Detection - For analytics
function detectQuestionCategory(message: string): string {
  const categories = {
    banking: ['bank', 'account', 'deposit', 'checking', 'savings', 'debit'],
    tax: ['tax', '1040', 'deduction', 'irs', 'w2', 'w-2', 'filing'],
    remittance: ['send money', 'transfer', 'home', 'wire', 'remittance', 'family'],
    credit: ['credit card', 'credit score', 'build credit', 'fico', 'experian'],
    visa: ['visa', 'f1', 'opt', 'cpt', 'stem', 'work permit'],
    investment: ['invest', 'stock', 'retirement', '401k', 'roth'],
  };
  
  const lower = message.toLowerCase();
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(k => lower.includes(k))) {
      return category;
    }
  }
  return 'general';
}

// Country Detection - For personalized advice
function detectCountry(message: string): string {
  const countries = {
    'India': ['india', 'indian', 'rupee', 'inr', 'delhi', 'mumbai'],
    'China': ['china', 'chinese', 'yuan', 'cny', 'beijing', 'shanghai'],
    'Mexico': ['mexico', 'mexican', 'peso', 'mxn'],
    'Vietnam': ['vietnam', 'vietnamese', 'dong', 'vnd'],
    'South Korea': ['korea', 'korean', 'won', 'krw', 'seoul'],
    'Nigeria': ['nigeria', 'nigerian', 'naira', 'ngn', 'lagos'],
  };
  
  const lower = message.toLowerCase();
  for (const [country, keywords] of Object.entries(countries)) {
    if (keywords.some(k => lower.includes(k))) {
      return country;
    }
  }
  return 'unknown';
}

// Initialize Opik client
const isOpikConfigured = 
  process.env.OPIK_API_KEY && 
  !process.env.OPIK_API_KEY.includes('your_') &&
  process.env.OPIK_API_KEY.length > 10 &&
  process.env.OPIK_WORKSPACE &&
  !process.env.OPIK_WORKSPACE.includes('your_') &&
  process.env.OPIK_WORKSPACE.length > 2;

let opik: Opik | null = null;

if (isOpikConfigured) {
  try {
    opik = new Opik({
      apiKey: process.env.OPIK_API_KEY!,
      workspaceName: process.env.OPIK_WORKSPACE!,
      projectName: 'finmate',
      apiUrl: 'https://www.comet.com/opik/api',
    });
    console.log('✅ Opik tracing enabled');
  } catch (error) {
    console.error('❌ Failed to initialize Opik:', error);
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const messages = body.messages || [];
  const startTime = Date.now();
  
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response('Invalid messages', { status: 400 });
  }
  
  const userMessage = messages[messages.length - 1]?.content || '';
  
  // PII Detection
  const piiCheck = containsPII(userMessage);
  if (piiCheck.detected) {
    console.warn('🔒 PII detected:', piiCheck.types);
    
    const piiTrace = opik?.trace({
      name: 'pii_blocked',
      input: { message: '[REDACTED]', detected_types: piiCheck.types },
      output: { blocked: true, status: 'rejected' },
      projectName: 'finmate',
      tags: ['security', 'pii-detection', 'blocked', `types:${piiCheck.types.join(',')}`],
      metadata: {
        category: 'security',
        blocked: true,
        reason: 'PII detected',
        pii_types: piiCheck.types.join(', '),
        pii_count: piiCheck.types.length,
        action: 'request_blocked',
        severity: 'high',
        timestamp: new Date().toISOString(),
        user_notified: true,
      }
    });
    
    // Add span for PII detection logic
    const detectionSpan = piiTrace?.span({
      name: 'pii_pattern_matching',
      input: { message_length: userMessage.length },
      output: { detected_types: piiCheck.types, match_count: piiCheck.types.length },
      metadata: {
        patterns_checked: ['ssn', 'credit_card', 'password', 'account_number', 'routing_number'],
        detection_method: 'regex_patterns',
        confidence: 'high',
      }
    });
    detectionSpan?.end();
    
    piiTrace?.end();
    
    return Response.json({ 
      error: '🔒 Privacy Protection: Please don\'t share sensitive information like SSN, passwords, or account numbers!' 
    }, { status: 400 });
  }
  
  const category = detectQuestionCategory(userMessage);
  const country = detectCountry(userMessage);
  
  const trace = opik?.trace({
    name: 'chat_mentor',
    input: { messages, user_message: userMessage },
    projectName: 'finmate',
    tags: ['financial-advice', `category:${category}`, `country:${country}`, 'production'],
    metadata: { 
      category, 
      country, 
      message_length: userMessage.length, 
      conversation_length: messages.length,
      user_type: 'international_student',
      session_type: 'chat',
      model: 'gpt-4o-mini',
      temperature: 0.7,
    }
  });

  try {
    const llmStartTime = Date.now();
    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: `You are FinMate, an AI financial advisor for international students in the U.S.

Your role:
- Explain U.S. banking, taxes, credit, and financial concepts simply
- Be empathetic and supportive
- Use examples and analogies
- Keep responses concise (2-3 paragraphs)
- NEVER suggest risky financial behavior
- NEVER ask for sensitive information

Topics you help with:
- Opening bank accounts without SSN
- Building credit history
- Understanding taxes (1040-NR, FICA)
- International money transfers
- Budgeting and financial literacy`,
      messages: messages,
      temperature: 0.7,
    });

    let fullResponse = '';
    let totalTokens = 0;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const part of result.fullStream) {
            if (part.type === 'text-delta') {
              fullResponse += part.text;
              controller.enqueue(encoder.encode(part.text));
            }
            
            if (part.type === 'finish' && (part as any).usage) {
              totalTokens = (part as any).usage.totalTokens || 0;
            }
          }
          
          const safetyEval = evaluateFinancialSafety(fullResponse);
          const llmLatency = Date.now() - llmStartTime;
          const totalLatency = Date.now() - startTime;
          const estimatedCost = (totalTokens / 1000) * 0.00015;
          
          console.log('💬 Chat completed:', {
            category,
            country,
            safety_score: safetyEval.score,
            latency_ms: totalLatency,
            tokens: totalTokens,
            cost_usd: estimatedCost.toFixed(6),
          });
          
          if (trace) {
            // Add pre-processing span
            const preprocessSpan = trace.span({
              name: 'preprocessing',
              input: { message: userMessage },
              output: { category, country, message_length: userMessage.length },
              metadata: {
                category_detected: category,
                country_detected: country,
                pii_check: 'passed',
              }
            });
            preprocessSpan.end();
            
            // Add LLM generation span with detailed metrics
            const llmSpan = trace.span({
              name: 'llm_generation',
              input: { 
                model: 'gpt-4o-mini', 
                messages: messages.length, 
                temperature: 0.7,
                max_tokens: 'auto',
                stream: true,
              },
              output: { response: fullResponse, length: fullResponse.length },
              metadata: {
                tokens_total: totalTokens,
                tokens_per_second: totalTokens / (llmLatency / 1000),
                latency_ms: llmLatency,
                cost_usd: estimatedCost,
                model_version: 'gpt-4o-mini-2024',
                provider: 'openai',
              }
            });
            llmSpan.end();
            
            // Add safety evaluation span
            const safetySpan = trace.span({
              name: 'safety_evaluation',
              input: { response: fullResponse },
              output: { 
                score: safetyEval.score, 
                passed: safetyEval.score >= 0.7,
                flags: safetyEval.flags,
              },
              metadata: {
                safety_score: safetyEval.score,
                safety_flags_count: safetyEval.flags.length,
                risk_level: safetyEval.score >= 0.9 ? 'low' : safetyEval.score >= 0.7 ? 'medium' : 'high',
                evaluation_method: 'keyword_pattern_matching',
              }
            });
            safetySpan.end();
            
            // Update main trace with comprehensive data
            trace.update({
              output: { 
                response: fullResponse,
                metadata: {
                  response_quality: 'evaluated',
                  user_facing: true,
                }
              },
              tags: [
                'financial-advice', 
                `category:${category}`, 
                `country:${country}`,
                `safety:${safetyEval.score >= 0.7 ? 'passed' : 'flagged'}`,
                `latency:${totalLatency < 500 ? 'fast' : totalLatency < 1000 ? 'medium' : 'slow'}`,
                'production',
              ],
              metadata: {
                // Status & Quality
                status: 'success',
                quality_score: safetyEval.score,
                
                // Safety Metrics
                safety_score: safetyEval.score,
                safety_passed: safetyEval.score >= 0.7,
                safety_flags: safetyEval.flags.join('; ') || 'none',
                risk_level: safetyEval.score >= 0.9 ? 'low' : safetyEval.score >= 0.7 ? 'medium' : 'high',
                
                // Performance Metrics
                total_latency_ms: totalLatency,
                llm_latency_ms: llmLatency,
                preprocessing_latency_ms: llmStartTime - startTime,
                postprocessing_latency_ms: Date.now() - llmStartTime - llmLatency,
                
                // Token & Cost Metrics
                tokens: totalTokens,
                tokens_per_second: totalTokens / (llmLatency / 1000),
                cost_usd: estimatedCost,
                cost_per_1k_tokens: 0.00015,
                
                // Content Metrics
                response_length: fullResponse.length,
                response_words: fullResponse.split(' ').length,
                input_length: userMessage.length,
                compression_ratio: userMessage.length / fullResponse.length,
                
                // Categorization
                category,
                country,
                user_type: 'international_student',
                conversation_turn: messages.length,
                
                // Technical Details
                model: 'gpt-4o-mini',
                temperature: 0.7,
                streaming: true,
                api_version: 'v1',
              }
            });
            
            trace.end();
          }
          
          if (safetyEval.score < 0.7) {
            console.warn('⚠️ Low safety score detected!', {
              score: safetyEval.score,
              flags: safetyEval.flags,
              preview: fullResponse.substring(0, 150),
            });
          }
          
        } catch (streamError) {
          console.error('Stream error:', streamError);
          trace?.end();
        }
        
        controller.close();
      }
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  } catch (error) {
    console.error('Chat API error:', error);
    trace?.update({ metadata: { status: 'error', error: String(error) } });

    trace?.end();
    throw error;
  }
}

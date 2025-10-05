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

let opik: Opik | null = null;

if (isOpikConfigured) {
  try {
    opik = new Opik({
      apiKey: process.env.OPIK_API_KEY!,
      workspaceName: process.env.OPIK_WORKSPACE!,
      projectName: 'finmate',
      apiUrl: 'https://www.comet.com/opik/api',
    });
    console.log('✅ Opik tracing enabled for receipt parsing');
  } catch (error) {
    console.error('❌ Failed to initialize Opik:', error);
  }
}

// Helper function to extract field from text
function extractField(text: string, fieldNames: string[]): string | undefined {
  for (const field of fieldNames) {
    const regex = new RegExp(`"?${field}"?\\s*:?\\s*"?([^",\\n}]+)"?`, 'i');
    const match = text.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return undefined;
}

// Mock historical spending data (for demo purposes)
const MOCK_SPENDING_DATA = {
  monthlyTotal: 2340,
  categories: {
    groceries: 450,
    dining: 380,
    utilities: 120,
    transportation: 85,
    entertainment: 150,
    textbooks: 200,
    tuition: 8500
  },
  budgets: {
    groceries: 500,
    dining: 300,
    utilities: 150,
    transportation: 100,
    entertainment: 200,
    textbooks: 300
  }
};

// Function to generate smart insights based on parsed receipt
function generateSmartInsights(parsed: any) {
  const amount = parseFloat(parsed.amount?.toString().replace(/[^0-9.]/g, '') || '0');
  const merchant = (parsed.payer?.toLowerCase() || '');
  
  // Determine category based on merchant name
  let category = 'groceries'; // Default to groceries
  let categorySpending = 0;
  let budget = 0;
  
  if (merchant.includes('whole foods') || merchant.includes('trader joe') || merchant.includes('safeway') || merchant.includes('kroger') || merchant.includes('walmart') || merchant.includes('market') || merchant.includes('grocery')) {
    category = 'groceries';
    categorySpending = MOCK_SPENDING_DATA.categories.groceries;
    budget = MOCK_SPENDING_DATA.budgets.groceries;
  } else if (merchant.includes('chipotle') || merchant.includes('mcdonald') || merchant.includes('starbucks') || merchant.includes('subway') || merchant.includes('dunkin') || merchant.includes('restaurant') || merchant.includes('cafe')) {
    category = 'dining';
    categorySpending = MOCK_SPENDING_DATA.categories.dining;
    budget = MOCK_SPENDING_DATA.budgets.dining;
  } else if (merchant.includes('uber') || merchant.includes('lyft') || merchant.includes('shell') || merchant.includes('chevron') || merchant.includes('gas')) {
    category = 'transportation';
    categorySpending = MOCK_SPENDING_DATA.categories.transportation;
    budget = MOCK_SPENDING_DATA.budgets.transportation;
  } else if (merchant.includes('textbook') || merchant.includes('bookstore') || merchant.includes('book')) {
    category = 'textbooks';
    categorySpending = MOCK_SPENDING_DATA.categories.textbooks;
    budget = MOCK_SPENDING_DATA.budgets.textbooks;
  } else if (parsed.purpose?.toLowerCase().includes('fruit') || parsed.purpose?.toLowerCase().includes('vegetable') || parsed.purpose?.toLowerCase().includes('food')) {
    // Check purpose if merchant name doesn't match
    category = 'groceries';
    categorySpending = MOCK_SPENDING_DATA.categories.groceries;
    budget = MOCK_SPENDING_DATA.budgets.groceries;
  }

  const percentOfBudget = budget > 0 ? Math.round((categorySpending / budget) * 100) : 0;

  // Generate cheaper alternatives based on category
  const cheaperAlternatives = [];
  if (category === 'groceries') {
    cheaperAlternatives.push(
      { name: 'Walmart', savings: '$12-18', distance: '2.3 miles', note: 'Up to 25% cheaper on produce and basics' },
      { name: 'ALDI', savings: '$20-25', distance: '4.1 miles', note: 'Best prices on dairy, bread, and frozen foods' },
      { name: 'Costco', savings: '$30-40', distance: '6.8 miles', note: 'Buy in bulk - perfect for sharing with roommates' }
    );
  } else if (category === 'dining') {
    cheaperAlternatives.push(
      { name: 'Meal Prep at Home', savings: '$15-20/meal', note: 'Cook once, eat 4-5 times. Saves $300+/month' },
      { name: 'Campus Cafeteria', savings: '$5-8/meal', note: 'Use meal plan if available' },
      { name: 'Local Food Trucks', savings: '$3-5/meal', note: 'Often cheaper than chain restaurants' }
    );
  } else if (category === 'transportation') {
    cheaperAlternatives.push(
      { name: 'Campus Shuttle', savings: '$85/month', note: 'Free transportation within campus area' },
      { name: 'Student Bus Pass', savings: '$60/month', note: 'Discounted public transit - $30 vs $90' },
      { name: 'Bike Sharing', savings: '$50/month', note: 'First 30 min free on most platforms' }
    );
  } else if (category === 'textbooks') {
    cheaperAlternatives.push(
      { name: 'LibGen / Z-Library', savings: '$150-200', note: 'Free PDF versions (check copyright laws)' },
      { name: 'Campus Library Reserve', savings: '$200', note: 'Borrow for free, 2-hour checkout' },
      { name: 'OpenStax', savings: '$100-150', note: 'Free open-source textbooks for many courses' }
    );
  }

  // Determine tax deductibility
  let taxDeductible: any = { eligible: false };
  if (category === 'textbooks' || merchant.includes('bookstore') || merchant.includes('textbook')) {
    taxDeductible = {
      eligible: true,
      form: 'Form 8917',
      estimatedSaving: '$50-100',
      details: 'Required textbooks and course materials are tax-deductible under the American Opportunity Credit (up to $2,500/year).'
    };
  } else if (merchant.includes('tuition') || amount > 5000) {
    taxDeductible = {
      eligible: true,
      form: 'Form 1098-T',
      estimatedSaving: '$500-2,500',
      details: 'Tuition fees qualify for American Opportunity Credit or Lifetime Learning Credit. Save this receipt for tax filing!'
    };
  } else if (merchant.includes('laptop') || merchant.includes('computer') || parsed.purpose?.toLowerCase().includes('laptop')) {
    taxDeductible = {
      eligible: true,
      form: 'Form 8917',
      estimatedSaving: '$50-150',
      details: 'If required by your program, computer equipment is tax-deductible as an educational expense.'
    };
  }

  // Generate smart tips
  const smartTips = [];
  if (category === 'groceries' && categorySpending > budget * 0.8) {
    smartTips.push('You\'re at 90% of your grocery budget. Try buying store brands instead of name brands to save 30%.');
    smartTips.push('Shop on Wednesdays - most stores mark down items expiring soon by 50%.');
  } else if (category === 'dining' && categorySpending > 300) {
    smartTips.push(`You've spent $${categorySpending} on dining this month. Cooking at home 3x/week could save you $200/month.`);
    smartTips.push('Use student discounts at restaurants - many offer 10-20% off with valid ID.');
  } else if (category === 'transportation') {
    smartTips.push('Check if your university offers free shuttle services or discounted bus passes.');
    smartTips.push('Carpool with classmates using Facebook groups to split Uber/Lyft costs.');
  } else if (category === 'textbooks') {
    smartTips.push('Check if your professor has posted free PDFs or older editions work (often 90% similar).');
    smartTips.push('Rent textbooks instead of buying - saves 60-80% on average.');
  }

  // Add general international student tips
  smartTips.push('Track all educational expenses for tax deductions - international students can claim some credits.');
  if (amount > 100) {
    smartTips.push(`Compare this to home country prices: $${amount} = ₹${Math.round(amount * 83)} (India) or ¥${Math.round(amount * 7.2)} (China)`);
  }

  // Budget alert
  let budgetAlert: any = null;
  if (percentOfBudget >= 90) {
    budgetAlert = {
      type: 'warning',
      message: `You've used ${percentOfBudget}% of your ${category} budget this month. Consider switching to cheaper alternatives to stay on track.`
    };
  } else if (percentOfBudget >= 75) {
    budgetAlert = {
      type: 'info',
      message: `You're at ${percentOfBudget}% of your ${category} budget. You're on track, but watch your spending in the final week.`
    };
  } else if (percentOfBudget < 50 && budget > 0) {
    budgetAlert = {
      type: 'success',
      message: `Great job! You're only at ${percentOfBudget}% of your ${category} budget. Keep up the smart spending!`
    };
  }

  return {
    category,
    monthlySpending: {
      current: MOCK_SPENDING_DATA.monthlyTotal,
      category: categorySpending,
      percentOfBudget
    },
    cheaperAlternatives: cheaperAlternatives.length > 0 ? cheaperAlternatives : undefined,
    taxDeductible: taxDeductible.eligible ? taxDeductible : undefined,
    smartTips: smartTips.length > 0 ? smartTips : undefined,
    budgetAlert
  };
}

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
1. Merchant/Store name
2. Total amount (number only, no currency symbol)
3. Purchase purpose/items (brief description)
4. Date
5. Any visible fees or taxes

Format response as JSON with keys: payer, amount, currency, purpose, date, fees
Keep it concise and accurate.` 
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
      // Try to parse as JSON first
      const cleanText = result.text.trim();
      
      // If it starts with ```json, extract the JSON
      if (cleanText.includes('```json')) {
        const jsonMatch = cleanText.match(/```json\s*\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('Could not extract JSON from markdown');
        }
      } else if (cleanText.startsWith('{')) {
        analysis = JSON.parse(cleanText);
      } else {
        throw new Error('Not valid JSON');
      }
    } catch (e) {
      // If parsing fails, try to extract key info from text
      console.log('JSON parse failed, using text extraction. Text:', result.text);
      
      // Try to extract structured data from the text
      const text = result.text;
      analysis = {
        payer: extractField(text, ['payer', 'merchant', 'store']),
        amount: extractField(text, ['amount', 'total']),
        currency: extractField(text, ['currency']) || 'USD',
        purpose: extractField(text, ['purpose', 'description', 'items']),
        date: extractField(text, ['date']),
        fees: extractField(text, ['fees', 'fee']) || 'None visible'
      };
      
      // If still no data, set defaults
      if (!analysis.payer) analysis.payer = 'Unknown Merchant';
      if (!analysis.amount) analysis.amount = '0.00';
      if (!analysis.purpose) analysis.purpose = 'Purchase';
    }

    // Clean up the analysis object
    if (analysis.currency === '' || !analysis.currency) {
      analysis.currency = 'USD';
    }
    if (!analysis.fees) {
      analysis.fees = 'None visible';
    }

    // Add smart insights based on the parsed data
    const insights = generateSmartInsights(analysis);
    analysis = { ...analysis, ...insights };

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

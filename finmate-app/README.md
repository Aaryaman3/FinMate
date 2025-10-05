# FinMate - AI Financial Assistant for International Students

An AI-powered web application that helps international students in the U.S. manage their finances. Built with Next.js 15, powered by OpenAI, with AI observability through Opik.

## 🌟 Features

- **AI Financial Mentor**: Chat with an AI trained specifically for international student financial questions
- **Bank Recommendations**: Get personalized bank suggestions based on your visa status and needs
- **Receipt Scanner**: Upload and analyze payment receipts with AI-powered OCR
- **AI Transparency Dashboard**: View all AI operations with detailed metrics and traces
- **Real-time Chat**: Streaming AI responses for instant guidance
- **Mobile Responsive**: Beautiful UI that works on all devices

## 🛠 Technology Stack

- **Frontend**: Next.js 15 with App Router, React, TypeScript
- **Styling**: TailwindCSS, Framer Motion
- **AI Integration**: 
  - OpenAI GPT-4o-mini for chat and recommendations
  - GPT-4o for vision/OCR capabilities
  - Vercel AI SDK for streaming responses
  - **Echo SDK for authentication and AI billing** (fully integrated)
- **Observability**: Opik for AI tracing and metrics
- **Authentication & Billing**: Echo SDK with OAuth support

## 📦 Installation

1. **Navigate to the project:**
   ```bash
   cd finmate-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Edit `.env.local` and add your credentials:
   ```env
   # Required: OpenAI API Key
   OPENAI_API_KEY=your_openai_api_key
   
   # Required for Echo features: Echo Configuration
   ECHO_APP_ID=your_echo_app_id
   NEXT_PUBLIC_ECHO_APP_ID=your_echo_app_id
   ECHO_CLIENT_ID=your_echo_client_id
   ECHO_CLIENT_SECRET=your_echo_client_secret
   
   # Optional: Opik Configuration
   OPIK_API_KEY=your_opik_api_key
   OPIK_WORKSPACE=your_opik_workspace
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Getting Started

### Quick Start (Minimum Setup)

To get started quickly, you only need an OpenAI API key:

1. Get an API key from [OpenAI Platform](https://platform.openai.com/)
2. Add it to `.env.local` as `OPENAI_API_KEY=sk-...`
3. Run `npm run dev`
4. Visit `http://localhost:3000`

### Full Setup (With Echo & Opik)

For production-ready deployment with authentication, billing, and observability:

1. **OpenAI**: Required for all AI features
   - Sign up at [OpenAI Platform](https://platform.openai.com/)
   - Get API key and add to `.env.local`
   
2. **Echo**: Required for authentication and AI billing (fully integrated)
   - Sign up at [echo.merit.systems](https://echo.merit.systems)
   - Create an app and get credentials
   - Add ECHO_APP_ID, NEXT_PUBLIC_ECHO_APP_ID, ECHO_CLIENT_ID, and ECHO_CLIENT_SECRET to `.env.local`
   - All AI API calls are now billed through Echo
   - Users can sign in/out via the Echo Auth component in the header
   
3. **Opik** (optional): AI observability and tracing
   - Sign up at [comet.com/opik](https://www.comet.com/opik)
   - Get API key and workspace name

## 📱 Application Routes

- `/` - Landing page with feature overview
- `/dashboard` - Main dashboard with all features
- `/chat` - AI Financial Mentor chat interface
- `/banks` - Bank recommendation tool
- `/receipt` - Receipt scanner and analyzer
- `/transparency` - AI transparency dashboard

## 🎯 Key Features Explained

### 1. AI Financial Mentor
- Real-time streaming chat responses
- Trained specifically for international student finances
- Topics: Banking, taxes, credit building, money transfers
- Powered by GPT-4o-mini with Opik tracing

### 2. Bank Recommendations
- Personalized suggestions based on:
  - SSN availability
  - Visa type
  - Monthly income
  - Country of origin
- Includes 6 major U.S. banks
- AI-generated explanations

### 3. Receipt Scanner
- Upload any payment receipt (PNG, JPG, PDF)
- AI extracts:
  - Payer name
  - Amount and currency
  - Purpose
  - Date
  - Fees
- Suggests cheaper payment alternatives

### 4. Transparency Dashboard
- View all AI operations
- Performance metrics:
  - Total API calls
  - Average latency
  - Success rate
  - System uptime
- Links to detailed Opik traces

### 5. Echo Authentication & Billing
- **User Authentication**: Sign in/out with Echo OAuth
- **AI Billing**: All AI API calls are metered through Echo
- **User Dashboard**: View Echo credits and usage
- **Session Management**: Persistent authentication across pages
- Fully integrated in all API routes (chat, recommendations, receipt parsing)

## 🏗 Project Structure

```
finmate-app/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout with Echo provider
│   ├── globals.css           # Global styles
│   ├── dashboard/            # Main dashboard
│   ├── chat/                 # AI chat interface
│   ├── banks/                # Bank recommendations
│   ├── receipt/              # Receipt scanner
│   ├── transparency/         # AI transparency
│   └── api/
│       ├── chat/             # Chat API endpoint (Echo-wrapped)
│       ├── recommend-bank/   # Bank recommendation API (Echo-wrapped)
│       ├── parse-receipt/    # Receipt parsing API (Echo-wrapped)
│       └── echo/[...path]/   # Echo OAuth handlers
├── components/
│   ├── echo-auth.tsx         # Authentication component with useEcho()
│   ├── echo-provider.tsx     # Echo context provider
│   └── bank-card.tsx         # Bank display card
├── lib/
│   ├── opik.ts               # Opik client setup
│   └── bank-data.ts          # Bank database
└── .env.local                # Environment variables
```

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for GPT models |
| `ECHO_APP_ID` | Yes* | Echo application ID (server-side) |
| `NEXT_PUBLIC_ECHO_APP_ID` | Yes* | Echo application ID (client-side) |
| `ECHO_CLIENT_ID` | Yes* | Echo OAuth client ID |
| `ECHO_CLIENT_SECRET` | Yes* | Echo client secret |
| `OPIK_API_KEY` | No | Opik API key for tracing |
| `OPIK_WORKSPACE` | No | Opik workspace name |

*Required for Echo authentication and AI billing features

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

Or use Vercel CLI:
```bash
npm i -g vercel
vercel --prod
```

## 📊 AI Observability with Opik

Opik provides:
- **Trace logging**: Every AI call is logged
- **Performance metrics**: Latency, token usage
- **Error tracking**: Debug failed requests
- **Cost analysis**: Monitor API spending

## 🧪 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🆘 Troubleshooting

### API Calls Failing
- Check that `OPENAI_API_KEY` is set correctly
- Verify you have credits in your OpenAI account
- Check browser console for error messages

### Opik Traces Not Appearing
- Verify `OPIK_API_KEY` and `OPIK_WORKSPACE` are correct
- Check network connectivity to comet.com

### Build Errors
- Delete `node_modules` and `.next` folders
- Run `npm install` again
- Clear npm cache: `npm cache clean --force`

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Opik Documentation](https://www.comet.com/docs/opik/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Echo Documentation](https://echo.merit.systems/docs)

## 🎓 Made for International Students

This project is designed to help international students navigate the complex U.S. financial system.

---

Built with ❤️ for international students worldwide

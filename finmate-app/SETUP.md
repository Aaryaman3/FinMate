# FinMate Setup Guide

Follow these steps to get FinMate running on your local machine.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- An OpenAI API key (required)
- Echo credentials (optional)
- Opik credentials (optional)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd finmate-app
npm install
```

This will install:
- Next.js 15
- React 19
- TypeScript
- TailwindCSS
- Vercel AI SDK
- OpenAI SDK
- Opik SDK
- Framer Motion
- Lucide React (icons)
- And other dependencies

### 2. Configure Environment Variables

Edit the `.env.local` file in the project root:

```env
# REQUIRED: Get from https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

# OPTIONAL: Get from https://echo.merit.systems
ECHO_APP_ID=your_echo_app_id
ECHO_CLIENT_ID=your_echo_client_id
ECHO_CLIENT_SECRET=your_echo_client_secret

# OPTIONAL: Get from https://www.comet.com/opik
OPIK_API_KEY=your_opik_api_key
OPIK_WORKSPACE=your_workspace_name

# App Configuration
NEXT_PUBLIC_APP_NAME=FinMate
```

### 3. Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Click "Create new secret key"
5. Copy the key (starts with `sk-proj-`)
6. Paste it in `.env.local` as `OPENAI_API_KEY`

⚠️ **Important**: Keep this key secret! Never commit it to version control.

### 4. (Optional) Set Up Echo

Echo handles user authentication and AI billing:

1. Go to [echo.merit.systems](https://echo.merit.systems)
2. Create an account
3. Create a new application
4. Copy the App ID, Client ID, and Client Secret
5. Add them to `.env.local`

### 5. (Optional) Set Up Opik

Opik provides AI observability and tracing:

**Option A: Cloud (Recommended)**
1. Go to [comet.com](https://www.comet.com/)
2. Sign up for a free account
3. Navigate to Opik section
4. Get your API key and workspace name
5. Add them to `.env.local`

**Option B: Self-Hosted**
1. Follow [Opik installation guide](https://www.comet.com/docs/opik/self-hosting/)
2. Set `OPIK_URL_OVERRIDE` in `.env.local`

### 6. Start the Development Server

```bash
npm run dev
```

The app will start at [http://localhost:3000](http://localhost:3000)

### 7. Test the Application

1. **Landing Page**: Visit `http://localhost:3000`
2. **Dashboard**: Click "Get Started"
3. **AI Chat**: Test the chat feature
4. **Bank Recommendations**: Fill out the form
5. **Receipt Scanner**: Upload a test image

## Verification Checklist

- [ ] Application loads without errors
- [ ] Can navigate between pages
- [ ] Chat responds to messages (requires OpenAI key)
- [ ] Bank recommendations work (requires OpenAI key)
- [ ] Receipt scanner accepts file uploads (requires OpenAI key)
- [ ] Transparency dashboard shows mock data

## Common Issues

### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Invalid API Key" error
- Check that `OPENAI_API_KEY` is set correctly in `.env.local`
- Ensure the key starts with `sk-proj-` or `sk-`
- Verify you have credits in your OpenAI account

### Port 3000 already in use
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### TypeScript errors
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run dev
```

## Building for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm run start
```

## Environment-Specific Notes

### Development
- Hot reload enabled
- Detailed error messages
- Source maps available

### Production
- Optimized bundles
- No source maps
- Environment variables must be set in deployment platform

## Next Steps

1. **Customize the UI**: Edit pages in `app/` directory
2. **Add Features**: Create new API routes in `app/api/`
3. **Deploy**: Push to Vercel or your preferred platform
4. **Monitor**: Use Opik to track AI performance

## Getting Help

- Check the main [README.md](./README.md) for feature documentation
- Review [instructions.md](../instructions.md) for architecture details
- Check OpenAI API status at [status.openai.com](https://status.openai.com/)

## Security Notes

⚠️ **Never commit these to Git:**
- `.env.local`
- API keys
- Secrets or credentials

✅ **Safe to commit:**
- `.env.example` (template without real values)
- All code files
- Configuration files (without secrets)

---

Happy coding! 🚀

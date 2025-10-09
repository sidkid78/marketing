# Vercel Deployment Guide

## Quick Setup for Vercel

### Step 1: Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend` (if your Next.js app is in a subdirectory)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### Step 2: Add Environment Variable

#### In Vercel Dashboard:

1. Go to your project settings
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variable:

```
Name: NEXT_PUBLIC_GEMINI_API_KEY
Value: your_gemini_api_key_here
```

4. Select which environments to apply it to:
   - ✅ Production
   - ✅ Preview
   - ✅ Development (optional)

5. Click **Save**

#### Or use Vercel CLI:

```bash
vercel env add NEXT_PUBLIC_GEMINI_API_KEY
```

Then paste your API key when prompted.

### Step 3: Redeploy

After adding the environment variable:

```bash
vercel --prod
```

Or trigger a redeploy from the Vercel dashboard.

## How It Works

The application now supports **two ways** to provide the API key:

### 1. Environment Variable (Vercel)
- Set `NEXT_PUBLIC_GEMINI_API_KEY` in Vercel
- The app automatically detects and uses it
- Users see "✓ Environment variable detected" message
- No need for users to enter their own key

### 2. localStorage (User-Provided)
- Users can still enter their own API key
- Stored in browser localStorage
- Takes priority over environment variable
- Useful for personal API keys or testing

## Priority Order

```
User's localStorage key > Environment variable > No key
```

## Security Considerations

⚠️ **Important**: `NEXT_PUBLIC_` environment variables are **exposed to the browser**. This means:

- Anyone can view your API key in the browser's developer tools
- Your API key will be visible in the client-side JavaScript bundle
- This is acceptable for:
  - Personal projects
  - Demo applications
  - Development/testing
  - When API usage is rate-limited

### For Production Applications

If you're building a production app with sensitive data or high traffic, consider:

1. **Create a Next.js API Route** to proxy Gemini API calls:

```typescript
// app/api/gemini/generate/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  // API key stays server-side (no NEXT_PUBLIC_ prefix)
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const client = new GoogleGenAI({ apiKey });
    
    const response = await client.models.generateContent({
      model: body.model,
      contents: body.contents,
      config: body.config,
    });

    return NextResponse.json({ text: response.text });
  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
}
```

2. **Update your service to call the API route** instead of Gemini directly:

```typescript
// Instead of calling Gemini directly:
const response = await ai.models.generateContent({...});

// Call your API route:
const response = await fetch('/api/gemini/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ model, contents, config }),
});
const data = await response.json();
```

3. **Implement rate limiting** using Vercel Edge Config or a service like Upstash

## Troubleshooting

### API Key Not Working

1. **Check environment variable name**: Must be exactly `NEXT_PUBLIC_GEMINI_API_KEY`
2. **Redeploy after adding**: Environment variables require a redeploy
3. **Clear browser cache**: Try in incognito mode
4. **Check API key validity**: Test at [Google AI Studio](https://aistudio.google.com/app/apikey)

### "No API key found" Error

1. Verify the environment variable is set in Vercel
2. Check that you've redeployed after adding it
3. Try entering the key manually in the UI to test

### Hydration Errors

The app uses a `mounted` state to prevent hydration mismatches between server and client. If you see hydration errors:

1. Clear your browser cache
2. Check browser console for specific errors
3. Ensure you're using the latest build

## Local Development with Environment Variables

Create a `.env.local` file in the `frontend` directory:

```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

**Important**: Never commit `.env.local` to version control!

## Monitoring API Usage

Monitor your Gemini API usage at:
- [Google AI Studio](https://aistudio.google.com/app/apikey)
- Check your API quotas and billing

## Getting Help

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)


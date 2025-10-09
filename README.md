# AI Marketing Tools

This is a [Next.js](https://nextjs.org) application that combines two powerful AI-powered tools:
- **AI Marketing Agent**: Generate marketing strategies, content ideas, and performance analysis
- **Content Generation Studio**: Create educational content with AI assistance

## Prerequisites

- Node.js 18+ installed
- A Gemini API key (get one at [Google AI Studio](https://aistudio.google.com/app/apikey))

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Get Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key (you'll need it in the next step)

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### 4. Enter Your API Key

When you first open the application:
1. You'll see an "API Key" input field at the top
2. Paste your Gemini API key
3. Click "Save Key"

**Note**: Your API key is stored securely in your browser's localStorage and is never sent to any server except Google's Gemini API.

## Features

### AI Marketing Agent
- Generate comprehensive marketing strategies
- Create platform-specific content ideas
- Analyze campaign performance with AI-powered insights
- Get actionable recommendations

### Content Generation Studio
- Create educational content (courses, tutorials, guides)
- Customize for different target audiences
- Choose from various format preferences
- Download generated content as Markdown

## Project Structure

```
frontend/
├── app/                          # Next.js app directory
│   ├── page.tsx                 # Main page with tab navigation
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── ai-marketing-agent/          # Marketing agent application
│   ├── components/              # React components
│   ├── services/                # API services
│   └── types.ts                 # TypeScript types
├── content-generation-studio/   # Content studio application
│   ├── components/              # React components
│   ├── services/                # API services
│   └── types.ts                 # TypeScript types
└── components/                  # Shared UI components
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

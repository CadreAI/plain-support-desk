# Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- A Plain.com account ([sign up here](https://app.plain.com/register))
- A Slack workspace with admin access

## Step-by-Step Setup (5 minutes)

### Step 1: Get Your Plain API Key

1. Go to [Plain.com](https://www.plain.com/) and sign up/login
2. Navigate to **Settings → API Keys**
3. Click **"Create API Key"**
4. Name it "Support App Test"
5. **Copy the API key** (you'll need this in Step 3)

### Step 2: Connect Plain to Slack

1. In Plain, go to **Settings → Slack**
2. Click **"Connect to Slack"**
3. Select your Slack workspace and authorize
4. Go to your Slack workspace
5. In a support channel (e.g., `#support`), type: `/invite @Plain`
6. The Plain bot will join the channel

### Step 3: Configure the App

1. Open your terminal and navigate to the app:
   ```bash
   cd support-app
   ```

2. Copy the environment variables template:
   ```bash
   cp .env.local.example .env.local
   ```

3. Open `.env.local` in your editor and paste your API key:
   ```env
   PLAIN_API_KEY=plainApiKey_xxx_your_actual_key_here
   ```

### Step 4: Run the App

1. Install dependencies (if you haven't):
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to [http://localhost:3000](http://localhost:3000)

### Step 5: Test the Integration

1. **In the web app:**
   - Fill out the support form
   - Enter your email
   - Type a test message like "Testing the Plain integration!"
   - Click "Submit Support Request"

2. **In Slack:**
   - Go to your support channel
   - You should see your message appear from the Plain bot
   - Reply to the message in the thread

3. **Back in the web app:**
   - Watch the conversation view
   - Your Slack reply should appear within 5 seconds (the app polls every 5 seconds)

## Troubleshooting

### "PLAIN_API_KEY is not set" Error
- Make sure you created the `.env.local` file
- Check that the API key is correctly pasted (starts with `plainApiKey_`)
- Restart the dev server after adding the env variable

### Message not appearing in Slack
- Verify the Plain bot is in your channel (type `/invite @Plain`)
- Check Plain Settings → Slack to ensure integration is active
- Look at Plain's dashboard for any error logs

### Reply not showing in web app
- Check the browser console for errors
- Verify the thread ID is correct
- Make sure you replied in the Slack **thread**, not as a new message

## Next Steps

### For Production Deployment:

1. **Deploy to Vercel:**
   ```bash
   vercel
   ```
   - Add `PLAIN_API_KEY` in Vercel dashboard Environment Variables

2. **Set up webhooks:**
   - In Plain: Settings → Webhooks
   - Add URL: `https://your-app.vercel.app/api/webhooks/plain`
   - Select events: `thread.reply_sent`, `thread.status_changed`
   - Add the webhook secret to Vercel env vars

3. **Optional enhancements:**
   - Replace polling with WebSockets for real-time updates
   - Add user authentication
   - Implement file upload support
   - Add email notifications

## Architecture Summary

```
┌─────────────┐
│  User Form  │
└──────┬──────┘
       │ Submit
       ↓
┌─────────────────┐
│  Next.js API    │
│ (create thread) │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Plain.com     │←────── Fetches via API
│    (Thread)     │         (polling)
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Slack Channel  │
│  (Support Team) │
└────────┬────────┘
         │ Reply
         ↓
┌─────────────────┐
│  Web UI Shows   │
│     Reply       │
└─────────────────┘
```

## Support

- [Plain Documentation](https://www.plain.com/docs)
- [Plain Community](https://plain.com/community)
- [Next.js Documentation](https://nextjs.org/docs)


# Plain.com Support Help Desk - Test App

This is a Next.js application that demonstrates bidirectional support messaging using **Plain.com** with **Slack integration**. Users submit support requests through a web form, which are routed to Slack. Support agents reply in Slack, and responses sync back to the web app.

## Features

- ✅ Beautiful, modern support form UI
- ✅ Create support threads via Plain API
- ✅ Messages route to Slack channels
- ✅ Support team can reply directly in Slack
- ✅ Replies sync back and display in the web app
- ✅ Real-time polling for new messages (5-second intervals)
- ✅ Webhook endpoint for Plain events
- ✅ TypeScript + Tailwind CSS

## Architecture Flow

```
User submits form
    ↓
Next.js API creates thread in Plain
    ↓
Plain routes message to Slack channel
    ↓
Support agent replies in Slack
    ↓
Plain tracks reply
    ↓
Web app polls API and displays reply
```

## Setup Instructions

### 1. Plain.com Setup

1. **Create a Plain account** at [plain.com](https://www.plain.com/)
2. **Get your API key:**
   - Go to Settings → API Keys
   - Create a new API key
   - Copy the key (you'll need it for `.env.local`)

3. **Connect Slack to Plain:**
   - In Plain, go to Settings → Slack
   - Click "Connect to Slack"
   - Authorize the Plain app for your Slack workspace
   - Invite the Plain bot to your support channel: `/invite @Plain`

4. **Configure message routing:**
   - In Plain Settings → Slack
   - Choose your message ingestion mode:
     - **AI Mode** (recommended): Automatically groups related messages
     - **One-to-One Mode**: Each Slack thread = one Plain thread

5. **Set up webhooks (optional):**
   - Go to Settings → Webhooks in Plain
   - Add webhook URL: `https://your-domain.vercel.app/api/webhooks/plain`
   - Select events you want to receive (e.g., `thread.reply_sent`)
   - Copy the webhook secret

### 2. Local Development Setup

1. **Clone and install dependencies:**
   ```bash
   cd support-app
   npm install
   ```

2. **Create `.env.local` file:**
   ```bash
   cp .env.local.example .env.local
   ```

3. **Add your Plain API key:**
   ```env
   PLAIN_API_KEY=your_actual_api_key_here
   PLAIN_WEBHOOK_SECRET=your_webhook_secret_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the app:**
   - Navigate to [http://localhost:3000](http://localhost:3000)

### 3. Testing the Integration

1. **Submit a support request:**
   - Fill out the form with your email and message
   - Click "Submit Support Request"

2. **Check Slack:**
   - You should see the message appear in your configured Slack channel
   - The message will be formatted as a Plain thread

3. **Reply in Slack:**
   - Reply to the message thread in Slack
   - Your reply will be tracked by Plain

4. **Check the web app:**
   - The conversation view polls every 5 seconds
   - Your Slack reply should appear in the web interface

### 4. Deploy to Vercel

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Add environment variables:
     - `PLAIN_API_KEY`
     - `PLAIN_WEBHOOK_SECRET` (optional)
   - Deploy!

3. **Update webhook URL in Plain:**
   - Once deployed, update your webhook URL in Plain settings
   - Use: `https://your-app.vercel.app/api/webhooks/plain`

## Project Structure

```
support-app/
├── app/
│   ├── api/
│   │   ├── support/
│   │   │   ├── create/route.ts      # Create support thread
│   │   │   └── messages/route.ts    # Fetch thread messages
│   │   └── webhooks/
│   │       └── plain/route.ts       # Receive Plain webhooks
│   ├── components/
│   │   ├── SupportForm.tsx          # Support submission form
│   │   └── ConversationView.tsx     # Message display component
│   └── page.tsx                     # Main page
├── lib/
│   └── plain.ts                     # Plain client configuration
└── .env.local                       # Environment variables (not in git)
```

## API Routes

### POST `/api/support/create`
Creates a new support thread in Plain.

**Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "message": "I need help with..."
}
```

**Response:**
```json
{
  "success": true,
  "threadId": "th_xxx",
  "message": "Support request submitted successfully"
}
```

### GET `/api/support/messages?threadId={id}`
Fetches all messages for a thread.

**Response:**
```json
{
  "success": true,
  "threadId": "th_xxx",
  "messages": [
    {
      "id": "msg_xxx",
      "timestamp": "2025-10-03T...",
      "actor": {...},
      "type": "Chat",
      "content": "Message text"
    }
  ]
}
```

### POST `/api/webhooks/plain`
Receives webhook events from Plain (thread replies, status changes, etc.)

## Customization Ideas

- **Real-time updates:** Replace polling with WebSocket or Server-Sent Events
- **User authentication:** Add auth to track conversations per user
- **File uploads:** Support attachments in messages
- **Rich text editor:** Add markdown or WYSIWYG editor
- **Notification system:** Email/push notifications for replies
- **Analytics:** Track response times and satisfaction

## Troubleshooting

### Messages not appearing in Slack
- Verify Plain is connected to your Slack workspace
- Check that the Plain bot is invited to your channel
- Review Plain's activity logs in the dashboard

### Replies not syncing back to app
- Check that your API key has proper permissions
- Verify the thread ID is correct
- Look for errors in the browser console or server logs

### Webhook not working
- Ensure webhook URL is publicly accessible (use ngrok for local testing)
- Verify webhook secret matches
- Check Plain webhook logs for delivery status

## Resources

- [Plain Documentation](https://www.plain.com/docs)
- [Plain API Reference](https://www.plain.com/docs/api-reference)
- [Plain TypeScript SDK](https://github.com/team-plain/typescript-sdk)
- [Slack Integration Guide](https://www.plain.com/docs/slack)

## License

MIT

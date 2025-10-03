import { NextRequest, NextResponse } from 'next/server';
import { eventEmitter } from '@/lib/event-emitter';

async function sendSlackNotification(message: string, threadUrl?: string) {
  if (!process.env.SLACK_WEBHOOK_URL) {
    console.warn('SLACK_WEBHOOK_URL not configured, skipping Slack notification');
    return;
  }

  try {
    const payload = {
      text: message,
      blocks: threadUrl ? [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: message,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View in Plain',
              },
              url: threadUrl,
              style: 'primary',
            },
          ],
        },
      ] : undefined,
    };

    const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Failed to send Slack notification:', response.statusText);
    } else {
      console.log('✅ Slack notification sent');
    }
  } catch (error) {
    console.error('Error sending Slack notification:', error);
  }
}

// This webhook endpoint receives events from Plain when agents reply in Slack
// Configure this in Plain: Settings > Webhooks
// URL: https://your-domain.vercel.app/api/webhooks/plain
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log the webhook event for debugging
    console.log('Received Plain webhook:', JSON.stringify(body, null, 2));

    // TODO: In production, verify the webhook signature
    // const signature = request.headers.get('x-plain-signature');
    // if (!verifySignature(signature, body, process.env.PLAIN_WEBHOOK_SECRET)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    const eventType = body.eventType || body.type;
    const payload = body.payload || body.data || body;

    // Extract thread ID from various possible locations
    const threadId = 
      payload.threadId || 
      payload.thread?.id || 
      body.threadId;

    console.log('Processing webhook:', { eventType, threadId });

    // Send Slack notification for new threads
    if (eventType === 'thread.thread_created') {
      const customer = payload.customer || payload.thread?.customer;
      const customerEmail = customer?.email || customer?.emailAddress || 'Unknown';
      
      // Extract workspace ID from payload or use environment variable
      const workspaceId = payload.workspaceId || payload.thread?.workspaceId || process.env.PLAIN_WORKSPACE_ID;
      const threadUrl = threadId && workspaceId 
        ? `https://app.plain.com/workspace/${workspaceId}/thread/${threadId}`
        : undefined;
      
      await sendSlackNotification(
        `🆕 *New Support Request*\nFrom: ${customerEmail}`,
        threadUrl
      );
    }

    // Emit real-time updates to connected SSE clients
    if (threadId) {
      eventEmitter.emit(`thread:${threadId}`, {
        type: 'webhook',
        eventType,
        payload,
        timestamp: new Date().toISOString(),
      });
      
      console.log(`✅ Emitted event to ${eventEmitter.listenerCount(`thread:${threadId}`)} listeners`);
    }

    // Handle specific event types
    if (eventType === 'thread.slack_message_sent') {
      console.log('📨 New reply received - instant notification sent!');
    }

    return NextResponse.json({ 
      success: true,
      message: 'Webhook processed and clients notified',
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}


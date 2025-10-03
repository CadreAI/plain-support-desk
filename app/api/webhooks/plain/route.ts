import { NextRequest, NextResponse } from 'next/server';
import { eventEmitter } from '@/lib/event-emitter';

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
    if (eventType === 'thread.reply_sent' || eventType === 'thread.message_sent') {
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


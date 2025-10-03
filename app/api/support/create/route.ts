import { NextRequest, NextResponse } from 'next/server';
import { plainClient } from '@/lib/plain';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, message } = body;

    if (!email || !message) {
      return NextResponse.json(
        { error: 'Email and message are required' },
        { status: 400 }
      );
    }

    // First, upsert the customer
    const customerResult = await plainClient.upsertCustomer({
      identifier: {
        emailAddress: email,
      },
      onCreate: {
        email: {
          email: email,
          isVerified: false,
        },
        fullName: name || email,
      },
      onUpdate: {},
    });

    if (customerResult.error) {
      console.error('Error upserting customer:', customerResult.error);
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      );
    }

    const customerId = customerResult.data?.customer.id;

    // Create a thread with the message
    const threadResult = await plainClient.createThread({
      customerIdentifier: {
        customerId,
      },
      title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
      components: [
        {
          componentText: {
            text: message,
          },
        },
      ],
    });

    if (threadResult.error) {
      console.error('Error creating thread:', threadResult.error);
      return NextResponse.json(
        { error: 'Failed to create support thread' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      threadId: threadResult.data?.id,
      message: 'Support request submitted successfully',
    });
  } catch (error) {
    console.error('Error in create support route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


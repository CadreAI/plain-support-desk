import { NextRequest, NextResponse } from 'next/server';
import { plainClient } from '@/lib/plain';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const threadId = searchParams.get('threadId');

    if (!threadId) {
      return NextResponse.json(
        { error: 'threadId is required' },
        { status: 400 }
      );
    }

    // Fetch the thread
    const result = await plainClient.getThread({
      threadId,
    });

    if (result.error) {
      console.error('Error fetching thread:', result.error);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    const thread = result.data;

    // Return the full thread data - the client will parse it
    return NextResponse.json({
      success: true,
      threadId,
      thread,
    });
  } catch (error) {
    console.error('Error in messages route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


'use client';

import { useState, useEffect, useRef } from 'react';

interface Actor {
  actorType?: string;
  __typename?: string;
}

interface Message {
  id: string;
  timestamp: string;
  actor: Actor;
  type: string;
  content: string;
}

interface ConversationViewProps {
  threadId: string;
  customerEmail: string;
  onReset: () => void;
}

export default function ConversationView({
  threadId,
  customerEmail,
  onReset,
}: ConversationViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `/api/support/messages?threadId=${threadId}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch messages');
      }

      // For now, show a placeholder message
      // In a real app, parse data.thread to extract actual messages
      setMessages([{
        id: '1',
        timestamp: new Date().toISOString(),
        actor: { actorType: 'customer' },
        type: 'initial',
        content: 'Your support request has been submitted. Waiting for a reply...'
      }]);
      setError('');
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  // Set up Server-Sent Events for instant updates
  useEffect(() => {
    fetchMessages();

    // Connect to SSE endpoint for real-time updates
    const eventSource = new EventSource(`/api/support/stream?threadId=${threadId}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('✅ Connected to real-time updates');
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 Received instant update:', data);

        if (data.type === 'webhook') {
          // Webhook received - fetch latest messages immediately
          console.log('🚀 Fetching latest messages instantly...');
          void fetchMessages();
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      setIsConnected(false);
      // Will automatically reconnect
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  const isFromSupport = (actor: Actor) => {
    return actor?.actorType === 'user' || actor?.__typename === 'UserActor';
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="bg-black border-b-2 border-yellow-500 text-white p-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-wide">Your Support Request</h2>
          <p className="text-gray-400 text-sm mt-1">{customerEmail}</p>
        </div>
        <button
          onClick={onReset}
          className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition uppercase tracking-wide"
        >
          New Request
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-zinc-950">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400 text-lg">Loading messages...</div>
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border-2 border-red-500 text-red-200 px-5 py-4 rounded-lg">
            {error}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-2xl font-bold text-white mb-3">✓ Request Submitted!</p>
              <p className="text-gray-400 text-lg">
                Waiting for a reply from the support team...
              </p>
              <p className="text-gray-600 text-sm mt-3">
                You&apos;ll be notified instantly when we respond
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const fromSupport = isFromSupport(message.actor);
              return (
                <div
                  key={message.id}
                  className={`flex ${fromSupport ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-xl px-5 py-4 ${
                      fromSupport
                        ? 'bg-zinc-800 border-2 border-zinc-700 text-gray-200'
                        : 'bg-yellow-500 text-black'
                    }`}
                  >
                    <div className="text-xs font-bold mb-2 uppercase tracking-wider opacity-70">
                      {fromSupport ? 'Support Team' : 'You'}
                    </div>
                    <div className="text-base whitespace-pre-wrap">
                      {message.content}
                    </div>
                    <div
                      className={`text-xs mt-2 opacity-60`}
                    >
                      {new Date(message.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-black border-t-2 border-zinc-800 p-5">
        <div className="text-sm font-bold text-gray-300 flex items-center justify-center uppercase tracking-wider">
          <span className={`inline-block w-2.5 h-2.5 rounded-full mr-3 ${
            isConnected ? 'bg-yellow-500 animate-pulse' : 'bg-gray-600'
          }`}></span>
          {isConnected 
            ? '⚡ Live Connection Active - Instant Replies' 
            : 'Connecting to real-time updates...'}
        </div>
      </div>
    </div>
  );
}


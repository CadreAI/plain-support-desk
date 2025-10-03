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
      <div className="bg-indigo-600 text-white p-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Your Support Request</h2>
          <p className="text-indigo-100 text-sm">{customerEmail}</p>
        </div>
        <button
          onClick={onReset}
          className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition"
        >
          New Request
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading messages...</div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500 text-center">
              <p className="text-lg font-medium mb-2">Request submitted!</p>
              <p className="text-sm">
                Waiting for a reply from the support team...
              </p>
              <p className="text-xs text-gray-400 mt-2">
                (Polling for updates every 5 seconds)
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
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      fromSupport
                        ? 'bg-white border border-gray-200 text-gray-800'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">
                      {fromSupport ? 'Support Team' : 'You'}
                    </div>
                    <div className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </div>
                    <div
                      className={`text-xs mt-2 ${
                        fromSupport ? 'text-gray-400' : 'text-indigo-200'
                      }`}
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

      <div className="bg-white border-t border-gray-200 p-4">
        <div className="text-sm text-gray-600 flex items-center justify-center">
          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
            isConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
          }`}></span>
          {isConnected 
            ? '⚡ Live connection active - replies appear instantly!' 
            : 'Connecting to real-time updates...'}
        </div>
      </div>
    </div>
  );
}


'use client';

import { useState } from 'react';
import SupportForm from './components/SupportForm';
import ConversationView from './components/ConversationView';

export default function Home() {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string>('');

  const handleThreadCreated = (id: string, email: string) => {
    setThreadId(id);
    setCustomerEmail(email);
  };

  const handleReset = () => {
    setThreadId(null);
    setCustomerEmail('');
  };

  return (
    <main className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Support Help Desk
          </h1>
          <p className="text-gray-400 text-lg">
            Instant Response System • Powered by Plain + Slack ⚡
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
          {!threadId ? (
            <SupportForm onThreadCreated={handleThreadCreated} />
          ) : (
            <ConversationView
              threadId={threadId}
              customerEmail={customerEmail}
              onReset={handleReset}
            />
          )}
        </div>

        <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-wide">
            How It Works
          </h2>
          <ol className="space-y-4">
            <li className="flex items-start">
              <span className="font-bold text-yellow-500 text-xl mr-4 min-w-[2rem]">1.</span>
              <span className="text-gray-300 text-lg">Submit your support request using the form above</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-yellow-500 text-xl mr-4 min-w-[2rem]">2.</span>
              <span className="text-gray-300 text-lg">Message instantly routes to our Slack support channel</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-yellow-500 text-xl mr-4 min-w-[2rem]">3.</span>
              <span className="text-gray-300 text-lg">Our team replies directly in Slack</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-yellow-500 text-xl mr-4 min-w-[2rem]">4.</span>
              <span className="text-gray-300 text-lg">Replies appear here <span className="text-yellow-500 font-semibold">INSTANTLY</span> via webhooks</span>
            </li>
          </ol>
        </div>
      </div>
    </main>
  );
}

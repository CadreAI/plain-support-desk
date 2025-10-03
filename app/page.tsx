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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Support Help Desk
          </h1>
          <p className="text-gray-600">
            Powered by Plain.com • Messages route to Slack • Instant webhook updates ⚡
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
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

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            How it works:
          </h2>
          <ol className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="font-bold text-indigo-600 mr-2">1.</span>
              <span>Submit a support request using the form above</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-indigo-600 mr-2">2.</span>
              <span>Your message is sent to Plain and routed to Slack</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-indigo-600 mr-2">3.</span>
              <span>Your support team can reply directly in Slack</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-indigo-600 mr-2">4.</span>
              <span>Replies appear here INSTANTLY via webhooks (no polling!)</span>
            </li>
          </ol>
        </div>
      </div>
    </main>
  );
}

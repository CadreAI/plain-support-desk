'use client';

import { useState } from 'react';

interface SupportFormProps {
  onThreadCreated: (threadId: string, email: string) => void;
}

export default function SupportForm({ onThreadCreated }: SupportFormProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/support/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit support request');
      }

      onThreadCreated(data.threadId, email);
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-10">
      <h2 className="text-3xl font-bold text-white mb-8 uppercase tracking-wide">
        How Can We Help You?
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-5 py-4 bg-black border-2 border-zinc-700 text-white text-lg rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition placeholder-gray-600"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">
            Name (optional)
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-5 py-4 bg-black border-2 border-zinc-700 text-white text-lg rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition placeholder-gray-600"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">
            Message *
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={6}
            className="w-full px-5 py-4 bg-black border-2 border-zinc-700 text-white text-lg rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition resize-none placeholder-gray-600"
            placeholder="Describe your issue or question..."
          />
        </div>

        {error && (
          <div className="bg-red-900/30 border-2 border-red-500 text-red-200 px-5 py-4 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-700 disabled:text-gray-400 text-black font-bold py-5 px-6 rounded-lg transition duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-lg uppercase tracking-wide"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Support Request'}
        </button>
      </form>
    </div>
  );
}


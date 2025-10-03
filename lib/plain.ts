import { PlainClient } from '@team-plain/typescript-sdk';

function createPlainClient(): PlainClient {
  if (!process.env.PLAIN_API_KEY) {
    throw new Error('PLAIN_API_KEY is not set in environment variables');
  }

  return new PlainClient({
    apiKey: process.env.PLAIN_API_KEY,
  });
}

// Singleton instance
let _plainClient: PlainClient | null = null;

export function getPlainClient(): PlainClient {
  if (!_plainClient) {
    _plainClient = createPlainClient();
  }
  return _plainClient;
}

// For convenience in API routes
export const plainClient = {
  get upsertCustomer() {
    return getPlainClient().upsertCustomer.bind(getPlainClient());
  },
  get createThread() {
    return getPlainClient().createThread.bind(getPlainClient());
  },
  get getThread() {
    return getPlainClient().getThread.bind(getPlainClient());
  },
};


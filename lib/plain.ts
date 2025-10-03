import { PlainClient } from '@team-plain/typescript-sdk';

let _plainClient: PlainClient | null = null;

export function getPlainClient(): PlainClient {
  if (!process.env.PLAIN_API_KEY) {
    throw new Error('PLAIN_API_KEY is not set in environment variables');
  }

  if (!_plainClient) {
    _plainClient = new PlainClient({
      apiKey: process.env.PLAIN_API_KEY,
    });
  }

  return _plainClient;
}

// For backward compatibility
export const plainClient = new Proxy({} as PlainClient, {
  get(_target, prop) {
    return getPlainClient()[prop as keyof PlainClient];
  },
});


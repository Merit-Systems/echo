import { EchoClient } from '@merit-systems/echo-typescript-sdk';
import { auth } from '@/auth';

export async function getEchoClient(): Promise<EchoClient> {
  const session = await auth();
  if (!session?.accessToken) {
    throw new Error('No access token found');
  }
  return new EchoClient({ 
    apiKey: session.accessToken 
  });
}

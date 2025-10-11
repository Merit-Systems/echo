'use client';
import { useEffect, useRef, RefObject } from 'react';
import { useChat, type UseChatHelpers, type UseChatOptions, type UIMessage } from '@ai-sdk/react';
import { ChatInit } from 'ai';
import { PaymentRequirementsSchema, type Signer } from 'x402/types';
import { createPaymentHeader } from 'x402/client';
import { handleX402Error } from './utils';

type UseChatWithPaymentParams<UI_MESSAGE extends UIMessage> = ChatInit<UI_MESSAGE> & UseChatOptions<UI_MESSAGE> & {
  walletClient: Signer;
  regenerateOptions?: any;
};

async function handlePaymentError(
    err: Error,  
    regenerate: UseChatHelpers<UIMessage>["regenerate"], regenerateOptions: any, 
    walletClientRef: RefObject<Signer | null>) {

  const paymentDetails = handleX402Error(err);
  if (!paymentDetails) {
    return;
  }
  const currentWalletClient = walletClientRef.current;

  const paymentRequirement = PaymentRequirementsSchema.parse(paymentDetails.accepts[0]);
  const paymentHeader = await createPaymentHeader(
    currentWalletClient as unknown as Signer,
    paymentDetails.x402Version,
    paymentRequirement
  );
  if (regenerate) {
    await regenerate({
      headers: { 'x-payment': paymentHeader },
      ...regenerateOptions,
    });
  }

}

export function useChatWithPayment<UI_MESSAGE extends UIMessage = UIMessage>(
  { walletClient, regenerateOptions, ...options }: UseChatWithPaymentParams<UI_MESSAGE>
): UseChatHelpers<UI_MESSAGE> {
  const walletClientRef = useRef<Signer | null>(walletClient);

  useEffect(() => {
    walletClientRef.current = walletClient;
  }, [walletClient]);

  const { regenerate, ...chat } = useChat({
    ...(options),
    onError: async (err: Error) => {
      if (options.onError) options.onError(err);      
      handlePaymentError(err, regenerate, regenerateOptions, walletClientRef);
    },
  });

  return {
    ...chat,
    regenerate
  };
}

export default useChatWithPayment;


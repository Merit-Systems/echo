import { octetInputParser } from '@trpc/server/http';

import { createTRPCRouter, protectedProcedure } from '../trpc';
import { put } from '@vercel/blob';

export const uploadRouter = createTRPCRouter({
  image: protectedProcedure
    .input(octetInputParser)
    .mutation(async ({ ctx, input }) => {
      const fileName = `${ctx.session.user.id}-${Date.now()}`;

      // Convert ReadableStream to Uint8Array
      const chunks: Uint8Array[] = [];
      const reader = input.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
      } finally {
        reader.releaseLock();
      }

      // Combine chunks into a single Uint8Array
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const combined = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }

      const file = new File([combined], fileName, { type: 'image/jpeg' });

      const blob = await put(fileName, file, {
        access: 'public',
      });

      return {
        url: blob.url,
      };
    }),
});

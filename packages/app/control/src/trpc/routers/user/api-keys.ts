import {
  countApiKeys,
  createApiKey,
  createApiKeySchema,
  deleteApiKey,
  deleteApiKeySchema,
  getApiKey,
  getApiKeySchema,
  listApiKeys,
  listApiKeysSchema,
  updateApiKey,
  updateApiKeySchema,
} from '@/services/api-keys';
import {
  createTRPCRouter,
  paginatedProcedure,
  protectedProcedure,
} from '../../trpc';

export const userApiKeysRouter = createTRPCRouter({
  count: protectedProcedure
    .input(listApiKeysSchema)
    .query(async ({ ctx, input }) => {
      return countApiKeys(ctx.session.user.id, input);
    }),

  list: paginatedProcedure
    .concat(protectedProcedure)
    .input(listApiKeysSchema)
    .query(async ({ ctx: { session, pagination }, input }) => {
      return listApiKeys(session.user.id, input, pagination);
    }),

  get: protectedProcedure
    .input(getApiKeySchema)
    .query(async ({ ctx, input }) => {
      return getApiKey(ctx.session.user.id, input);
    }),

  create: protectedProcedure
    .input(createApiKeySchema)
    .mutation(async ({ ctx, input }) => {
      return createApiKey(ctx.session.user.id, input);
    }),

  update: protectedProcedure
    .input(updateApiKeySchema)
    .mutation(async ({ ctx, input }) => {
      return updateApiKey(ctx.session.user.id, input);
    }),

  delete: protectedProcedure
    .input(deleteApiKeySchema)
    .mutation(async ({ ctx, input }) => {
      return deleteApiKey(ctx.session.user.id, input);
    }),
});

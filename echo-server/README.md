# Echo Server

## Prerequisites

This server depends on the generated Prisma client from the `echo-control` project. Before running the server, you need to ensure the Prisma client is copied locally.

## Development

### First Time Setup

1. Make sure the `echo-control` project has generated its Prisma client:

   ```bash
   cd ../echo-control
   pnpm run build  # or whatever command generates the Prisma client
   ```

2. Copy the generated Prisma client:
   ```bash
   pnpm run copy-prisma
   ```

### Running the Server

```bash
# Development mode (automatically copies Prisma client)
pnpm run dev

# Production mode
pnpm run build
pnpm start
```

The `dev` and `start` scripts automatically run `copy-prisma` as a pre-hook, so you don't need to run it manually.

## Docker Considerations

When building a Docker image, you'll need to ensure both projects are available in the build context:

### Option 1: Multi-stage build with both projects

```dockerfile
FROM node:18-alpine AS base

# Copy both projects
COPY echo-control/ /app/echo-control/
COPY echo-server/ /app/echo-server/

# Build echo-control first
WORKDIR /app/echo-control
RUN pnpm install && pnpm run build

# Build echo-server
WORKDIR /app/echo-server
RUN pnpm install && pnpm run build

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=base /app/echo-server/dist ./dist
COPY --from=base /app/echo-server/node_modules ./node_modules
COPY --from=base /app/echo-server/package.json ./package.json

CMD ["pnpm", "start"]
```

### Option 2: Build artifacts approach

1. Build the echo-control project and export the generated files
2. Copy the generated files into the echo-server build context
3. Build the echo-server

## Scripts

- `copy-prisma`: Copies the generated Prisma client from echo-control
- `dev`: Runs the development server (with auto-copy)
- `build`: Builds the TypeScript code (with auto-copy)
- `start`: Starts the production server (with auto-copy)
- `seed-usage-products`: Seeds UsageProducts from model_prices.json into the database

### Usage Products Seeding

The `seed-usage-products` script creates UsageProduct records from the model_prices.json file, which contains pricing and metadata for various LLM models.

```bash
# Seed all apps with usage products
pnpm run seed-usage-products

# Seed specific app with verbose output
pnpm run seed-usage-products abc-123-app-id --verbose

# Overwrite existing usage products
pnpm run seed-usage-products --overwrite

# Show help
pnpm run seed-usage-products --help
```

This script maps model data from model_prices.json to the UsageProduct table with:

- Model pricing (input/output cost per token)
- Provider information (OpenAI, Anthropic, Google)
- Model metadata and descriptions
- Category set to "llm" for all products

## Error Handling

If the generated Prisma client is not found, the server will throw a descriptive error message asking you to run `pnpm run copy-prisma`.

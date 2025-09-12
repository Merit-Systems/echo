# Echo Server

## Prerequisites

This server depends on the generated Prisma client from the `echo-control` project. Before running the server, you need to ensure the Prisma client is copied locally.

## Development

### First Time Setup

1. Make sure the `echo-control` project has generated its Prisma client:

   ```bash
   cd ../control
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
COPY packages/app/control/ /app/packages/app/control/
COPY packages/app/server/ /app/packages/app/server/

# Build echo-control first
WORKDIR /app/echo-control
RUN pnpm install && pnpm run build

# Build echo-server
WORKDIR /app/echo-server
RUN pnpm install && pnpm run build

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=base /app/packages/app/server/dist ./dist
COPY --from=base /app/packages/app/server/node_modules ./node_modules
COPY --from=base /app/packages/app/server/package.json ./package.json

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

## Error Handling

If the generated Prisma client is not found, the server will throw a descriptive error message asking you to run `pnpm run copy-prisma`.

# Echo Server

## Prerequisites

- Node.js 18+
- pnpm
- For full local stack: Docker + Docker Compose plugin (`docker compose`)

## Development

### Recommended (from repo root)

```bash
pnpm install
pnpm dev
```

The root `pnpm dev` command starts both `echo-control` and `echo-server`.

### Running the Server

```bash
# In this package only:
pnpm run dev

# Build + start
pnpm run build
pnpm start
```

The server scripts automatically copy Prisma schema/client artifacts from `echo-control` before build/start.
If `DATABASE_URL` is not set, the server uses a local default:
`postgresql://echo_user:echo_password@localhost:5469/echo_control_v2?schema=public`.

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

If the generated Prisma client artifacts are missing, run `pnpm run copy-prisma` and retry.

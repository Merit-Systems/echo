# Echo Next.js Image Generation Template

AI-powered image generation application built with Next.js and Echo, featuring automatic billing and user management.

## Quick Start

Use the Echo CLI to create a new project with this template:

```bash
npx echo-start@latest --template next-image
```

You'll be prompted for your Echo App ID. Don't have one? Get it at [echo.merit.systems/new](https://echo.merit.systems/new).

## Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- A [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) store for image hosting (required to avoid HTTP 413 payload errors)

## Environment Variables

Copy `.env.local` and fill in your values:

| Variable | Description |
|---|---|
| `ECHO_APP_ID` | Your Echo App ID from [echo.merit.systems/new](https://echo.merit.systems/new) |
| `NEXT_PUBLIC_ECHO_APP_ID` | Same value as `ECHO_APP_ID` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token from your Vercel dashboard → Storage → Blob |

> **Why Vercel Blob?** AI image models return large base64-encoded images. Passing these between client and server exceeds Vercel's function payload limit (HTTP 413). Images are now stored in Vercel Blob and URLs are returned instead.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

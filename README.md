# Echo
<div align="center">
  <a href="https://echo.merit.systems/docs/getting-started/react"><strong>Quick Start</strong></a> | <a href="https://echo.merit.systems/docs"><strong>Docs</strong></a> | <a href="https://echo.merit.systems/new"><strong>Create App</strong></a>
</div>

![Echo Header](./imgs/header_gif.gif)


<a href="https://discord.gg/JuKt7tPnNc"><img alt="Discord" src="https://img.shields.io/discord/1382120201713352836?color=7289da&logo=discord&logoColor=white"></a> [![Twitter Follow](https://img.shields.io/twitter/follow/merit_systems?style=social)](https://x.com/merit_systems) [![GitHub Repo stars](https://img.shields.io/github/stars/Merit-Systems/echo?style=social)](https://github.com/Merit-Systems/echo) [![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

From Vercel AI SDK to Revenue in 5 Lines

Replace your OpenAI import with Echo. Get instant OAuth, user accounts, and usage billing.

[Read the docs](https://echo.merit.systems/docs) to get started or [read our announcement](https://www.merit.systems/blog/echo) to learn more.

Consider giving a star on GitHub!

## Why Echo?

**Skip the complexity** - No API keys to manage, no auth flows to build, no payment processing to set up. Go live in minutes.

**OAuth magic** - Users sign in once, get a universal balance that works across all Echo apps.

**Universal balance** - Your users' credits work across every Echo-powered app they use.

**Simplified payouts** - Revenue hits your GitHub account directly. No Stripe dashboard, no merchant accounts. [Learn more](https://www.merit.systems/docs).

## Core

- [Echo Control](./echo-control): Next.js app for [echo.merit.systems](https://echo.merit.systems). Hosted site and api routes.
- [Echo Server](./echo-server): Express server for router.echo.merit.systems. Proxy for routing and metering LLM requests from clients.

## SDKs

- [Echo TS SDK](./echo-typescript-sdk) Typescript SDK that all the framework specific SDKs are built on top of.
- [Echo Next.js SDK](./echo-next-sdk) SDK for simple Next.js 15+ App Router integration.
- [Echo React SDK](./echo-react-sdk) SDK for simple React client side SPA integration.

## Examples

- [Echo Next.js Example](./examples/next-sdk-example)
- [Echo React SDK](./examples/vite)

# Development

Fill out `echo-control/.env` and `echo-server/.env`. Then...

- `pnpm i`
- `pnpm dev`

![Echo Header](./imgs/header_gif.gif)

<div align="center">
  
# Echo

</div>

  <div align="center">
    
  [![Discord](https://img.shields.io/discord/1382120201713352836?style=flat&logo=discord&logoColor=white&label=Discord)](https://discord.gg/JuKt7tPnNc) 
  ![X (formerly Twitter) Follow](https://img.shields.io/twitter/follow/merit_systems) 
  [![GitHub Repo stars](https://img.shields.io/github/stars/Merit-Systems/echo?style=social)](https://github.com/Merit-Systems/echo) 
  [![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

  </div>

From Vercel AI SDK to Revenue in 5 Lines

Replace your OpenAI import with Echo. Get instant OAuth, user accounts, and usage billing.

Consider giving a star on GitHub!

<div align="center">
  <div style="border-radius: 16px; padding: 32px; margin: 24px 0; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
    <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2);">
      <code style="font-size: 18px; font-weight: 500;">
        npm create echo-start@latest
      </code>
    </div>
  </div>
</div>

## Why Echo?

**Skip the complexity** - No API keys to manage, no auth flows to build, no payment processing to set up. Go live in minutes.

**OAuth magic** - Users sign in once, get a universal balance that works across all Echo apps.

**Universal balance** - Your users' credits work across every Echo-powered app they use.

**Simplified payouts** - Revenue hits your GitHub account directly. No Stripe dashboard, no merchant accounts. [Learn more](https://www.merit.systems/docs).

## Core

- [Echo Control](./packages/app/control): Next.js app for [echo.merit.systems](https://echo.merit.systems). Hosted site and api routes.
- [Echo Server](./packages/app/server): Express server for router.echo.merit.systems. Proxy for routing and metering LLM requests from clients.

## SDKs

- [Echo TS SDK](./packages/sdk/ts) Typescript SDK that all the framework specific SDKs are built on top of.
- [Echo Next.js SDK](./packages/sdk/next) SDK for simple Next.js 15+ App Router integration.
- [Echo React SDK](./packages/sdk/react) SDK for simple React client side SPA integration.

## Examples

- [Echo Next.js Example](./packages/sdk/examples/next)
- [Echo React SDK](./packages/sdk/examples/vite)

## 🚀 Quick Start



### 📦 Available Templates

<table>
  <tr>
    <td><strong>🏗️ <a href="./templates/next">next</a></strong></td>
    <td>Next.js application with Echo integration</td>
  </tr>
  <tr>
    <td><strong>⚛️ <a href="./templates/react">react</a></strong></td>
    <td>Vite React application with Echo</td>
  </tr>
  <tr>
    <td><strong>💬 <a href="./templates/next-chat">next-chat</a></strong></td>
    <td>Next.js with Echo and Vercel AI SDK</td>
  </tr>
  <tr>
    <td><strong>🤖 <a href="./templates/assistant-ui">assistant-ui</a></strong></td>
    <td>Next.js with Echo and Assistant UI</td>
  </tr>
</table>

<div align="center">
  <em>💡 Run <code>npm create echo-start@latest my-app</code> to choose interactively</em>
</div>

# Development

Fill out `packages/app/control/.env` and `packages/app/server/.env`. Then...

- `pnpm i`
- `pnpm dev`

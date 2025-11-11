# Echodex

A command-line interface for AI chat powered by [Echo](https://echo.merit.systems) with support for API keys, WalletConnect, and self-custodied local wallets.

## Features

- **Triple Authentication Options**: 
  - Echo API keys for managed accounts
  - WalletConnect for mobile wallet integration
  - Local Wallet for full self-custody (NEW!)
- **Multi-Model Support**: GPT-4o, GPT-5, GPT-5 Mini, GPT-5 Nano
- **X402 Protocol**: Pay-per-use with crypto wallets via the X402 payment protocol
- **Conversation Management**: Resume previous conversations and export chat history
- **Secure Storage**: OS keychain integration for credential and private key storage
- **Real-time Balance Tracking**: Check USDC balance and usage in real-time
- **Multi-Chain Support**: Base, Ethereum, Optimism, Polygon, Arbitrum

## Prerequisites

- Node.js 18.0.0 or higher
- pnpm 10.0.0 or higher
- An Echo account (sign up at [echo.merit.systems](https://echo.merit.systems))

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Merit-Systems/echo.git
cd echo/templates/echo-cli
pnpm install
pnpm build
```

### Global Installation (Optional)

To use `echodex` globally:

```bash
pnpm link --global
```

Or use it directly:

```bash
pnpm start
```

## Quick Start

1. **Authenticate**

   ```bash
   echodex login
   ```

   Choose your authentication method:
   - **Echo API Key**: Browser-based API key creation
   - **WalletConnect**: Mobile wallet via QR code
   - **Local Wallet**: Generate and self-custody your own wallet (NEW!)

2. **Start chatting**

   ```bash
   echodex
   ```

3. **Select a model** (optional)

   ```bash
   echodex model
   ```

## Commands

### Authentication

```bash
echodex login          # Authenticate with Echo (API key or wallet)
echodex logout         # Sign out and clear credentials
```

### Chat

```bash
echodex                # Start a new chat session
echodex resume         # Resume your last conversation
```

### Model Management

```bash
echodex model          # Select a different AI model
```

### History

```bash
echodex history        # View your conversation history
echodex export         # Export conversations as JSON
echodex clear-history  # Clear all conversation history
```

### Profile

```bash
echodex profile        # View your profile and balance
```

### Local Wallet Management (Self-Custody)

```bash
echodex wallet-balance     # Show USDC balance
echodex wallet-address     # Display wallet address and QR code
echodex fund-wallet        # Show QR code and wait for USDC deposit
echodex export-private-key # Export private key for backup (⚠️ SENSITIVE)
```

## Authentication Methods

### Echo API Key

Managed account with web-based API key creation:

1. Run `echodex login` and select "Echo API Key"
2. Your browser opens to echo.merit.systems
3. Sign in and create an API key
4. The key is securely stored in your OS keychain
5. Pay for AI usage via Echo's account system

### WalletConnect

Connect your mobile wallet via WalletConnect:

1. Run `echodex login` and select "WalletConnect"
2. Scan the QR code with your mobile wallet (MetaMask, Rainbow, etc.)
3. Approve the connection
4. Fund your wallet with USDC on supported chains
5. Pay for AI usage directly from your wallet via X402

### Local Wallet (Self-Custody) - NEW!

Generate and manage your own wallet locally:

1. Run `echodex login` and select "Local Wallet (Self Custody)"
2. Select your preferred blockchain (Ethereum, Base, Optimism, Polygon, Arbitrum)
3. Your private key is generated and stored securely in your OS keychain
4. A QR code is displayed to fund your wallet with USDC
5. Scan with any wallet and send USDC to your generated address
6. The CLI waits for confirmation or press Ctrl+C to continue later
7. Use `echodex wallet-balance` to check your balance anytime
8. Use `echodex fund-wallet` to fund later if needed

**Security Features**:
- ✅ Private keys stored in OS keychain (macOS Keychain, Windows Credential Vault, Linux Secret Service)
- ✅ You have full custody of your keys
- ✅ Backup your key with `echodex export-private-key`
- ✅ Keys are deleted from keychain on logout
- ✅ No central authority controls your funds

**Supported Networks**:
- Ethereum Mainnet (chainId 1)
- Base (chainId 8453)
- Optimism (chainId 10)
- Polygon (chainId 137)
- Arbitrum (chainId 42161)

## Configuration

### Required Setup

Before running the CLI, update the configuration in `src/constants.ts`:

1. **Echo App ID**: 
   - Visit [echo.merit.systems](https://echo.merit.systems)
   - Create or retrieve your Echo App ID
   - Replace `YOUR_ECHO_APP_ID` in `src/constants.ts`

2. **WalletConnect Project ID**:
   - Visit [walletconnect.com](https://walletconnect.com)
   - Create a new project and get your Project ID
   - Replace `YOUR_WALLETCONNECT_PROJECT_ID` in `src/constants.ts`

After updating these values, rebuild the project:

```bash
pnpm build
```

### Runtime Configuration

Configuration is stored in:
- **Credentials**: OS keychain (secure)
- **Settings**: `~/.config/echodex/` (platform-specific)

### Available Models

- GPT-4o
- GPT-5
- GPT-5 Mini
- GPT-5 Nano

Switch models anytime with `echodex model`.

## Tech Stack

- **TypeScript**: ESNext with strict mode
- **Echo SDK**: TypeScript SDK for Echo integration
- **Vercel AI SDK**: Streaming AI responses
- **WalletConnect**: Crypto wallet authentication
- **X402 Protocol**: Decentralized payment protocol
- **Keytar**: Secure credential storage
- **Conf**: Configuration management
- **Zod**: Runtime validation
- **Commander**: CLI framework
- **Clack Prompts**: Interactive CLI prompts

## Development

### Running in Development

```bash
pnpm dev
```

### Building

```bash
pnpm build
```

### Project Structure

```
src/
├── auth/           # Authentication logic (API key, WalletConnect, Local Wallet)
│   ├── login.ts    # Echo API key login
│   ├── wallet.ts   # WalletConnect login
│   ├── local-wallet.ts # Local wallet initialization
│   └── providers.ts # AI provider setup
├── config/         # Configuration, models, and constants
├── core/           # Core features (chat, history, profile)
│   └── local-wallet.ts # Wallet management commands
├── utils/          # Utility functions
│   ├── signer.ts   # Wallet client creation
│   └── local-wallet.ts # Wallet utilities & balance queries
├── validation/     # Zod schemas and validators
└── index.ts        # CLI entry point
```

## Troubleshooting

### Keychain Access

**macOS**:
- Grant Terminal/iTerm2 access in System Preferences → Privacy & Security

**Linux**:
- Ensure Secret Service is running: `systemctl --user status secrets-service`
- Install if needed: `sudo apt-get install gnome-keyring`

**Windows**:
- Credential Manager should work automatically

### Local Wallet Issues

**Private Key Not Found**:
- Run `echodex logout` then `echodex login` again
- Your private key should be stored in OS keychain
- If issues persist, check keychain/credential vault settings

**Balance Not Showing**:
- Ensure USDC is sent on the correct network (shown on wallet address screen)
- Allow 10-30 seconds for blockchain confirmation
- Run `echodex wallet-balance` to force a refresh
- Check your address on a block explorer (e.g., Etherscan for Ethereum)

**Deposit Not Being Detected**:
- Verify the USDC token address matches your network
- Wait for block confirmation (usually 12-15 seconds)
- Try `echodex fund-wallet` again to continue monitoring
- Use block explorer to verify transaction completed

### Connection Issues (WalletConnect)

If WalletConnect fails:
- Ensure you have a stable internet connection
- Try regenerating the QR code
- Check that your wallet supports WalletConnect v2

### Balance Issues (Echo/WalletConnect)

If your balance isn't updating:
- Run `echodex profile` to refresh
- Ensure you're authenticated (run `echodex login` again if needed)

### Private Key Security

**Lost or Compromised Key**:
1. Immediately run `echodex logout` (deletes local key)
2. Create a new wallet: `echodex login` → select "Local Wallet (Self Custody)"
3. Transfer remaining USDC from old address to new address (if needed)
4. Never reuse compromised private keys

## Support

- **Documentation**: [echo.merit.systems/docs](https://echo.merit.systems/docs)
- **Platform**: [echo.merit.systems](https://echo.merit.systems)
- **GitHub**: [github.com/Merit-Systems/echo](https://github.com/Merit-Systems/echo)
- **Discord**: [discord.gg/merit](https://discord.gg/merit)

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for contribution guidelines.

## License

MIT

---

Built with ❤️ by [Merit Systems](https://merit.systems)

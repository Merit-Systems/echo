# Windows Setup Guide for Echo

This guide helps Windows users get Echo running locally with minimal friction.

## Prerequisites

### 1. Install Node.js
- Download and install Node.js 18+ from [nodejs.org](https://nodejs.org/)
- Verify installation: `node --version`

### 2. Install pnpm
Echo uses pnpm as its package manager. Choose one of these methods:

**Option A: Using npm (Recommended for Windows)**
```powershell
npm install -g pnpm
```

**Option B: Using corepack (built into Node 16.13+)**
```powershell
corepack enable
corepack prepare pnpm@latest --activate
```

Verify installation:
```powershell
pnpm --version
```

### 3. Install Docker Desktop
- Download from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
- Install and start Docker Desktop
- Verify: `docker --version` and `docker compose version`

### 4. Install Git for Windows (if not already installed)
- Download from [git-scm.com](https://git-scm.com/download/win)
- Choose "Git Bash" during installation for Unix-style shell support

## Quick Start

### Using PowerShell (Windows-native)

1. **Clone the repository**
   ```powershell
   git clone https://github.com/Merit-Systems/Echo.git
   cd Echo
   ```

2. **Install dependencies**
   ```powershell
   pnpm install
   ```

3. **Set up environment (Control Plane)**
   ```powershell
   cd packages\app\control
   .\scripts\setup-windows.ps1
   ```

4. **Start development servers**
   ```powershell
   cd ..\..\..
   pnpm dev
   ```

   This automatically:
   - Starts Docker containers for PostgreSQL
   - Generates Prisma client
   - Runs database migrations
   - Starts both Echo Control and Echo Server

5. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Using Git Bash (Unix-style)

If you prefer bash-style commands:

1. **Clone and install**
   ```bash
   git clone https://github.com/Merit-Systems/Echo.git
   cd Echo
   pnpm install
   ```

2. **Set up and run**
   ```bash
   cd packages/app/control
   ./scripts/setup.sh
   cd ../../..
   pnpm dev
   ```

## Common Issues on Windows

### pnpm command not found
**Solution**: Install pnpm using `npm install -g pnpm` or enable corepack as shown above.

### Docker daemon is not running
**Solution**: Open Docker Desktop and wait for it to fully start. You'll see a green icon in the system tray when ready.

### Port 5469 already in use
**Solution**: Another PostgreSQL instance may be running. Either:
- Stop the conflicting service
- Change the port in `packages/app/control/docker-local-db.yml` and update `DATABASE_URL` in `.env`

### PowerShell execution policy error
**Solution**: If you see "cannot be loaded because running scripts is disabled", run:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### Setup scripts won't run
**Solution**: Windows users should use `setup-windows.ps1` in PowerShell or `setup.sh` in Git Bash:
```powershell
# In PowerShell
.\scripts\setup-windows.ps1

# In Git Bash
./scripts/setup.sh
```

### Line ending errors (CRLF vs LF)
**Solution**: Configure Git to handle line endings:
```bash
git config --global core.autocrlf true
```

## Verifying Your Setup

After completing setup, verify everything works:

1. **Check Docker**
   ```powershell
   docker ps
   ```
   Should show `echo-control-postgres-v2` container running

2. **Check Database Connection**
   ```powershell
   cd packages\app\control
   pnpm exec prisma studio
   ```
   Should open Prisma Studio in your browser

3. **Access Echo**
   Visit [http://localhost:3000](http://localhost:3000)
   You should see the Echo Control dashboard

## Development Workflow

### Starting the servers
```powershell
# From repo root
pnpm dev
```

### Stopping the servers
- Press `Ctrl+C` in the terminal running `pnpm dev`
- Stop Docker containers:
  ```powershell
  cd packages\app\control
  docker compose -f docker-local-db.yml down
  ```

### Resetting the database
```powershell
cd packages\app\control
pnpm exec prisma migrate reset
```

### Viewing database
```powershell
cd packages\app\control
pnpm exec prisma studio
```

## Need Help?

- Check the main [README.md](./README.md) for general documentation
- Review [packages/app/control/README.md](./packages/app/control/README.md) for Control Plane details
- Check [packages/app/server/README.md](./packages/app/server/README.md) for Server details
- Report issues at [github.com/Merit-Systems/Echo/issues](https://github.com/Merit-Systems/Echo/issues)

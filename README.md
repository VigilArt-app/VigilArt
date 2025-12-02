# VigilArt
Helping artists track their work with insightful reports! ✨

## Getting started

Quick steps to run the project locally.

### Prerequisites
- Node.js (recommended >= 18)
- pnpm (install: `npm install -g pnpm`)
- Doppler CLI (used to inject secrets at runtime)

### Install dependencies
From the repository root:

```bash
pnpm install
```

### Doppler CLI — install & setup
*See Doppler's [readme file](./documentation/doppler.md) for more details.*

### Running with Docker Compose

You can run the entire stack using Docker Compose in either development or production mode.

#### Development Mode

- Uses `docker-compose.dev.yml`
- Loads environment variables from a local `.env` file at root of the repository (see [.env.example](.env.example)).
- Suitable for local development, debugging, and testing.

**Start the stack in development mode:**

```bash
docker compose -f docker-compose.dev.yml up --build
```

You can also run a single service (e.g., backend):

```bash
docker compose -f docker-compose.dev.yml up backend
```

> **Note:** Make sure your `.env` file is present and contains all required variables.

#### Production Mode

- Uses `docker-compose.prod.yml`
- Loads secrets and environment variables via Doppler CLI (secure secret management)
- Suitable for deployment and production-like environments

**Start the stack in production mode:**

```bash
doppler run -- docker compose -f docker-compose.prod.yml up
```

You can also run a single service (e.g., backend):

```bash
doppler run -- docker compose -f docker-compose.prod.yml up backend
```

> **Note:** Doppler injects secrets at runtime. Ensure you have Doppler CLI installed and configured with access to your project’s secrets.

#### Key Differences

- **Environment Variables:**  
	- Dev: Uses `.env` files for local configuration.  
	- Prod: Uses Doppler for secure secret injection.
- **Compose Files:**  
	- Dev: `docker-compose.dev.yml` (local setup, hot-reloading, debug tools)  
	- Prod: `docker-compose.prod.yml` (optimized for deployment, secure, persistent volumes)
- **Usage:**  
	- Dev: Fast iteration, local testing.  
	- Prod: Realistic environment, secure secrets, ready for deployment.

### Add a new dependency to one of the packages

To add a new dependency to a specific package, use the following command from the repository root:

```bash
pnpm add <package-name> -w -F <package-folder>
```

or to add a dev dependency:

```bash
pnpm add <package-name> -w -D -F <package-folder>
```

You can also `cd` into the package folder and run the command without `-F` and `-w` flags.
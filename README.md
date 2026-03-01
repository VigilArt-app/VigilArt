<div align="center">

<p align="center">
<img src="https://github.com/user-attachments/assets/28412052-109c-40c3-b28e-70c7fdd97505" alt="VigilArt banner" title="VigilArt" width="800" />
</p>

# VigilArt

<p align="center">
<strong>Our goal:</strong> help artists protect their work online.

Currently working on a website and a mobile app!
</p>
</div>

## About

<p align="center"><img width="800" alt="Vigilart workflow" src="https://github.com/user-attachments/assets/0a53d857-a542-464f-ae9d-f791c0c0aa60" /></p>

- **Upload** your artworks to the app.
- Get regularly **notified** about where your artworks appear online, all in one dashboard.
- **Take action** with automatically generated DMCA reports to remove unauthorized uses of your artworks.

## Status

[![Deploy to dev](https://github.com/VigilArt-app/VigilArt/actions/workflows/deploy-dev.yml/badge.svg?branch=dev)](https://dev.vigilart.app)

## Getting started

Quick steps to run the project locally.

### Prerequisites
- Node.js (recommended >= 18)
- pnpm (install: `npm install -g pnpm`)
- Doppler CLI (used to inject secrets at runtime)

### For Windows users

See [Windows-specific setup instructions](./documentation/windows.md).

### Install dependencies
From the repository root:

```bash
pnpm install
```

### Development Mode

- Uses `docker-compose.dev.yml` to easily start the database and Prisma Studio for local development.
- Loads environment variables from a local `.env` file at the root of the repository (see [.env.example](.env.example)).
- Suitable for local development, debugging, and testing.

**Start the database and Prisma Studio:**

```bash
docker compose -f docker-compose.dev.yml up db
docker compose -f docker-compose.dev.yml up prisma-studio
```

You can also start both at once:

```bash
docker compose -f docker-compose.dev.yml up
```

> **Note:** Make sure your `.env` file is present and contains all required variables.

**Start the backend and frontend for development:**

From the repository root, use the following scripts:

```bash
pnpm dev          # Starts both backend and frontend
pnpm dev:backend  # Starts only the backend
pnpm dev:frontend # Starts only the frontend
```

This allows you to use hot-reloading and other dev features outside of Docker for the app code, while still using Docker for the database and Prisma Studio.

### Production Mode

- Uses `docker-compose.prod.yml`
- Loads secrets and environment variables via Doppler CLI (secure secret management)
- Suitable for deployment and production-like environments

*For more details on how to use Doppler, see [Doppler's readme file](./documentation/doppler.md).*

**Start the stack in production mode:**

```bash
doppler run -- docker compose -f docker-compose.prod.yml up
```

You can also run a single service (e.g., backend):

```bash
doppler run -- docker compose -f docker-compose.prod.yml build backend
doppler run -- docker compose -f docker-compose.prod.yml up backend
```

> **Note:** Doppler injects secrets at runtime. Ensure you have Doppler CLI installed and configured with access to your project’s secrets.

### Key Differences

- **Environment Variables:**
	- Dev: Uses `.env` files for local configuration.
	- Prod: Uses Doppler for secure secret injection.
- **Compose Files:**
	- Dev: `docker-compose.dev.yml` and pnpm scripts.
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

### Access the website online

The VigilArt development website is accessible at: [https://dev.vigilart.app](https://dev.vigilart.app).  
The production website is accessible at: [https://vigilart.app](https://vigilart.app).

The APIs are also accessible online by using dev-api.vigilart.app and api.vigilart.app respectively.

### Documentation

Further documentation can be found in the [documentation folder](./documentation).

API documentation is auto-generated and can be accessed at different URLs based on your environment:
- Local development: `http://localhost:3000/api/v1/docs`
- Development environment: `https://dev-api.vigilart.app/api/v1/docs`
- Production environment: Not available.

The API documentation is generated using Swagger and provides detailed information about the available endpoints, request/response schemas, and authentication methods.

## Developers

| [<img src="https://github.com/yasssb.png?size=85" width=85><br><sub>Yasmine BEDRANE</sub>](https://github.com/yasssb) | [<img src="https://github.com/Sachaplr.png?size=85" width=85><br><sub>Sacha POLEROWICZ</sub>](https://github.com/Sachaplr) | [<img src="https://github.com/capuchegianni.png?size=85" width=85><br><sub>Gianni HENRIQUES</sub>](https://github.com/capuchegianni) |[<img src="https://github.com/sephorah.png?size=85" width=85><br><sub>Séphorah ANIAMBOSSOU</sub>](https://github.com/sephorah)
| :---: | :---: | :---: | :---: |

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

### Running the services
Use Doppler to provide environment variables when running packages.

Examples (from repo root):

- Start the backend:

```bash
pnpm run dev:backend
```

- Start the frontend:

```bash
pnpm run dev:frontend
```

Or run inside a package folder:

```bash
cd backend
pnpm run dev
```

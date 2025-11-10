# Using Doppler for environment variable management

This project uses [Doppler](https://www.doppler.com/) to manage environment variables and secrets for both the frontend and backend services. Doppler allows you to securely store, manage, and inject environment variables at runtime.

## Installing Doppler CLI
- macOS / Linux (recommended):

```bash
curl -sLf https://cli.doppler.com/install.sh | sh
```

- Windows: install via your package manager (Chocolatey, Scoop, or Winget).  
For example with Chocolatey:

```powershell
choco install doppler
```

*See [Doppler installation docucmentation](https://docs.doppler.com/docs/install-cli) for more details.*

**Important**: on Windows, after installing Doppler you must restart your computer for the CLI to function correctly.

After installation, log in to your Doppler account:

```bash
doppler login
```

## Setting up Doppler using the CLI

Frontend developers don't have to execute any additional commands since the npm scripts already include the necessary environment variable injection.

For backend developers, they need to execute the following commands to use their own environment variables:

```bash
cd backend
doppler setup --project vigilart --config dev_[devname]
```

Finally, the backend developer can setup its env variables on the doppler dashboard, based on it's own database credentials.
# How to work on Windows

To ensure full compatibility with the project's Docker and pnpm configuration without performance issues, **you must use WSL 2 (Windows Subsystem for Linux)**.

## 1. Setup Environment
- Install **WSL 2** by running `wsl --install` in PowerShell (Administrator).
- Install **Docker Desktop** and ensure "Use the WSL 2 based engine" is enabled in Settings > General.
- Install **VSCode** and the **[WSL Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl)**.

## 2. Clone the project
Open your Linux terminal (e.g., Ubuntu), add your SSH key to the ssh-agent, and clone the repository into your Linux home directory:
```bash
git clone git@github.com:VigilArt-app/VigilArt.git
```

**⚠️ Important: Do not clone the project into the mounted Windows drives (e.g., /mnt/c/...). This will cause severe performance issues with Docker volumes and file permissions.**

## 3. Open the project on VSCode
```bash
cd VigilArt
code .
```
If you have correctly installed VSCode and its WSL extension, VSCode will open in WSL mode.

## 4. Follow the regular setup instructions
From this point, follow the regular setup instructions in the README.md as you would on Linux or macOS.
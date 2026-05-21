# ArchStore — Arch Linux Package Store

A classic, stable, and practical Linux desktop style package manager frontend for Arch Linux. It combines official `pacman` repositories and the Arch User Repository (AUR) into a dense, functional interface reminiscent of classic utilities like Synaptic Package Manager, Pamac, and older GNOME/XFCE applications.

## Main Features

- **Unified Search**: Search packages across pacman repositories and the AUR simultaneously.
- **Detailed Package Metadata**: View licenses, sizes, packager, installation dates, dependencies, and installed versions.
- **PKGBUILD Security Scanner**: Analyzes PKGBUILD script manifests for suspicious scripts, remote code execution (curl/wget to sh), command injection, and other threats.
- **System Updates Manager**: Dense list split into security bulletins and standard applications, supporting individual selections and upgrade execution.
- **Category Browsing**: Explore applications by genre (Development, System, Networks, Multimedia, Games, etc.).
- **Local SQLite Caching**: Fast indexing and pagination for package queries with a 15-minute Time-to-Live (TTL).

---

## Technical Architecture

### Backend (FastAPI + SQLite)
- Safe execution of system tools (`pacman`, `yay`) utilizing `asyncio.subprocess` exec arrays (no `shell=True`) to completely eliminate command injection vectors.
- Whitelist-based package name and search query sanitization.
- Lightweight SQLite storage cache with auto-expiration.

### Frontend (React + TypeScript + TailwindCSS v4)
- Stable, non-trendy desktop-oriented interface with a fixed sidebar, top toolbar, main work panel, and bottom status bar.
- Pure black dark mode (`#000000`) and clean white light mode with dense spacing, standard table layouts, and classic retro-thin scrollbars.
- Simple rectangular borders with minimal rounding, zero modern gradients, shimmers, or floating card designs.

---

## Installation & Setup

### Prerequisites
Make sure you have `python`, `node`, `npm`, and an AUR helper (like `yay`) installed.

### 1. Backend Setup
Create a virtual environment, activate it, and install Python dependencies:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Start the development API server:
```bash
uvicorn main:app --reload --port 8000
```
The backend API will run on `http://localhost:8000`.

### 2. Frontend Setup
Navigate to the frontend folder, install npm modules, and run the development server:
```bash
cd frontend
npm install
npm run dev
```
The frontend application will start on `http://localhost:5173`. Any calls to `/api` will be proxied to the backend automatically.

---

## Security Policy

1. **Command Sanitization**: Strict whitelist of `^[a-zA-Z0-9@._+-]+$` for all package names passed to shell processes.
2. **Untrusted Scripts Isolation**: Build and PKGBUILD script generation is handled strictly through the pacman package manager database structures and standard AUR helpers (`yay`), bypassing manual root exec calls.
3. **No Sudo Privilege Escalation without Prompt**: Installation requests call `pkexec` (standard Polkit helper) to prompt user dynamically, or run in the user's home space for user-run AUR installs.

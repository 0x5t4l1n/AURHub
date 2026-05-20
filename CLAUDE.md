# CLAUDE.md

# Project Name
ArchStore

# Project Description
ArchStore is a lightweight modern package store for Arch Linux.
It combines official pacman repositories and the AUR into one clean interface similar to a Play Store.

Users can:
- Search packages
- Install packages
- View package details
- Check updates
- Browse categories
- Analyze package security

---

# Goals
- Fast and lightweight
- Modern UI
- Secure package installation
- Unified package ecosystem
- Beginner friendly
- Open source

---

# Core Features

## Package Search
Search packages from:
- pacman repositories
- AUR repositories

---

## Package Information
Show:
- package name
- description
- maintainer
- dependencies
- version
- popularity
- votes
- package size
- last updated

---

## One Click Install
Install packages using:
- pacman
- paru

---

## Update Center
Show available package updates.

---

## Security Scanner
Analyze PKGBUILD files for:
- dangerous bash commands
- suspicious scripts
- hidden downloads
- obfuscated code
- remote execution attempts

---

# Tech Stack

## Frontend
- React
- TailwindCSS
- Vite

## Backend
- Python
- FastAPI

## Database
- SQLite

---

# APIs

## AUR RPC
https://aur.archlinux.org/rpc/

---

# Backend Structure

backend/
├── api/
├── scanner/
├── services/
├── database/
├── main.py

---

# Frontend Structure

frontend/
├── src/
├── components/
├── pages/
├── layouts/
├── services/

---

# UI Style
- Dark theme
- Minimal interface
- Fast navigation
- Responsive design

---

# Future Features
- AI malware detection
- Verified packages
- Package reviews
- Package screenshots
- Dependency graph
- Flatpak support
- Snap support
- Electron desktop client

---

# Security Rules
- Never execute unknown scripts directly
- Always sanitize shell commands
- Validate package metadata
- Use sandboxed package analysis
- Prevent command injection

---

# Development Commands

## Backend
uvicorn main:app --reload

## Frontend
npm run dev

---

# Project Vision
Create the best lightweight package store experience for Arch Linux users.

---

# Maintainer
Aur & Arch 5t4l1n
github:0x5t4l1n

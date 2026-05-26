<div align="center">

```
 █████╗ ██████╗  ██████╗██╗  ██╗███████╗████████╗ ██████╗ ██████╗ ███████╗
██╔══██╗██╔══██╗██╔════╝██║  ██║██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗██╔════╝
███████║██████╔╝██║     ███████║███████╗   ██║   ██║   ██║██████╔╝█████╗  
██╔══██║██╔══██╗██║     ██╔══██║╚════██║   ██║   ██║   ██║██╔══██╗██╔══╝  
██║  ██║██║  ██║╚██████╗██║  ██║███████║   ██║   ╚██████╔╝██║  ██║███████╗
╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝
```

**A classic, dense, and security-aware package manager frontend for Arch Linux**

[![AUR](https://img.shields.io/aur/version/archstore-git?style=flat-square\&logo=arch-linux\&logoColor=white\&color=1793d1\&label=AUR)](https://aur.archlinux.org/packages/archstore-git)
[![License](https://img.shields.io/badge/license-GPL--3.0--or--later-blue?style=flat-square)](../LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-mirror-black?style=flat-square\&logo=github)](https://github.com/w4nn4d13/AURHub)
[![GitLab](https://img.shields.io/badge/GitLab-mirror-orange?style=flat-square\&logo=gitlab)](https://gitlab.archlinux.org/5t4l1n/aurhub)
[![Self-Hosted Git](https://img.shields.io/badge/Self--Hosted-Gitea-green?style=flat-square\&logo=gitea\&logoColor=white)](https://git.w4nn4d13.tech/0x5t4l1n/AURHub)


</div>

---

## Screenshots

### Dark Theme
![ArchStore Dark Theme](https://github.com/user-attachments/assets/d8be372c-b9d2-43df-80c7-41e7dcf89155)

### Light Theme
![ArchStore Light Theme](https://github.com/user-attachments/assets/632cb351-993d-4efe-b9b6-2dc3741963b4)

---

## Features

- **Unified Search** — search official repositories and the AUR at the same time
- **Package Metadata** — licenses, sizes, packager, install dates, dependencies
- **PKGBUILD Security Scanner** — flags suspicious scripts before you install
- **System Updates** — split view of security bulletins and standard upgrades
- **Category Browsing** — browse by genre: Development, System, Multimedia, Games, and more
- **Fast Local Cache** — results are cached locally for instant pagination

---

## Installation

### From the AUR (recommended)

```bash
yay -S archstore-git
```

Or manually:

```bash
git clone https://aur.archlinux.org/archstore-git.git
cd archstore-git
makepkg -si
```

### From source

**Requirements:** `python 3.11+`, `node 20+`, `npm`, `yay` or `paru`

**Backend**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Project Links

| | |
|---|---|
| AUR | [aur.archlinux.org/packages/archstore-git](https://aur.archlinux.org/packages/archstore-git) |
| GitHub | [github.com/0x5t4l1n/AURHub](https://github.com/0x5t4l1n/AURHub) |
| GitLab | [gitlab.archlinux.org/5t4l1n/aurhub](https://gitlab.archlinux.org/5t4l1n/aurhub) |

---

## License

GNU GPL v3.0 or later — see [LICENSE](../LICENSE) for full terms.

---

<div align="center">
Built for Arch Linux 
</div>

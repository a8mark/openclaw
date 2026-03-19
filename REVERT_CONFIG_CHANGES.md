# Config Reversion Checklist - Autumn VM Cleanup

Tracks temporary changes from the 2026-03-13 rescue. See `AUTUMN_CONFIG.md` for the canonical setup reference.

## 1. Mac Network (Local)

- [x] **Ethernet IP (`en11`)**: Reverted to DHCP.
- [x] **Static Route**: Cleaned up. Verify: `netstat -rn | grep 192.168.168`.

## 2. Autumn VM Config (`~/infra/config/openclaw.json`)

- [x] **Primary Model**: Restored to `google/gemini-3-flash-preview`.
- [x] **Fallbacks**: Correct: `["google/gemini-3.1-pro-preview", "anthropic/claude-opus-4-6"]`.
- [ ] **Allowed Origins**: `http://localhost:18789` added — keeping for SSH-based access.
- [ ] **Doctor Fix**: Ran `openclaw doctor --fix` which normalized legacy keys. Non-reversible, harmless.

## 3. Autumn VM Files & State

- [x] **Workspace symlink**: `~/.openclaw/workspace-main -> ~/.openclaw/workspace`. Permanent fix for [openclaw#21770](https://github.com/openclaw/openclaw/issues/21770).
- [x] **Orphan agent removed**: `~/.openclaw/agents/main` moved to `main.orphan-*`.
- [x] **SOUL.md updated**: Added hard rule — no external emails, draft only.
- [x] **gemini-send.sh fixed**: Config path updated to infra config, response file instructions added.
- [ ] **Problematic session**: `6f7b7adf-*` in `~/autumn_backup/`. Can delete when confirmed stable.
- [ ] **Delivery queue**: 28 items deleted. Non-reversible.
- [ ] **Python scripts**: In `~/autumn_backup/`. Can delete when confirmed stable.
- [ ] **Stale default config**: `~/.openclaw/openclaw.json` is out of sync with live config. Should be deleted or synced to avoid confusion.

## 4. Infrastructure (Proxmox)

- [x] **VM 100 IP**: DHCP restored. If drops again: `sudo ip addr add 192.168.168.23/24 dev enp6s18`.
- [x] **VM 102 created and provisioned**: `autumn-workstation`, Ubuntu 24.04, 8 cores, 16GB RAM, 120GB disk, IP `192.168.168.24`. Installed: xfce4, xrdp, tmux, Node.js 22, claude-code. Users: `markv` (primary), `autumn`. XRDP working via SSH tunnel. SSH config entry `autumn-workstation` added. Mac Desktop shortcut created.
- [ ] **Serial ports (VM 100/101)**: Added `serial0: socket`. Can keep — useful for console access.

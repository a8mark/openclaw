# Autumn Infrastructure & Configuration Guide

Consolidated reference for the Autumn AI assistant deployment on the Autom8ly Proxmox cluster.

## Identity

- **Name**: Autumn
- **Email**: autumn@autom8ly.com
- **Domain**: autumn.chatgenii.com
- **GitHub Org**: a8-autumn
- **GCP Project**: `a8crm-423502`
- **Service Account**: `autumn-service-account@a8crm-423502.iam.gserviceaccount.com`

## Proxmox Cluster ("GPUMonster")

- **Host**: AMD Ryzen 9 9900X, NVIDIA RTX 4080 Super, 124 GB RAM, 24 threads
- **Host IP**: `192.168.168.21`
- **Proxmox UI**: `https://192.168.168.21:8006`

### VMs

| VMID | Name                  | IP                    | User          | Purpose                                   |
| ---- | --------------------- | --------------------- | ------------- | ----------------------------------------- |
| 100  | gpumonster-ubuntu2404 | 192.168.168.23 (DHCP) | root          | Inference node, Ollama                    |
| 101  | moltbot (autumn-vm)   | 192.168.168.22        | autumn        | OpenClaw gateway, primary                 |
| 102  | autumn-workstation    | 192.168.168.24        | markv, autumn | CLI workstation (tmux, claude-code, XRDP) |

### GPU Passthrough (VM 100)

IOMMU/VFIO config staged on host but **pending reboot**. See `GPU_PASSTHROUGH_PLAN.md` for full steps. Currently Ollama runs on CPU.

## SSH Access

All access goes through a Cloudflare Zero Trust tunnel via `ssh.chatgenii.com`.

| Target                  | Command                             |
| ----------------------- | ----------------------------------- |
| Proxmox Host            | `ssh gpumonster`                    |
| Inference Node (VM 100) | `ssh gpumonster-ubuntu2404`         |
| Autumn VM (VM 101)      | `ssh autumn-vm` or `ssh moltbot-vm` |
| Workstation (VM 102)    | `ssh autumn-workstation`            |

VMs are reached via `ProxyJump gpumonster`. Auth tokens expire periodically — re-auth at `https://ssh.chatgenii.com` in a browser.

For direct LAN access (when on the same network):

- VM 101: `ssh -o IdentitiesOnly=yes autumn@192.168.168.22`
- VM 102: `ssh -o IdentitiesOnly=yes -i ~/.ssh/id_ed25519 markv@192.168.168.24`

Full SSH config: see `ssh-access.md`.

### VM 102 — Autumn Workstation (Machine Shop)

Deployed 2026-03-15. Ubuntu 24.04 cloud image + cloud-init.

**Installed software**: xfce4, xrdp (0.9.24), tmux, Node.js 22, git, build-essential, claude-code (2.1.74)

**Users**:

- `markv` — primary user for CLI subscriptions (claude-code, copilot, codex). Passwordless sudo.
- `autumn` — system/admin user (created by cloud-init). Passwordless sudo.

**Remote Desktop (XRDP)**:

1. SSH tunnel: `ssh -o IdentitiesOnly=yes -i ~/.ssh/id_ed25519 -L 3389:localhost:3389 -N markv@192.168.168.24`
2. Connect via Microsoft Remote Desktop to `localhost` as `markv`
3. Or use the `Autumn Workstation.command` shortcut on Mac Desktop

**Cloud-init config**: `/var/lib/vz/snippets/vm102-setup.yaml` on Proxmox host

**Pending setup**:

- SSH key from VM 101 (autumn) → VM 102 (markv) for Autumn to dispatch work
- crew8 MCP configuration
- claude-code MCP integration with crew8

## OpenClaw Gateway (VM 101)

### Service

- **Systemd**: `openclaw-gateway` (user service, user `autumn`)
- **Port**: 18789
- **Web UI**: `http://localhost:18789` (local) or `https://autumn.chatgenii.com` (Cloudflare tunnel)
- **Version**: Check with `systemctl --user status openclaw-gateway`

### Key Paths

| Path                                          | Purpose                                                                                                                      |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `~/infra/config/openclaw.json`                | **Live config** (via `OPENCLAW_CONFIG_PATH` env var)                                                                         |
| `~/.openclaw/openclaw.json`                   | Default config (NOT used — stale copy, ignore)                                                                               |
| `~/.openclaw/workspace`                       | Agent workspace (git: `a8-autumn/autumn-workspace`)                                                                          |
| `~/.openclaw/workspace-main`                  | **Symlink** to `~/.openclaw/workspace` (required due to [openclaw#21770](https://github.com/openclaw/openclaw/issues/21770)) |
| `~/.openclaw/credentials/autumn-gcp-key.json` | GCP service account key                                                                                                      |
| `~/.openclaw/agents/autumn/sessions/`         | Session state                                                                                                                |
| `~/.openclaw/cron/jobs.json`                  | Cron job definitions                                                                                                         |
| `~/infra/`                                    | Infrastructure repo (git: `a8-autumn/autumn-infra`)                                                                          |
| `~/scripts/`                                  | Operational scripts (synced from infra repo)                                                                                 |
| `~/logs/`                                     | Application logs                                                                                                             |
| `/tmp/openclaw/openclaw-YYYY-MM-DD.log`       | Gateway daily log                                                                                                            |

### Systemd Environment Overrides

File: `~/.config/systemd/user/openclaw-gateway.service.d/env.conf`

Contains:

- `OPENCLAW_CONFIG_PATH=/home/autumn/infra/config/openclaw.json`
- `ANTHROPIC_API_KEY`
- `GOOGLE_APPLICATION_CREDENTIALS`
- `GOOGLE_CLOUD_PROJECT=a8crm-423502`
- `GOOGLE_CLOUD_LOCATION=us-east5`

### Common Operations

```bash
# Restart gateway
systemctl --user restart openclaw-gateway

# Check status
systemctl --user status openclaw-gateway

# View logs
journalctl --user -u openclaw-gateway --since '10 min ago'
tail -f /tmp/openclaw/openclaw-$(date +%Y-%m-%d).log

# Send message to Autumn
bash ~/scripts/gemini-send.sh 'your message here'
```

## Model Tier System

| Tier           | Model                            | Provider         | Purpose                                 |
| -------------- | -------------------------------- | ---------------- | --------------------------------------- |
| 1 (Primary)    | `google/gemini-3-flash-preview`  | Google AI Studio | Fast, free, handles most tasks          |
| 2 (Fallback)   | `google/gemini-3.1-pro-preview`  | Google AI Studio | More capable, free                      |
| 3 (Escalation) | `anthropic/claude-opus-4-6`      | Anthropic API    | Paid, last resort                       |
| Local          | `ollama-vm/autumn-logic-35b`     | Ollama (VM 100)  | Background/cron tasks, offline fallback |
| Local          | `ollama-vm/autumn-gatekeeper-8b` | Ollama (VM 100)  | Lightweight gatekeeper                  |

Auth for Google models: Google AI Studio API key (not Vertex AI). No token refresh needed.

## Agent Configuration

Single agent `autumn` (default), defined in `~/infra/config/openclaw.json`:

- Identity: Autumn 🍂
- Workspace: `/home/autumn/.openclaw/workspace`
- Memory: Firestore (`autumn-memories` collection, project `a8crm-423502`)
- Channels: Google Chat (allowlist mode)

### Workspace Files (git: a8-autumn/autumn-workspace)

- `SOUL.md` — Core personality, boundaries, hard rules
- `IDENTITY.md` — Name, emoji, vibe
- `USER.md` — Info about Mark and the team
- `AGENTS.md` — Session boot sequence, tool usage, group chat rules
- `MEMORY.md` — Long-term curated memory
- `memory/` — Daily logs
- `HEARTBEAT.md` — Periodic check instructions
- `TOOLS.md` — Tool-specific notes

### Security Rules (in SOUL.md)

- **NEVER send emails outside @autom8ly.com** — prepare drafts for employee review
- Only @autom8ly.com addresses may receive direct sends
- Private data stays private
- Ask before acting externally

## Git Repos

| Repo            | Location on VM          | GitHub                       |
| --------------- | ----------------------- | ---------------------------- |
| Workspace       | `~/.openclaw/workspace` | `a8-autumn/autumn-workspace` |
| Infrastructure  | `~/infra/`              | `a8-autumn/autumn-infra`     |
| OpenClaw (fork) | `~/openclaw/`           | `a8mark/openclaw`            |

## Google Chat Integration

- **Poller**: `node ~/infra/scripts/gchat-poll-v11.js` (runs under gateway cgroup)
- **Poller logs**: `~/logs/gchat-poll.log`
- **Channel config**: In `channels.googlechat` section of openclaw.json
- **Service account**: `autumn-gcp-key.json`
- **Audience**: project number `11254680268`
- **Group policy**: allowlist

## Cron Jobs (VM 101)

| Schedule       | Script                  | Purpose                                      |
| -------------- | ----------------------- | -------------------------------------------- |
| `*/5 * * * *`  | `check-task-queue.sh`   | System safety sweep (Gmail, GChat, tasks.md) |
| `0 4 */5 * *`  | `gog gmail watch renew` | Auto-renew Gmail push notifications          |
| `0 14 * * 1-5` | `investomania-daily.sh` | Pre-market scan (9 AM ET)                    |
| `0 20 * * 1-5` | `investomania-daily.sh` | Pre-close scan (3 PM ET)                     |
| `*/30 * * * *` | `cron-watchdog.sh`      | Monitor cron jobs for silent failures        |

OpenClaw internal crons (in `~/.openclaw/cron/jobs.json`):

- Token Refresh (Vertex AI) — runs periodically
- Real-time Health Check (Gmail & GChat) — runs periodically
- OASIS Daily Trading Scan
- OpenClaw daily changelog

## Common Failure Modes

1. **Config corruption by local LLM** — The 35B model has previously corrupted `openclaw.json` causing crash loops. Never let local models modify config files.
2. **Cloudflare tunnel auth expiry** — SSH fails, needs browser re-auth at `ssh.chatgenii.com`.
3. **VM 100 DHCP timeout** — Ollama becomes unreachable. Fix: `sudo ip addr add 192.168.168.23/24 dev enp6s18` on VM 100 console.
4. **Workspace-main bug** — OpenClaw reads from `workspace-main` not the configured workspace path ([#21770](https://github.com/openclaw/openclaw/issues/21770)). Fixed with symlink. Do not remove.
5. **Stale default config** — `~/.openclaw/openclaw.json` exists but is NOT used. The live config is at `~/infra/config/openclaw.json`. Edits to the wrong file have no effect.
6. **Orphan sessions** — Using `/new` in the UI can create sessions bound to a generic agent instead of autumn. Check `~/.openclaw/agents/` for unexpected directories.

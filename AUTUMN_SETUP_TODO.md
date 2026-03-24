# Autumn (OpenClaw) Setup Plan

## 1. Infrastructure (Proxmox + Mac)

- [ ] Confirm Ubuntu VM (ID 100) is booted and reachable.
- [ ] Get VM local IP (`ip addr`).
- [ ] Update Mac `~/.ssh/config` with `ProxyJump officeamd-remote`.
- [ ] Verify SSH access: `ssh my-ubuntu-vm`.

## 2. VM Prerequisites

- [ ] Install Docker & Node.js 22.
- [ ] Install `cloudflared` (for the web tunnel).
- [ ] Create dedicated `openclaw` system user.

## 3. OpenClaw Installation

- [ ] Clone `https://github.com/openclaw/openclaw`.
- [ ] `npm install` and initial build.

## 4. Identity & Security Configuration

- [ ] **Name:** Autumn
- [ ] **Email:** autumn@autom8ly.com
- [ ] **Domain:** autumn.chatgenii.com
- [ ] **Security Rule (Whitelisting):**
  - Only respond to `@autom8ly.com`.
  - Forward all external communications to `mark@autom8ly.com`.
  - Never reply to non-autom8ly domains.
- [ ] **GitHub Access:** Read-only access to the organization.

## 5. Integrations (Credentials Needed)

- [ ] **LLM:** Anthropic/Claude API Key (Ready).
- [ ] **Google Project:** `a8crm` (GCP).
  - [ ] Enable **Gmail API**.
  - [ ] Enable **Google Chat API**.
  - [ ] Create **OAuth Client ID** & download `client_secret.json`.
- [ ] **GitHub:** Personal Access Token (PAT) with `read:org`.

## 6. Access & Monitoring

- [x] Set up Cloudflare Tunnel inside VM for `autumn.chatgenii.com`.
- [x] Verify web UI access.

## 7. Pending Repairs & Refinements (Traveling Phase)

- [ ] **Fix Cloudflare Tunnel:** GPUMonster tunnel is currently down in dashboard. Needs local network check.
- [ ] **Restore SSH Access:** Re-verify `ssh.chatgenii.com` once tunnel is healthy (DNS must be Orange Clouded).
- [ ] **GChat Node.js Migration:** Monitor and verify `gchat-poll-v8.js` implementation by Autumn.
- [ ] **Permanent API Key:** Move `ANTHROPIC_API_KEY` from systemd environment override to a more permanent/config-native solution.
- [ ] **Guppy VM Recovery:** Fix "Guest has not initialized display" boot issues for Guppy-Desktop (201) and Guppy-Autumn (202).

# SSH Access Guide - Autom8ly Cluster

This guide describes how to access the Autom8ly Proxmox cluster and its VMs remotely using Cloudflare Zero Trust tunnels and SSH aliases.

## **Global Access Aliases**

You can use these short commands from your Mac regardless of your location (Local or Remote):

| Target                | Command                     | Description                        |
| :-------------------- | :-------------------------- | :--------------------------------- |
| **GPUMonster (Host)** | `ssh gpumonster`            | Proxmox Hypervisor Host            |
| **Inference Node**    | `ssh gpumonster-ubuntu2404` | VM 100 - High-performance GPU node |
| **Autumn VM**         | `ssh autumn-vm`             | VM 101 - Primary Moltbot instance  |
| **Moltbot Alias**     | `ssh moltbot-vm`            | Alternative alias for VM 101       |

## **How it Works**

1.  **Cloudflare Tunnel**: The `gpumonster` host runs a `cloudflared` daemon that maintains a secure outbound tunnel to `ssh.chatgenii.com`.
2.  **ProxyCommand**: Your local SSH config uses `cloudflared access ssh` to connect to that tunnel. This handles the global-to-local routing without needing open ports or a VPN.
3.  **ProxyJump**: The VMs are reached using `ProxyJump gpumonster`. Your Mac first connects to the host via the tunnel, then "jumps" to the internal VM IP address.

## **Configuration (for new machines)**

### **1. Install Cloudflare CLI**

```bash
brew install cloudflared
```

### **2. Update `~/.ssh/config`**

Add the following block to your local SSH configuration:

```text
# Proxmox Parent Cluster Host
Host gpumonster
    HostName ssh.chatgenii.com
    User root
    ProxyCommand /opt/homebrew/bin/cloudflared access ssh --hostname %h
    IdentitiesOnly yes

# VM 100 - Inference Node
Host gpumonster-ubuntu2404
    HostName 192.168.168.23
    User root
    ProxyJump gpumonster
    IdentitiesOnly yes

# VM 101 - Moltbot / Autumn VM
Host moltbot-vm autumn-vm autumn-direct
    HostName 192.168.168.22
    User autumn
    ProxyJump gpumonster
    IdentitiesOnly yes
```

### **3. Initial Authentication**

The first time you run `ssh gpumonster`, a browser window will open. Log in with your Autom8ly Cloudflare credentials to authorize your device.

## **Local Network Access (Colocated)**

When on the same LAN as the cluster (192.168.168.0/24), bypass Cloudflare for faster, more stable connections.

### LAN IPs

| Target                          | IP                                               | User   |
| :------------------------------ | :----------------------------------------------- | :----- |
| **GPUMonster (Host)**           | 192.168.168.21 (vmbr0) / 192.168.168.49 (enp9s0) | root   |
| **Inference Node (VM 100)**     | 192.168.168.23                                   | root   |
| **Autumn Workstation (VM 102)** | 192.168.168.24                                   | markv  |
| **Autumn VM (VM 101)**          | 192.168.168.25                                   | autumn |
| **NemoClaw (VM 103)**           | 192.168.168.26                                   | markv  |

### Direct SSH (no Cloudflare)

```bash
# Direct to a VM if your Mac can route to 192.168.168.0/24
ssh -o IdentitiesOnly=yes markv@192.168.168.26

# Via gpumonster as jump host (LAN IP, no cloudflared)
ssh -o IdentitiesOnly=yes -J root@192.168.168.21 markv@192.168.168.26
```

### Port Forward for Autumn Control UI (local)

```bash
# Direct (if routable)
ssh -o IdentitiesOnly=yes -L 18789:127.0.0.1:18789 markv@192.168.168.26 -N

# Via gpumonster jump (LAN)
ssh -o IdentitiesOnly=yes -J root@192.168.168.21 -L 18789:127.0.0.1:18789 markv@192.168.168.26 -N
```

### Port Forward for Workstation RDP (local)

```bash
# Direct (if routable)
ssh -o IdentitiesOnly=yes -L 3389:127.0.0.1:3389 markv@192.168.168.24 -N

# Via gpumonster jump (LAN)
ssh -o IdentitiesOnly=yes -J root@192.168.168.21 -L 3389:127.0.0.1:3389 markv@192.168.168.24 -N
```

Then connect your RDP client (Microsoft Remote Desktop) to `localhost:3389`.

## **Keeping Tunnels Alive**

SSH tunnels (especially through Cloudflare) drop due to idle timeouts. Add keepalives to prevent this:

```bash
# Add these flags to any SSH tunnel command:
#   -o ServerAliveInterval=30    (send keepalive every 30s)
#   -o ServerAliveCountMax=3     (disconnect after 3 missed keepalives)

# Example: Autumn Control UI tunnel with keepalive
ssh -o IdentitiesOnly=yes -o ServerAliveInterval=30 -o ServerAliveCountMax=3 \
    -L 18789:127.0.0.1:18789 markv@192.168.168.26 -N
```

For tunnels that auto-reconnect when they die, use `autossh`:

```bash
brew install autossh

# autossh restarts the tunnel automatically on disconnect
autossh -M 0 -o IdentitiesOnly=yes -o ServerAliveInterval=30 -o ServerAliveCountMax=3 \
    -L 18789:127.0.0.1:18789 markv@192.168.168.26 -N
```

When colocated, always use direct LAN IPs instead of `-J gpumonster` to avoid Cloudflare's idle timeout entirely.

## **Maintenance**

- If `platform.chatgenii.com` or `ssh gpumonster` stops working, check the `cloudflared` service status on the host:
  `ssh 192.168.168.21 "systemctl status cloudflared"`
- The tunnel configuration lives on GPUMonster at: `/etc/cloudflared/config.yml`

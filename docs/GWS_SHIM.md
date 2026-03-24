# Google Workspace Shim Architecture

## Overview

Controlled Google Workspace access for OpenClaw agents via a policy-enforcing FastAPI shim (`gws_shim`). Both `gws` CLI and the shim run at the host layer on the nemoclaw VM (192.168.168.26), outside the OpenShell agent sandbox.

## Layer Model

1. **Nemoclaw VM host** - gws CLI, gws_shim service, credentials, audit logs
2. **OpenShell sandbox** - OpenClaw agent, can only reach shim via localhost:8100
3. **Agent** - calls shim actions, never sees gws directly

## Flow

```
Agent (in sandbox)
  -> POST localhost:8100/api/v1/action
    -> gws_shim validates agent + action + payload
      -> shim enforces policy (domains, rates, drives)
        -> shim invokes gws CLI (subprocess, no shell=True)
          -> returns structured JSON response
```

## Security Principles

- Agents never call `gws` directly - shim is the only interface
- Server-side policy enforcement (no prompt trust)
- Per-agent authorization with action allowlists
- Recipient domain restrictions for outbound email
- Shared drive ID restrictions for Drive operations
- Rate limiting (per-hour, per-day)
- Deduplication window for sends
- Append-only audit logging (JSONL)
- Credentials stored at host layer, inaccessible to sandbox

## API Surface

All requests go to `POST /api/v1/action`:

```json
{
  "agent_id": "my-assistant",
  "action": "gmail_send_email",
  "payload": {
    "to": "user@autom8ly.com",
    "subject": "...",
    "body": "..."
  }
}
```

### Supported Actions

| Action                    | Description   | Key Policy                                 |
| ------------------------- | ------------- | ------------------------------------------ |
| `gmail_send_email`        | Send email    | Domain-restricted recipients, rate-limited |
| `gmail_check_email`       | Check inbox   | Mailbox restricted, query validation       |
| `drive_list_files`        | List files    | Restricted to allowed drive IDs            |
| `drive_get_file_metadata` | Get file info | File must belong to allowed drive          |
| `drive_search_files`      | Search files  | Search restricted to allowed drives        |

## Deployment

- Service: `/opt/gws_shim/` on nemoclaw VM
- Config: `/opt/gws_shim/config.yaml`
- Audit log: `/var/log/gws_shim/audit.jsonl`
- Systemd: `gws_shim.service`
- Bind: `127.0.0.1:8100`

## Policy Configuration

```yaml
shim:
  bind: "127.0.0.1"
  port: 8100
  audit_log: "/var/log/gws_shim/audit.jsonl"
  gws_path: "/usr/local/bin/gws"

agents:
  my-assistant:
    actions:
      - gmail_send_email
      - gmail_check_email
      - drive_list_files
      - drive_get_file_metadata
      - drive_search_files
    allowed_recipient_domains:
      - autom8ly.com
      - chatgenii.com
    allowed_drive_ids: []
    rate_limits:
      gmail_send_email:
        per_hour: 10
        per_day: 50
      gmail_check_email:
        per_hour: 30
        per_day: 200
    gmail_account: "autumn@autom8ly.com"
```

## Response Format

Success:

```json
{
  "ok": true,
  "action": "gmail_send_email",
  "request_id": "req_abc123",
  "result": { "message_id": "msg_xyz" }
}
```

Denied:

```json
{
  "ok": false,
  "action": "gmail_send_email",
  "request_id": "req_abc124",
  "error": "recipient_domain_not_allowed"
}
```

## Audit Log Format

Each line in `/var/log/gws_shim/audit.jsonl`:

```json
{
  "timestamp": "2026-03-22T18:00:00Z",
  "request_id": "req_abc123",
  "agent_id": "my-assistant",
  "action": "gmail_send_email",
  "payload_summary": { "to": "user@autom8ly.com", "subject": "..." },
  "decision": "allow",
  "reason": null,
  "gws_exit_code": 0,
  "duration_ms": 1234
}
```

## GWS CLI Reference

The `gws` CLI (`@googleworkspace/cli`) uses a REST-style interface:

```bash
# Gmail
gws gmail users messages list --params '{"userId": "me", "maxResults": 10}'
gws gmail users messages send --params '{"userId": "me"}' --json '{"raw": "base64..."}'

# Drive
gws drive files list --params '{"pageSize": 10, "driveId": "...", "corpora": "drive"}'
gws drive files get --params '{"fileId": "abc123"}'
```

## Non-Goals

- No arbitrary Google Workspace API passthrough
- No generic CLI passthrough
- No prompt-based security enforcement
- No reliance on OAuth scopes alone for drive isolation

## Future Expansion

- GChat send/receive actions
- Calendar read/create actions
- Human-in-the-loop approval for sensitive actions
- Webhook/callback support for async operations
- Additional agent profiles with different permission sets

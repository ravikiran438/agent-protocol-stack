---
title: For A2A Developers
description: How to declare all four protocol extensions on a single AgentCard.
---

## AgentCard with All Four Extensions

All four protocols use the standard A2A `capabilities.extensions`
mechanism. An agent that supports all four declares them in a single
array:

```json
{
  "name": "service-provider-agent",
  "version": "1.0",
  "capabilities": {
    "extensions": [
      {
        "uri": "https://github.com/ravikiran438/agent-consent-protocol/v1",
        "description": "ACAP: usage-policy consent and per-action adherence.",
        "required": true
      },
      {
        "uri": "https://github.com/ravikiran438/phala-protocol/v1",
        "description": "Phala: principal-declared welfare feedback.",
        "required": false
      },
      {
        "uri": "https://github.com/ravikiran438/pratyahara-nerve/v1",
        "description": "NERVE: behavioral integrity monitoring.",
        "required": true
      },
      {
        "uri": "https://github.com/ravikiran438/sauvidya-pace/v1",
        "description": "PACE: principal accessibility and capacity.",
        "required": true
      }
    ]
  }
}
```

### Why some are `required: true`

| Protocol | Default | Reason |
|---|---|---|
| ACAP | `true` | Callee wants callers to accept usage policy before invoking skills |
| Phala | `false` | Welfare feedback is advisory (BU-3: agents MAY ignore BeliefUpdates) |
| NERVE | `true` | Security layer: callee expects callers to participate in the trust envelope |
| PACE | `true` | Agents serving principals with registered PCPs MUST adapt interaction |

### Agents that support fewer protocols

An agent can declare any subset. A deployment that only needs consent:

```json
{
  "capabilities": {
    "extensions": [
      {
        "uri": "https://github.com/ravikiran438/agent-consent-protocol/v1",
        "description": "ACAP: usage-policy consent and per-action adherence.",
        "required": true
      }
    ]
  }
}
```

Agents that do not understand an extension ignore the entry. No error,
no failure, no negotiation. The extensions are additive.

## Advertising Protocol Support in an MCP Handshake

For MCP tool servers whose agent supports one or more of the four
protocols, each protocol registers as a custom server capability in
the `serverCapabilities` object during the `initialize` handshake,
keyed by the same extension URI used on the A2A AgentCard:

```json
{
  "serverCapabilities": {
    "tools": {},
    "https://github.com/ravikiran438/pratyahara-nerve/v1": {
      "neuron_type": "processing",
      "behavioral_fingerprint": "sha256:...",
      "trust_score": 0.88
    },
    "https://github.com/ravikiran438/sauvidya-pace/v1": {
      "supported_modalities": ["voice", "text"],
      "supported_languages": ["en", "te", "hi"]
    }
  }
}
```

## MCP Reference Servers

Each protocol ships a reference [Model Context Protocol](https://modelcontextprotocol.io/)
server that exposes its validators as MCP tools. All four use stdio
transport and work with any MCP-compatible client; the configuration
below uses VSCode's native MCP settings, and the same console script
binds to any stdio-capable host. The pattern is identical across
repos; each stays independently installable with no shared package.

| Protocol | Console script | Tools exposed | Purpose |
|---|---|---|---|
| ACAP | `acap-mcp` | 8 | Core validators + one primary entry point per extension (governance tiering, category preferences, regulatory context, audit projection) |
| Phala | `phala-mcp` | 6 | The five primitive validators plus the BU-Privacy invariant check |
| NERVE | `nerve-mcp` | 10 | Seven Core safety invariants (N-1, N-3, N-4, N-5, N-9, N-14, N-15) plus three Yathartha extension invariants (N-16, N-17, N-18) for capability-surface integrity |
| PACE | `pace-mcp` | 6 | The six named accessibility invariants (IM-1, IM-2, CCC-1, CCC-2, AIC-1, AIC-2) |

### Install

Two paths depending on whether you are consuming or contributing.

**For end users (no clone, ephemeral with `uvx`):**

```bash
uvx --from 'acap[mcp] @ git+https://github.com/ravikiran438/agent-consent-protocol.git@v0.1.0' acap-mcp
uvx --from 'phala[mcp] @ git+https://github.com/ravikiran438/phala-protocol.git@v0.1.0' phala-mcp
uvx --from 'nerve[mcp] @ git+https://github.com/ravikiran438/pratyahara-nerve.git@v0.1.0' nerve-mcp
uvx --from 'pace[mcp] @ git+https://github.com/ravikiran438/sauvidya-pace.git@v0.1.0' pace-mcp
```

**For end users (persistent, into an existing venv):**

```bash
pip install 'acap[mcp] @ git+https://github.com/ravikiran438/agent-consent-protocol.git@v0.1.0'
# substitute phala/nerve/pace as needed
```

**For contributors (clone + editable install):**

```bash
git clone https://github.com/ravikiran438/agent-consent-protocol.git
cd agent-consent-protocol
pip install -e '.[mcp]'
```

Any of the three paths registers the appropriate `<name>-mcp` console
script in the active Python environment.

### VSCode MCP config

Add this to `.vscode/mcp.json` at your workspace root (or configure
globally via your VSCode user settings, under the MCP section). Only
include the servers you need.

**Option A — `uvx` from git URLs (no persistent install required):**

```json
{
  "servers": {
    "acap": {
      "type": "stdio",
      "command": "uvx",
      "args": [
        "--from",
        "acap[mcp] @ git+https://github.com/ravikiran438/agent-consent-protocol.git@v0.1.0",
        "acap-mcp"
      ]
    },
    "phala": {
      "type": "stdio",
      "command": "uvx",
      "args": [
        "--from",
        "phala[mcp] @ git+https://github.com/ravikiran438/phala-protocol.git@v0.1.0",
        "phala-mcp"
      ]
    },
    "nerve": {
      "type": "stdio",
      "command": "uvx",
      "args": [
        "--from",
        "nerve[mcp] @ git+https://github.com/ravikiran438/pratyahara-nerve.git@v0.1.0",
        "nerve-mcp"
      ]
    },
    "pace": {
      "type": "stdio",
      "command": "uvx",
      "args": [
        "--from",
        "pace[mcp] @ git+https://github.com/ravikiran438/sauvidya-pace.git@v0.1.0",
        "pace-mcp"
      ]
    }
  }
}
```

**Option B — absolute paths to pre-installed binaries:**

```json
{
  "servers": {
    "acap": {
      "type": "stdio",
      "command": "/absolute/path/to/agent-consent-protocol/.venv/bin/acap-mcp"
    },
    "phala": {
      "type": "stdio",
      "command": "/absolute/path/to/phala-protocol/.venv/bin/phala-mcp"
    },
    "nerve": {
      "type": "stdio",
      "command": "/absolute/path/to/pratyahara-nerve/.venv/bin/nerve-mcp"
    },
    "pace": {
      "type": "stdio",
      "command": "/absolute/path/to/sauvidya-pace/.venv/bin/pace-mcp"
    }
  }
}
```

Reload the workspace. The tools appear in any MCP-aware VSCode
extension grouped by server name. Other MCP hosts accept the same
console-script paths under their own configuration conventions.

### Tool-naming convention

Every tool is named `validate_<invariant>` and takes a JSON payload
of the primitive(s) it operates on. Output is a JSON object with
`{"ok": true, ...}` on success or `{"ok": false, "error": "..."}` on
invariant failure. A malformed input (not a structural invariant
failure) surfaces as an MCP protocol error rather than an `ok=false`
response.

See each server's `src/<package>/mcp_server/README.md` for the full
tool schema and per-tool examples.

## Companion Repositories

| Protocol | Package | Tests | TLA+ |
|---|---|---|---|
| ACAP | [agent-consent-protocol](https://github.com/ravikiran438/agent-consent-protocol) | 128 (Core + 4 extensions + MCP) | Full state machine |
| Phala | [phala-protocol](https://github.com/ravikiran438/phala-protocol) | 27 (Core + MCP) | Skeleton |
| NERVE | [pratyahara-nerve](https://github.com/ravikiran438/pratyahara-nerve) | 94 (Core + Yathartha + MCP) | Full state machine (Core + Yathartha) |
| PACE | [sauvidya-pace](https://github.com/ravikiran438/sauvidya-pace) | 55 (Core + MCP) | Full state machine |

Total: **304 tests** across the stack.

## Papers

| Protocol | DOI |
|---|---|
| Anumati / ACAP | [10.5281/zenodo.19606339](https://doi.org/10.5281/zenodo.19606339) |
| Phala | [10.5281/zenodo.19625612](https://doi.org/10.5281/zenodo.19625612) |
| Pratyahara / NERVE | [10.5281/zenodo.19628589](https://doi.org/10.5281/zenodo.19628589) |
| Sauvidya / PACE | [10.5281/zenodo.19633139](https://doi.org/10.5281/zenodo.19633139) |
| Yathartha (NERVE extension) | [10.5281/zenodo.19659633](https://doi.org/10.5281/zenodo.19659633) |

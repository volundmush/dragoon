# SurrealDB Development Setup

This project runs SurrealDB and the official SurrealDB MCP server through Docker
Compose.

## Environment Files

`.env` contains safe development defaults and is committed to the repo.

`.env.local` is ignored by git and is for local overrides, secrets, alternate
ports, or machine-specific settings.

Use `.env.local` for values like:

```sh
SURREALDB_PASS=your-local-password
SURREAL_PASS=your-local-password
SURREALDB_PORT=18000
SURREALMCP_PORT=18080
```

The Deno Docker tasks load `.env` first and `.env.local` second when
`.env.local` exists, so local values override committed defaults.

## Services

`surrealdb` runs SurrealDB 3.x from `surrealdb/surrealdb:v3`.

`surrealmcp` runs the official SurrealDB MCP server from
`surrealdb/surrealmcp:latest`.

The default development namespace and database are:

```txt
namespace: dragoon
database: dev
```

## Commands

Start SurrealDB and SurrealMCP:

```sh
deno task db:up
```

Stop them:

```sh
deno task db:down
```

Open a SurrealQL shell:

```sh
deno task db:sql
```

Watch database and MCP logs:

```sh
deno task db:logs
```

Check SurrealDB readiness:

```sh
deno task db:ready
```

## MCP

MCP means Model Context Protocol. It is a standard way for AI tools to talk to
external systems through controlled tools.

The SurrealDB MCP server is not part of your application. It is a helper service
for AI clients. In this project it connects to the local `surrealdb` Compose
service and exposes MCP over HTTP at:

```txt
http://localhost:8080
```

Inside Docker Compose, it connects to SurrealDB at:

```txt
ws://surrealdb:8000/rpc
```

If an AI client supports HTTP MCP servers, point it at `http://localhost:8080`.
If an AI client only supports stdio MCP servers, configure it to run the
official Docker image directly:

```sh
docker run --rm -i --pull always \
  --env SURREALDB_URL=ws://host.docker.internal:8000/rpc \
  --env SURREALDB_NS=dragoon \
  --env SURREALDB_DB=dev \
  --env SURREALDB_USER=root \
  --env SURREALDB_PASS=root \
  surrealdb/surrealmcp:latest start
```

Use `host.docker.internal` when the MCP container is launched outside the
Compose network and needs to reach SurrealDB through the host-published port.

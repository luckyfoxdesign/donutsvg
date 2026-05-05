# Agent Instructions

## Command Execution

All project-related commands must be run inside the Docker Compose container.

This includes package manager commands, dependency installation, dev server startup, builds, tests, linting, formatting, and any other project tooling.

Use the existing Compose service:

```sh
docker compose run --rm s_svelteapp <command>
```

Examples:

```sh
docker compose run --rm s_svelteapp npm ci
docker compose run --rm s_svelteapp npm run build
docker compose run --rm s_svelteapp npm run dev
```

Do not run `npm`, `node`, `vite`, or other project tooling directly on the host machine.


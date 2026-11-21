# Concrete Contractors Estimator (Docker)

A tiny self-hosted web app and JSON API for the take-off concrete contractors do before a pour:
cubic yards with waste, ready-mix order quantity, 80/60/40 lb bag counts, rebar or mesh for slabs,
a rough installed cost range and a hot-weather pour plan. Node 22 on Alpine, no dependencies, runs as
the unprivileged `node` user.

```bash
docker run --rm -p 8080:8080 iamnazzal/concrete-contractors-estimator
# open http://localhost:8080
```

## API

| Endpoint | Example |
|---|---|
| `GET /api/estimate` | `/api/estimate?shape=slab&length=20&width=10&thickness=4&finish=stamped` |
| | `/api/estimate?shape=footing&length=40&width=12&depth=12` |
| | `/api/estimate?shape=column&diameter=12&height=4&count=4` |
| | `/api/estimate?shape=steps&steps=3&rise=7&run=11&width=4` |
| `GET /api/pour` | `/api/pour?high=108&month=7` |
| `GET /healthz` | returns `ok` |

Optional: `waste` (fraction, default 0.10), `spacing` (rebar inches, default 18), `removeOld=true`.

```json
{"shape":"slab","rebar":{"barsAlongLength":7,"barsAlongWidth":14,"linearFeet":280,"sticks20":16},"meshSheets":5,
 "cost":{"low":2400,"high":4000,"currency":"USD"},"cubicFeet":73.33,"cubicYards":2.72,"orderYards":2.75,
 "bags80":123,"bags60":163,"bags40":245,"suggestion":"ready-mix"}
```

Tags: `1.0.0`, `latest` (linux/amd64 and linux/arm64). Cost figures are planning numbers, not a quote.

## Links

- Driveways, patios, stamped concrete and repairs planned for desert heat, from a [Phoenix concrete company](https://concretecontractorsphoenix.net/).
- Source: https://github.com/nbkdevs/concrete-contractors-phoenix/tree/main/packages/docker

MIT licensed.

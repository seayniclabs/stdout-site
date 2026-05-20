# stdout-site

Product page + community library for [stdout.seayniclabs.com](https://stdout.seayniclabs.com).

- **Product page** — marketing for StdOut + Windlass
- **Library** — `GET /library/api/sync`, `POST /library/api/submit`, browsable UI
- **Admin** — `/admin` submission review (env credentials)

License/update checks live on **store.seayniclabs.com** — not this service.

## Quick start

```bash
cp .env.example .env   # set ADMIN_EMAIL / ADMIN_PASSWORD
npm install && npm run build
docker compose up -d
curl http://localhost:8114/healthz
curl "http://localhost:8114/library/api/sync?since_version=0"
```

## Ports

| Service | Host port |
|---------|-----------|
| stdout-site (nginx) | **8114** |
| navhome-site (moved) | **8124** |

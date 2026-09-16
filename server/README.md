# Planner sync

The backend for the handwriting planner at `alexschuller.com/planner`.

It is intentionally small: a JSON document per day, stored in Postgres, behind a
bearer token. It does no merging — the browser does that, because the browser is
the only place that knows which strokes were just drawn. If this service is
down, the planner keeps working offline and catches up later.

## Setup

```bash
createdb planner                      # or use an existing database
psql planner < schema.sql

python -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
```

Generate a token per person — long and random, not a memorable password:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Running

```bash
export DATABASE_URL="postgresql://planner:...@localhost/planner"
export PLANNER_TOKENS="alex:PASTE_THE_TOKEN"
export ALLOWED_ORIGINS="https://alexschuller.com"

gunicorn -w 2 -b 127.0.0.1:8099 app:app
```

Same shape as any other Flask service here — systemd unit, reverse proxy in
front, done.

## The reverse proxy

It must be HTTPS with a real certificate. The planner is served over HTTPS and
browsers refuse to let an HTTPS page call a plain HTTP address — it fails
silently, which is unpleasant to debug. A bare IP or a `192.168.x.x` address
won't do either; it needs a hostname on a certificate.

Caddy, which handles the certificate itself:

```
planner.example.com {
    reverse_proxy 127.0.0.1:8099
}
```

nginx, assuming certbot has already issued the certificate:

```nginx
server {
    listen 443 ssl;
    server_name planner.example.com;

    ssl_certificate     /etc/letsencrypt/live/planner.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/planner.example.com/privkey.pem;

    client_max_body_size 4m;

    location / {
        proxy_pass http://127.0.0.1:8099;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Do **not** add CORS headers at the proxy — the app already sends them, and two
sets of `Access-Control-Allow-Origin` makes browsers reject the response.

## Checking it

```bash
curl https://planner.example.com/api/health
# {"ok":true}

curl -H "Authorization: Bearer $TOKEN" https://planner.example.com/api/days
# {"days":[],"now":...}
```

## Notes

- No secrets live in this repository. The token and the database URL come from
  the environment, which is why this code is safe to publish.
- Every write is keyed `(owner, ymd)` and refuses to overwrite a newer row, so a
  late-arriving save from a device that was offline can't clobber a fresh one.
- Adding a second person is one more `owner:token` pair in `PLANNER_TOKENS`;
  their rows are separated by the `owner` column.
- Backups are ordinary `pg_dump`.

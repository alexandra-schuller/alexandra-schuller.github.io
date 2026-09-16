"""Planner sync — a deliberately boring store for the planner's pages.

The browser cannot speak to Postgres directly, so this sits between them. It is
the whole backend, and it is meant to stay this dull: it stores a JSON document
per day and hands it back. It never inspects a stroke, never merges anything,
and has no opinion about handwriting. All of that already happens in the
browser, which is the only place that knows what the user just drew.

Routes
    GET  /api/health              -- is it up
    GET  /api/days?since=<ms>     -- every page changed since a timestamp
    PUT  /api/days/<YYYY-MM-DD>   -- store one page
    DELETE /api/days/<YYYY-MM-DD> -- forget one page

Auth is a single bearer token per person, compared in constant time. That is
proportionate for a household planner: it is not a password anyone types, it is
a long random string pasted into each browser once. Rotating it is a matter of
changing the environment variable and pasting the new one.

Environment
    DATABASE_URL     postgresql://user:pass@host/dbname
    PLANNER_TOKENS   owner:token pairs, comma separated
                     e.g. "alex:s7Kq...,lindsay:9fRm..."
    ALLOWED_ORIGINS  comma separated, e.g. "https://alexschuller.com"
"""

import hmac
import json
import os
import time

import psycopg
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool
from flask import Flask, jsonify, request, make_response

app = Flask(__name__)

MAX_BODY = 2 * 1024 * 1024          # a very full page of ink is tens of KB
app.config["MAX_CONTENT_LENGTH"] = MAX_BODY

DATABASE_URL = os.environ["DATABASE_URL"]
ALLOWED_ORIGINS = [o.strip() for o in
                   os.environ.get("ALLOWED_ORIGINS", "").split(",") if o.strip()]

def _load_tokens():
    """owner:token,owner:token -> {token: owner}"""
    out = {}
    for pair in os.environ.get("PLANNER_TOKENS", "").split(","):
        pair = pair.strip()
        if not pair or ":" not in pair:
            continue
        owner, token = pair.split(":", 1)
        if len(token) < 24:
            raise SystemExit("token for %r is too short to be worth having" % owner)
        out[token] = owner
    if not out:
        raise SystemExit("set PLANNER_TOKENS, or nobody can sign in")
    return out

TOKENS = _load_tokens()

pool = ConnectionPool(DATABASE_URL, min_size=1, max_size=4, kwargs={"row_factory": dict_row})


# ---------------------------------------------------------------- auth

def owner_for(req):
    """The owner this request proves it is, or None.

    Compared with compare_digest so a wrong token takes the same time as a
    right one and can't be discovered a character at a time.
    """
    header = req.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None
    offered = header[7:].strip()
    for token, owner in TOKENS.items():
        if hmac.compare_digest(offered, token):
            return owner
    return None


def deny():
    return make_response(jsonify(error="not authorised"), 401)


# ---------------------------------------------------------------- CORS
# The planner is served from alexschuller.com and this runs on another host, so
# every response needs to say which origin may read it. The Authorization
# header makes browsers send a preflight first, so OPTIONS must be answered too.

@app.after_request
def cors(resp):
    origin = request.headers.get("Origin")
    if origin and origin in ALLOWED_ORIGINS:
        resp.headers["Access-Control-Allow-Origin"] = origin
        resp.headers["Vary"] = "Origin"
        resp.headers["Access-Control-Allow-Methods"] = "GET, PUT, DELETE, OPTIONS"
        resp.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        resp.headers["Access-Control-Max-Age"] = "86400"
    return resp


@app.route("/api/<path:_any>", methods=["OPTIONS"])
def preflight(_any):
    return make_response("", 204)


# ---------------------------------------------------------------- routes

@app.get("/api/health")
def health():
    with pool.connection() as conn:
        conn.execute("select 1")
    return jsonify(ok=True)


@app.get("/api/days")
def list_days():
    owner = owner_for(request)
    if not owner:
        return deny()
    try:
        since = int(request.args.get("since", 0))
    except ValueError:
        since = 0

    with pool.connection() as conn:
        rows = conn.execute(
            "select ymd, doc, updated from planner_days"
            " where owner = %s and updated > %s order by ymd",
            (owner, since),
        ).fetchall()

    return jsonify(
        days=[r["doc"] for r in rows],
        now=int(time.time() * 1000),
    )


@app.put("/api/days/<ymd>")
def put_day(ymd):
    owner = owner_for(request)
    if not owner:
        return deny()
    if not _valid_ymd(ymd):
        return make_response(jsonify(error="bad date"), 400)

    doc = request.get_json(silent=True)
    if not isinstance(doc, dict):
        return make_response(jsonify(error="expected a JSON object"), 400)

    # Trust the client's own date over the URL for what goes in the document,
    # but key the row on the URL either way.
    doc["ymd"] = ymd
    updated = doc.get("updated")
    if not isinstance(updated, int):
        updated = int(time.time() * 1000)
        doc["updated"] = updated

    with pool.connection() as conn:
        conn.execute(
            "insert into planner_days (owner, ymd, doc, updated)"
            " values (%s, %s, %s, %s)"
            " on conflict (owner, ymd) do update"
            "   set doc = excluded.doc, updated = excluded.updated"
            "   where excluded.updated >= planner_days.updated",
            (owner, ymd, json.dumps(doc), updated),
        )
    return jsonify(ok=True, updated=updated)


@app.delete("/api/days/<ymd>")
def delete_day(ymd):
    owner = owner_for(request)
    if not owner:
        return deny()
    if not _valid_ymd(ymd):
        return make_response(jsonify(error="bad date"), 400)
    with pool.connection() as conn:
        conn.execute("delete from planner_days where owner = %s and ymd = %s", (owner, ymd))
    return jsonify(ok=True)


def _valid_ymd(s):
    if len(s) != 10 or s[4] != "-" or s[7] != "-":
        return False
    y, m, d = s[:4], s[5:7], s[8:10]
    return y.isdigit() and m.isdigit() and d.isdigit() and "01" <= m <= "12" and "01" <= d <= "31"


@app.errorhandler(413)
def too_big(_e):
    return make_response(jsonify(error="that page is too large"), 413)


if __name__ == "__main__":
    # Development only. In production put it behind gunicorn, the way his other
    # Flask services already run.
    app.run(host="127.0.0.1", port=8099, debug=False)

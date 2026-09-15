#!/usr/bin/env python
"""Build the Sunrise pages.

One app, several places. The CSS and JS live once in lib/; this inlines them
into a self-contained page per location, because each app folder needs its own
service worker and a worker can only cache files inside its own folder.

Edit lib/sunrise.js or lib/sunrise.css, then run:
    python lib/build_sunrise.py
"""

import io, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIB = os.path.join(ROOT, "lib")

SITES = [
    {
        "dir": "sunrise",
        "title": "Sunrise",
        "place": "Montréal, QC",
        "config": {
            "lat": 45.5019, "lon": -73.5674, "tz": "America/Montreal",
            "storeKey": "sunrise:last",
            "tiles": ["now", "uv", "wind", "humidity", "air", "pollen", "moon"],
            "apps": [
                {"name": "The Planner", "blurb": "One day per page, written by hand.",
                 "href": "/planner/", "accent": "--pine", "tint": "--t-pine", "edge": "#CFE0D6"},
                {"name": "Strong Woman", "blurb": "What you're lifting today.",
                 "accent": "--rose", "tint": "--t-rose", "edge": "#F0D3D7"},
                {"name": "The Closet", "blurb": "Everything you own, and what goes together.",
                 "href": "/closet/", "accent": "--clay", "tint": "--t-clay", "edge": "#EFD5CA"},
                {"name": "Morning Routine", "blurb": "How the day starts.",
                 "accent": "--butter", "tint": "--t-butter", "edge": "#EFE0B6"},
                {"name": "Bedtime Routine", "blurb": "How it winds down.",
                 "accent": "--peri", "tint": "--t-peri", "edge": "#D6DAF0"},
            ],
        },
    },
    {
        # No app tiles here, so the grid is filled with readings instead —
        # twelve either way, which divides evenly on a laptop, tablet and phone.
        "dir": "lindsaysunrise",
        "title": "Sunrise",
        "place": "Aylmer, Gatineau, QC",
        "config": {
            "lat": 45.3946, "lon": -75.8453, "tz": "America/Toronto",
            "storeKey": "lindsaysunrise:last",
            "tiles": ["now", "feels", "uv", "wind", "humidity", "dew",
                      "air", "cloud", "rain", "pressure", "pollen", "moon"],
            "apps": [],
        },
    },
]


def main():
    css = io.open(os.path.join(LIB, "sunrise.css"), encoding="utf-8").read()
    js = io.open(os.path.join(LIB, "sunrise.js"), encoding="utf-8").read()
    tpl = io.open(os.path.join(LIB, "sunrise.template.html"), encoding="utf-8").read()

    for site in SITES:
        n = len(site["config"]["tiles"]) + len(site["config"]["apps"])
        if n != 12:
            raise SystemExit("%s has %d tiles; the grid wants 12" % (site["dir"], n))

        page = (tpl
                .replace("__CSS__", css.rstrip("\n"))
                .replace("__CONFIG__", json.dumps(site["config"], ensure_ascii=False, indent=2))
                .replace("__JS__", js.rstrip("\n"))
                .replace("__PLACE__", site["place"])
                .replace("__TITLE__", site["title"]))

        left = re.findall(r"__[A-Z]+__", page)
        if left:
            raise SystemExit("unreplaced tokens in %s: %s" % (site["dir"], set(left)))

        out = os.path.join(ROOT, site["dir"], "index.html")
        io.open(out, "w", encoding="utf-8", newline="").write(page)
        print("wrote %s  (%d tiles, %d bytes)" % (out, n, len(page)))


if __name__ == "__main__":
    main()

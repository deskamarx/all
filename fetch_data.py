import urllib.request
import ssl
import json
import csv
import io

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

sources = [
    {
        "id": "NW",
        "docId": "1mop7ZAi0wxPjLmz-Fxc8u0vBKA9gtglrvO234QTEXDo",
        "gid": "929163505",
        "name": "Nazrul Wing"
    },
    {
        "id": "CASH",
        "docId": "1HjbDxsXofIz_qmpK9RyEIDR60O0Pj8uuAfoTTZPDFCc",
        "gid": "0",
        "name": "Cash Accounts"
    },
    {
        "id": "UNO",
        "docId": "1bqkVehJun-96yjFNrJRw9S89e3YSjt1pu8e6d0x07bk",
        "gid": "1618809603",
        "name": "UNO Yeasin Workstation"
    },
    {
        "id": "ALPANA",
        "docId": "1gimiqrecqXwGxTaFjpcprgU6ZvMaMZKYN44599K62cY",
        "gid": "0",
        "name": "Alpana Cash"
    }
]

for src in sources:
    url = f"https://docs.google.com/spreadsheets/d/{src['docId']}/export?format=csv&gid={src['gid']}"
    print(f"Fetching {src['name']} from {url}...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx) as response:
            content = response.read().decode('utf-8', errors='ignore')
            lines = content.splitlines()
            print(f"  Success! Received {len(lines)} lines.")
            print(f"  Header: {lines[0] if lines else 'EMPTY'}")
            # Save raw file
            with open(f"public/data/raw_{src['id']}.csv", "w", encoding="utf-8") as f:
                f.write(content)
    except Exception as e:
        print(f"  Failed: {e}")

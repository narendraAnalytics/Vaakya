"""
Seed clause_library table with BGE embeddings from local JSON files.
Run once: uv run python scripts/seed_clauses.py
"""

import json
import sys
from pathlib import Path

# Add backend root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env")

from services.supabase_client import get_supabase
from services.embeddings import embed

CLAUSE_DIR = Path(__file__).parent.parent / "clause_library"

# JSON field → table column
DOC_TYPE_MAP = {
    "nda.json": "NDA",
    "vendor_agreement.json": "Vendor Agreement",
    "employment_agreement.json": "Employment Contract",
    "service_agreement.json": "Service Agreement",
    "lease_agreement.json": "Lease Agreement",
    "partnership_deed.json": "Partnership Deed",
}

def main():
    supabase = get_supabase()

    # Clear existing rows so re-runs are idempotent
    supabase.table("clause_library").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    print("Cleared existing clause_library rows.")

    total = 0
    for fname, doc_type in DOC_TYPE_MAP.items():
        fpath = CLAUSE_DIR / fname
        if not fpath.exists():
            print(f"  SKIP {fname} (not found)")
            continue

        clauses = json.loads(fpath.read_text(encoding="utf-8"))
        rows = []
        for c in clauses:
            text = c.get("clause_text", "").strip()
            if not text:
                continue
            vec = embed(text)
            rows.append({
                "document_type": doc_type,
                "clause_name": c.get("clause_type", "unknown"),
                "clause_text": text,
                "jurisdiction": c.get("jurisdiction", "India"),
                "embedding": vec,
            })

        if rows:
            supabase.table("clause_library").insert(rows).execute()
            print(f"  {doc_type}: {len(rows)} clauses inserted")
            total += len(rows)

    print(f"\nDone — {total} clauses seeded into clause_library.")

if __name__ == "__main__":
    main()

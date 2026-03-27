"""Property-based tests for B2B form validation (task 9.3).

Feature: phase-1-foundation
Properties 7 (B2B), 8 (B2B), 10 — missing required fields, extended field round-trip,
and message length enforcement.
"""
import sqlite3
import sys
import os
import tempfile
import unittest
from unittest import mock

# Patch resend before importing app so the module-level import doesn't fail.
sys.modules['resend'] = mock.MagicMock()
os.environ.setdefault('RESEND_API_KEY', 'test')

import app as flask_app

from hypothesis import given, settings
from hypothesis import strategies as st

client = flask_app.app.test_client()

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _fresh_db():
    f = tempfile.NamedTemporaryFile(suffix='.db', delete=False)
    f.close()
    return f.name


def _safe_unlink(path):
    try:
        os.unlink(path)
    except (PermissionError, OSError):
        pass


def _get_leads():
    with sqlite3.connect(flask_app.DB_NAME) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute("SELECT * FROM business_leads").fetchall()
        return [dict(r) for r in rows]


# ---------------------------------------------------------------------------
# Strategies
# ---------------------------------------------------------------------------

_COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-1000", "1000+"]
_INDUSTRIES = ["Technology", "Healthcare", "Finance", "E-commerce", "Education", "Other"]
_BUDGET_RANGES = ["Under $5K", "$5K-$25K", "$25K-$100K", "$100K+"]
_TIMELINES = ["Immediately", "Within 1 month", "1-3 months", "3-6 months", "Exploring options"]
_REFERRAL_SOURCES = ["LinkedIn", "Google Search", "Referral", "Social Media", "Other"]

B2B_REQUIRED_FIELDS = [
    "companyName", "contactName", "email", "projectType",
    "phone", "companySize", "industry", "budgetRange", "timeline", "referralSource",
]


def _base_b2b_payload():
    """Return a fixed valid B2B payload dict."""
    return {
        "companyName": "Acme Corp",
        "contactName": "John Smith",
        "email": "john@acme.com",
        "projectType": "Data Annotation",
        "phone": "+15550009999",
        "companySize": "11-50",
        "industry": "Technology",
        "budgetRange": "$5K-$25K",
        "timeline": "Within 1 month",
        "referralSource": "LinkedIn",
    }


def valid_b2b_payload():
    """Strategy generating valid /api/b2b/apply payloads with all required fields."""
    return st.fixed_dictionaries({
        "companyName": st.text(
            alphabet=st.characters(whitelist_categories=("Lu", "Ll", "Nd"), whitelist_characters=" &.,-"),
            min_size=1,
            max_size=100,
        ).filter(lambda s: s.strip()),
        "contactName": st.text(
            alphabet=st.characters(whitelist_categories=("Lu", "Ll"), whitelist_characters=" "),
            min_size=1,
            max_size=80,
        ).filter(lambda s: s.strip()),
        "email": st.emails(),
        "projectType": st.text(min_size=1, max_size=100).filter(lambda s: s.strip()),
        "phone": st.from_regex(r"\+1555[0-9]{7}", fullmatch=True),
        "companySize": st.sampled_from(_COMPANY_SIZES),
        "industry": st.sampled_from(_INDUSTRIES),
        "budgetRange": st.sampled_from(_BUDGET_RANGES),
        "timeline": st.sampled_from(_TIMELINES),
        "referralSource": st.sampled_from(_REFERRAL_SOURCES),
    })


def b2b_payload_missing_one_required_field():
    """Strategy that generates a valid B2B payload with exactly one required field removed."""
    return (
        st.sampled_from(B2B_REQUIRED_FIELDS)
        .flatmap(lambda field: valid_b2b_payload().map(
            lambda payload: {k: v for k, v in payload.items() if k != field}
        ))
    )


# ---------------------------------------------------------------------------
# Test class
# ---------------------------------------------------------------------------

class TestB2BValidationProperties(unittest.TestCase):

    def setUp(self):
        self.db = _fresh_db()
        flask_app.DB_NAME = self.db
        flask_app.init_db()
        flask_app.migrate_db()

    def tearDown(self):
        _safe_unlink(self.db)

    # **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6**
    @given(b2b_payload_missing_one_required_field())
    @settings(max_examples=50, deadline=None)
    def test_missing_required_field_returns_400(self, payload):
        """Property 7 (B2B): Missing required fields return 400 and no DB row is inserted."""
        initial_count = len(_get_leads())
        resp = client.post('/api/b2b/apply', json=payload)
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(len(_get_leads()), initial_count,
                         "No DB row should be inserted when a required field is missing")

    # **Validates: Requirements 7.8**
    @given(valid_b2b_payload())
    @settings(max_examples=50, deadline=None)
    def test_b2b_extended_fields_round_trip(self, payload):
        """Property 8 (B2B): New fields round-trip through the database."""
        # Clear table before each example to avoid stale rows with the same email
        with sqlite3.connect(flask_app.DB_NAME) as conn:
            conn.execute("DELETE FROM business_leads")
            conn.commit()
        with mock.patch.object(sys.modules['resend'].Emails, 'send'):
            resp = client.post('/api/b2b/apply', json=payload)
        self.assertEqual(resp.status_code, 200)
        rows = _get_leads()
        saved = next((r for r in rows if r["email"] == payload["email"]), None)
        self.assertIsNotNone(saved, f"Expected row with email {payload['email']} in DB")
        self.assertEqual(saved["phone"], payload["phone"])
        self.assertEqual(saved["company_size"], payload["companySize"])
        self.assertEqual(saved["industry"], payload["industry"])
        self.assertEqual(saved["budget_range"], payload["budgetRange"])
        self.assertEqual(saved["timeline"], payload["timeline"])
        self.assertEqual(saved["referral_source"], payload["referralSource"])

    # **Validates: Requirements 7.7**
    @given(st.text(min_size=1001))
    @settings(max_examples=50, deadline=None)
    def test_b2b_message_too_long_returns_400(self, message):
        """Property 10: B2B message length enforcement — strings > 1000 chars return 400."""
        payload = {**_base_b2b_payload(), "message": message}
        initial_count = len(_get_leads())
        resp = client.post('/api/b2b/apply', json=payload)
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(len(_get_leads()), initial_count,
                         "No DB row should be inserted when message exceeds 1000 characters")


if __name__ == '__main__':
    unittest.main(verbosity=2)

"""Property-based tests for trainer form validation (task 8.3).

Feature: phase-1-foundation
Properties 7, 8, 9 — missing required fields, extended field round-trip, availability hours boundary.
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


def _get_applicants():
    with sqlite3.connect(flask_app.DB_NAME) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute("SELECT * FROM applicants").fetchall()
        return [dict(r) for r in rows]


# ---------------------------------------------------------------------------
# Strategies
# ---------------------------------------------------------------------------

_SPECIALTIES = ["coding", "data annotation", "content moderation", "translation", "other"]

REQUIRED_FIELDS = ["name", "email", "specialty", "experience", "phone", "availabilityHours"]


def _base_valid_payload():
    """Return a fixed valid payload dict."""
    return {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "specialty": "coding",
        "experience": "3 years",
        "phone": "+15550001234",
        "availabilityHours": 20,
    }


def valid_trainer_payload_with_extended_fields():
    """Strategy generating valid payloads that include all extended fields."""
    return st.fixed_dictionaries({
        "name": st.text(
            alphabet=st.characters(whitelist_categories=("Lu", "Ll", "Nd"), whitelist_characters=" "),
            min_size=1,
            max_size=80,
        ).filter(lambda s: s.strip()),
        "email": st.emails(),
        "specialty": st.sampled_from(_SPECIALTIES),
        "experience": st.text(min_size=1, max_size=200).filter(lambda s: s.strip()),
        "phone": st.from_regex(r"\+1555[0-9]{7}", fullmatch=True),
        "availabilityHours": st.integers(min_value=1, max_value=168),
    })


def trainer_payload_missing_one_required_field():
    """Strategy that generates a valid payload with exactly one required field removed."""
    return (
        st.sampled_from(REQUIRED_FIELDS)
        .flatmap(lambda field: valid_trainer_payload_with_extended_fields().map(
            lambda payload: {k: v for k, v in payload.items() if k != field}
        ))
    )


# ---------------------------------------------------------------------------
# Test class
# ---------------------------------------------------------------------------

class TestTrainerValidationProperties(unittest.TestCase):

    def setUp(self):
        self.db = _fresh_db()
        flask_app.DB_NAME = self.db
        flask_app.init_db()
        flask_app.migrate_db()

    def tearDown(self):
        _safe_unlink(self.db)

    # **Validates: Requirements 6.1, 6.3, 6.6**
    @given(trainer_payload_missing_one_required_field())
    @settings(max_examples=50, deadline=None)
    def test_missing_required_field_returns_400(self, payload):
        """Property 7: Missing required fields return 400 and no DB row is inserted."""
        initial_count = len(_get_applicants())
        resp = client.post('/api/apply', json=payload)
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(len(_get_applicants()), initial_count,
                         "No DB row should be inserted when a required field is missing")

    # **Validates: Requirements 6.7**
    @given(valid_trainer_payload_with_extended_fields())
    @settings(max_examples=50, deadline=None)
    def test_trainer_extended_fields_round_trip(self, payload):
        """Property 8: New fields round-trip through the database."""
        # Clear table before each example to avoid stale rows with the same email
        with sqlite3.connect(flask_app.DB_NAME) as conn:
            conn.execute("DELETE FROM applicants")
            conn.commit()
        with mock.patch.object(sys.modules['resend'].Emails, 'send'):
            resp = client.post('/api/apply', json=payload)
        self.assertEqual(resp.status_code, 200)
        rows = _get_applicants()
        saved = next((r for r in rows if r["email"] == payload["email"]), None)
        self.assertIsNotNone(saved, f"Expected row with email {payload['email']} in DB")
        self.assertEqual(saved["phone"], payload["phone"])
        self.assertEqual(saved["availability_hours"], payload["availabilityHours"])

    # **Validates: Requirements 6.3**
    @given(st.integers().filter(lambda x: x < 1 or x > 168))
    @settings(max_examples=50, deadline=None)
    def test_invalid_availability_hours_returns_400(self, hours):
        """Property 9: Availability hours outside 1–168 return 400 and no DB row."""
        payload = {**_base_valid_payload(), "availabilityHours": hours}
        initial_count = len(_get_applicants())
        resp = client.post('/api/apply', json=payload)
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(len(_get_applicants()), initial_count,
                         "No DB row should be inserted for invalid availability hours")


if __name__ == '__main__':
    unittest.main(verbosity=2)

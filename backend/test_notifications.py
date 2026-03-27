"""Property-based tests for notification behavior (task 4.4).

Feature: phase-1-foundation
Properties 2, 3, 4 — notification recipients, body content, and Resend failure isolation.
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
# Hypothesis strategy
# ---------------------------------------------------------------------------

_SPECIALTIES = ["coding", "data annotation", "content moderation", "translation", "other"]


def valid_trainer_payload():
    """Strategy that generates valid /api/apply payloads."""
    return st.fixed_dictionaries({
        "name": st.text(
            alphabet=st.characters(whitelist_categories=("Lu", "Ll", "Nd"), whitelist_characters=" "),
            min_size=1,
            max_size=80,
        ).filter(lambda s: s.strip()),
        "email": st.emails(),
        "specialty": st.sampled_from(_SPECIALTIES),
        "experience": st.text(min_size=1, max_size=200).filter(lambda s: s.strip()),
        "phone": st.from_regex(r"\+1555\d{7}", fullmatch=True),
        "availabilityHours": st.integers(min_value=1, max_value=168),
    })


# ---------------------------------------------------------------------------
# Test class
# ---------------------------------------------------------------------------

class TestNotificationProperties(unittest.TestCase):

    def setUp(self):
        self.db = _fresh_db()
        flask_app.DB_NAME = self.db
        flask_app.init_db()
        flask_app.migrate_db()

    def tearDown(self):
        _safe_unlink(self.db)

    # **Validates: Requirements 4.1, 4.2**
    @given(valid_trainer_payload())
    @settings(max_examples=50, deadline=None)
    def test_trainer_notification_recipients(self, payload):
        """Property 2: Valid submission triggers notification to both founders."""
        with mock.patch.object(sys.modules['resend'].Emails, 'send') as mock_send:
            resp = client.post('/api/apply', json=payload)
            self.assertEqual(resp.status_code, 200)
            mock_send.assert_called_once()
            recipients = mock_send.call_args[0][0]["to"]
            self.assertIn("Brianna@CronanTech.com", recipients)
            self.assertIn("Bethany@CronanTech.com", recipients)

    # **Validates: Requirements 4.3**
    @given(valid_trainer_payload())
    @settings(max_examples=50, deadline=None)
    def test_notification_body_contains_submitter_info(self, payload):
        """Property 3: Notification email contains submitter details."""
        with mock.patch.object(sys.modules['resend'].Emails, 'send') as mock_send:
            resp = client.post('/api/apply', json=payload)
            self.assertEqual(resp.status_code, 200)
            mock_send.assert_called_once()
            html = mock_send.call_args[0][0]["html"]
            self.assertIn(payload["name"], html)
            self.assertIn(payload["email"], html)

    # **Validates: Requirements 4.4**
    @given(valid_trainer_payload())
    @settings(max_examples=50, deadline=None)
    def test_resend_failure_does_not_block_save(self, payload):
        """Property 4: Resend failure does not block DB save."""
        with mock.patch.object(sys.modules['resend'].Emails, 'send',
                               side_effect=Exception("network error")):
            resp = client.post('/api/apply', json=payload)
            self.assertEqual(resp.status_code, 200)
            rows = _get_applicants()
            self.assertTrue(
                any(r["email"] == payload["email"] for r in rows),
                f"Expected email {payload['email']} in DB rows but got: {rows}",
            )


if __name__ == '__main__':
    unittest.main(verbosity=2)

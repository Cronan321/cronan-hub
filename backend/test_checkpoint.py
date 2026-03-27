"""Quick smoke tests for the phase-1-foundation checkpoint."""
import sqlite3
import sys
import os
import unittest
from unittest import mock

# Patch resend before importing app
sys.modules['resend'] = mock.MagicMock()
os.environ.setdefault('RESEND_API_KEY', 'test')

import app as flask_app

client = flask_app.app.test_client()


def fresh_db():
    """Return a path to a fresh temp DB."""
    import tempfile
    f = tempfile.NamedTemporaryFile(suffix='.db', delete=False)
    f.close()
    return f.name


def safe_unlink(path):
    """Delete a file, ignoring Windows file-lock errors."""
    try:
        os.unlink(path)
    except (PermissionError, OSError):
        pass  # Windows may hold the SQLite file open briefly


class TestMigrateDb(unittest.TestCase):
    def setUp(self):
        self.db = fresh_db()
        flask_app.DB_NAME = self.db
        flask_app.init_db()

    def tearDown(self):
        safe_unlink(self.db)

    def test_migrate_idempotent(self):
        flask_app.migrate_db()
        flask_app.migrate_db()  # second run must not raise
        with sqlite3.connect(self.db) as conn:
            cols = {row[1] for row in conn.execute("PRAGMA table_info(applicants)")}
            self.assertIn('phone', cols)
            self.assertIn('linkedin_url', cols)
            self.assertIn('availability_hours', cols)
            b_cols = {row[1] for row in conn.execute("PRAGMA table_info(business_leads)")}
            for c in ('phone', 'company_size', 'industry', 'budget_range', 'timeline', 'referral_source', 'message'):
                self.assertIn(c, b_cols)


class TestSendNotification(unittest.TestCase):
    def test_sends_to_both_founders(self):
        with mock.patch.object(sys.modules['resend'].Emails, 'send') as mock_send:
            flask_app.send_notification('Test', '<p>hello</p>')
            mock_send.assert_called_once()
            args = mock_send.call_args[0][0]
            self.assertIn('Brianna@CronanTech.com', args['to'])
            self.assertIn('Bethany@CronanTech.com', args['to'])
            self.assertEqual(args['from'], 'notifications@cronantech.com')

    def test_exception_does_not_propagate(self):
        with mock.patch.object(sys.modules['resend'].Emails, 'send', side_effect=Exception('network error')):
            # Should not raise
            flask_app.send_notification('Test', '<p>hello</p>')


class TestApplyEndpoint(unittest.TestCase):
    def setUp(self):
        self.db = fresh_db()
        flask_app.DB_NAME = self.db
        flask_app.init_db()
        flask_app.migrate_db()

    def tearDown(self):
        safe_unlink(self.db)

    def _valid_payload(self):
        return {
            'name': 'Jane Doe',
            'email': 'jane@example.com',
            'specialty': 'coding',
            'experience': '3 years',
            'phone': '+15550001234',
            'availabilityHours': 20,
        }

    def test_valid_submission_returns_200(self):
        with mock.patch.object(sys.modules['resend'].Emails, 'send'):
            resp = client.post('/api/apply', json=self._valid_payload())
        self.assertEqual(resp.status_code, 200)

    def test_missing_phone_returns_400(self):
        payload = self._valid_payload()
        del payload['phone']
        resp = client.post('/api/apply', json=payload)
        self.assertEqual(resp.status_code, 400)

    def test_availability_hours_too_low_returns_400(self):
        payload = {**self._valid_payload(), 'availabilityHours': 0}
        resp = client.post('/api/apply', json=payload)
        self.assertEqual(resp.status_code, 400)

    def test_availability_hours_too_high_returns_400(self):
        payload = {**self._valid_payload(), 'availabilityHours': 169}
        resp = client.post('/api/apply', json=payload)
        self.assertEqual(resp.status_code, 400)

    def test_availability_hours_boundary_1_ok(self):
        with mock.patch.object(sys.modules['resend'].Emails, 'send'):
            resp = client.post('/api/apply', json={**self._valid_payload(), 'availabilityHours': 1})
        self.assertEqual(resp.status_code, 200)

    def test_availability_hours_boundary_168_ok(self):
        with mock.patch.object(sys.modules['resend'].Emails, 'send'):
            resp = client.post('/api/apply', json={**self._valid_payload(), 'availabilityHours': 168, 'email': 'jane2@example.com'})
        self.assertEqual(resp.status_code, 200)


class TestB2BApplyEndpoint(unittest.TestCase):
    def setUp(self):
        self.db = fresh_db()
        flask_app.DB_NAME = self.db
        flask_app.init_db()
        flask_app.migrate_db()

    def tearDown(self):
        safe_unlink(self.db)

    def _valid_payload(self):
        return {
            'companyName': 'Acme Corp',
            'contactName': 'John Smith',
            'email': 'john@acme.com',
            'projectType': 'Data Annotation',
            'phone': '+15550009999',
            'companySize': '11-50',
            'industry': 'Technology',
            'budgetRange': '$5K–$25K',
            'timeline': 'Within 1 month',
            'referralSource': 'LinkedIn',
        }

    def test_valid_submission_returns_200(self):
        with mock.patch.object(sys.modules['resend'].Emails, 'send'):
            resp = client.post('/api/b2b/apply', json=self._valid_payload())
        self.assertEqual(resp.status_code, 200)

    def test_missing_company_size_returns_400(self):
        payload = self._valid_payload()
        del payload['companySize']
        resp = client.post('/api/b2b/apply', json=payload)
        self.assertEqual(resp.status_code, 400)

    def test_message_too_long_returns_400(self):
        payload = {**self._valid_payload(), 'message': 'x' * 1001}
        resp = client.post('/api/b2b/apply', json=payload)
        self.assertEqual(resp.status_code, 400)

    def test_message_exactly_1000_ok(self):
        with mock.patch.object(sys.modules['resend'].Emails, 'send'):
            resp = client.post('/api/b2b/apply', json={**self._valid_payload(), 'message': 'x' * 1000})
        self.assertEqual(resp.status_code, 200)


if __name__ == '__main__':
    unittest.main(verbosity=2)

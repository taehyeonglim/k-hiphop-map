#!/usr/bin/env python3
"""Offline identity and publication gates; no network or real photo downloads."""
import hashlib
import importlib.util
import tempfile
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('survey', Path(__file__).with_name('survey-portraits.py'))
survey = importlib.util.module_from_spec(spec)
spec.loader.exec_module(survey)


class PortraitGates(unittest.TestCase):
    def test_only_the_reviewed_image_bytes_and_source_can_publish(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'photo.webp'
            path.write_bytes(b'reviewed photo')
            asset = {'sourceUrl': 'https://commons.wikimedia.org/wiki/File:Fixture.jpg'}
            approval = {**asset, 'reviewedAt': '2026-10-04', 'identityConfirmed': True, 'cropApproved': True,
                        'imageSha256': hashlib.sha256(path.read_bytes()).hexdigest()}
            self.assertTrue(survey.approved_candidate(asset, approval, path))
            self.assertFalse(survey.approved_candidate(asset, {**approval, 'identityConfirmed': False}, path))
            self.assertFalse(survey.approved_candidate(asset, {**approval, 'cropApproved': False}, path))
            self.assertFalse(survey.approved_candidate(asset, {**approval, 'sourceUrl': 'another-source'}, path))
            path.write_bytes(b'different crop')
            self.assertFalse(survey.approved_candidate(asset, approval, path))

    def test_same_name_artist_from_another_country_is_not_eligible(self):
        def claim(value): return {'mainsnak': {'datavalue': {'value': value}}}
        entity = {'claims': {'P31': [claim({'id': 'Q5'})], 'P27': [claim({'id': 'Q664'})]},
                  'descriptions': {'en': {'value': 'New Zealand singer-songwriter'}}}
        self.assertFalse(survey.p.eligible_entity(entity, {'kind': 'person', 'country': 'PH'}))

    def test_conflicting_music_identifier_is_not_eligible(self):
        entity = {'claims': {'P31': [{'mainsnak': {'datavalue': {'value': {'id': 'Q5'}}}}],
                             'P434': [{'mainsnak': {'datavalue': {'value': 'wrong-id'}}}]}}
        self.assertFalse(survey.p.eligible_entity(entity, {'kind': 'person', 'externalIds': {'musicbrainz': 'correct-id'}}))


if __name__ == '__main__':
    unittest.main()

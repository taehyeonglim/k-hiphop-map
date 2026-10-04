#!/usr/bin/env python3
"""Offline identity and publication gates; no network or real photo downloads."""
import hashlib
import importlib.util
import tempfile
import unittest
from pathlib import Path
from PIL import Image

spec = importlib.util.spec_from_file_location('survey', Path(__file__).with_name('survey-portraits.py'))
survey = importlib.util.module_from_spec(spec)
spec.loader.exec_module(survey)
selection_spec = importlib.util.spec_from_file_location('selections', Path(__file__).with_name('stage-portrait-selections.py'))
selections = importlib.util.module_from_spec(selection_spec)
selection_spec.loader.exec_module(selections)


class PortraitGates(unittest.TestCase):
    def test_video_requires_its_own_explicit_reuse_license(self):
        info = {'id': 'abcdefghijk', 'title': 'Artist interview', 'channel': 'Official channel'}
        with self.assertRaises(ValueError):
            selections.video_attribution(info, info['id'])
        info['license'] = selections.YOUTUBE_CC
        self.assertEqual(selections.video_attribution(info, info['id'])['author'], 'Official channel')
        with self.assertRaises(ValueError):
            selections.video_attribution(info, 'another1234')

    def test_reproduction_rejects_changed_dimensions_or_partial_group_crop(self):
        image = Image.new('RGB', (640, 360))
        selection = {'sourceSize': [640, 360], 'box': [100, 0, 460, 360]}
        self.assertEqual(selections.crop_image(image, selection, 'person').size, (256, 256))
        with self.assertRaises(ValueError):
            selections.crop_image(image, selection, 'group')
        with self.assertRaises(ValueError):
            selections.crop_image(image, {**selection, 'sourceSize': [1280, 720]}, 'person')
        with self.assertRaises(ValueError):
            selections.crop_image(image, {**selection, 'box': [-1, 0, 359, 360]}, 'person')

    def test_title_variants_find_qualified_korean_and_uppercase_stage_names(self):
        english, korean = survey.p.wiki_candidates({'name': '주석', 'nameEn': 'JOOSUC', 'aliases': []})
        self.assertIn('주석 (가수)', korean)
        self.assertIn('주석 (래퍼)', korean)
        self.assertIn('Joosuc', english)
        english, _ = survey.p.wiki_candidates({'name': '던말릭', 'nameEn': 'DON MALIK'})
        self.assertIn('Don Malik (rapper)', english)

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

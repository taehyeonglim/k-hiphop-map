#!/usr/bin/env python3
"""Offline regression tests for source identity and collaboration eligibility."""
import copy, json, tempfile, unittest
from pathlib import Path
import collect


def artist(aid,core=True):
    return {'id':aid,'name':aid,'nameEn':aid,'aliases':[],'kind':'person','core':core,'externalIds':{'musicbrainz':aid},'sources':[], 'coverage':{'recordingCount':0,'releaseCount':0,'pendingCount':0,'checkedAt':'2026-10-01','note':''}}


def recording(rid,participants,isrc=None):
    return {'id':rid,'title':rid,'year':2020,'date':'2020-01-01','releaseIds':[],'credits':[{'artistId':a,'role':'main','verification':'source-confirmed','sourceIds':['fixture-source']} for a in participants],'sources':[{'id':'fixture-source','provider':'MusicBrainz','url':'https://musicbrainz.org/recording/'+rid,'fetchedAt':'2026-10-01'}],'isrcs':[isrc] if isrc else [],'kind':'official','verification':'source-confirmed'}


class CollectorRegressions(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.original_root=collect.ROOT
        collect.ROOT=Path(self.temp.name);(collect.ROOT/'data').mkdir()
    def tearDown(self):
        collect.ROOT=self.original_root;self.temp.cleanup()
    def dataset(self,recordings,artists):
        return {'version':'fixture','asOf':'2026-10-01','artists':artists,'recordings':recordings,'releases':[],'memberships':[],'notes':[]}
    def test_alias_collision_cannot_bind_a_foreign_credit(self):
        seed={'id':'korean-rapper','name':'양홍원','nameEn':'YANGHONGWON','aliases':['Young B'],'kind':'person','core':True,'country':'KR'}
        c=collect.Collector(None,[seed])
        foreign={'id':'foreign-mbid','name':'Young B','aliases':[{'name':'YANGHONGWON'}]}
        self.assertIsNone(c.seed_match(foreign))
        c.mbid_seed['verified-korean-mbid']=seed
        self.assertEqual(c.seed_match({'id':'verified-korean-mbid','name':'Young B'})['id'],'korean-rapper')
    def test_undocumented_noncore_voice_stays_pending(self):
        ds=self.dataset([recording('song',['core','unknown'])],[artist('core'),artist('unknown',False)])
        got=collect.normalize_dataset(ds)['recordings'][0]
        self.assertEqual(next(c for c in got['credits'] if c['artistId']=='unknown')['verification'],'pending')
        self.assertEqual(ds['artists'][1]['coverage']['pendingCount'],1)
    def test_shared_isrc_with_conflicting_participants_is_quarantined(self):
        ds=self.dataset([recording('one',['a','b'],'KRFIX0000001'),recording('two',['a','c'],'KRFIX0000001')],[artist('a'),artist('b'),artist('c')])
        got=collect.normalize_dataset(ds)
        self.assertEqual(len(got['recordings']),2)
        self.assertTrue(all(r['verification']=='pending' for r in got['recordings']))
    def test_same_isrc_and_participants_dedup_across_releases(self):
        a=recording('one',['a','b'],'KRFIX0000001');b=recording('two',['a','b'],'KRFIX0000001');b['date']='2022-01-01';b['year']=2022
        got=collect.normalize_dataset(self.dataset([a,b],[artist('a'),artist('b')]))
        self.assertEqual(len(got['recordings']),1);self.assertEqual(got['recordings'][0]['year'],2020)
    def test_version_changes_for_corrected_credit_but_not_check_timestamp(self):
        ds=self.dataset([recording('one',['a','b'])],[artist('a'),artist('b')]);version=collect.dataset_version(ds)
        checked=copy.deepcopy(ds);checked['artists'][0]['coverage']['checkedAt']='2026-10-01T23:00:00Z';checked['recordings'][0]['sources'][0]['fetchedAt']='2026-10-01T23:00:00Z'
        self.assertEqual(version,collect.dataset_version(checked))
        changed=copy.deepcopy(ds);changed['recordings'][0]['credits'][1]['verification']='pending'
        self.assertNotEqual(version,collect.dataset_version(changed))
    def test_same_confirmed_mbid_alias_cannot_create_two_people(self):
        main=artist('canonical');legacy=artist('legacy');legacy['externalIds']['musicbrainz']='canonical'
        (collect.ROOT/'data/seeds.json').write_text(json.dumps([{'id':'canonical'}]))
        ds=self.dataset([recording('one',['canonical','legacy'])],[main,legacy])
        got=collect.normalize_dataset(ds)
        self.assertEqual([a['id'] for a in got['artists']],['canonical'])
        self.assertEqual([c['artistId'] for c in got['recordings'][0]['credits']],['canonical'])
    def test_membership_is_deduped_without_becoming_performance(self):
        membership={'groupId':'group','artistId':'a','source':{'id':'fixture','provider':'MusicBrainz','url':'https://musicbrainz.org/artist/group','fetchedAt':'2026-10-01'}}
        ds=self.dataset([recording('one',['a'])],[artist('a'),artist('group')]);ds['memberships']=[membership,copy.deepcopy(membership)]
        got=collect.normalize_dataset(ds)
        self.assertEqual(len(got['memberships']),1);self.assertEqual(len(got['recordings'][0]['credits']),1)

if __name__=='__main__':unittest.main()

#!/usr/bin/env python3
"""Offline regression tests for source identity and collaboration eligibility."""
import copy, json, sqlite3, tempfile, unittest, importlib.util
from pathlib import Path
import collect
from unittest.mock import patch


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
    def resolver_client(self,response):
        class CachedClient:
            def __init__(self):
                self.db=sqlite3.connect(':memory:')
                self.db.execute('CREATE TABLE candidates (seed_id TEXT PRIMARY KEY, payload TEXT, checked_at TEXT)')
            def mb(self,*args,**kwargs):return response
        return CachedClient()
    def test_missing_country_namesake_prevents_automatic_wrong_identity(self):
        seed={'id':'rapper','name':'탁','nameEn':'Tak','aliases':[],'kind':'person','core':True,'country':'KR'}
        raw={'artists':[{'id':'actual-rapper','name':'탁','type':'Person','score':100,'area':{'name':'Seoul'}}, {'id':'unrelated-composer','name':'탁','type':'Person','country':'KR','score':100}]}
        c=collect.Collector(self.resolver_client(raw),[seed])
        self.assertIsNone(c.resolve(seed))
        self.assertEqual(set(c.pending['rapper']['candidateIds']),{'actual-rapper','unrelated-composer'})
    def test_pinned_identity_survives_display_name_change(self):
        seed={'id':'rapper','name':'이영지','nameEn':'Lee Young-ji','aliases':['영지'],'kind':'person','core':True,'country':'KR','musicbrainz':'actual-rapper'}
        client=self.resolver_client({'id':'actual-rapper','name':'이영지'})
        client.db.execute('INSERT INTO candidates VALUES (?,?,?)',('rapper',json.dumps({'artists':[{'id':'actual-rapper','name':'이영지'},{'id':'unrelated-singer','name':'영지','country':'KR'}]}),'2026-10-01'))
        self.assertEqual(collect.Collector(client,[seed]).resolve(seed)['id'],'actual-rapper')
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
    def test_nonperformance_variant_component_dedup_is_stable(self):
        rows=[recording(rid,['a','b']) for rid in ['one','two','three']]
        rows[0]['title']='Song';rows[1]['title']='Song';rows[2]['title']='Song (bonus track)'
        ds=collect.normalize_dataset(self.dataset(rows,[artist('a'),artist('b')]))
        self.assertEqual(len(ds['recordings']),1)
        self.assertEqual(collect.dataset_version(ds),collect.dataset_version(collect.normalize_dataset(copy.deepcopy(ds))))
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

    def test_garion_114_with_duplicated_last_page_is_rejected(self):
        class Client:
            def mb(self, entity, **params):
                rows = [{'id': str(i)} for i in range(100 if params['offset'] == 0 else 14)]
                return {'recordings': rows, 'recording-count': 114}
        with self.assertRaisesRegex(ValueError, 'overlapping'):
            collect.browse_all(Client(), 'recording', artist='garion')

    def test_short_release_pages_advance_by_actual_count(self):
        offsets=[]
        class Client:
            def mb(self, entity, **params):
                start=params['offset'];offsets.append(start)
                return {'releases':[{'id':str(i)} for i in range(start,min(5,start+2))], 'release-count':5}
        got=collect.browse_all(Client(),'release',artist='fixture')
        self.assertEqual(offsets,[0,2,4]);self.assertEqual(len(got),5)

    def test_partial_or_changing_count_never_claims_complete(self):
        class Client:
            def mb(self, entity, **params):
                return {'recordings':[], 'recording-count':114}
        with self.assertRaisesRegex(ValueError,'incomplete'):
            collect.browse_all(Client(),'recording',artist='fixture')

    def test_official_source_does_not_approve_every_unknown_credit(self):
        r=recording('one',['a','b']);r['sources'][0]['provider']='official'
        got=collect.normalize_dataset(self.dataset([r],[artist('a'),artist('b',False)]))
        self.assertEqual(got['recordings'][0]['credits'][1]['verification'],'pending')

    def test_track_review_overrides_producer_policy_with_exact_evidence(self):
        from archive_support import apply_track_reviews
        ds=self.dataset([recording('one',['a'])],[artist('a'),artist('b',False)])
        review={'one':{'sources':[{'id':'review','provider':'Bugs','url':'https://music.bugs.co.kr/track/519441'}],
            'credits':[{'artistId':'b','role':'rap','verification':'reviewed','sourceIds':['review']}]}}
        (collect.ROOT/'data/track-review.json').write_text(json.dumps(review))
        got=apply_track_reviews(collect.normalize_dataset(ds),collect.ROOT)
        self.assertEqual(got['recordings'][0]['credits'][0]['artistId'],'b')
        self.assertEqual(got['artists'][1]['coverage']['recordingCount'],1)

    def test_archive_preserves_full_positions_but_not_mr_edges(self):
        spec=importlib.util.spec_from_file_location('release_collector',Path(__file__).with_name('collect-releases.py'))
        module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
        raw={'id':'release','title':'MP fixture','date':'2000','artist-credit':[{'artist':{'id':'89ad4ac3-39f7-470e-963a-56509c546377','name':'Various Artists'}}],
             'media':[{'position':1,'track-count':2,'tracks':[
                 {'number':'1','title':'Voice','recording':{'id':'voice','artist-credit':[{'artist':{'id':'new','name':'New Rapper'}}]}},
                 {'number':'2','title':'Voice (MR)','recording':{'id':'mr','artist-credit':[{'artist':{'id':'new','name':'New Rapper'}}]}}]}]}
        release,records=module.release_inventory(raw,collect.Collector(None,[]),{})
        self.assertEqual(len(release['tracks']),2);self.assertEqual(len(records),1)
        self.assertEqual(release['artistIds'],[]);self.assertEqual(release['type'],'compilation')
        self.assertEqual(records[0]['credits'][0]['verification'],'pending')
        self.assertEqual(release['tracks'][1]['status'],'excluded')

    def test_archive_overlay_survives_refresh_and_is_idempotent(self):
        from archive_support import merge_archive
        a=artist('a');r=recording('one',['a']);r['releaseIds']=['release']
        rel={'id':'release','artistIds':[],'recordingIds':['one'],'title':'Compilation','type':'compilation'}
        (collect.ROOT/'data/archive.json').write_text(json.dumps({'artists':[a],'recordings':[r],'releases':[rel]}))
        ds=self.dataset([],[])
        once=copy.deepcopy(merge_archive(ds,collect.ROOT));twice=merge_archive(ds,collect.ROOT)
        self.assertEqual(once,twice);self.assertEqual(twice['releases'][0]['artistIds'],[])

    def test_artist_browse_does_not_import_other_compilation_performers(self):
        release={'id':'compilation','media':[{'track-count':2,'tracks':[
            {'recording':{'id':'related','artist-credit':[{'artist':{'id':'a'}}]}},
            {'recording':{'id':'unrelated','artist-credit':[{'artist':{'id':'other'}}]}},
        ]}]}
        class Client:
            def mb(self,*args,**kwargs):return release
        c=collect.Collector(Client(),[]);c.artists={'a':artist('a')}
        c.resolve=lambda seed:{'id':'a'};c.ensure_artist=lambda raw:'a'
        imported=[];c.ingest=imported.append
        with patch('collect.browse_all',return_value=[{'id':'compilation'}]):
            c.collect_seed({'id':'a'},8)
        self.assertEqual([record['id'] for record in imported],['related'])

    def test_mr_marker_does_not_match_mr_domino(self):
        from archive_support import is_instrumental_title
        for title in ['Mr. Domino', 'MR. DOMINO', 'Mr. Independent']:
            self.assertFalse(is_instrumental_title(title))
        for title in ['Song (MR)', 'Song MR', 'Song (mr.)', 'Song (Instrumental)']:
            self.assertTrue(is_instrumental_title(title))

    def test_review_cannot_reference_a_different_credit_source(self):
        from archive_support import apply_track_reviews
        ds=self.dataset([recording('one',['a'])],[artist('a')])
        review={'one':{'sources':[{'id':'review','provider':'Bugs','url':'https://music.bugs.co.kr/track/1'}],
            'credits':[{'artistId':'a','role':'rap','verification':'reviewed','sourceIds':['review','unrelated']} ]}}
        (collect.ROOT/'data/track-review.json').write_text(json.dumps(review))
        with self.assertRaisesRegex(ValueError,'Invalid reviewed'):
            apply_track_reviews(ds,collect.ROOT)

    def test_reviewed_stage_name_is_one_artist_and_retains_old_id(self):
        main=artist('canonical');old=artist('legacy',False)
        (collect.ROOT/'data/seeds.json').write_text(json.dumps([{'id':'canonical'}]))
        (collect.ROOT/'data/artist-aliases.json').write_text(json.dumps({'legacy':{'artistId':'canonical','source':{'id':'alias-proof','provider':'Bugs','url':'https://music.bugs.co.kr/album/1'}}}))
        ds=collect.normalize_dataset(self.dataset([recording('one',['canonical','legacy'])],[main,old]))
        self.assertEqual(len(ds['artists']),1)
        self.assertEqual(ds['artistAliases'],{'legacy':'canonical'})
        self.assertEqual(ds['artists'][0]['externalIds']['musicbrainzAlias:legacy'],'legacy')
        self.assertEqual([c['artistId'] for c in ds['recordings'][0]['credits']],['canonical'])

if __name__=='__main__':unittest.main()

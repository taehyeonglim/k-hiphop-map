#!/usr/bin/env python3
"""Resumable, source-backed Korean hip-hop catalog collection.

MusicBrainz artist-credit is the only automatically accepted performance credit.
Album ownership, membership and composer/producer relations never create ties.
Raw responses, discovery decisions and candidates live in SQLite. No credentials
are needed; MusicBrainz requests are serialized at <= 1 request / second.
"""
from __future__ import annotations
import argparse, datetime as dt, hashlib, json, re, sqlite3, time, unicodedata
import urllib.error, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
UA = 'KHipHopMap/1.0 (noncommercial Korean music archive; https://github.com/taehyeonglim/k-hiphop-map)'
MB = 'https://musicbrainz.org/ws/2/'
NOW = dt.datetime.now(dt.timezone.utc).isoformat().replace('+00:00','Z')
ASOF = dt.date.today().isoformat()
# Catalog-primary artist credits can name a producer. These are held out of vocal
# ties unless a manually reviewed per-recording performance credit overrides them.
PRODUCTION_ONLY = {norm_name for norm_name in ['codekunst','primary','toil','wayched','djsoulscape','frnk','groovyroom','slom','woogie','brllnt','dress','250','loptimist','djpremier','djpremier','djsnake','marshmello','daftpunK','alannwalker','skrillex','diplo','slowrabbit','pdogg','suminproducer','nuol','nuoliunce']} 


def norm(s):
    return ''.join(c for c in unicodedata.normalize('NFKC', s).casefold() if c.isalnum())


def evidence(provider, url, note=''):
    return {'id': 'src-' + hashlib.sha256(url.encode()).hexdigest()[:16], 'provider': provider,
            'url': url, 'fetchedAt': NOW, 'license': 'CC0 core metadata' if provider=='MusicBrainz' else 'Noncommercial API use', **({'note':note} if note else {})}


class Client:
    def __init__(self, refresh=False):
        (ROOT/'data').mkdir(exist_ok=True)
        self.db=sqlite3.connect(ROOT/'data/catalog.sqlite', timeout=120)
        self.db.execute('CREATE TABLE IF NOT EXISTS http_cache (url TEXT PRIMARY KEY, body TEXT NOT NULL, fetched_at TEXT NOT NULL)')
        self.db.execute('CREATE TABLE IF NOT EXISTS candidates (seed_id TEXT PRIMARY KEY, payload TEXT NOT NULL, checked_at TEXT NOT NULL)')
        self.db.execute('CREATE TABLE IF NOT EXISTS collection_log (id INTEGER PRIMARY KEY, seed_id TEXT, stage TEXT, message TEXT, created_at TEXT)')
        self.db.execute('CREATE TABLE IF NOT EXISTS request_clock (host TEXT PRIMARY KEY, last_at REAL NOT NULL)')
        self.db.commit(); self.refresh=refresh
    def get(self, url, json_response=True):
        cached=self.db.execute('SELECT body, fetched_at FROM http_cache WHERE url=?',(url,)).fetchone()
        cache_fresh=bool(cached and dt.datetime.now(dt.timezone.utc)-dt.datetime.fromisoformat(cached[1].replace('Z','+00:00')) < dt.timedelta(days=7))
        if cached and cache_fresh and not self.refresh:
            return json.loads(cached[0]) if json_response else cached[0]
        host=urllib.parse.urlparse(url).netloc
        for attempt in range(4):
            self.db.execute('BEGIN IMMEDIATE')
            row=self.db.execute('SELECT last_at FROM request_clock WHERE host=?',(host,)).fetchone()
            interval=1.1 if 'musicbrainz' in host else 0.5
            if row: time.sleep(max(0,interval-(time.time()-row[0])))
            self.db.execute('INSERT OR REPLACE INTO request_clock VALUES (?,?)',(host,time.time()))
            self.db.commit()
            try:
                req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'application/json' if json_response else '*/*'})
                body=urllib.request.urlopen(req,timeout=45).read().decode('utf-8-sig')
                parsed=json.loads(body) if json_response else body
                self.db.execute('INSERT OR REPLACE INTO http_cache VALUES (?,?,?)',(url,body,NOW));self.db.commit()
                return parsed
            except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as e:
                if isinstance(e,urllib.error.HTTPError) and e.code not in [429,500,502,503,504]: raise
                if attempt==3: raise
                time.sleep(min(20, 2**(attempt+1)))
    def mb(self, entity, **params):
        return self.get(MB+entity+'?'+urllib.parse.urlencode({**params,'fmt':'json'}))
    def log(self,seed,stage,msg):
        self.db.execute('INSERT INTO collection_log (seed_id,stage,message,created_at) VALUES (?,?,?,?)',(seed,stage,msg,NOW));self.db.commit()


class Collector:
    def __init__(self, client, seeds):
        self.client=client; self.seeds=seeds;self.artists={}; self.recordings={};self.releases={};self.memberships=[]
        self.pending={};self.mbid_seed={};self.seed_alias={};self.resolved=[]
        for seed in seeds:
            for name in [seed['name'],seed['nameEn'],*seed.get('aliases',[])]: self.seed_alias.setdefault(norm(name),[]).append(seed)
        self.pending_file=ROOT/'data/pending.json'
        review=ROOT/'data/identity-review.json';self.identity_review=json.loads(review.read_text()) if review.exists() else {}
        self.primary_mbid={}
    def seed_match(self, artist):
        mbid=artist['id']
        if mbid in self.mbid_seed:return self.mbid_seed[mbid]
        # A credit name or alias is not an identity key. Bi/Rain, Young B and
        # Noel collide across countries; only independently resolved MBIDs bind.
        return None
    def add_artist(self, raw, seed=None):
        seed=seed or self.seed_match(raw)
        artist_id=seed['id'] if seed else 'mb-'+raw['id']
        source=evidence('MusicBrainz','https://musicbrainz.org/artist/'+raw['id'])
        if artist_id in self.artists:
            a=self.artists[artist_id]
            if a['externalIds'].get('musicbrainz')!=raw['id']:a['externalIds']['musicbrainzAlias:'+raw['id']]=raw['id']
            return artist_id
        aliases=list(dict.fromkeys([*(seed.get('aliases',[]) if seed else []),*[r['name'] for r in raw.get('aliases',[]) if r.get('type')!='Legal name'],raw.get('name','')]))
        name=seed['name'] if seed else raw.get('name','Unknown')
        en=seed['nameEn'] if seed else next((a['name'] for a in raw.get('aliases',[]) if a.get('locale')=='en' and a.get('type')=='Artist name'),raw.get('name',''))
        kind=seed.get('kind','person') if seed else ('group' if raw.get('type') in ('Group','Orchestra','Choir') else 'person')
        self.artists[artist_id]={'id':artist_id,'name':name,'nameEn':en,'aliases':[n for n in aliases if n and n!=name],
            'kind':kind,'core':bool(seed and seed.get('core',True)),'country':raw.get('country') or (seed.get('country') if seed else None),
            'externalIds':{'musicbrainz':self.primary_mbid.get(seed['id'],raw['id']) if seed else raw['id']},'sources':[source],
            'coverage':{'releaseCount':0,'recordingCount':0,'pendingCount':0,'checkedAt':NOW,'note':'MusicBrainz 녹음별 아티스트 크레딧 확인; 전체 디스코그래피 수록률은 보증하지 않습니다.'}}
        if seed:
            review=self.identity_review.get(seed['id'])
            if review:
                provider='MusicBrainz' if 'musicbrainz.org' in review['sourceUrl'] else 'maniadb' if 'maniadb.com' in review['sourceUrl'] else 'official'
                rs=evidence(provider,review['sourceUrl'],review['note'])
                if provider=='official':rs.pop('license',None)
                self.artists[artist_id]['sources']=list({x['id']:x for x in [*self.artists[artist_id]['sources'],rs]}.values())
            self.mbid_seed[raw['id']]=seed
            if self.artists[artist_id]['externalIds']['musicbrainz']!=raw['id']:self.artists[artist_id]['externalIds']['musicbrainzAlias:'+raw['id']]=raw['id']
        return artist_id
    def resolve(self,seed):
        review_path=ROOT/'data/identity-review.json'
        if review_path.exists():self.identity_review=json.loads(review_path.read_text())
        review=self.identity_review.get(seed['id'])
        if review:
            cached=self.client.db.execute('SELECT payload FROM candidates WHERE seed_id=?',(seed['id'],)).fetchone()
            raw=next((a for a in json.loads(cached[0]).get('artists',[]) if a['id']==review['musicbrainz']),None) if cached else None
            if not raw:raw=self.client.mb('artist/'+review['musicbrainz'],inc='aliases+url-rels')
            self.mbid_seed[raw['id']]=seed;self.primary_mbid[seed['id']]=raw['id']
            for alias_id in review.get('alternateMusicbrainz',[]):self.mbid_seed[alias_id]=seed
            return raw
        if seed.get('musicbrainz'):
            cached=self.client.db.execute('SELECT payload FROM candidates WHERE seed_id=?',(seed['id'],)).fetchone()
            a=next((a for a in json.loads(cached[0]).get('artists',[]) if a['id']==seed['musicbrainz']),None) if cached else None
            if not a:a=self.client.mb('artist/'+seed['musicbrainz'],inc='aliases+url-rels')
            self.mbid_seed[a['id']]=seed;self.primary_mbid[seed['id']]=a['id'];return a
        safe=lambda s:s.replace('"','')
        query='('+ ' OR '.join('artist:"'+safe(n)+'"' for n in list(dict.fromkeys([seed.get('search',seed['name']),seed['nameEn'],*seed.get('aliases',[])])))+')'
        result=self.client.mb('artist',query=query,limit=25)
        names={norm(n) for n in [seed['name'],seed['nameEn'],*seed.get('aliases',[])]}
        candidates=[]
        for a in result.get('artists',[]):
            exact=bool(names.intersection({norm(a.get('name','')),norm(a.get('sort-name','')),*[norm(x['name']) for x in a.get('aliases',[])]}))
            area=a.get('area',{}).get('name','')
            korean=a.get('country')=='KR' or area=='South Korea' or bool(re.search(r'korea',a.get('disambiguation',''),re.I))
            unknown_country=not a.get('country')
            kind_ok=not (seed['kind']=='person' and a.get('type') in ('Group','Orchestra','Choir')) and not (seed['kind']=='group' and a.get('type')=='Person')
            if not kind_ok:continue
            if exact and korean:candidates.append(a)
            elif exact and unknown_country:candidates.append(a)
            elif exact and int(a.get('score',0))==100 and len(result.get('artists',[]))==1 and len(norm(seed['nameEn']))>=5:candidates.append(a)
        self.client.db.execute('INSERT OR REPLACE INTO candidates VALUES (?,?,?)',(seed['id'],json.dumps(result,ensure_ascii=False),NOW));self.client.db.commit()
        if len(candidates)==1:
            a=candidates[0]
            korean=a.get('country')=='KR' or a.get('area',{}).get('name')=='South Korea' or bool(re.search(r'korea',a.get('disambiguation',''),re.I))
            globally_unique=int(a.get('score',0))==100 and len(result.get('artists',[]))==1 and len(norm(seed['nameEn']))>=5
            if korean or globally_unique:
                self.mbid_seed[a['id']]=seed;self.primary_mbid[seed['id']]=a['id']
                return a
        self.pending[seed['id']]={'reason':'artist-match-ambiguous' if candidates else 'artist-not-matched','candidateIds':[a['id'] for a in candidates]}
        return None
    def ingest(self,rec):
        date=rec.get('first-release-date')
        if not date or not re.match(r'^\d{4}',date):return
        year=int(date[:4])
        if not 1995<=year<=int(ASOF[:4]) or date>ASOF:return
        title=rec.get('title','')
        if re.fullmatch(r'\[(silence|unknown|data track)\]',title,re.I):return
        if rec.get('video') or re.search(r'\b(instrumental|inst\.?|karaoke|video clip|video edit|music video|data track|making of movie|MV)\b|반주',title,re.I):return
        rawcredits=[ac for ac in rec.get('artist-credit',[]) if isinstance(ac,dict) and ac.get('artist')]
        # MusicBrainz's special purpose artists are never vocal participants.
        rawcredits=[ac for ac in rawcredits if ac['artist']['id'] not in ('89ad4ac3-39f7-470e-963a-56509c546377','125ec42a-7229-4250-afc5-e057484327fe')]
        if not rawcredits:return
        if all(norm(ac['artist'].get('name','')) in PRODUCTION_ONLY or norm(ac['artist'].get('sort-name','')) in PRODUCTION_ONLY for ac in rawcredits):return
        # Collect only core repertoire / one-hop co-credits. Release artist alone is not enough.
        if not any((self.seed_match(ac['artist']) or {}).get('core',False) for ac in rawcredits):return
        rid='mb-'+rec['id'];src=evidence('MusicBrainz','https://musicbrainz.org/recording/'+rec['id'],'Recording artist-credit; dates from first-release-date. Not production/composition relationships. '+('Version: '+rec['disambiguation'] if rec.get('disambiguation') else ''))
        credits=[];featured=False
        for ac in rawcredits:
            aid=self.add_artist(ac['artist']);role='producer' if norm(ac['artist'].get('name','')) in PRODUCTION_ONLY or norm(ac['artist'].get('sort-name','')) in PRODUCTION_ONLY else 'featured' if featured else 'main'
            credits.append({'artistId':aid,'role':role,'verification':'source-confirmed','sourceIds':[src['id']]})
            if re.search(r'feat|featuring|with',ac.get('joinphrase',''),re.I):featured=True
        # An artist repeated under two credited names remains one participant.
        credits=list({c['artistId']:c for c in credits}.values())
        releaseids=[]
        official=[r for r in rec.get('releases',[]) if r.get('status') in ('Official',None)]
        for rel in official:
            rd=rel.get('date')
            if not rd or not re.match(r'^\d{4}',rd):continue
            ry=int(rd[:4])
            if not 1995<=ry<=int(ASOF[:4]) or rd>ASOF:continue
            relid='mb-'+rel['id'];releaseids.append(relid)
            relsrc=evidence('MusicBrainz','https://musicbrainz.org/release/'+rel['id'])
            group=rel.get('release-group',{})
            primary=group.get('primary-type','Album').lower()
            secondary=[s.lower() for s in group.get('secondary-types',[])]
            rtype='compilation' if 'compilation' in secondary else 'mixtape' if 'mixtape/street' in secondary else primary if primary in ('album','ep','single') else 'album'
            owners=[]
            for ac in rel.get('artist-credit',[]):
                if not isinstance(ac,dict) or not ac.get('artist'):continue
                ra=ac['artist'];seed=self.seed_match(ra);owner=seed['id'] if seed else 'mb-'+ra['id']
                if owner in self.artists:owners.append(owner)
            if not owners:owners=[credits[0]['artistId']]
            if relid not in self.releases:self.releases[relid]={'id':relid,'title':rel['title'],'artistIds':list(dict.fromkeys(owners)),'date':rd,'year':ry,'type':rtype,'source':relsrc,'recordingIds':[],'url':relsrc['url']}
            if rid not in self.releases[relid]['recordingIds']:self.releases[relid]['recordingIds'].append(rid)
        if rid in self.recordings:
            old=self.recordings[rid]
            old['releaseIds']=sorted(set([*old['releaseIds'],*releaseids]))
            if date<old.get('date','9999'):old.update(date=date,year=year)
            return
        self.recordings[rid]={'id':rid,'title':title,'year':year,'date':date,'releaseIds':releaseids,'credits':credits,
            'sources':[src],'isrcs':rec.get('isrcs',[]),'kind':'official','verification':'source-confirmed' if any(x.get('status')=='Official' for x in rec.get('releases',[])) else 'pending',
            'listenUrl':'https://www.youtube.com/results?search_query='+urllib.parse.quote(title+' '+rawcredits[0]['artist']['name'])}
    def collect_seed(self,seed,max_pages):
        raw=getattr(self,'resolved_raw',{}).get(seed['id']) or self.resolve(seed)
        if not raw:return
        if not seed.get('core',True):return # Adjacent singers are imported only through core co-credits.
        aid=self.add_artist(raw,seed)
        if not any(s['id']==seed['id'] for s in self.resolved):self.resolved.append({**seed,'musicbrainz':raw['id']})
        total_found=0
        review=self.identity_review.get(seed['id'],{})
        for mbid in [raw['id'],*review.get('alternateMusicbrainz',[])]:
            for page in range(max_pages):
                result=self.client.mb('recording',query='arid:'+mbid,limit=100,offset=page*100)
                for rec in result.get('recordings',[]):self.ingest(rec)
                if (page+1)*100>=result.get('count',0):break
            count=result.get('count',0);total_found+=count
            if count>max_pages*100:self.pending[seed['id']]={'reason':'recording-pages-capped','available':count,'collectedPages':max_pages}
        self.artists[aid]['coverage']['note']=f'MusicBrainz 아티스트 크레딧 검색 {total_found}건 확인. 중복 녹음·연도 불명·기악·영상은 제외하며, 전체 디스코그래피 수록률은 보증하지 않습니다.'
    def export(self):
        coverage={aid:{'recordings':set(),'releases':set()} for aid in self.artists}
        for rec in self.recordings.values():
            for c in rec['credits']:
                item=coverage[c['artistId']];item['recordings'].add(rec['id']);item['releases'].update(rec['releaseIds'])
        for aid,a in self.artists.items():
            item=coverage[aid];a['coverage'].update(recordingCount=len(item['recordings']),releaseCount=len(item['releases']),pendingCount=1 if aid in self.pending else 0)
        # Earliest observed recording is not the artist's actual debut date.
        # Preserve source-backed manual fixes and official free-release additions outside collector output.
        ds={'version':'2026.10.01','asOf':ASOF,'artists':list(self.artists.values()),'recordings':list(self.recordings.values()),'releases':list(self.releases.values()),'memberships':list(self.memberships),
            'notes':['MusicBrainz의 녹음별 아티스트 표기와 확인된 래퍼·보컬 정체성으로 공동 작업을 계산합니다. 보컬 역할 불명·기악·프로듀싱 참여자는 관계 집계에서 제외하며 전체 발매곡 수록을 보증하지 않습니다.','그룹은 별도 노드이며, 멤버십·작곡·프로듀싱 관계는 자동 협업에 포함하지 않습니다.','기간은 1995년부터 현재 수집일까지이며, 연도 불명·기악·영상 항목은 집계에서 제외합니다.']}
        overrides=ROOT/'data/official.json'
        if overrides.exists():
            extra=json.loads(overrides.read_text())
            for key in ['artists','recordings','releases','memberships']:
                if key=='memberships':ds[key].extend(extra.get(key,[]));continue
                byid={x['id']:x for x in ds[key]}
                for item in extra.get(key,[]):
                    if item['id'] in byid and key=='artists':
                        old=byid[item['id']];old['sources']=list({x['id']:x for x in [*old['sources'],*item.get('sources',[])]}.values());old['aliases']=list(dict.fromkeys([*old.get('aliases',[]),*item.get('aliases',[])]));[old['externalIds'].setdefault(k,v) for k,v in item.get('externalIds',{}).items()]
                    else:byid[item['id']]=item
                ds[key]=list(byid.values())
            ds['notes'].extend(extra.get('notes',[]))
        ds=normalize_dataset(ds)
        ds['version']=dataset_version(ds)
        portraits=ROOT/'data/portraits.json'
        if portraits.exists():
            ims=json.loads(portraits.read_text())
            if isinstance(ims,dict):
                for artist in ds['artists']:
                    if artist['id'] in ims:artist['image']=ims[artist['id']]
        for name,obj in [('catalog.json',ds),('resolved-seeds.json',self.resolved),('pending.json',self.pending)]:
            path=ROOT/'data'/name;tmp=path.with_suffix('.tmp');tmp.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n');tmp.replace(path)
        return ds


def dataset_version(ds):
    """Version actual publication content while excluding volatile timestamps."""
    def stable(value):
        if isinstance(value,dict):return {k:stable(v) for k,v in value.items() if k not in ('fetchedAt','checkedAt','version','image')}
        if isinstance(value,list):return [stable(v) for v in value]
        return value
    payload={key:stable(ds[key]) for key in ('artists','recordings','releases','memberships')}
    digest=hashlib.sha256(json.dumps(payload,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()[:8]
    return ds['asOf'].replace('-','.')+'-'+digest


def normalize_dataset(ds):
    """Merge unambiguous same-performance identifiers while retaining evidence.

    Shared ISRC with different participants is kept separate for human review;
    title similarity by itself never merges different studio performances.
    """
    seed_path=ROOT/'data/seeds.json';seed_rows=json.loads(seed_path.read_text()) if seed_path.exists() else [];canonical_seed_ids={s['id'] for s in seed_rows}
    grouped={};artist_alias={}
    for a in ds['artists']:grouped.setdefault(a['externalIds'].get('musicbrainz',a['id']),[]).append(a)
    unique_artists=[]
    for mbid,variants in grouped.items():
        chosen=min(variants,key=lambda a:(a['id'] not in canonical_seed_ids,a['id']))
        chosen['aliases']=list(dict.fromkeys(n for a in variants for n in [a['name'],a['nameEn'],*a['aliases']] if n!=chosen['name']))
        chosen['sources']=list({x['id']:x for a in variants for x in a['sources']}.values())
        for a in variants:
            artist_alias[a['id']]=chosen['id']
            for k,v in a['externalIds'].items():chosen['externalIds'].setdefault(k,v)
        unique_artists.append(chosen)
    ds['artists']=unique_artists
    for r in ds['recordings']:
        for c in r['credits']:c['artistId']=artist_alias[c['artistId']]
        grouped_credits={}
        for c in r['credits']:
            if c['artistId'] not in grouped_credits:grouped_credits[c['artistId']]=c
            else:grouped_credits[c['artistId']]['sourceIds']=sorted(set([*grouped_credits[c['artistId']]['sourceIds'],*c['sourceIds']]))
        r['credits']=list(grouped_credits.values())
    for rel in ds['releases']:rel['artistIds']=sorted({artist_alias[a] for a in rel['artistIds']})
    for membership in ds['memberships']:
        membership['groupId']=artist_alias.get(membership['groupId'],membership['groupId']);membership['artistId']=artist_alias.get(membership['artistId'],membership['artistId'])
    rows={r['id']:r for r in ds['recordings']};parent={rid:rid for rid in rows};artist_map={a['id']:a for a in ds['artists']}
    rp=ROOT/'data/recording-review.json';recording_reviews=json.loads(rp.read_text()) if rp.exists() else {}
    for rid,review in recording_reviews.items():
        if rid in rows:
            rows[rid]['verification']=review['verification'];rows[rid]['sources'][0]['note']=review['reason']+' Evidence: '+review['sourceUrl']
    pp=ROOT/'data/performer-policy.json';policies=json.loads(pp.read_text()) if pp.exists() else {}
    mp=ROOT/'data/artist-metadata.json';metadata=json.loads(mp.read_text()) if mp.exists() else {}
    resolved_path=ROOT/'data/resolved-seeds.json';resolved=json.loads(resolved_path.read_text()) if resolved_path.exists() else []
    resolved_map={s['id']:s for s in resolved}
    for a in ds['artists']:
        confirmed=resolved_map.get(a['id'])
        if confirmed:
            a['externalIds']['musicbrainz']=confirmed['musicbrainz'];a['core']=confirmed.get('core',True)
        info=metadata.get(a['externalIds'].get('musicbrainz'))
        if info:
            if not a['core']:a['kind']='group' if info.get('type') in ('Group','Orchestra','Choir') else 'person'
            if info.get('country'):a['country']=info['country']
    ds['memberships']=list({(m['groupId'],m['artistId'],m.get('startYear'),m.get('endYear')):m for m in ds['memberships']}.values())
    def find(rid):
        while parent[rid]!=rid:
            parent[rid]=parent[parent[rid]];rid=parent[rid]
        return rid
    def union(a,b):
        a,b=find(a),find(b)
        if a!=b:parent[max(a,b)]=min(a,b)
    performer=lambda r:tuple(sorted(c['artistId'] for c in r['credits'] if c['role'] in ('main','featured','vocal','rap')))
    by_isrc={};by_title={};conflicts=[];held_ids={rid for rid,v in recording_reviews.items() if v['verification']=='pending'}
    suffix=re.compile(r"\s*[\[(](?:(?:\d{4}\s*)?remaster(?:ed)?(?:\s*\d{4})?|3d sound|dolby atmos|spatial audio|bonus track|stereo(?: mix)?|mono(?: mix)?)[\])]\s*",re.I)
    for r in rows.values():
        for credit in r['credits']:
            a=artist_map.get(credit['artistId'])
            if not a:continue
            policy=policies.get(a['externalIds'].get('musicbrainz',''))
            if policy and not policy['eligible']:
                credit['role']=policy.get('role','instrumental');credit['verification']='reviewed'
            elif any(norm(n) in PRODUCTION_ONLY for n in [a['name'],a['nameEn']]):credit['role']='producer';credit['verification']='reviewed'
            elif a['core'] or (policy and policy['eligible']):credit['verification']='source-confirmed'
            elif not any(s['provider']=='official' for s in r['sources']):credit['verification']='pending'
            if policy:
                ps=policy['source']
                r['sources']=list({x['id']:x for x in [*r['sources'],ps]}.values());credit['sourceIds']=sorted(set([*credit['sourceIds'],ps['id']]))
        p=performer(r)
        for isrc in r.get('isrcs',[]):
            if isrc in by_isrc:
                prev=rows[by_isrc[isrc]]
                if performer(prev)==p:union(prev['id'],r['id'])
                else:
                    conflicts.append(isrc);held_ids.update([prev['id'],r['id']]);prev['verification']='pending';r['verification']='pending'
            else:by_isrc[isrc]=r['id']
        base=suffix.sub('',r['title']).strip();key=(norm(base),p)
        marked=base!=r['title'].strip() or any(re.search(r'Version:.*(atmos|spatial|remaster|3d sound)',src.get('note',''),re.I) for src in r['sources'])
        by_title.setdefault(key,[]).append((r['id'],marked))
    # Examine the whole component: a spatial/remaster annotation may be the
    # final row returned by the API, after several otherwise unmarked editions.
    for variants in by_title.values():
        if any(marked for _,marked in variants):
            for rid,_ in variants[1:]:union(variants[0][0],rid)
    # Reviewed same-duration single/EP variant with identical MB artist-credit ID.
    if 'mb-bab592fc-63a4-46e2-883c-273509cec038' in rows and 'mb-def24bc1-16a2-4027-b1a3-aae895b496d1' in rows:
        union('mb-bab592fc-63a4-46e2-883c-273509cec038','mb-def24bc1-16a2-4027-b1a3-aae895b496d1')
    # This later-titled remix lacks duration/ISRC, so it cannot count as a second
    # performance until independently resolved against the confirmed 2012 single.
    if 'mb-f87a43ea-a6c8-40e4-8947-dc6bfc39af7d' in rows and 'mb-7af7c369-7ed2-4afb-9606-17ba4d06da44' in rows:
        rows['mb-f87a43ea-a6c8-40e4-8947-dc6bfc39af7d']['verification']='pending'
        rows['mb-f87a43ea-a6c8-40e4-8947-dc6bfc39af7d']['sources'][0]['note']='Same participants/title as the 2012 remix, but no duration/ISRC; possible duplicate held out of map counts pending review.'
    # Same performance on CD / digital editions; cachedMBartist-credit IDs match.
    for a,b in [('mb-57d6fc75-6911-499c-9351-a9380874b2b6','mb-12259981-4670-40e4-96f3-71697c0c318e'),('mb-7db03833-f358-4a1a-909b-42291b55da83','mb-8ef5dbf6-e342-4b46-b5df-f3c16b8f7d82')]:
        if a in rows and b in rows and performer(rows[a])==performer(rows[b]):union(a,b)
    groups={}
    for rid in rows:groups.setdefault(find(rid),[]).append(rows[rid])
    merged=[];canonical={}
    for rid,variants in sorted(groups.items()):
        chosen=min(variants,key=lambda r:(r.get('date',str(r['year'])),r['id']))
        row={**chosen,'id':rid}
        row['date']=min(r.get('date',str(r['year'])) for r in variants);row['year']=int(row['date'][:4])
        row['releaseIds']=sorted({x for r in variants for x in r['releaseIds']})
        row['isrcs']=sorted({x for r in variants for x in r.get('isrcs',[])})
        row['sources']=list({x['id']:x for r in variants for x in r['sources']}.values())
        cr={}
        for r in variants:
            canonical[r['id']]=rid
            for c in r['credits']:
                if c['artistId'] not in cr:cr[c['artistId']]={**c,'sourceIds':list(c['sourceIds'])}
                else:cr[c['artistId']]['sourceIds']=sorted(set(cr[c['artistId']]['sourceIds']+c['sourceIds']))
        row['verification']='pending' if any(r['id'] in held_ids for r in variants) else 'source-confirmed' if any(r['verification']=='source-confirmed' for r in variants) else 'pending'
        row['credits']=list(cr.values());row['kind']='free' if any(r['kind']=='free' for r in variants) else 'official';merged.append(row)
    for rel in ds['releases']:rel['recordingIds']=sorted({canonical[r] for r in rel['recordingIds'] if r in canonical})
    ds['recordings']=merged
    for a in ds['artists']:
        if a.get('country') is None:a.pop('country',None)
    coverage={aid:{'recordings':set(),'releases':set(),'pending':set()} for aid in artist_map}
    for r in merged:
        for c in r['credits']:
            item=coverage[c['artistId']];item['recordings'].add(r['id']);item['releases'].update(r['releaseIds'])
            if r['verification']=='pending' or c['verification']=='pending':item['pending'].add(r['id'])
    for a in ds['artists']:
        a.pop('debutYear',None)
        item=coverage[a['id']];a['coverage'].update(recordingCount=len(item['recordings']),releaseCount=len(item['releases']),pendingCount=len(item['pending']))
    if len(merged)<len(rows):ds['notes'].append(f"동일 ISRC·참여자 또는 리마스터·입체음향 표기가 일치하는 {len(rows)-len(merged)}건을 같은 녹음으로 병합했습니다.")
    if conflicts:ds['notes'].append(f"ISRC 참여자가 다른 {len(set(conflicts))}건은 병합하지 않고 검토 대기로 유지합니다.")
    return ds


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--limit',type=int,default=0);parser.add_argument('--offset',type=int,default=0)
    parser.add_argument('--max-pages',type=int,default=8);parser.add_argument('--refresh',action='store_true');parser.add_argument('--normalize-only',action='store_true');parser.add_argument('--export-every',type=int,default=5)
    args=parser.parse_args()
    if args.normalize_only:
        path=ROOT/'data/catalog.json';ds=normalize_dataset(json.loads(path.read_text()));ds['version']=dataset_version(ds);path.write_text(json.dumps(ds,ensure_ascii=False,indent=2)+'\n');return
    seeds=json.loads((ROOT/'data/seeds.json').read_text())
    selected=seeds[args.offset:args.offset+args.limit if args.limit else None]
    collector=Collector(Client(args.refresh),seeds)
    collector.resolved_raw={}
    for i,seed in enumerate(seeds):
        try:
            raw=collector.resolve(seed)
            if raw:
                collector.resolved_raw[seed['id']]=raw;collector.resolved.append({**seed,'musicbrainz':raw['id']})
        except Exception as e:collector.pending[seed['id']]={'reason':'request-failed','error':str(e)}
        if (i+1)%20==0:
            (ROOT/'data/resolved-seeds.json').write_text(json.dumps(collector.resolved,ensure_ascii=False,indent=2)+'\n')
            print(f'Identity discovery [{i+1}/{len(seeds)}]: {len(collector.resolved)} confirmed, {len(collector.pending)} pending',flush=True)
    for i,seed in enumerate(selected):
        try:collector.collect_seed(seed,args.max_pages)
        except Exception as e:
            collector.client.log(seed['id'],'error',str(e));collector.pending[seed['id']]={'reason':'request-failed','error':str(e)}
        if (args.export_every and (i+1)%args.export_every==0) or i==len(selected)-1:
            ds=collector.export();print(f'[{i+1}/{len(selected)}] {seed["nameEn"]}: {len(ds["artists"])} artists ({sum(a["core"] for a in ds["artists"])} core), {len(ds["recordings"])} recordings, {len(ds["releases"])} releases, {len(collector.pending)} pending',flush=True)
    print('Collection complete; catalog.sqlite retains raw evidence and retryable candidates.',flush=True)

if __name__=='__main__':main()

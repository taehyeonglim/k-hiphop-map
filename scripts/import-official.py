#!/usr/bin/env python3
"""Import narrowly reviewed official-source additions and band memberships.

The curated release below is verified against the artist's own official blog;
original beat/sample producers are deliberately NOT credited as vocal guests.
This script never invents a recording identifier: it uses the exact MusicBrainz
recording on the matched official release and preserves the original evidence.
"""
import json, sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from collect import ROOT, Client, Collector, evidence, NOW, norm

SEEDS=json.loads((ROOT/'data/seeds.json').read_text())
client=Client();collector=Collector(client,SEEDS)
existing=json.loads((ROOT/'data/catalog.json').read_text()) if (ROOT/'data/catalog.json').exists() else {'artists':[]}
base={a['id']:a for a in existing['artists']}
for a in existing['artists']:
    if a.get('externalIds',{}).get('musicbrainz'):
        seed=next((s for s in SEEDS if s['id']==a['id']),None)
        if seed:
            collector.primary_mbid[seed['id']]=a['externalIds']['musicbrainz']
            for mbid in [a['externalIds']['musicbrainz'],*collector.identity_review.get(seed['id'],{}).get('alternateMusicbrainz',[])]:collector.mbid_seed[mbid]=seed

# Official label-operated BTS blog, live HTML rechecked for title, date and guest.
url='https://bangtan.tistory.com/285';html=client.get(url,json_response=False)
assert all(token in html for token in ['RM - Rap Monster','Krizz Kaliko','2015','mediafire.com','God Rap']), 'Official source changed; human review required.'
source=evidence('official',url,'Artist/label blog, 2015-03-20. Explicit free download and track list; Rush features Krizz Kaliko. Original-beat producers are not performance credits.')
source.pop('license',None)
rm=client.mb('artist/58f1e354-ecbc-4fd3-aa25-97eb1d9bd8b9',inc='aliases')
rmseed=next(s for s in SEEDS if s['id']=='rm');collector.add_artist(rm,rmseed)
rel=client.mb('release/ddd2a171-0ddd-40b6-afc9-fbd1b2185263',inc='recordings+artist-credits')
release_id='mb-'+rel['id'];recording_ids=[]
for medium in rel.get('media',[]):
    for track in medium.get('tracks',[]):
        rec=track['recording'];rid='mb-'+rec['id'];recording_ids.append(rid)
        mb_source=evidence('MusicBrainz','https://musicbrainz.org/recording/'+rec['id'])
        # The blog explicitly presents this as RM's mixtape. Only its named guest
        # is accepted; J. Cole, Drake etc. appear as original beat owners only.
        credits=[{'artistId':'rm','role':'main','verification':'source-confirmed','sourceIds':[source['id'],mb_source['id']]}]
        if norm(rec['title'])=='rush':
            guest=client.mb('artist/eacc6d9c-199e-45fb-960b-e21fa503f82b',inc='aliases')
            gid=collector.add_artist(guest)
            credits.append({'artistId':gid,'role':'featured','verification':'source-confirmed','sourceIds':[source['id'],mb_source['id']]})
        collector.recordings[rid]={'id':rid,'title':rec['title'],'year':2015,'date':'2015-03-20','releaseIds':[release_id],'credits':credits,'sources':[mb_source,source],'isrcs':rec.get('isrcs',[]),'kind':'free','verification':'source-confirmed','listenUrl':'https://soundcloud.com/bangtan/sets/rm-rap-monster/s-FJEew'}
collector.releases[release_id]={'id':release_id,'title':'RM','artistIds':['rm'],'date':'2015-03-20','year':2015,'type':'mixtape','source':source,'recordingIds':recording_ids,'url':url}
collector.artists['rm']['sources'].append(source)

# Group membership is separately stored context, not inferred singing on songs.
for artist in existing['artists']:
    if artist['kind']!='group' or not artist['core']:continue
    mbid=artist.get('externalIds',{}).get('musicbrainz')
    if not mbid:continue
    raw=client.mb('artist/'+mbid,inc='artist-rels+url-rels')
    msource=evidence('MusicBrainz','https://musicbrainz.org/artist/'+mbid,'Explicit member-of-band relationships; no recording performance is inferred.')
    for reln in raw.get('relations',[]):
        if reln.get('type')!='member of band' or reln.get('direction')!='backward' or reln.get('artist',{}).get('type')!='Person':continue
        person=reln['artist'];aid=collector.add_artist(person)
        member={'groupId':artist['id'],'artistId':aid,'source':msource}
        if reln.get('begin'):member['startYear']=int(reln['begin'][:4])
        if reln.get('end'):member['endYear']=int(reln['end'][:4])
        collector.memberships.append(member)
    print('Memberships:',artist['nameEn'],len(collector.memberships),flush=True)

out={'artists':list(collector.artists.values()),'releases':list(collector.releases.values()),'recordings':list(collector.recordings.values()),'memberships':collector.memberships,'notes':['공식 무료 공개 믹스테이프 RM(2015)은 아티스트·레이블 블로그에서 발매일·트랙·무료 배포·피처링을 추가 확인했습니다. 비트 원작자·샘플 아티스트는 참여자로 취급하지 않습니다.','그룹 멤버십은 MusicBrainz의 명시된 member-of-band 관계로 별도 보관하며, 그룹 곡을 멤버 개인의 협업으로 전환하지 않습니다.']}
(ROOT/'data/official.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print('Imported',len(out['recordings']),'free recordings and',len(out['memberships']),'memberships.')

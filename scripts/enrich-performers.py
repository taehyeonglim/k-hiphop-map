#!/usr/bin/env python3
"""Confirm one-hop performers from MusicBrainz artist identity metadata.

Artist billing is not proof of singing. Only explicit singer/rapper/vocalist
identity or a documented review policy upgrades unknown one-hop credits. Batch
MBID searches keep this inexpensive without guessing from aliases or country.
"""
import json, re, sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from collect import ROOT, Client, evidence
catalog=json.loads((ROOT/'data/catalog.json').read_text())
ids=[a['externalIds']['musicbrainz'] for a in catalog['artists'] if a.get('externalIds',{}).get('musicbrainz')]
client=Client();policy={};metadata_path=ROOT/'data/artist-metadata.json';metadata=json.loads(metadata_path.read_text()) if metadata_path.exists() else {}
ids=[aid for aid in ids if aid not in metadata]
path=ROOT/'data/performer-policy.json'
if path.exists():policy=json.loads(path.read_text())
for start in range(0,len(ids),40):
    chunk=ids[start:start+40]
    raw=client.mb('artist',query='arid:('+ ' OR '.join(chunk)+')',limit=100)
    for artist in raw.get('artists',[]):
        aid=artist['id'];metadata[aid]=artist
        dis=artist.get('disambiguation','')
        source=evidence('MusicBrainz','https://musicbrainz.org/artist/'+aid,'Explicit artist identity disambiguation: '+dis)
        if re.search(r'\b(rapper|rap artist|singer|vocalist|vocal group|boy band|girl group|boy group|girl band)\b',dis,re.I):
            policy[aid]={'eligible':True,'source':source,'reason':dis}
        elif re.search(r'\b(trumpeter|guitarist|drummer|pianist|instrumentalist|sound engineer|record producer|composer|DJ)\b',dis,re.I) and not re.search(r'\b(singer|rapper|vocalist)\b',dis,re.I):
            policy[aid]={'eligible':False,'role':'instrumental' if re.search(r'trumpet|guitar|drum|piano|instrument',dis,re.I) else 'producer','source':source,'reason':dis}
    print(f'Artist metadata [{min(start+40,len(ids))}/{len(ids)}]: {sum(p["eligible"] for p in policy.values())} explicitly identified vocalists',flush=True)
# IDs here are deliberately specific: Seven the underground rapper is NOT Se7en
# and is not excluded merely because "DJ Seven" appears in one title.
for aid,role in {'172db744-4c70-4bc5-bd74-a8c90811c29a':'instrumental','6c77993b-236a-4bd6-80ad-b7d55c14f15d':'instrumental','143259a0-3057-479c-8b62-355720ffeab9':'instrumental'}.items():
    policy[aid]={'eligible':False,'role':role,'source':evidence('MusicBrainz','https://musicbrainz.org/artist/'+aid,'Curator review: scratch DJ / instrumental guest, held out of vocal collaboration ties.'),'reason':'Known instrumental guest; billing does not imply singing.'}
policy['172db744-4c70-4bc5-bd74-a8c90811c29a']['source']=evidence('official','https://www.aomgofficial.com/djwegun','Official AOMG profile: turntablist and producer; no vocal performance inferred.')
policy['172db744-4c70-4bc5-bd74-a8c90811c29a']['source'].pop('license',None)
path.write_text(json.dumps(policy,ensure_ascii=False,indent=2)+'\n')
(ROOT/'data/artist-metadata.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n')
print('Saved',len(policy),'explicit performer policies.')

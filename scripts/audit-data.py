#!/usr/bin/env python3
"""Repeatable 25-artist, five-era source availability audit (not recall scores)."""
import json,sys,urllib.parse,xml.etree.ElementTree as ET
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from collect import ROOT,Client,NOW,norm
samples=[('1995–2004',['dj-doc','drunken-tiger','garion','cb-mass','kim-jin-pyo']),('2005–2009',['dok2','the-quiett','paloalto','verbal-jint','basick']),('2010–2014',['swings','e-sens','supreme-team','beenzino','jay-park']),('2015–2019',['bewhy','c-jamm','changmo','kid-milli','yanghongwon']),('2020–현재',['lee-young-ji','since','be-o','homies','fleeky-bang'])]
seeds={a['id']:a for a in json.loads((ROOT/'data/seeds.json').read_text())};catalog=json.loads((ROOT/'data/catalog.json').read_text());artists={a['id']:a for a in catalog['artists']};client=Client();rows=[]
for era,ids in samples:
 for aid in ids:
  seed=seeds[aid];name=seed['name'];query=urllib.parse.quote(name)
  artisturl=f'https://www.maniadb.com/api/search/{query}/?sr=artist&display=5&key=example&v=0.5'
  albumurl=f'https://www.maniadb.com/api/search/{query}/?sr=album&display=100&key=example&v=0.5'
  row={'era':era,'id':aid,'name':name,'musicbrainzId':artists.get(aid,{}).get('externalIds',{}).get('musicbrainz'),'collectedRecordings':artists.get(aid,{}).get('coverage',{}).get('recordingCount',0),'maniadbArtistUrl':artisturl,'maniadbAlbumUrl':albumurl}
  try:
   root=ET.fromstring(client.get(artisturl,json_response=False));items=root.findall('./channel/item')
   exact=[x for x in items if norm(x.findtext('title','')) in {norm(name),norm(seed['nameEn']),*[norm(n) for n in seed.get('aliases',[])]}]
   row['maniadbExactArtistCandidates']=[x.get('id') for x in exact]
   root=ET.fromstring(client.get(albumurl,json_response=False));row['maniadbAlbumSearchCount']=int(root.findtext('./channel/total','0'))
  except Exception as e:row['error']=str(e)
  rows.append(row);print(era,name,row.get('maniadbAlbumSearchCount',row.get('error')),flush=True)
(ROOT/'data/source-audit.json').write_text(json.dumps({'checkedAt':NOW,'meaning':'Candidate search availability; not complete repertoire coverage or recall. Era labels are sampling strata, not sourced debut claims.','artists':rows},ensure_ascii=False,indent=2)+'\n')
print('Saved 25-artist source audit.')

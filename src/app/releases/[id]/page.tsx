import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDataset } from '@/lib/data';
import { releaseTypes } from '@/lib/releases';

export function generateStaticParams() { return getDataset().releases.map(release => ({ id: release.id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params, release = getDataset().releases.find(row => row.id === id);
  return { title: release ? `${release.title} · ${release.year}` : '앨범', alternates: { canonical: `/releases/${id}/` } };
}
export default async function ReleasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params, data = getDataset(), release = data.releases.find(row => row.id === id);
  if (!release) notFound();
  const artists = new Map(data.artists.map(artist => [artist.id, artist]));
  const records = new Map(data.recordings.map(recording => [recording.id, recording]));
  const linked = release.recordingIds.map(rid => records.get(rid)).filter(row => row !== undefined);
  const editions = release.editionGroup ? data.releases.filter(row => row.id !== id && row.editionGroup === release.editionGroup) : [];
  const pending = release.tracks?.filter(track => track.status === 'pending').length ?? 0;
  return <main className="document-page release-document"><nav className="archive-nav" aria-label="아카이브 메뉴"><Link href="/releases/">← 앨범 탐색</Link><Link href="/">협업 지도</Link><Link href="/coverage/">수집 현황</Link></nav>
    <div className="document-kicker">{release.year} / {releaseTypes[release.type]}</div><h1 className="release-title">{release.title}</h1>
    <p className="document-lead">{release.type === 'compilation' ? 'Various Artists' : release.artistIds.map(aid => artists.get(aid)?.name).filter(Boolean).join(' · ') || '발매 주체 확인 중'}</p>
    <dl className="release-facts"><dt>발매</dt><dd>{release.date}</dd><dt>레이블</dt><dd>{release.labels?.join(' · ') || '확인 중'}</dd>{release.aliases?.length ? <><dt>다른 표기</dt><dd>{release.aliases.join(' · ')}</dd></> : null}
      <dt>수록 목록</dt><dd>{release.inventory?.status === 'complete' ? `${release.tracks?.length} / ${release.inventory.expectedTracks}트랙 확인` : '일부 수록 · 전체 목록 미확인'}</dd>
      <dt>녹음 연결</dt><dd>{linked.length}곡{pending > 0 ? ` · 트랙 ${pending}개 참여 근거 검토 중` : ''}</dd>
    </dl>
    <section><h2>수록곡</h2><p>참여자 링크는 확인된 크레딧입니다. 녹음과 실연 근거가 확인된 협업을 지도에 반영합니다. 기악·MR은 수록 목록에 남기며, 그룹 명의를 멤버 개인의 참여로 바꾸지 않습니다.</p>
      {release.tracks ? <ol className="album-tracks">{release.tracks.map(track => {
        const rec = track.recordingId ? records.get(track.recordingId) : undefined;
        const approved = rec?.credits.filter(credit => credit.verification !== 'pending' && ['main', 'featured', 'rap', 'vocal'].includes(credit.role)) ?? [];
        return <li key={`${track.disc}-${track.position}`}><span className="track-position">{track.disc}.{track.number}</span><div><h3>{track.title}</h3><p className="track-billing">원문 표기 · {track.creditedAs || '확인 중'}</p>
          {!!approved.length && <p className="track-people">{approved.map(credit => <Link key={credit.artistId} href={`/artists/${credit.artistId}/`}>{artists.get(credit.artistId)?.name ?? credit.artistId}</Link>)}</p>}
          {track.status !== 'linked' && <p className="track-status">{track.status === 'excluded' ? track.reason : track.reason || '일부 참여자·역할 근거 검토 중'}</p>}
          <details className="track-evidence"><summary>트랙 출처와 크레딧 근거</summary><div>{[...new Map([...track.sources, ...(rec?.sources ?? [])].map(source => [source.id, source])).values()].map(source => <a key={source.id} href={source.url} target="_blank" rel="noreferrer">{source.provider} ↗</a>)}</div></details>
        </div></li>;
      })}</ol> : <><p className="document-note">전체 트랙 순서는 아직 확인하지 못했습니다. 아래는 현재 연결된 녹음이며, 앨범의 전체 수록곡 목록이 아닙니다.</p><ul className="partial-tracks">{linked.map(recording => <li key={recording.id}>{recording.title}</li>)}</ul></>}
    </section>
    {!!editions.length && <section><h2>관련 판본</h2>{editions.map(edition => <p key={edition.id}><Link href={`/releases/${edition.id}/`}>{edition.title} · {edition.date}</Link></p>)}</section>}
    <section><h2>발매 정보 출처</h2>{(release.sources ?? [release.source]).map(source => <p key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.provider} ↗</a>{source.note ? ` · ${source.note}` : ''}</p>)}<p><Link href="/coverage/">누락 자료와 사진의 수집 현황</Link></p></section>
    <footer className="document-footer">K-HIPHOP MAP / {data.version}</footer>
  </main>;
}

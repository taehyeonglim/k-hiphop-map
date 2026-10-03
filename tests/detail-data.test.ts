import { afterEach, expect, it, vi } from 'vitest';
import { DatasetChangedError, fetchArtistDetail, fetchRecordingDetail } from '../src/lib/detail-data';
afterEach(() => vi.unstubAllGlobals());
it('rejects stale detail instead of caching mixed dataset versions', async () => {
  const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ version: 'old', artist: { id: 'a' }, recordings: [], releases: [], memberships: [] }) });
  vi.stubGlobal('fetch', fetcher);
  await expect(fetchArtistDetail('a', 'new')).rejects.toBeInstanceOf(DatasetChangedError);
  fetcher.mockResolvedValue({ ok: true, json: async () => ({ version: 'new', artist: { id: 'a' }, recordings: [], releases: [], memberships: [] }) });
  await expect(fetchArtistDetail('a', 'new')).resolves.toMatchObject({ version: 'new' });
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(fetcher.mock.calls[0][0]).toContain('?v=new');
});
it('rejects malformed and wrong-identity recording chunks', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ version: 'v1', recording: { id: 'wrong', sources: [] } }) }));
  await expect(fetchRecordingDetail('r', 'v1')).rejects.toThrow('형식');
});
it('does not cache an aborted request', async () => {
  const controller = new AbortController(); controller.abort();
  const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ version: 'abort-version', artist: { id: 'b' }, recordings: [], releases: [], memberships: [] }) });
  vi.stubGlobal('fetch', fetcher);
  await expect(fetchArtistDetail('b', 'abort-version', controller.signal)).rejects.toMatchObject({ name: 'AbortError' });
  await expect(fetchArtistDetail('b', 'abort-version')).resolves.toMatchObject({ version: 'abort-version' });
  expect(fetcher).toHaveBeenCalledTimes(2);
});

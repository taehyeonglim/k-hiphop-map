export type Verification = 'source-confirmed' | 'reviewed' | 'pending';
export interface SourceEvidence { id: string; provider: 'MusicBrainz' | 'maniadb' | 'official' | 'Wikimedia' | 'Bugs' | 'Genie'; url: string; fetchedAt: string; license?: string; note?: string }
export interface ImageAsset { src: string; originalUrl: string; sourceUrl: string; author: string; title?: string; license: string; licenseUrl: string; crop?: string; identitySources?: string[]; checkedAt?: string; reviewedAt?: string; permission?: { basis: 'license' | 'permission'; url: string } }
export interface Artist { id: string; name: string; nameEn: string; aliases: string[]; kind: 'person' | 'group'; core: boolean; country?: string; debutYear?: number; image?: ImageAsset; externalIds: Record<string,string>; sources: SourceEvidence[]; coverage: { releaseCount: number; recordingCount: number; pendingCount: number; checkedAt: string; note: string }; community?: number; x?: number; y?: number }
export interface ReleaseTrack { disc: number; position: number; number: string; title: string; creditedAs: string; recordingId?: string; durationMs?: number; status: 'linked' | 'pending' | 'excluded'; reason?: string; sources: SourceEvidence[] }
export interface Release { id: string; title: string; artistIds: string[]; date: string; year: number; type: 'album' | 'ep' | 'single' | 'compilation' | 'mixtape'; source: SourceEvidence; recordingIds: string[]; url?: string; aliases?: string[]; labels?: string[]; series?: string; editionGroup?: string; sources?: SourceEvidence[]; tracks?: ReleaseTrack[]; inventory?: { status: 'complete' | 'partial'; expectedTracks: number; checkedAt: string } }
export interface ReleaseIndexEntry extends Pick<Release, 'id' | 'title' | 'aliases' | 'year' | 'type' | 'labels' | 'series' | 'editionGroup'> { artists: string[]; trackCount: number | null; linkedCount: number; pendingCount: number; complete: boolean }
export interface ReleaseIndex { version: string; asOf: string; releases: ReleaseIndexEntry[] }
export type PortraitState = 'unsearched' | 'included' | 'retry' | 'not-found' | 'visual-review' | 'permission-needed' | 'identity-review';
export interface PortraitReview { state: PortraitState; checkedAt?: string; reason?: string; sources?: string[]; nextAction: string; attempts: { provider: string; checkedAt: string; result: string }[] }
export interface CoverageData { version: string; asOf: string; portraits: (PortraitReview & { id: string; name: string; core: boolean })[]; releases: { id: string; title: string; status: string; reason?: string; tracks?: number; checkedAt?: string }[] }
export interface Credit { artistId: string; role: 'main' | 'featured' | 'vocal' | 'rap' | 'producer' | 'composer' | 'instrumental'; verification: Verification; sourceIds: string[] }
export interface Recording { id: string; title: string; year: number; date?: string; releaseIds: string[]; credits: Credit[]; sources: SourceEvidence[]; isrcs: string[]; kind: 'official' | 'free'; verification: Verification; listenUrl?: string }
export interface Membership { groupId: string; artistId: string; startYear?: number; endYear?: number; source: SourceEvidence }
export interface Dataset { artistAliases?: Record<string, string>; version: string; asOf: string; artists: Artist[]; releases: Release[]; recordings: Recording[]; memberships: Membership[]; notes: string[] }
export interface GraphEdge { id: string; source: string; target: string; count: number; recordingIds: string[]; weight: number; affinity: number; years: number[] }
export interface GraphNode { id: string; degree: number; count: number; community: number; x: number; y: number }
export interface GraphSnapshot { version: string; asOf: string; nodes: GraphNode[]; edges: GraphEdge[]; stats: { artists: number; coreArtists: number; recordings: number; collaborations: number; releases: number; portraits: number } }
export interface MapFilters { from: number; to: number; cumulative: boolean; extended: boolean; minCount: number; artist?: string; target?: string }

/** Deliberately excludes discography and evidence, which load on selection. */
export type MapArtist = Pick<Artist, 'id' | 'name' | 'nameEn' | 'aliases' | 'kind' | 'core' | 'image' | 'community' | 'x' | 'y'>;
export type MapRecording = Pick<Recording, 'id' | 'year' | 'verification'> & {
  credits: Pick<Credit, 'artistId' | 'role' | 'verification'>[];
};
export interface MapDataset { artistAliases?: Record<string, string>; version: string; asOf: string; artists: MapArtist[]; recordings: MapRecording[]; notes: string[] }
export type GraphDataset = MapDataset & { releases?: Release[] };
export interface ArtistDetail { version: string; artist: Artist; releases: Release[]; recordings: Recording[]; memberships: Membership[] }
export interface RecordingDetail { version: string; recording: Recording }

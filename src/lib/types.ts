export type Verification = 'source-confirmed' | 'reviewed' | 'pending';
export interface SourceEvidence { id: string; provider: 'MusicBrainz' | 'maniadb' | 'official' | 'Wikimedia'; url: string; fetchedAt: string; license?: string; note?: string }
export interface ImageAsset { src: string; originalUrl: string; sourceUrl: string; author: string; license: string; licenseUrl: string; crop?: string }
export interface Artist { id: string; name: string; nameEn: string; aliases: string[]; kind: 'person' | 'group'; core: boolean; country?: string; debutYear?: number; image?: ImageAsset; externalIds: Record<string,string>; sources: SourceEvidence[]; coverage: { releaseCount: number; recordingCount: number; pendingCount: number; checkedAt: string; note: string }; community?: number; x?: number; y?: number }
export interface Release { id: string; title: string; artistIds: string[]; date: string; year: number; type: 'album' | 'ep' | 'single' | 'compilation' | 'mixtape'; source: SourceEvidence; recordingIds: string[]; url?: string }
export interface Credit { artistId: string; role: 'main' | 'featured' | 'vocal' | 'rap' | 'producer' | 'composer' | 'instrumental'; verification: Verification; sourceIds: string[] }
export interface Recording { id: string; title: string; year: number; date?: string; releaseIds: string[]; credits: Credit[]; sources: SourceEvidence[]; isrcs: string[]; kind: 'official' | 'free'; verification: Verification; listenUrl?: string }
export interface Membership { groupId: string; artistId: string; startYear?: number; endYear?: number; source: SourceEvidence }
export interface Dataset { version: string; asOf: string; artists: Artist[]; releases: Release[]; recordings: Recording[]; memberships: Membership[]; notes: string[] }
export interface GraphEdge { id: string; source: string; target: string; count: number; recordingIds: string[]; weight: number; affinity: number; years: number[] }
export interface GraphNode { id: string; degree: number; count: number; community: number; x: number; y: number }
export interface GraphSnapshot { version: string; asOf: string; nodes: GraphNode[]; edges: GraphEdge[]; stats: { artists: number; coreArtists: number; recordings: number; collaborations: number; releases: number; portraits: number } }
export interface MapFilters { from: number; to: number; cumulative: boolean; extended: boolean; minCount: number; artist?: string; target?: string }

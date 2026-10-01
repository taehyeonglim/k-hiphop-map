# Source verification and publication limits

Audit date: 2026-10-01. This review inspected the actual MusicBrainz JSON responses in `data/catalog.sqlite` (`http_cache.body`), the generated catalog, and the collection rules. It did not send another batch of MusicBrainz API requests. The dated source links below allow a reviewer to inspect each recording; the cache preserves what the collector received even when the public website changes.

## What the evidence establishes

- The sampled recording's `artist-credit` names the listed artist MBIDs. The cache's `first-release-date` supplies the displayed recording year; it is not an artist's debut year.
- A MusicBrainz recording is an audio entity that can appear on several releases. Counting a recording MBID once prevents counting a single and its album appearance twice **when MusicBrainz uses the same recording MBID**. Different MBIDs can still describe duplicate database entries.
- A recording's primary credited artists are not necessarily all, or only, vocal performers. The public [MusicBrainz recording documentation](https://musicbrainz.org/doc/Recording) describes the artist field as the artists the recording is primarily credited to. Source-confirmed billing alone must not be presented as independently confirmed rap/vocal performance.
- Group credits remain group credits. This review does not infer a group's individual members as recording participants.
- The sample checks identity, billing and database dates. It does not prove complete discographies, all featured artists, exact daily release dates, rights in recordings, or every participant's performance role.

## Twenty-five artist sample across five recording eras

The eras refer to the **sample recording date**, not a claimed artist debut. Every listed focal artist's published MBID was found in the cached recording's `artist-credit`. Twenty-four samples contain two credited parties. Garion is deliberately a solo/group-only control: the cache's 2004 two-party candidate was a video edit and cannot establish an eligible audio collaboration.

| Recording era | Focal artist / identity kind | Cached first release | Recording source | Raw credited parties | Audit note |
| --- | --- | --- | --- | --- | --- |
| 1995–2004 | 가리온 / group | 2004-01-16 | [이렇게 (U Practice the Art of Hiphop)](https://musicbrainz.org/recording/43fdd7c6-b403-4cb1-96d8-bd115879d950) | 가리온 | Group-only control; no person-level or collaboration edge inferred. |
| 1995–2004 | 드렁큰 타이거 / group | 2000-04-23 | [Blues (Boom Bap 으로 치료해줄께)](https://musicbrainz.org/recording/57d6fc75-6911-499c-9351-a9380874b2b6) | Drunken Tiger; Roscoe Umali | Second same-title recording MBID exists; duplicate review required. |
| 1995–2004 | DJ DOC / group | 2004-11-09 | [One Night](https://musicbrainz.org/recording/6e5e8518-2d8a-4c1d-8e6f-aba3a9fce540) | DJ DOC; Red Roc | Group retained as one credited party. |
| 1995–2004 | 김진표 / person | 2001-01-23 | [목격자는 필요없어](https://musicbrainz.org/recording/26365728-69f3-433d-b2a1-4fc6e165b9b3) | 김진표; Mysty | Later 2004 release does not reset recording year. |
| 1995–2004 | CB Mass / group | 2000-09-06 | [The Movement II](https://musicbrainz.org/recording/1c0dd8a5-dfb4-4c80-bbc5-8ac8ad363d2f) | CB Mass; Drunken Tiger | Group-to-group billing; no expansion to either group's members. |
| 2005–2009 | 에픽하이 / group | 2005-10-04 | [Fly](https://musicbrainz.org/recording/37933dc7-ff6d-46f2-be50-b65bf169bdbc) | Epik High; Amin. J | Cache also contains 2005-10-06 and 2006-02-10 release dates. |
| 2005–2009 | 버벌진트 / person | 2005-07-25 | [Right Here, Right Now](https://musicbrainz.org/recording/38ed34c6-83ba-4591-9302-731a87a77610) | Joosuc; Verbal Jint | Focal artist is the second credited party. |
| 2005–2009 | 더 콰이엇 / person | 2005-07-28 | [Be Quiet](https://musicbrainz.org/recording/00c48930-93c4-4347-b104-51190fabe0ef) | The Quiett; Kebee | 2007 appearance does not add a second recording count. |
| 2005–2009 | 다이나믹 듀오 / group | 2005-10-26 | [나쁜소식 (Bad News Is Coming)](https://musicbrainz.org/recording/20abbd8a-a20c-4712-828b-bb9e65b5801b) | Dynamic Duo; BMK | Singer billed alongside hip-hop group. |
| 2005–2009 | 팔로알토 / person | 2005-10-26 | [파도 (I Know)](https://musicbrainz.org/recording/f23f1893-7770-441a-8575-151d40a7e1be) | Dynamic Duo; Paloalto | Focal artist is the second credited party. |
| 2010–2014 | 빈지노 / person | 2010-11-09 | [가뭄](https://musicbrainz.org/recording/f9808c4a-e34d-4752-839e-daf90fed0ef7) | Paloalto; Beenzino | Billing identities match focal and collaborator MBIDs. |
| 2010–2014 | 도끼 / person | 2010-04-06 | [Tonight](https://musicbrainz.org/recording/4c020937-c2c8-4231-a409-7cd8bfa938bd) | Dok2; MYK | Billing identity matches focal MBID. |
| 2010–2014 | 박재범 / person | 2011-04-29 | [Level 1000](https://musicbrainz.org/recording/b6fee6d1-206a-48b6-b986-629787416de0) | Jay Park; Dok2 | Billing identities match both core MBIDs. |
| 2010–2014 | 스윙스 / person | 2010-07-01 | [니가 잠든 후에](https://musicbrainz.org/recording/115bfc1d-b033-43de-974b-75480497ab43) | TAEYANG; Swings | Later releases remain one recording; TAEYANG is a direct collaborator. |
| 2010–2014 | 로꼬 / person | 2014-06-30 | [Nice Body](https://musicbrainz.org/recording/3c09857d-77a4-4ada-862f-98f815df2fcb) | 효민; Loco | Idol collaborator does not become a core hip-hop identity by co-credit alone. |
| 2015–2019 | 비와이 / person | 2017-09-17 | [9ucci Bank](https://musicbrainz.org/recording/c544d917-ba2d-4ec7-9044-7bddfa6ea268) | BewhY; Dok2 | Returned release date is 2017-09-19; database first-release-date agrees on year but not day. |
| 2015–2019 | 나플라 / person | 2015-11-17 | [J.O.T.S.](https://musicbrainz.org/recording/cf76f8fa-00ad-49ef-8252-752e4e3e3d6f) | Dynamic Duo; nafla | Focal artist is the second credited party. |
| 2015–2019 | 창모 / person | 2017-11-17 | [Crazy (remix)](https://musicbrainz.org/recording/a346b244-bcc9-4097-a1e9-0779ad220a19) | Dok2; 창모 | Explicit remix; must not be merged with original title by string similarity. |
| 2015–2019 | 키드밀리 / person | 2017-02-23 | [Family Business](https://musicbrainz.org/recording/2ab19d60-18e8-4a02-bc18-467de2c28b3c) | Kid Milli; Swings | Search result supplies first-release-date but no dated release rows. |
| 2015–2019 | 재키와이 / person | 2018 | [bbanzzi](https://musicbrainz.org/recording/555cecde-7cd4-4b94-94b7-0ddcf3f3f6c8) | Coogie; Jvcki Wai | Year precision only; do not invent month/day. |
| 2020–current | 호미들 / group | 2022-09-06 | [New thing](https://musicbrainz.org/recording/d7dd83f8-cc27-4be5-8d12-daf5a65bc08d) | ZICO; Homies | Group is distinct from Chin, CK and Louie. |
| 2020–current | 신스 / person | 2022-08-17 | [COMPASS](https://musicbrainz.org/recording/48009b7b-10f9-4be8-a2ef-054dcc73e380) | SINCE; Chin | No dated release rows returned; recording date and billing are cached. |
| 2020–current | 허성현 / person | 2022-12-17 | [펄펄](https://musicbrainz.org/recording/2d3ce3ee-bc94-438b-ae6d-3e71dcce6990) | Huh; Dynamic Duo | Person-to-group billing, not person-to-members. |
| 2020–current | 트레이드엘 / person | 2022-01-19 | [White Night](https://musicbrainz.org/recording/0233ed11-fb06-44c7-9671-f6d0ad2bee6e) | Trade L; Loco | Billing identities match both artist MBIDs. |
| 2020–current | 노스페이스갓 / person | 2020-12-27 | [BMW](https://musicbrainz.org/recording/38ee6dd5-5cd4-41db-905f-4afe927ec2e9) | Uneducated Kid; Northfacegawd | 2021-01-27 release appearance does not change recording year. |

## Findings from the broader identity and duplicate audit

These are concrete findings from the first generated catalog, communicated to the collector owner for remediation. They are not assertions that every finding remains in the final published snapshot.

1. **Names cannot merge different MBIDs automatically, and source MBIDs can also be wrong.** `Bi` projected RAIN credits to B.I; `노을` projected a 2004 group credit to NO:EL; composer TAK projected to Baechigi rapper Tak. Name normalization must only discover review candidates. Recording ingestion must use independently resolved MBIDs. The `Young B` issue was traced further: MusicBrainz itself links a 2006 Webstar recording and a 2015 Italian recording to YANGHONGWON's Korean MBID. [Apple Music's Webstar catalog](https://music.apple.com/us/artist/webstar/179515468) describes that era's Young B as a teenage female rapper, contradicting the Korean artist's identity. Those recording credits require review even after local MBID matching is fixed. A genuinely duplicated artist entry requires an explicit, evidenced cross-ID mapping. Country filters also missed the correct Baechigi entry because its country is absent, while the Korean composer homonym has country KR. The correct Homies Louie is explicitly disambiguated as a member of Homies; a different Korean Louie born in 1990 must not be substituted.
2. **Known nonvocal billed participants need exclusion or per-recording review.** Epik High's `Funkdamental` names unknownDJs, Loco's `Act serious` names DJ Wegun, and Kim Jin-pyo's `첫사랑은 죽었다` names trumpeter 이주한. [AOMG's official DJ Wegun profile](https://www.aomgofficial.com/djwegun) identifies his production and turntablism work. A global finite producer-name list cannot prove every other billed artist sings or raps. Direct performance evidence is needed before claiming a complete vocal-only network.
3. **Video flags alone are insufficient.** Garion's [옛이야기 (video edit)](https://musicbrainz.org/recording/aecac913-2ceb-4bca-95f2-4a19a7afac1f) was unflagged by the cached search result yet titled as a video edit. The explicit title must be held out of eligible audio counts.
4. **Different MBIDs can inflate ties.** Drunken Tiger's `Blues (Boom Bap 으로 치료해줄께)` and `Blues (Boombap으로 치료해줄께)` have the same parties/year but different MBIDs. Their cached lengths are 189000 and 189426 milliseconds, both are track 6 on 18-track CD releases of the second album, and their `artist-credit-id` is identical. [NEURON](https://musicbrainz.org/recording/7db03833-f358-4a1a-909b-42291b55da83) and its [Dolby Atmos entry](https://musicbrainz.org/recording/8ef5dbf6-e342-4b46-b5df-f3c16b8f7d82) have identical credited parties, date, duration and release-group; the variant marker occurs in `disambiguation`, not title. Title, duration, ISRC and release context should generate a duplicate-review candidate; title alone is not sufficient to merge. Intros, skits and silence are not distinct songs simply because the database gives them recording IDs.
5. **Release dates have varying precision and database disagreements.** The 9ucci Bank example disagrees on September 17 versus September 19, while bbanzzi only establishes 2018. The public filter can safely use the evidenced year; exact dates need a stronger source.
6. **Adjacent genres must remain distinguishable.** Seed classification included R&B musicians such as Zion.T, Crush, DEAN, Hoody, SUMIN and Ra.D. Artist-credit is not evidence that a person is a core hip-hop artist. Core scope is an editorial classification and direct collaborators should remain available in the one-hop expansion.
7. **Freshness is not completeness.** The first snapshot's latest cached dates included 2026-09-04 (`anime`, `TUKUTZISM`), but that does not prove every October 1 release has been collected or independently verified. The data's collection date and actual observed latest date must be described separately.
8. **A recording is not proof of an official release.** A later audit pass found 34 catalog recordings for which all returned release statuses were Bootleg, Promotion or Pseudo-Release, yet the generated kind was `official`. Examples include Garion's [Mutu](https://musicbrainz.org/recording/5bd384b5-6014-436e-8ae3-58b7c9e29659), returned with a DJMAX Portable Clazziquai Edition bootleg release. Search results can be partial, so these records are review candidates rather than proof that no official release exists. An official release or artist/label publication should establish eligibility; promotional and free releases require publication evidence rather than an automatic official label.
9. **Review status must survive every public view.** The graph excludes pending recordings and pending participant credits. The initial artist discography view only checked participant status, allowing a quarantined recording to appear under confirmed releases. Confirmed discographies must also exclude pending recordings; collection coverage counts must be labeled as collection counts when they include review candidates.

## Rechecking before publication

- Reload the final `catalog.json`, not an earlier in-memory copy; assert the 25 sample MBIDs still resolve to the intended focal identities.
- Check every source participant MBID against its catalog identity. Reviewed duplicate-MBID mappings must be listed explicitly; no alias-only identity projection may remain.
- Check the known false matches above, known nonvocal parties, video-edit exclusion, ambiguous duplicate candidates and count agreement between edge details and snapshot counts.
- Keep uncertain roles/dates/duplicates in a review queue and publish the source-backed collection status. Do not convert a successful referential-integrity test into a claim that the full historical discography is complete.
- Independently verify official free-release additions against the artist/label page. A title in a fan index or search results is discovery evidence, not official publication evidence.

## Official free-release cross-check

The [BANGTAN BLOG publication](https://bangtan.tistory.com/285) was opened independently during this audit. It is dated 2015-03-20, lists eleven RM mixtape tracks and provides download links. Its Rush entry explicitly names Krizz Kaliko as featured and Pdogg as producer. The catalog's Rush credit therefore has independent official featured-performer evidence. Original-beat credits on other tracks describe reused music and do not establish co-performance with those original artists. This supports the official-free category for these eleven entries; it does not verify all free releases in Korean hip-hop.

The authoritative collection status remains the generated catalog and pending-review data. This document records the sampling method and the specific factual risks that were actually observed.

## Reviewed identity mapping evidence

All 45 manually reviewed mapping decisions in `data/identity-review.json` were matched to actual cached artist data. The table records the raw identity context, rather than merely trusting the review-file notes. Publication matching is checked separately against the frozen catalog. Birth dates are identity disambiguators, not debut years. BIGHIT and Genie sources linked here were also independently opened for the SUGA/Agust D relationship and the H2ADIN, Pinodyne, Noh Yun-ha and Loxx Punkman contexts.

| Reviewed key | Source identity | Canonical MusicBrainz ID | Cached identity context |
| --- | --- | --- | --- |
| jay-park | [Jay Park](https://musicbrainz.org/artist/3dda8202-ce15-4031-862a-77bc6759d15e) | 3dda8202-ce15-4031-862a-77bc6759d15e | search; KR; 1987-04-25 |
| woo | [우원재](https://musicbrainz.org/artist/b22efa02-ca72-4aa7-a81d-838e60dc81c7) | b22efa02-ca72-4aa7-a81d-838e60dc81c7 | search; KR; 1996-12-23 |
| geeks | [Geeks](https://musicbrainz.org/artist/80ab91cb-3b46-4f38-92e4-f8f68518596b/relationships) | 80ab91cb-3b46-4f38-92e4-f8f68518596b | lookup; KR; South Korean hip-hop duo; 2011 |
| louie | [루이](https://musicbrainz.org/artist/80ab91cb-3b46-4f38-92e4-f8f68518596b/relationships) | b4f51145-3d43-4fb0-b983-289d7e3ede1f | search; KR; 1990-04-30 |
| lil-boi | [lIlBOI](https://musicbrainz.org/artist/9727b9b2-5e0e-4b2d-a62a-2999a9b3996f) | 9727b9b2-5e0e-4b2d-a62a-2999a9b3996f | lookup; KR; Korean rapper; 1991-06-07 |
| dean | [DEAN](https://musicbrainz.org/artist/2b983abf-ef53-483e-a5f0-356e745008bd) | 2b983abf-ef53-483e-a5f0-356e745008bd | lookup; KR; South Korean singer; 1992-11-10 |
| gray | [GRAY](https://musicbrainz.org/artist/3d8084a9-656e-497b-a368-04b59fd75ce0) | 3d8084a9-656e-497b-a368-04b59fd75ce0 | lookup; KR; Korean rapper/producer; 1986-12-08 |
| mithra-jin | [Mithra 眞](https://musicbrainz.org/artist/9e0346de-34fc-4ec6-bcb7-c5b6c72340f4?all=1&va=1) | 9e0346de-34fc-4ec6-bcb7-c5b6c72340f4 | lookup; KR; 1983-01-06 |
| mc-gree | [MC Gree](https://musicbrainz.org/artist/6e82b864-0723-4830-a834-d63d4fa63358) | 6e82b864-0723-4830-a834-d63d4fa63358 | search; KR; Korean rapper; 1998-11-10 |
| mino | [MINO](https://musicbrainz.org/artist/2650741e-908c-4cae-ba98-0717da3c3ce0) | 2650741e-908c-4cae-ba98-0717da3c3ce0 | search; KR; South Korean rapper; 1993-03-30 |
| sumin | [SUMIN](https://musicbrainz.org/artist/16f456c9-e23b-4675-ab6a-fd295712c256) | 16f456c9-e23b-4675-ab6a-fd295712c256 | search; KR; Korean singer/producer; 1991-05-13 |
| northfacegawd | [Northfacegawd](https://musicbrainz.org/artist/5aeba76e-d77e-4463-a202-7d964086f54d) | 5aeba76e-d77e-4463-a202-7d964086f54d | search; KR |
| a-chess | [A-Chess](https://musicbrainz.org/artist/1380a0d4-0e0b-48d2-a755-cd7107021d0a) | 1380a0d4-0e0b-48d2-a755-cd7107021d0a | search; KR; 1994-05-17 |
| ourealgoat | [Ourealgoat](https://musicbrainz.org/artist/0d2f9a5b-b578-4e79-85bb-8f3e01ad296f) | 0d2f9a5b-b578-4e79-85bb-8f3e01ad296f | search; KR |
| since | [SINCE](https://musicbrainz.org/artist/0b7a9b4c-2ee1-4b6c-ad31-4732d2b781b4) | 0b7a9b4c-2ee1-4b6c-ad31-4732d2b781b4 | search; KR; Korean rapper; 1992-12-28 |
| unofficialboyy | [unofficialboyy](https://musicbrainz.org/artist/78d32ee5-5b35-444f-8f64-2d00516ef805) | 78d32ee5-5b35-444f-8f64-2d00516ef805 | search; KR; 1998 |
| geegooin | [Geegooin](https://musicbrainz.org/artist/07e78331-884c-4c94-988f-1424da3b94d2) | 07e78331-884c-4c94-988f-1424da3b94d2 | search; KR |
| bobby | [BOBBY](https://musicbrainz.org/artist/de461f00-89b7-46e2-b6ba-550ef383fb8e) | de461f00-89b7-46e2-b6ba-550ef383fb8e | lookup; KR; South Korean-American rapper; 1995-12-21 |
| blase | [BLASÉ](https://musicbrainz.org/artist/2f96c1ae-0671-4d48-9507-670892a2ac67/releases) | 2f96c1ae-0671-4d48-9507-670892a2ac67 | search; KR; Korean rapper |
| rhythm-power | [Rhythm Power](https://musicbrainz.org/artist/91075f86-a5f7-4d9a-878a-7380b905953e/relationships) | 91075f86-a5f7-4d9a-878a-7380b905953e | lookup; KR; Korean group |
| boi-b | [보이비](https://musicbrainz.org/artist/91075f86-a5f7-4d9a-878a-7380b905953e/relationships) | 8d235776-51a8-446b-ba81-11e9de55dcb8 | search; KR; Korean rapper; 1986-09-04 |
| hangzoo | [Hangzoo](https://musicbrainz.org/artist/91075f86-a5f7-4d9a-878a-7380b905953e/relationships) | 15b381b5-a02d-4d5e-af0a-4a1b0bf0cd4c | search; KR; 행주; 1986-12-10 |
| lee-hyun-bae | [Smash](https://musicbrainz.org/artist/0ec6c8f1-624f-44d4-8473-0548e20f04c5/relationships) | 0ec6c8f1-624f-44d4-8473-0548e20f04c5 | lookup; KR; Korean emcee; 1973 |
| ph-1 | [pH-1](https://musicbrainz.org/artist/aace796b-0569-49b6-a144-64ea24031962) | aace796b-0569-49b6-a144-64ea24031962 | search; KR; Korean rapper; 1989-07-23 |
| sik-k | [Sik‐K](https://musicbrainz.org/artist/bbf6aa09-987b-46b6-8dd9-89c6ade3c00f) | bbf6aa09-987b-46b6-8dd9-89c6ade3c00f | search; KR; South Korean rapper; 1994-02-26 |
| woodie-gochild | [Woodie Gochild](https://musicbrainz.org/artist/adc8b0d8-874b-4e10-be9f-82d52582b310) | adc8b0d8-874b-4e10-be9f-82d52582b310 | search; KR; Korean rapper; 1996-04-02 |
| haon | [HAON](https://musicbrainz.org/artist/8cb31f1b-645a-4c9e-ab9e-06aa8cb08949) | 8cb31f1b-645a-4c9e-ab9e-06aa8cb08949 | search; KR; Korean rapper; 2000-07-07 |
| rohann | [Rohann](https://musicbrainz.org/artist/cde885e9-4d2f-4247-a17e-d207594eaa74) | cde885e9-4d2f-4247-a17e-d207594eaa74 | search; KR; Korean rapper; 2000-06-04 |
| lee-hyun-jun | [이현준](https://musicbrainz.org/artist/5bad2471-f9bc-4cb6-929e-ebbda9f40780) | 5bad2471-f9bc-4cb6-929e-ebbda9f40780 | search; KR; South Korean rapper; 1994-01-19 |
| vince | [Vince](https://musicbrainz.org/artist/eb3b506f-da9a-4c4f-a0e9-7612597751f3) | eb3b506f-da9a-4c4f-a0e9-7612597751f3 | lookup; KR; Korean singer/rapper; 1989-04-30 |
| los | [Los](https://musicbrainz.org/artist/b80c6a8c-4689-41d2-a467-dc8a3a8e1c20) | b80c6a8c-4689-41d2-a467-dc8a3a8e1c20 | lookup; KR; Korean rapper |
| suga | [SUGA](https://bts.ibighit.com/kor/discography/suga/detail/d-day/) | b629da42-c668-49d2-be67-498605ee2a13 | search; KR; BTS; 1993-03-09 |
| bill-stax | [BILL STAX](https://musicbrainz.org/artist/4bb2e755-5017-475f-8295-fc6e59038cf3) | 4bb2e755-5017-475f-8295-fc6e59038cf3 | search; KR; Korean rapper, fka Vasco; 1980-12-18 |
| tak | [탁](https://musicbrainz.org/artist/3d9738d8-8dff-4b8b-9ff2-a5d8f5e397ff) | 3d9738d8-8dff-4b8b-9ff2-a5d8f5e397ff | search; BaeChiGi; 1983-09-10 |
| pinodyne | [Pinodyne](https://www.genie.co.kr/detail/artistInfo?xxnm=79927636) | 45481dad-8c61-483a-8004-fab5dd920e6c | lookup; KR |
| choi-sam | [Choi Sam](https://musicbrainz.org/recording/1ead1beb-fa10-4617-b003-dab19195771c) | 2a8a1d2a-08b6-4178-b7df-210f4db6b137 | search; Korean rapper |
| nuol | [Nuol](https://musicbrainz.org/recording/a13683eb-6792-4b85-b3a8-1f2c32645332) | e44a0006-fb27-4064-a1de-91790ed2cc07 | search; KR; Sung-Bum Choi; 1982-03-24 |
| h2adin | [Jowonu](https://www.genie.co.kr/detail/artistInfo?xxnm=80570213) | e4c6c6bf-0ec6-46f0-979d-f5658afdad23 | lookup |
| noh-yun-ha | [Roh Yunha](https://www.genie.co.kr/detail/songInfo?xgnm=99610768) | f6605fb3-30c6-4f74-a699-cef595a11f7a | lookup; KR; 2003-02-06 |
| kim-chang-yeol | [김창렬](https://musicbrainz.org/artist/502e4ed1-eb37-44ac-bf95-84fbc5315ae5/relationships) | 480358ff-5127-4fca-b7e6-2257fe3ab610 | lookup |
| one-sun | [Onesun](https://musicbrainz.org/recording/dfafa767-cedb-483e-8db2-41ef4b71816d) | e8a2c58e-a912-4f47-87a2-701d06c43ea1 | lookup |
| gan-d | [Gan-D](https://musicbrainz.org/artist/deb96d52-0bf3-4744-89bc-4d9d4e198533/relationships) | 1f4655f7-1e38-44ad-97c1-0fc828738e39 | search |
| rock-punkman | [Loxx Punkman](https://www.genie.co.kr/magazine/subMain?mgz_seq=4675) | 4f0b05b2-b44d-4342-b537-b6ebe9df8a4f | lookup; KR; Korean rapper |
| skull | [Skull](https://www.maniadb.com/artist/106118?o=g) | 4503247e-5ff1-440e-a8a1-425f518cfe9a | search; KR; Korean reggae artist; 1979-11-02 |
| jimmy-paige | [Jimmy Paige](https://musicbrainz.org/artist/0792db4a-d0ea-48b9-bf37-9537db84ccdd) | 0792db4a-d0ea-48b9-bf37-9537db84ccdd | lookup; KR; Korean rapper; 1990-09-03 |

Skull additionally preserves the independently reviewed alternate MBID `5765ee3c-4cc7-431a-b6a4-e3851a8f601f`; SUGA additionally preserves the official Agust D persona MBID `f09d2950-e3c6-47b2-b21c-2bad2cd3f616`. These are explicit cross-ID decisions, not generalized alias merging.


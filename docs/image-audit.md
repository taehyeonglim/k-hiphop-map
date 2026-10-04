# Portrait source audit

This report is regenerated when reviewed candidates are published. It covers every artist in the current catalogue. Discovery does not itself approve a portrait: identity, file-specific reuse terms and the actual crop must be reviewed.

- Current catalogue artists: 2756
- Artists with a published portrait: 674
- Core artist coverage: 161/268 (60.1%)
- Output: 256×256 same-origin WebP files. People are cropped; group photographs retain the complete image with letterboxing. Changes are disclosed per asset.
- Missing photographs use initials. An unresolved search does not establish that a photograph does not exist.

## Survey status

| State | Artists |
| --- | ---: |
| identity-review | 53 |
| included | 674 |
| not-found | 1985 |
| permission-needed | 2 |
| retry | 1 |
| visual-review | 41 |

Every unresolved artist has a reason, checked date and next action in [the review registry](../data/portrait-review.json) and the searchable [public collection status](https://k-hiphop-map.vercel.app/coverage/). Known official/profile URLs and access failures are preserved in [profile evidence](../data/portrait-source-candidates.json). An Open Graph image can be an album cover or site logo; it is not an approved artist portrait.

Commons captions, photographer searches and CC video search results are retained in [expanded discovery](../data/portrait-discovery.json). Manual frame/crop coordinates are in [portrait selections](../data/portrait-selections.json), with observed per-video license statements in [video evidence](../data/portrait-video-evidence.json). See the [expansion record](portrait-expansion.md).

## Reproduction

```sh
python3 scripts/survey-portraits.py
python3 scripts/survey-profile-sources.py --merge-review
python3 scripts/discover-portrait-sources.py --provider commons
python3 scripts/discover-portrait-sources.py --provider flickr
python3 scripts/discover-portrait-sources.py --provider youtube
python3 scripts/stage-portrait-selections.py
# Review each staged identity, attribution and crop; record its SHA-256 in portrait-approvals.json.
python3 scripts/survey-portraits.py --publish-only
npm run data:build
npm run data:validate:launch
```

The survey accepts explicit CC BY, CC BY-SA, CC0 or public-domain file metadata. Non-Wikimedia originals require photo-specific permission records or explicit CC BY video licenses from the selected source. An official channel or CC search result alone is not permission. Video title, author, timestamp and changes are retained. Wikipedia local fair-use files are excluded. Current published sources and license conditions are listed below and on the [credits page](https://k-hiphop-map.vercel.app/credits/). API caches expire after 30 days; transient request failures remain retryable.

## Included assets

| Artist | Author | License | Source |
| --- | --- | --- | --- |
| 10cm | Trainholic | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Kwon_Jung-yeol,_10cm.jpg) |
| 24kGoldn | Kpapa111111 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:24kgoldn2024.jpg) |
| 45RPM | Jinho Jung | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:45RPM.jpg) |
| A$AP TyY | Castelliaj | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:ASAP_TyY_Wiki.jpg) |
| AGNEZ MO | Toglenn | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Agnez_Monica_2019_(facecrop).jpg) |
| AJ Tracey | Jwslubbock | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:AIM_independent_music_awards_2019_01.jpg) |
| AKMU | Korea.net / Korean Culture and Information Service (Jeon Han) | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:KOCIS_Korea_President_Park_Culture_Day_Movie_03(1).jpg) |
| Afgan | Yudha Baskoro derivative work: Syfuel ( talk ) | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Afgansyah_Rezza_(2013)_-_Cropped.jpg) |
| Afrojack | DJ Meekz | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Afrojack_2015.jpg) |
| Ailee | 티비텐 TV10 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Ailee_in_March_2023_3.jpg) |
| Akrobatik | RasmusH , Denmark | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Akrobatik_in_Copenhagen.jpg) |
| Alan Walker | Maximilian Wild | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Alan_Walker_(cropped).jpg) |
| Alex | shaq32 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:160217_%EC%95%8C%EB%A0%89%EC%8A%A4.jpg) |
| Anderson .Paak | John Sears | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:%27K-Pops!%27_director_Anderson_.Paak_at_the_2024_Toronto_International_Film_Festival_5_(Cropped).jpg) |
| Andrew Choi | Gage Skidmore | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Andrew_Choi_by_Gage_Skidmore.jpg) |
| Annika Wells | Mrtoonice | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Annika_Wells_photo.jpg) |
| Arden Cho | Mattgray0727 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Arden_Cho_(2019).jpg) |
| As One | photo taken by flickr user photoren | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:As_One.jpg) |
| Awich | Dick Thomas Johnson from Tokyo, Japan | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Awich_from_%22Lightning_Over_the_Beyond%22_at_Red_Carpet_of_the_Tokyo_International_Film_Festival_2022_(52461523415).jpg) |
| BADVILLAIN | TV Ten | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Badvillain_240614.png) |
| BBGIRLS | Brave Entertainment | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Brave_Girls_Summer_Queen_2.png) |
| BM | Natisatv | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:BM_of_KARD,_2021.jpg) |
| BMK | LG전자 | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Big_Mama_King_(BMK).jpg) |
| BUMKEY | BRANDNEW MUSIC | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Bumkey_in_2021.png) |
| Baauer | Leah Gair | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Baauer_Big_Dancing_by_Leah_Gair_cropped.jpg) |
| Babylon | Marie Claire Korea | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:(Marie_Claire_Korea)_%EB%A7%88%EB%A6%AC%ED%94%8C%EB%A0%88%EC%9D%B4%EB%A6%AC%EC%8A%A4%ED%8A%B8_%EB%B2%A0%EC%9D%B4%EB%B9%8C%EB%A1%A0_%ED%8E%B8_15s.JPG) |
| Badshah | Bollywood Hungama | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Badshah_spotted_before_the_shoot_of_No_Filter_Neha.jpg) |
| Bang JaeMin | 백일몽 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:170606_%EB%B0%A9%EC%9E%AC%EB%AF%BC_Bang_Jae-min.png) |
| Becky G | Shan BOODY | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Becky_G_2023_01_(cropped).jpg) |
| Belle | Marie Claire Korea | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Belle_kiof.png) |
| Big K.R.I.T. | Usfjrain | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:BIG_KRIT_Jahret_Rainey_(cropped).jpg) |
| Big Mama | SBS Radio | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Big_Mama_in_December_2023.png) |
| Bipolar Sunshine | Cihatkoyuncu | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Bipolarsunshine.jpg) |
| Black Eyed Peas | nicolas genin from Paris, France | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Les_Black_Eyed_Peas_en_concert_au_VIP_Room_Paris_3_(cropped).jpg) |
| BoA | Dispatch | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:BoA_at_Incheon_Airport_on_May_15,_2019_(2).png) |
| Bob James | Meutia Chaerani / Indradi Soemardjan http://www.indrani.net | [CC BY 2.5](https://creativecommons.org/licenses/by/2.5) | [Original file](https://commons.wikimedia.org/wiki/File:Bob_James,_jazz_musician_(2004).jpg) |
| Boys Noize | Arne Müseler | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Boys_noize_juicy_beats_2011_5.jpg) |
| Brian | Ten Asia | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Brian_Joo_(2),_2024_(cropped).jpg) |
| Burna Boy | Nuță Lucian from Cluj-Napoca, Romania | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Untold_2024_-Burna_Boy_(53926047977)_(cropped).jpg) |
| Bursters | Laurana Beck | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Bursters_group.jpg) |
| CHAEYOUNG | 시간은금! | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Chaeyoung_at_Gaon_Awards_red_carpet_on_January_23,_2019.jpg) |
| CHAI | HunkinElvis | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:LeeSoojung-by_HunkinElvis2.jpg) |
| CHANYEOL | ggbye1127 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Chanyeol_at_a_Dynamic_Duo_concert_on_December_8,_2019.jpg) |
| CHEEZE | Studio FLO 스튜디오 플로 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Cheezedalchong2021.png) |
| CHUNG HA | Marie Claire Korea | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Chung_Ha_in_March_2025.png) |
| CL | 티비텐 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:CL_%EC%8A%A4%ED%83%80%EC%9D%BC_%EC%96%B4%EC%9B%8C%EC%A6%88_2024_(2).jpg) |
| Car, the Garden | K-POPIT 케이팝잇 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Car,_the_Garden_in_2026.png) |
| Cautious Clay | Monika Cefis | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Cautious_Clay.jpg) |
| Cedric the Entertainer | Alexander Vaughn | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Cedric_the_Entertainer_2010.jpg) |
| Cha Cha Malone | Koreamgmt | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Cha_Cha_Malone,_music_producer_of_AOMG.jpg) |
| Chancellor | Neoaristocrats | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:2022%EB%85%84_%EC%B1%88%EC%8A%AC%EB%9F%AC_%EC%82%AC%EC%A7%84_%EC%B4%AC%EC%98%81.jpg) |
| Charli xcx | Elena Ternovaja | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Charli_xcx_at_Berlinale_2026-1.jpg) |
| Chi Pu | TV HUB - Giải Trí | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Chi_Pu_as_H%E1%BA%A1_Linh_in_She_Was_Pretty_(M%E1%BB%91i_t%C3%ACnh_%C4%91%E1%BA%A7u_c%E1%BB%A7a_t%C3%B4i).jpg) |
| Christopher | Kim Matthäi Leland | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Christopher_(sanger).jpg) |
| Clazziquai Project | KBS Kwave | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Clazziquai_Project_Sept_2014.png) |
| Code Kunst | SBS Radio | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Code_Kunst_200306.jpg) |
| Craig Cardiff | Adam M. Dee | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Craig_Cardiff_performs_at_Maxwell%27s_Music_House_in_Waterloo,_Ontario.jpg) |
| Crystal Kay | Goldnrush Podcast | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Crystal_Kay_at_Goldnrush_Podcast.png) |
| D.O. | Marie Claire Korea | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:D.O._modeling_for_Marie_Claire_Korea,_August_issue,_2023_(3).jpg) |
| DAVICHI | Korea.net / Korean Culture and Information Service (Jeon Han) | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:K_Drama_IRIS2_Press_01_(8455582202).jpg) |
| DAWN | dispatchsns | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:E%27Dawn_going_to_a_Music_Bank_recording_on_July_22,_2018.png) |
| DAY6 | The original uploader was Shuohyun at Chinese Wikipedia . | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:DAY6_in_taiwan.jpg) |
| DAYOUNG | 덕후는 사진을 남긴다 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:170921_%EC%9D%B8%EC%B2%9C%EA%B3%B5%ED%95%AD_%EC%B6%9C%EA%B5%AD_%EC%9A%B0%EC%A3%BC%EC%86%8C%EB%85%80_%EB%8B%A4%EC%98%81_%EC%A7%81%EC%B0%8D_(4).jpg) |
| DIA | NewsInStar | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:190320_%EB%8B%A4%EC%9D%B4%EC%95%84_%27NEWTRO%27_%EC%87%BC%EC%BC%80%EC%9D%B4%EC%8A%A4_(1).jpg) |
| DJ DOC | Jinho Jung from Seoul, South Korea | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:DJ_DOC_@_Cyworld_Dream_Music_Festival_%EC%8B%B8%EC%9D%B4%EC%9B%94%EB%93%9C_%EB%93%9C%EB%A6%BC_%EB%AE%A4%EC%A7%81_%ED%8E%98%EC%8A%A4%ED%8B%B0%EB%B2%8C_42.jpg) |
| DJ Honda | DJ Quietstorm | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:DJ_Honda_-_Deejay_Japan_(35975571580).jpg) |
| DJ Premier | alanpixx | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:DJ_Premier_2008.jpg) |
| DJ Soda | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:DJ_Soda_03.jpg) |
| DPR IAN | cclownofficial | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:(%EA%B3%B5%EC%8B%9D%EC%98%81%EC%83%81)_C-CLOWN_%EB%8D%B0%EB%B7%94_100%EC%9D%BC_%EC%B6%95%ED%95%98%EC%98%81%EC%83%81_44s_(cropped).jpg) |
| DPR LIVE | JLibert | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:DPR_Live_SXSW_Korea_Spotlight_2018.jpg) |
| Dalmatian | Parfaitic | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:20101217_%EB%8B%AC%EB%A7%88%EC%8B%9C%EC%95%88_%EB%B6%80%EC%B2%9C%ED%88%AC%EB%82%98_%EA%B2%BD%EC%9D%B8%EA%B3%B5%EA%B0%9C%EB%B0%A9%EC%86%A1_1.jpg) |
| Dal★Shabet | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Dal_Shabet_in_Jan_2015.jpg) |
| DeVita | Marie Claire Korea | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Devita_20210515_(2).png) |
| Demrick | LG001996 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Demrick.jpg) |
| DinDin | Korean Newspaper Newspaper "NewsInstar" | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:20190608_DinDin_%EB%94%98%EB%94%98_(2).jpg) |
| Diplo | mtheory LLC | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Diplo_2014_Press_Photo_(cropped).jpg) |
| Don Toliver | Sanchez Productions | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Don_Toliver_by_Sanchez_Productions.jpg) |
| Dumbfoundead | John Sears | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Dumbfoundead_at_the_2024_Toronto_International_Film_Festival_(cropped).jpg) |
| ELLY | TwoAhn | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:LE_at_a_fansigning_event_in_Mokdong_on_October_8,_2022_(3).jpg) |
| EXID | 우연히현영 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:141211_EXID_%EB%8D%94%EC%87%BC_in_%EC%BD%94%EC%97%91%EC%8A%A4_%EC%95%BC%EC%99%B8%EB%AC%B4%EB%8C%80.jpg) |
| EXO-SC | Republic of Korea | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Chanyeol_and_Sehun_at_the_Fashion_Kode_2014_(1)_(cropped).jpg) |
| Ed Sheeran | Harald Krichel | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Ed_Sheeran-6886_(cropped).jpg) |
| Eric | josungsoo | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:130718_eric_MNET_20%27S_CHOICE.jpg) |
| Eric Nam | Eric Nam | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Eric_Nam_(2021).jpg) |
| Erykah Badu | Radiobums at English Wikipedia | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Erykah_Badu_in_Nation19_Magazine.jpg) |
| Exy | 재곰사몽 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:160821_%EC%9A%B0%EC%A3%BC%EC%86%8C%EB%85%80_%EC%98%81%EB%93%B1%ED%8F%AC_%ED%8C%AC%EC%8B%B8%EC%9D%B8%ED%9A%8C_%EC%97%91%EC%8B%9C_(4).jpg) |
| Eyedi | KATV | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:%EC%95%84%EC%9D%B4%EB%94%94(%EB%82%A8%EC%9C%A0%EC%A7%84).jpg) |
| FIESTAR | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Fiestar_in_2024.jpg) |
| Fakts One | Jrg1977 | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Fakts_One_NY.jpg) |
| Fall Out Boy | hs audreylynne | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:FallOutBoy.jpg) |
| Famous Dex | Icebox | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Famous_Dex_2018.png) |
| Far East Movement | Vervegirl Canada | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:2011_MuchMusic_Video_Awards_-_Far_East_Movement.jpg) |
| Flowsik | yoruhana | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Aziatix_2012_1.jpg) |
| G.NA | LGEPR | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Korean_singer_G.NA_LG_Promo_photograph.jpg) |
| G.O.D | K-POPIT 케이팝잇 TV10 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:G.o.d._@_Seoul_Spring_Festa,_30_April_2025_09.png) |
| GD&TOP | GOM | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:GD_%26_TOP_-_MADE_THE_MOVIE_Premiere.jpg) |
| GSoul | 아리랑TV | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:%EC%95%84%EB%A6%AC%EB%9E%91TV,_%EC%95%84%EC%9E%84%EB%9D%BC%EC%9D%B4%EB%B8%8C,_%EC%A7%80%EC%86%8C%EC%9A%B8_-_14%EC%9D%BC_%EB%B0%A9%EC%86%A1_2-1.jpg) |
| GYUBIN | gyubinhk | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:250928-Gyubin-HKFancon.jpg) |
| GZA/Genius | Flowizm | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:GZA_at_Paid_Dues_3.jpg) |
| Gallant | Gallant | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | [Original file](https://commons.wikimedia.org/wiki/File:Gallant-Plaid-Suit-Yellow-Green.jpg) |
| Giant Pink | 정아선 (JAS) | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:180311_%EC%9E%90%EC%9D%B4%EC%96%B8%ED%8A%B8%ED%95%91%ED%81%AC_-_E.G.O._%EB%A1%A4%EB%A7%81%ED%99%80_23%EC%A3%BC%EB%85%84_%EC%BC%80%EC%9D%B4%EC%8B%9C_%EB%8B%A8%EB%8F%85_%EC%BD%98%EC%84%9C%ED%8A%B8_(2).png) |
| Gill | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Gil_from_acrofan.jpg) |
| GloRilla | HOTSPOTATL | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Glorilla_in_a_2023_interview_(cropped).png) |
| Gloc‐9 | ChocolateFactoryTV | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:GLOC-9.png) |
| GroovyRoom | OnlyOneOf official | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Groovyroom_in_2020.png) |
| Gummy | 관인생략 | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Gummy_20111124.jpg) |
| HOSHI | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:240415_Hoshi.jpg) |
| HUH YUNJIN | 티비텐 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:260110_Le_Sserafim%27s_Huh_Yunjin_at_GDA_2026_01.jpg) |
| HWASA | TV10 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Hwasa_in_January_2026.png) |
| HYNN | WhitepaperS2 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:HYNN.jpg) |
| HYO | 티비텐 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:20220323_%EC%86%8C%EB%85%80%EC%8B%9C%EB%8C%80_%ED%9A%A8%EC%97%B0.jpg) |
| Halsey | Justin Higuchi | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Halsey_@_Hollywood_Forever_10_14_2025_(54925500921).jpg) |
| Heize | seono의 BOL4 story | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Heize_at_Zion.T_X_Heize_Concert_on_April_21,_2018_(4)_(cropped).jpg) |
| Higher Brothers | Moyopoyo | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Higher_Brothers_Icebox_2019.jpg) |
| Hit‐Boy | Skripture Made This Remix | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:HitBoy_in_2026.png) |
| Honey J | Save the Children | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Honey_J,_2026.jpg) |
| Hyolyn | dispatchsns | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:%E2%80%9C%ED%9D%B0%ED%8B%B0%EC%97%90_%EC%B2%AD%EB%B0%94%EC%A7%80%EB%A7%8C_%EA%B1%B8%EC%B3%90%EB%8F%84%E2%80%9D_...%ED%9A%A8%EB%A6%B0,_%ED%95%AB%ED%95%9C_%EA%B3%B5%ED%95%AD%ED%8C%A8%EC%85%98_%ED%9A%A8%EB%A6%B0_(%EB%94%94%ED%8C%A8%EC%A7%A4)_2.png) |
| HyunA | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:20230720_Kim_HyunA_in_July_2023_01_(cropped).png) |
| INFINITE H | ☜LOVE&PEACE☞ | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:20150207_%EC%9D%B8%ED%94%BC%EB%8B%88%ED%8A%B8_%EC%97%90%EC%9D%B4%EC%B9%98_%EC%9A%A9%EC%82%B0%ED%8C%AC%EC%8B%B8.jpg) |
| IU | 티비텐 TV10 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:250718_Lee_Ji-eun_(%EC%9D%B4%EC%A7%80%EC%9D%80).png) |
| IZ | dispatchsns | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:180501_IZ_02.png) |
| IZ*ONE | 뉴스인스타 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:190106_33%ED%9A%8C_%EA%B3%A8%EB%93%A0%EB%94%94%EC%8A%A4%ED%81%AC_%EC%8B%9C%EC%83%81%EC%8B%9D_%EB%A0%88%EB%93%9C%EC%B9%B4%ED%8E%AB_%EC%95%84%EC%9D%B4%EC%A6%88%EC%9B%90.jpg) |
| Inspectah Deck | Coup d'Oreille | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Inspectah_Deck_in_Paris,_2013_(cropped).jpg) |
| J. Cole | HOTSPOTATL | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:HOTSPOTATL_-_21_Savage_%26_J.Cole_Light_Birthday_Bash_ATL_2023_On_FIRE_(xu6HKf40MX0_-_2m38s)_(cropped).jpg) |
| J.Sheon | ELLE TAIWAN | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:J.Sheon_ELLE_Taiwan_2020_(cropped).jpg) |
| JAMIE | NINE STARS | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Park_Ji-min_going_to_a_Music_Bank_recording_in_September_2018_(2).png) |
| JENNIE | 티비텐 TV10 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Jennie_2026_GDA_1.jpg) |
| JEON SOMI | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:20230720_Jeon_Somi_(%EC%A0%84%EC%86%8C%EB%AF%B8).jpg) |
| JINU | NewsInStar | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:180118_Kim_Jin-woo.png) |
| JINUSEAN | Republic of Korea | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Hello_MrK_Concert_2016_10.jpg) |
| JK 김동욱 | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:JK_Donguk_from_acrofan.jpg) |
| JO YURI | TV10 / Ten Asia | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:082125_Jo_Yuri_for_Maradi_Mercredi_photo_call_01.png) |
| JONGHYUN | Anju | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Jonghyun_at_a_fansigning_in_Busan,_in_June_2016_01.jpg) |
| JOOHONEY | http://tojooheon.tistory.com/ | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:171104_%EC%A3%BC%ED%97%8C_02.jpg) |
| JUN. K | Pa-shoulder | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Jun_K1.jpg) |
| Jay B | THHeadline | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Siam_Center_x_JAY_B_The_2nd_Exhibition_in_Bangkok_press_conference,_13_January_2025_02_(cropped).png) |
| Jessica | 티비텐 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Jessica_Jung_W_Korea_October_2024.jpg) |
| Jinu | Pabian | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Jinusean_Jinu.jpg) |
| Joey Bada$$ | The Come Up Show | [CC BY 2.5](https://creativecommons.org/licenses/by/2.5) | [Original file](https://commons.wikimedia.org/wiki/File:Joey_Badass.jpg) |
| John Park | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:John_Park_from_acrofan.jpg) |
| Juice WRLD | MTV International | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Juice_Wrld_VMAs.png) |
| Jung Kook | K-POPIT 케이팝잇 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Jung_Kook_of_BTS,_February_12,_2026_(1).png) |
| Junoflo | Bonnielou2013 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Junoflo_SXSW_2018.jpg) |
| K.Will | 별사타앙 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:K.Will_on_May_14,_2013.jpg) |
| KANGDANIEL | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:KANG_DANIEL_220719.jpg) |
| KCM | 여니수니 | [CC BY 2.0 kr](https://creativecommons.org/licenses/by/2.0/kr/deed.en) | [Original file](https://commons.wikimedia.org/wiki/File:%EA%B0%80%EC%88%98_KCM.jpg) |
| KOHH | 株式会社スペシャネット | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:KOHH2016.jpg) |
| KR$NA | Tuptap music | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:IMG_0838_Rapper_KRSNA.jpg) |
| Kanto | Nine Stars | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Kanto_May_2018.png) |
| Kei | Darkest Days | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:151023_%EB%9F%AC%EB%B8%94%EB%A6%AC%EC%A6%88_%EB%AE%A4%EC%A7%81%EB%B1%85%ED%81%AC_%EB%AF%B8%EB%8B%88%ED%8C%AC%EB%AF%B8%ED%8C%85_-_02_(6).jpg) |
| Keke Palmer | Dominick D | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Keke_Palmer_2016_Paleyfest_original.jpg) |
| Keyveatz | Ten Asia | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Keyveatz,_2026.jpg) |
| Kim Petras | Ted Eytan | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Kim_Petras_(42743719761)_(a).jpg) |
| King Kapisi | New Zealand Government, Office of the Governor-General | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | [Original file](https://commons.wikimedia.org/wiki/File:Bill_Urale_MNZM_(cropped).jpg) |
| Kingston Rudieska | Jon Dunbar | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Kingston_rudieska_rise_again_ska_reggae_festival_20131229.jpg) |
| Koncept | Clayton Jones | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Koncept_greyscale.jpg) |
| Krizz Kaliko | Mizery Made | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Krizz_Kaliko_on_2008-07-01.JPG) |
| Kurupt | G patkar | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Kurupt_Young_Gotti_in_Abu_Dhabi.jpg) |
| LABOUM | Nine Stars | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:180723_%EB%9D%BC%EB%B6%90.jpg) |
| LE SSERAFIM | https://www.youtube.com/@_TV10 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Le_Sserafim_at_2026_Golden_Disc_awards.png) |
| LEE HI | SBS Radio | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:LeeHi_2021_(derived).jpg) |
| LEO | Ten Asia | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Lee_Leo,_2026.jpg) |
| Lee Hyun | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Lee_Hyun_from_acrofan.jpg) |
| Lee Su Jeong | demical | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:%EB%B2%A0%EC%9D%B4%EB%B9%84_%EC%86%8C%EC%9A%B8.jpg) |
| Lexy | 와사비콘텐츠 | [CC BY 2.0 kr](https://creativecommons.org/licenses/by/2.0/kr/deed.en) | [Original file](https://commons.wikimedia.org/wiki/File:Lexy.jpg) |
| Lil Mosey | File:Lil Mosey (41879461061).jpg : Curtis Huynh for The Come Up Show derivative work: Alexis Jazz | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Lil_Mosey_(41879461061)_(retouched).jpg) |
| Lil Moshpit | OnlyOneOf Official | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:%EC%9D%B4%ED%9C%98%EB%AF%BC_2020.png) |
| Lil Nas X | Fabebk | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Lil_Nas_X_back_stage_at_the_MTV_Video_Music_Awards_2019.jpg) |
| Lil Yachty | Lygonstreet | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Lil_Yachty_2025.jpg) |
| Little Simz | Frank Schwichtenberg | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Little_Simz_-_Openair_Frauenfeld_2019_05.jpg) |
| Lucid Fall | 롯데엔터테인먼트 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Lucidfall2021.png) |
| Lyn | 여니수니 | [CC BY 2.0 kr](https://creativecommons.org/licenses/by/2.0/kr/deed.en) | [Original file](https://commons.wikimedia.org/wiki/File:Lyn_(singer).jpg) |
| M.I.A. | Interscope Records | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:MIA_press_photo_2016.png) |
| MAMAMOO | Galaxy Studio | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Mamamoo_in_2023.png) |
| MAMAMOO+ | JC 제시 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:20230403_MAMAMOO%2B_(%EB%A7%88%EB%A7%88%EB%AC%B4%2B).jpg) |
| MAX | Toglenn | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:MAX_Schneider_2019_by_Glenn_Francis.jpg) |
| MAX | Nesnad | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:MAXgroup-all-a-oct1-2016.jpg) |
| MC 메타 | 인문360 | [CC BY (YouTube)](https://www.youtube.com/t/creative_commons) | [Original file](https://www.youtube.com/watch?v=gW1_xz9ylo4) |
| MC 몽 | http://vobkr.tistory.com/ | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:090402_MC%EB%AA%BD_01.jpg) |
| MC 스나이퍼 | 1theK (원더케이) | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Mcsniper2015.png) |
| MELODYDAY | SJ | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:%EB%A9%9C%EB%A1%9C%EB%94%94%EB%8D%B0%EC%9D%B4(MelodyDay)_%EC%98%81%EB%93%B1%ED%8F%AC_%ED%83%80%EC%9E%84%EC%8A%A4%ED%80%98%EC%96%B4_%EB%AC%B8%ED%99%94%EA%B3%B5%EC%97%B0_02.jpg) |
| MINNIE | Robert Sim | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Minnie_at_Owndays_popup_in_Plaza_Singapura_01_-_RSKY_-_20260611.jpg) |
| MIYEON | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:(G)I-DLE_Airport_Departure_2024_Miyeon_waving_hands.png) |
| MONSTA X | Newsen [뉴스엔 김기태 기자] | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:MonstaX_in_Golden_Disc_Awards_2019.jpg) |
| Mahalia | Raph_PH | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Boardmaster21_(76)_(51385229597)_(cropped).jpg) |
| Maliibu Miitch | Hoodforeign | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Maliibu_Miitch.jpg) |
| Malik B | TwinTurbo | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Malik_Arnell_Paz.png) |
| Massive Töne | Mika Väisänen | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Massive_T%C3%B6ne.jpg) |
| Masta Killa | iDstroy | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Masta_Killa_Interview_2025.jpeg) |
| Masta Wu | May S. Young from Metro NYC, United States | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:EpikHigh_061215_021_(18588500859).jpg) |
| Megan Thee Stallion | ADWEEK | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Megan_Thee_Stallion_Adweek_02.jpg) |
| Miguel | Toglenn | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Miguel_2019_by_Glenn_Francis.jpg) |
| Mike Posner | Adam Bielawski | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Mike-Posner_B96_Summerbash_2012-06-16.jpg) |
| Mirani | Marie Claire Korea | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:220120_MarieClaire_Korea_(3).jpg) |
| Missy Elliott | Atlantic Records | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Missy_Elliot.jpg) |
| Miwoo | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Woo_Hye-Mi_from_acrofan.jpg) |
| Moses Sumney | Sydney Botie | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Moses_Sumney,_SummerStage_2014_(cropped).jpg) |
| Mountain Brothers | Michael Jung | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Mountain_brothers.jpg) |
| Mr. Capone-E | Aeg12521 | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:MrCapone-E.jpg) |
| Mudd the student | Marie Claire Korea | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Mudd_the_Student_20220122.png) |
| NARSHA | KIYOUNG KIM | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Narsha_at_the_press_conference_for_the_musical_The_Memory_2013_153.jpg) |
| NAYEON | TV10 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Nayeon_in_November_2025.png) |
| NERVO | Manfred Werner - Tsui | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Life_Ball_2014_red_carpet_116_Miriam_Olivia_Nervo.jpg) |
| NMIXX | David Lee | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:NMIXX_in_Oakland.jpg) |
| NS Yoon-G | 허수아비 [147 Company] | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:170402_NS%EC%9C%A4%EC%A7%80_01.jpg) |
| Na Haeun | Ten Asia | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Na_Haeun,_2026.jpg) |
| Nessly | Therapprofessional | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Nessly_by_Shotbymeech_2022.png) |
| Niel | 티비텐 TV10 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:%EB%8B%88%EC%97%98_%22%EC%98%88%EC%A0%84_%EB%AA%A8%EC%8A%B5%EC%9C%BC%EB%A1%9C_%EB%8F%8C%EC%95%84%EA%B0%80%EB%A0%A4%EA%B3%A0_%EB%8B%A4%EC%9D%B4%EC%96%B4%ED%8A%B8_%EC%A4%91%EC%9D%B4%EC%97%90%EC%9A%94%22_3s.jpg) |
| Nile Rodgers | Gage Skidmore | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Nile_Rodgers_by_Gage_Skidmore_2.jpg) |
| OG Maco | Asapccampana | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Og_maco.jpg) |
| ONEW | Marie Claire Korea | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Onew_for_Marie_Claire_Magazine_August_Issue_2021_03.png) |
| OnlyOneOf | OnlyOneOf official | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:OnlyOneOf_on_Produced_by_Myself_photoshoot_05.png) |
| Ookay | swimfinfan | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Ookay_Spring_Awakening_2014.jpg) |
| PENIEL | leechapusopu | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Peniel_Shin_at_BTOB_Time_in_January_2017.jpg) |
| PMD | Simon Abrams from Brooklyn, USA | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Parrish_Smith_(cropped).jpg) |
| PSY | Korea.net / Korean Culture and Information Service (Jeon Han) | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:PSY(%EC%8B%B8%EC%9D%B4)_at_2015_Summer_K-POP_Festival.jpg) |
| Park Bom | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:190330_%EB%B0%95%EB%B4%84_%EB%A1%AF%EB%8D%B0%EB%B0%B1%ED%99%94%EC%A0%90_%EC%9E%A0%EC%8B%A4_%ED%8C%AC%EC%8B%B8%EC%9D%B8%ED%9A%8C_2.jpg) |
| Parrish Smith | Simon Abrams from Brooklyn, USA | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Parrish_Smith_(cropped).jpg) |
| Pharoahe Monch | maartmeester | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Pharoahe_Monch_Appelsap.JPG) |
| Pharrell Williams | Web Summit /Ramsey Cardy/Sportsfile | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Pharrell_Williams_2024_(54133384149).jpg) |
| Punch | STUDIO JEJUMBC _ 스튜디오 제주MBC | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Punch_181224.jpg) |
| RAIN | TV10 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Rain_(entertainer)_in_March_2026.png) |
| REI AMI | The Cosplay Baker | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:ANYC25_from_YouTube_video_by_TBC_-_Rei_Ami_with_Zoey_cosplayer_02_(cropped).jpg) |
| Rachael Yamagata | Janet Dancer | [CC BY-SA 3.0](http://creativecommons.org/licenses/by-sa/3.0/) | [Original file](https://commons.wikimedia.org/wiki/File:Rachael_Yamagata2005.jpg) |
| Raiden | Raiden | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:DJ_Raiden_in_2018-2.png) |
| Raina | BRANDNEW MUSIC | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Raina_in_July_2021.png) |
| Rakaa Iriscience | A-F-R-O | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Rakaa.jpg) |
| Raz Simone | Rainier Avenue Radio | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:RazSimone2020.png) |
| Rhymer | News in Star | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Rhymer_at_Seoul_Fashion_Week_on_October_15,_2019_01.png) |
| Rich the Kid | Frank Schwichtenberg | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Rich_the_Kid_-_Openair_Frauenfeld_2019_04.jpg) |
| Rico Nasty | Toglenn | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Rico_Nasty_2019_by_Glenn_Francis.jpg) |
| Ronaldinho Gaúcho | Marcos Corrêa/PR | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Ronaldinho_in_2019.jpg) |
| Royce da 5′9″ | kEVVY KEV | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Royce_feeling_it.jpg) |
| Ruby Ibarra | Fobanese | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Ruby_Ibarra.jpg) |
| SEKAI NO OWARI | Dick Thomas Johnson | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Sekainoowari-freelive2015.jpg) |
| SEOLA | 디스패치 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:190321_%EC%9A%B0%EC%A3%BC%EC%86%8C%EB%85%80_%EC%84%A4%EC%95%84.jpg) |
| SEULGI | SeulRene 'IS' LOVE❤️ | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Kang_Seul-gi_at_Coca-Cola_Event_on_January_18,_2020_03.jpg) |
| SG Wannabe | SBS Radio | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:SG_Wannabe_in_March_2024.png) |
| SISTAR | SJ | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:%EC%94%A8%EC%8A%A4%ED%83%80(SISTAR)_G%ED%8E%98%EC%8A%A4%ED%8B%B0%EB%B2%8C_%EC%95%84%EC%8B%9C%EC%95%84_%EB%93%9C%EB%A6%BC_%EC%BD%98%EC%84%9C%ED%8A%B8_(11).jpg) |
| SUNMI | 티비텐 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Lee_Sunmi_%EC%9D%B4%EC%84%A0%EB%AF%B8_2024_06.jpg) |
| SUNNY | Spes Sublimitas | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:220820_Sunny_@SM_TOWN.jpg) |
| SUNYE | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Sunye_(Min_Sun-ye)_in_July_2022.png) |
| Sam Kim | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:181201_%EC%83%98%EA%B9%80_%EC%BD%94%EC%97%91%EC%8A%A4_%EC%8A%A4%ED%83%80%ED%95%84%EB%93%9C_%ED%8C%AC%EC%8B%B8%EC%9D%B8%ED%9A%8C_06.jpg) |
| Samuel | Samuel OFFICIAL | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Samuel_Kim_in_Sixteen_Showcase_interview_04.png) |
| Sandara Park | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Sandara_Park_Airport_Departure_2022_2_(cropped).jpg) |
| SeeYa | SBS Radio | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:SeeYa_in_April_2026.png) |
| Sera Ryu | Sera Ryu | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:180306_Sera_Ryu_YouTube.png) |
| SinB | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:SinB_August_2024_(3x4_cropped).jpg) |
| Skrillex | Carl Pocket | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:From_First_To_Last_-_Emo_Nite_2_-_PH_Carl_Pocket_(cropped).jpg) |
| Sky Ferreira | Flickr user Abby Gillardi | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Sky_Ferreira_St_Louis_Sept_2013_(2).jpg) |
| So!YoON! | Marie Claire Korea | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Hwang_So-yoon_in_2025.jpg) |
| Sonnet | SJ | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:%EC%86%90%EC%8A%B9%EC%97%B0_CBS_%EB%9F%AC%EB%B9%99%EC%9C%A0_%EC%BD%98%EC%84%9C%ED%8A%B8_%ED%99%94%EC%84%B1_%EA%B6%81%ED%8F%89%ED%95%AD.jpg) |
| Soulja Boy | Reed Kavner | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Soulja_Boy_Tell_%27Em_on_YouTube_Live.jpg) |
| Stella Jang | SBS Radio | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Stella_Jang_210401.png) |
| Stephanie | SJ | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:%EC%8A%A4%ED%85%8C%ED%8C%8C%EB%8B%88(Stephanie)_OBS_%EC%A7%80%EA%B5%AC%EC%B4%8C_%ED%96%89%EB%B3%B5_%EB%82%98%EB%88%94_%EC%BD%98%EC%84%9C%ED%8A%B8.jpg) |
| Steve Aoki | Jalil Arfaoui from Orgeval, France | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Steve_Aoki_2011.jpg) |
| Stormzy | Frank Schwichtenberg | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Stormzy_-_Openair_Frauenfeld_2019_03.jpg) |
| Stray Kids | K-POPIT 케이팝잇 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Stray_Kids_at_the_40th_Golden_Disc_Awards,_January_10,_2026_(1).png) |
| Suboi | Galaxy Studio | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:SUBOI_%E2%80%93_BATTLE_OF_THE_BRIDES_2_%E2%80%93_HCMC_PREMIERE_%E2%80%93_P1.jpg) |
| Suzy | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:20241128_Bae_Suzy_CELINE_photocall_(cropped).jpg) |
| TAEMIN | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:240919_SHINEE_Taemin.jpg) |
| TAEYANG | GOM | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Taeyang_-_MADE_THE_MOVIE_Premiere_(Chopped).png) |
| TAEYEON | sublimitas_spes | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:250807_%ED%83%9C%EC%97%B0_%27%EC%95%85%EB%A7%88%EA%B0%80_%EC%9D%B4%EC%82%AC%EC%99%94%EB%8B%A4%27_VIP_Premiere_04_(cropped).jpg) |
| TOMORROW X TOGETHER | Dispatch | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:TXT_at_Soribada_Awards_on_August_23,_2019.png) |
| TRI.BE | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Tri.be_2021.png) |
| Taebin | Han Cinema | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:KCON_LA_2016_Red_Carpet_Danny_Im.jpg) |
| Taka Perry | Whk1234 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Taka_Perry.jpg) |
| Talib Kweli | Tuomas Vitikainen | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Talib_Kweli_-_Ilosaarirock_2012.jpg) |
| Thaitanium | Sry85 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Thaitanium_at_VERY_TV_25-3-2015.jpg) |
| The Barberettes | anna Hanks from Austin, Texas, USA | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:The_Barberettes_SXSW_2015-5531.jpg) |
| Tiffany Young | sublimitas viii | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:260215_TIFFANY_@33th_Hanteo_Music_Awards_2025_4_(cropped).jpg) |
| Token | UPROXX Studio | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Token_2016_(cropped).jpg) |
| Tory Lanez | The Come Up Show | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Tory_Lanez_2500x1669.jpg) |
| Twista | Elliothtz | [CC BY-SA 3.0](http://creativecommons.org/licenses/by-sa/3.0/) | [Original file](https://commons.wikimedia.org/wiki/File:Twista_College_of_Charleston_2008.04.23.jpg) |
| Tyla Yaweh | The Come Up Show from Canada | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Tyla_Yaweh_(41152729484).jpg) |
| UMI | Happy Jack | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Umi_(singer)_Happy_Jack_2024.png) |
| Urban Zakapa | K-POPIT 케이팝잇 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Urban_Zakapa_in_August_2026.png) |
| V | TV10 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:V_at_W_Korea_Breast_Cancer_Campaign,_15_October_2025.png) |
| VERBAL | Charlesy (original work by Sry85 ) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Teriyaki_Boyz_VERBAL_crop.jpg) |
| VERNON | Seventeen | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Vernon_Follow_240330_2.jpg) |
| VIINI | theMarchIssue97 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:%EA%B6%8C%ED%98%84%EB%B9%88_171020.jpg) |
| VIVIZ | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:230315_VIVIZ_Seoul_Fashion_Week.jpg) |
| WENDY | 오늘의 소녀 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Wendy_Son_at_Dream_Concert_on_May_12,_2018.jpg) |
| WEi | TenAsia | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:WEi_showcase_in_October_(2).jpg) |
| WOOCHAN | 티비텐 TV10 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Woochan_250708.jpg) |
| WOODZ | 디스패치 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:191018_X1_Cho_Seung-youn_at_Seoul_Fashion_Week_SS_2020.png) |
| Wale | Max.blodgett | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Walle_Georgetown_(cropped).JPG) |
| Warren G | Connie Lodge | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Warren_G_and_Kurupt_(cropped).jpg) |
| Weki Meki | 사진&여행 (生活의發見) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:09%EC%9B%94_26%EC%9D%BC_%EB%AE%A4%EC%BD%98_%EC%87%BC%EC%BC%80%EC%9D%B4%EC%8A%A4_MUCON_Showcase_(78).jpg) |
| Whee In | THEL1VE | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Wheein_in_2022.jpg) |
| Wonder Girls | KIYOUNG KIM | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Wonder_Girls_in_2011_Korea_Entertainment_Awards.jpg) |
| XG | 티비텐 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:XG_going_to_MusicBank_240531.jpg) |
| XIA | scene PLAYBILL | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:(%EC%94%AC%ED%94%8C%EB%A0%88%EC%9D%B4%EB%B9%8C)_7%EC%9B%94%ED%98%B8_%EA%B9%80%EC%A4%80%EC%88%98_(1).jpg) |
| XIUMIN | 티비텐 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Xiumin_at_Billboard_K_POWER_100_on_August_27,_2024.png) |
| YBN Nahmir | The Come Up Show | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:YBN_Nahmir.png) |
| YENA | 티비텐 (TV10) | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:CHOI_YENA_(%EC%B5%9C%EC%98%88%EB%82%98)_%E2%80%93_2024.09.30_%E2%80%93_P1.jpg) |
| YERIN | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Yerin_September_2024_(3x4_cropped).jpg) |
| YG | The Come Up Show | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Rapper_YG_2015.jpg) |
| YOUNG POSSE | 티비텐 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:YOUNG_POSSE_Seoul_Fashion_Week_September_2024.jpg) |
| YUMDDA | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Yumdda_from_acrofan.jpg) |
| YUQI | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:20230630_Song_Yu-qi.jpg) |
| Yiruma | Trainholic | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Yiruma_2017_Suwon.jpg) |
| YooA | f2.8 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:160805_%EC%98%A4%EB%A7%88%EC%9D%B4%EA%B1%B8_%EB%AE%A4%EC%A7%81%EB%B1%85%ED%81%AC_%EC%A4%91%EA%B0%84%ED%87%B4%EA%B7%BC%EA%B8%B8_6.jpg) |
| Yozoh | 숏버스 프로젝트 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Yozoh2021.png) |
| Yuna | Irwandy Mazwir | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Yuna_(singer).jpg) |
| Yves | David Lee | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Yves_in_Tacoma_P1.jpg) |
| ZEEBRA | Sry85 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Zeebra_japan.JPG) |
| aespa | David Lee | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Aespa_01.jpg) |
| benny blanco | Matt Adam | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Benny_Bowtie_2018.jpg) |
| pH-1 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:190506_%EC%94%A8%ED%8E%98%EC%8A%A4%ED%8B%B0%EB%B2%8C_pH-1.jpg) |
| sogumm | Marie Claire Korea | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Sogumm_210522.png) |
| youra | MUSHROOM COMPANY | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Youra_in_March_2024.png) |
| ちゃんみな | De81112 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Chanmina_Zepp_New_Taipei_2025_(cropped).jpg) |
| 周湯豪 | onlymyself65536 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:%E5%91%A8%E6%B9%AF%E8%B1%AA.JPG) |
| 坂本龍一 | Joi Ito | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:RyuichiSakamotoJI4.jpg) |
| 宇多田ヒカル | Goldnrush Podcast | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Hikaru_Utada_at_Spotify_Tokyo.png) |
| 岩田剛典 | Avex Group Inc. | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:JSB_takanori_iwata_2018.jpg) |
| 幾田りら | TenAsia | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Lilas_Ikuta_at_the_2024_Melon_Music_Awards.png) |
| 星野源 | Space Shower Network. | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Gen_hoshino.jpg) |
| 陳冠希 | tathei | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Edison_Chen_in_2005.jpg) |
| 가리온 | 뮤지스땅스 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Garion.png) |
| 가인 | 곰탱유 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:(2016.09.11)%EB%A9%9C%EB%A1%9C%EB%94%94%ED%8F%AC%EB%A0%88%EC%8A%A4%ED%8A%B8%EC%BA%A0%ED%94%84_%EC%A0%9C%EC%95%84%EB%8B%98_%EA%B0%80%EC%9D%B8%EB%8B%98_%EC%A7%81%EC%B0%8D_by%EA%B3%B0%ED%83%B1%EC%9C%A0_(1).jpg) |
| 가희 | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Kahi_in_February_2024.png) |
| 간디 | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Buga_Kingz_from_acrofan.jpg) |
| 강균성 | KATV | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Kang_kyun_sung.png) |
| 강대성 | GOM | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Daesung_-_MADE_THE_MOVIE_Premiere.jpg) |
| 강민경 | KIYOUNG KIM | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Kang_Min-kyung_at_the_beverage_promotions_176.jpg) |
| 강승윤 | 1004SYNA | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:190607_%EC%9C%84%EB%84%88_%EB%B0%A9%EC%BD%95_%ED%8C%AC%EC%8B%B8%EC%9D%B8%ED%9A%8C_%EA%B0%95%EC%8A%B9%EC%9C%A4_1.jpg) |
| 강영현 | Shuohyun at Chinese Wikipedia | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:2017_Young_K_Taiwan.jpg) |
| 강타 | scene PLAYBILL | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:%EC%94%AC%ED%94%8C%EB%A0%88%EC%9D%B4%EB%B9%8C_8%EC%9B%94%ED%98%B8_%EA%B0%95%ED%83%80.jpg) |
| 개리 | Jinho Jung | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Kang_Gary.jpg) |
| 개코 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:181013_%EC%9D%B4%ED%83%9C%EC%9B%90_%EC%A7%80%EA%B5%AC%EC%B4%8C_%EC%B6%95%EC%A0%9C_%EC%B0%A9%ED%95%9C%EC%BD%98%EC%84%9C%ED%8A%B8_%EA%B0%9C%EC%BD%94.jpg) |
| 경서 | PIDA MUSIC | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:190725_%EA%B2%BD%EC%84%9C.png) |
| 공민지 | CBSJOY | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Minzy_CBS_Joy_2018.png) |
| 구준회 | shaq32 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Koo_Jun-hoe_-_2016_Gaon_Chart_K-pop_Awards_red_carpet.jpg) |
| 구하라 | HeyDay | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:170807_%EA%B5%AC%ED%95%98%EB%9D%BC_(cropped).jpg) |
| 권정열 | Trainholic | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Kwon_Jung-yeol,_10cm.jpg) |
| 권진아 | K-POPIT 케이팝잇 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Kwon_Jin-ah_in_July_2026.png) |
| 그냥노창 | 147company 마린 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:161002_%EC%B2%9C%EC%B1%84%EB%85%B8%EC%B0%BD_01.jpg) |
| 그레이 | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:GRAY_in_October_2024.png) |
| 그리 | BRANDNEW MUSIC | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:GREE_201120.jpg) |
| 기리보이 | Linchpins | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:2017_%EA%B8%B0%EB%A6%AC%EB%B3%B4%EC%9D%B4_(cropped).jpg) |
| 길 | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Gil_from_acrofan.jpg) |
| 길학미 | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Gil_Hak-mi_from_acrofan.jpg) |
| 김고은 | John Sears | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Kim_Go-eun_at_the_2024_Toronto_International_Film_Festival_(cropped).jpg) |
| 김규종 | tenasia10 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:%EA%B9%80%EA%B7%9C%EC%A2%85.jpg) |
| 김동완 | scene PLAYBILL | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:%27%EC%A0%A0%ED%8B%80%EB%A7%A8%EC%8A%A4_%EA%B0%80%EC%9D%B4%EB%93%9C%27_%EB%B0%B0%EC%9A%B0_%EA%B9%80%EB%8F%99%EC%99%84.jpg) |
| 김반장 | Bonnielou2013 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Windy_City_9_cropped.jpg) |
| 김보아 | Meimeiyeh | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:SPICA_Kim_Bo_A.jpg) |
| 김성규 | Kissing Light | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:180226_10_Stories_%EC%86%94%EB%A1%9C_%EC%87%BC%EC%BC%80%EC%9D%B4%EC%8A%A4_%EC%84%B1%EA%B7%9C_2-1.jpg) |
| 김세정 | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Kim_Sejeong_in_June_2025.png) |
| 김소혜 | TV10 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Kim_So-hye_(%EA%B9%80%EC%86%8C%ED%98%9C)_2023_03.jpg) |
| 김수윤 | Nine Stars | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:2019_Pink_Punch_Showcase_Su_Yun.png) |
| 김신영 | Official Youtube account of 식신로드 (Gourmet Road) , its twitter account has a link to the YouTube account | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:%EC%A3%BC%EC%98%81%ED%9B%88,_%EC%B2%9C%EC%9D%B4%EC%8A%AC_%EC%B6%9C%EC%97%B0_%ED%93%A8%EC%A0%84_%ED%96%84%EB%B2%84%EA%B7%B8_%EC%8A%A4%ED%85%8C%EC%9D%B4%ED%81%AC_%EA%B0%95%EB%82%A8%EA%B5%AC_%EC%97%AD%EC%82%BC%EB%8F%99_%EB%AF%BC%EB%B0%95_(%EC%8B%9D%EC%8B%A0%EB%A1%9C%EB%93%9C_Gourmet_Road)_eps_176-1_(%EA%B9%80%EC%8B%A0%EC%98%81).jpg) |
| 김심야 | Marie Claire Korea | [CC BY (YouTube)](https://www.youtube.com/t/creative_commons) | [Original file](https://www.youtube.com/watch?v=gOHQ1YZTHLQ) |
| 김연우 | Jinho Jung from Seoul, South Korea | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Kim_Yeon-woo.jpg) |
| 김오키 | Studio FLO 스튜디오 플로 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:%EA%B9%80%EC%98%A4%ED%82%A4.jpg) |
| 김완선 | Korea.net / Korean Culture and Information Service (Jeon Han) | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Kim_Wan_Sun_Korea_KPOP_World_Festival_18_(cropped).jpg) |
| 김윤아 | Republic of Korea | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Kim_Yoon-ah_in_2025.jpg) |
| 김이지 | SBS Radio | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Kim_E-Z_in_September_2025.png) |
| 김장훈 | LG전자 | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Kim_Jang-hoon.jpg) |
| 김조한 | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Kim_Johan_from_acrofan.jpg) |
| 김종국 | Vernon Chan from Kuala Lumpur, Malaysia | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Kim_Jong_Kook_at_Malaysia_for_Running_Man_Fan_Meeting_Asian_Tour_2014.jpg) |
| 김지숙 | Dmost Entertainment | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:JISOOK_in_Japan.jpg) |
| 김진표 | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Kim_Jin_Pyo_from_acrofan.jpg) |
| 김창열 | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Kim_Chang-Ryeol_from_acrofan.jpg) |
| 김하온 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:190506_%EC%94%A8%ED%8E%98%EC%8A%A4%ED%8B%B0%EB%B2%8C_%EA%B9%80%ED%95%98%EC%98%A8.jpg) |
| 김현중 | 뉴스인스타 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:181023_%27%EC%8B%9C%EA%B0%84%EC%9D%B4_%EB%A9%88%EC%B6%94%EB%8A%94_%EA%B7%B8%EB%95%8C%27_%EC%A0%9C%EC%9E%91%EB%B0%9C%ED%91%9C%ED%9A%8C_%EA%B9%80%ED%98%84%EC%A4%91.png) |
| 김희선 | 디스패치 / Dispatch | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:%E2%80%9C%ED%99%94%EC%82%AC%ED%95%9C_%EA%BD%83%EB%AF%B8%EB%AA%A8_%E2%80%9D_..._%EA%B9%80%ED%9D%AC%EC%84%A0_(1).jpg) |
| 나다 | Marie Claire Korea | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Nada_for_Marie_Claire_Korea_2016_(2).jpg) |
| 나얼 | 여니수니 | [CC BY 2.0 kr](https://creativecommons.org/licenses/by/2.0/kr/deed.en) | [Original file](https://commons.wikimedia.org/wiki/File:Naul.jpg) |
| 나윤권 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:240831_%EB%82%98%EC%9C%A4%EA%B6%8C_%EC%8B%A0%EC%B4%8C_%EB%B2%84%EC%8A%A4%ED%82%B9.jpg) |
| 나찰 | 뮤지스땅스 | [CC BY (YouTube)](https://www.youtube.com/t/creative_commons) | [Original file](https://www.youtube.com/watch?v=h5a9_2I0Hy8) |
| 나플라 | GROOVL1N | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Nafla_200625.png) |
| 넉살 | Studio FLO | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Nucksal_210913.png) |
| 넋업샨 | 권우찬 | [CC-BY-SA-3.0](http://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://ko.wikipedia.org/wiki/%ED%8C%8C%EC%9D%BC:Nuck.jpg) |
| 노지훈 | SBS Radio | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Roh_Ji-hoon_(%EB%85%B8%EC%A7%80%ED%9B%88)_220720.jpg) |
| 노홍철 | Park Dae ung | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:140807_%EB%85%B8%ED%99%8D%EC%B2%A0_01.jpg) |
| 닝닝 | 티비텐 TV10 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Ningning_at_Seoul_Discovery_Expedition_event_on_March_11,_2026_02.jpg) |
| 다이나믹 듀오 | KoreaNews France | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Interview_with_Dynamic_Duo_for_Koreanews.fr_at_MIDEM_festival_2014_5s.jpg) |
| 달수빈 | soobin212tw | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Subin_from_DalShabet_on_28th_May,_2016_3.jpg) |
| 더 원 | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:The_One_from_acrofan.jpg) |
| 더 콰이엇 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:180801_%EB%B6%80%EC%82%B0%EB%B0%94%EB%8B%A4%EC%B6%95%EC%A0%9C_%EB%8D%94%EC%BD%B0%EC%9D%B4%EC%97%87_4.jpg) |
| 던밀스 | Studio FLO 스튜디오 플로 | [CC BY (YouTube)](https://www.youtube.com/t/creative_commons) | [Original file](https://www.youtube.com/watch?v=_rce7xwmNxU) |
| 데프콘 | zzal TV 고다쿠 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:(GO%EB%8B%A4%EC%BF%A0)_%EA%B3%A0%EB%8B%A4%EC%BF%A0%EC%97%90_%EB%B0%94%EB%9D%BC%EB%8A%94_%EA%B2%83%EC%9D%80_(%EC%8B%9C%EC%A6%8C2_%EC%B5%9C%EC%A2%85%ED%9A%8C)_1m48s.jpg) |
| 도끼 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:180801_%EB%B6%80%EC%82%B0%EB%B0%94%EB%8B%A4%EC%B6%95%EC%A0%9C_%EB%8F%84%EB%81%BC_1.jpg) |
| 도영 | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:20231006_Doyoung_(NCT).jpg) |
| 도한세 | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Do_Han_Se_2021.png) |
| 동해 | Daegil yoo | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:171115_%EC%8A%88%ED%8D%BC%EC%A3%BC%EB%8B%88%EC%96%B4_%EB%8F%99%ED%95%B4.jpg) |
| 드렁큰 타이거 | NewsInStar | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Drunken_tiger2018.png) |
| 디아크 | Studio FLO 스튜디오 플로 | [CC BY (YouTube)](https://www.youtube.com/t/creative_commons) | [Original file](https://www.youtube.com/watch?v=ZaDNQK9zPD4) |
| 디테오 | Ming J | [CC BY (YouTube)](https://www.youtube.com/t/creative_commons) | [Original file](https://www.youtube.com/watch?v=I17FKnWTH2Q) |
| 딕펑스 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:190919_%EB%94%95%ED%8E%91%EC%8A%A4_%ED%99%8D%EB%8C%80_%EB%B2%84%EC%8A%A4%ED%82%B9.jpg) |
| 딘 | Jae Chung (JDZ) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:DEAN,_Joombas_Music_Group_artist.png) |
| 딥플로우 | GET CHEE$E | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Deepflow_Feb_2017.png) |
| 라디 | o2news | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:091018_%EB%94%94%EC%A7%80%ED%84%B8_%EB%AE%A4%EC%A7%81%EC%96%B4%EC%9B%8C%EB%93%9C_Ra.D.jpg) |
| 라임어택 | 이선재 | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Rhyme-A-_Soulcompany_Show.png) |
| 래원 | Studio FLO | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Layone_210913.png) |
| 레디 | Bonnielou2013 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Reddy_1_2017_cropped_2.jpg) |
| 레이디 제인 | poongwoo | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:120114_%EB%A1%AF%EB%8D%B0%EC%9B%94%EB%93%9C_-_%EB%A0%88%EC%9D%B4%EB%94%94%EC%A0%9C%EC%9D%B8.jpg) |
| 로꼬 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:220521_%EB%8D%94%ED%81%AC%EB%9D%BC%EC%9D%B4%EA%B7%B8%EB%9D%BC%EC%9A%B4%EB%93%9C_%EB%A1%9C%EA%BC%AC.jpg) |
| 로시 | Dorothy Company | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Rothy_201223.jpg) |
| 루이 (긱스) | Ming J | [CC BY (YouTube)](https://www.youtube.com/t/creative_commons) | [Original file](https://www.youtube.com/watch?v=KkOmkffvvrE) |
| 루피 | Marie Claire Korea | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Loopy_200318.jpg) |
| 리듬파워 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:180801_%EB%B6%80%EC%82%B0%EB%B0%94%EB%8B%A4%EC%B6%95%EC%A0%9C_%EB%A6%AC%EB%93%AC%ED%8C%8C%EC%9B%8C_1.jpg) |
| 리쌍 | Jinho Jung | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Leessang.jpg) |
| 릴러말즈 | Bamboo Studio | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:%EB%A6%B4%EB%9F%AC%EB%A7%90%EC%A6%88_2022.png) |
| 릴보이 | ENTmedia music | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Lil_Boi_170827.jpg) |
| 마이노스 | Lamin | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:110618_%EA%B8%80%EB%A1%9C%EB%B2%8C_%EC%97%90%ED%8B%B0%EC%BC%93_%EC%BA%A0%ED%8E%98%EC%9D%B8_-_%ED%99%8D%EB%8C%80_%ED%9E%99%ED%95%A9_%EA%B2%8C%EB%A6%B4%EB%9D%BC_%EC%BD%98%EC%84%9C%ED%8A%B8_Eluphant_3.jpg) |
| 마이크로닷 | K-POPIT 케이팝잇 | [CC BY (YouTube)](https://www.youtube.com/t/creative_commons) | [Original file](https://www.youtube.com/watch?v=EuEK0mVQGMw) |
| 마이티 마우스 | Bryan Dorrough | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Mighty_Mouth.jpg) |
| 매드클라운 | mang2goon | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:150425_%EB%A7%A4%EB%93%9C%ED%81%B4%EB%9D%BC%EC%9A%B4_02.jpg) |
| 머쉬베놈 | Marie Claire Korea | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Mushvenom_20210201.png) |
| 면도 | WOMAN SENSE | [CC BY (YouTube)](https://www.youtube.com/t/creative_commons) | [Original file](https://www.youtube.com/watch?v=jrXZO4BvWGI) |
| 문종업 | NINE STARS | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Moon_Jong_Up_%EB%AC%B8%EC%A2%85%EC%97%85_,_%27HEADACHE%27_PRESS_SHOWCASE_PHOTO_SESSION_18m_11s.jpg) |
| 문지은 | poongwoo | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:120428_Pni_%EC%82%AC%EC%A7%84%EC%98%81%EC%83%81%EA%B8%B0%EC%9E%90%EC%9E%AC%EC%A0%84_-_%EC%86%8C%EB%8B%88_%EB%AC%B8%EC%A7%80%EC%9D%80.jpg) |
| 뮤지 | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:20111026_970fb_o.jpg) |
| 미노이 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:230423_%EC%98%AC%ED%95%B4%EB%8F%84_%EA%B8%80%EB%A0%80%EB%82%98%EB%B4%84_(%EB%AF%B8%EB%85%B8%EC%9D%B4).jpg) |
| 미료 | http://kayrick.tistory.com/ | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:180524_%EB%AF%B8%EB%A3%8C_03.jpg) |
| 미쓰라 | May S. Young from Metro NYC, United States | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:EpikHigh_061215_052_(18152025264).jpg) |
| 바비 | shaq32 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Bobby_-_2016_Gaon_Chart_K-pop_Awards_red_carpet.jpg) |
| 바비킴 | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Bobby_Kim_from_acrofan_cropped.JPG) |
| 바스코 | Linchpins | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:2017_%EB%B9%8C%EC%8A%A4%ED%83%9D%EC%8A%A4.jpg) |
| 박경 | mduangdara from Midlothian, VA, United States | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Block_B_at_KCON_2015_in_Los_Angeles_-_3.jpg) |
| 박명수 | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Park_Myeong-su_from_Acrofan.jpg) |
| 박보람 | Strawberry Kiss | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:150509_%EC%8B%A0%EC%B4%8C_%EC%9C%A0%ED%94%8C%EB%A0%89%EC%8A%A4_%ED%8C%AC%EC%8B%B8%EC%9D%B8%ED%9A%8C_%EB%B0%95%EB%B3%B4%EB%9E%8C.jpg) |
| 박수진 | Rokiei | [CC BY 2.0 kr](https://creativecommons.org/licenses/by/2.0/kr/deed.en) | [Original file](https://commons.wikimedia.org/wiki/File:Park_Soo-jin_at_the_2014_Seoul_Fashion_Week.JPG) |
| 박재범 | Tourism.Victoria | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Jay_Park_in_Flinders_Street_Station,_in_September_2012.png) |
| 박정현 | 서울종합예술실용학교 공식 영상채널 싹튜브 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Lena_Park,_2015_(cropped).jpg) |
| 박진영 | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Park_Jin-young_(Founder_of_JYP_Entertainment)_in_February_2011_from_acrofan.jpg) |
| 박화요비 | Jinho.Jung | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Hwayobi_in_Cyworld_Dream_Music_Festival.jpg) |
| 박효신 | 달덩이 | [CC BY 2.0 kr](https://creativecommons.org/licenses/by/2.0/kr/deed.en) | [Original file](https://commons.wikimedia.org/wiki/File:Park_Hyo-Shin18.jpg) |
| 방시혁 | Hybetest151515 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Bang-Si-Hyuk.jpg) |
| 방용국 | EVERY MOMENT | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:160226_%EC%97%AC%EC%9D%98%EB%8F%84%ED%8C%AC%EC%8B%B8_(%EC%9A%A9%EA%B5%AD)_4.jpg) |
| 방재민 | 백일몽 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:170606_%EB%B0%A9%EC%9E%AC%EB%AF%BC_Bang_Jae-min.png) |
| 배치기 | SBS Radio 에라오 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Baechigi_in_2020.png) |
| 백예린 | YERINBAEKMOM | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Baek_Ye-rin_performing_%22Sugar%22_on_July_10,_2014.jpg) |
| 백지영 | 디스패치 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:190328_%EB%B0%B1%EC%A7%80%EC%98%81.jpg) |
| 뱃사공 | 코넛 - Conut HipHop Magazine | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Bassagong.jpg) |
| 버벌진트 | Ming J | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Verbal_Jint_-_%EA%B8%B0%EB%A6%84%EA%B0%99%EC%9D%80%EA%B1%B8_%EB%81%BC%EC%96%B9%EB%82%98.jpg) |
| 베이식 | Pabian | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:%EB%B2%A0%EC%9D%B4%EC%8B%9D_(cropped).jpg) |
| 보이비 | 꽁병지tv | [CC BY (YouTube)](https://www.youtube.com/t/creative_commons) | [Original file](https://www.youtube.com/watch?v=auCs_1wzOCc) |
| 볼빨간사춘기 | LG전자 | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:LG%EC%A0%84%EC%9E%90,_%E2%80%98LG_G6%E2%80%99%EB%A1%9C_%EC%A0%9C%EC%9E%91%ED%95%9C_%EC%9D%8C%EC%9B%90_%EA%B3%B5%EA%B0%9C_(33965400595)_(cropped).jpg) |
| 봉태규 | 디스패치 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:190716_%EB%B4%89%ED%83%9C%EA%B7%9C.jpg) |
| 부가킹즈 | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Buga_Kingz_from_acrofan.jpg) |
| 부석순 | SEVENTEEN | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:230216_BSS_(%EB%B6%80%EC%84%9D%EC%88%9C).jpg) |
| 블라세 | GooseBumps | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Blase_2020.png) |
| 비아이 | Hikooksong | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:20221210_B.I_All_Day_Show_in_Seoul_Crop.jpg) |
| 비오 | Marie Claire Korea | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:20211226%E2%80%94Be%27O,_interview,_Marie_Claire_Korea_(00m11s).jpg) |
| 비와이 | f2.8 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:20161119_%EB%B9%84%EC%99%80%EC%9D%B4_%EB%A9%9C%EB%A1%A0%EB%AE%A4%EC%A7%81%EC%96%B4%EC%9B%8C%EB%93%9C_(2).jpg) |
| 비지 | JKEntAUS | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Special_message_from_MFBTY_with_JUNOFLO.webm) |
| 비프리 | Lamin | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:110618_%EA%B8%80%EB%A1%9C%EB%B2%8C_%EC%97%90%ED%8B%B0%EC%BC%93_%EC%BA%A0%ED%8E%98%EC%9D%B8_-_%ED%99%8D%EB%8C%80_%ED%9E%99%ED%95%A9_%EA%B2%8C%EB%A6%B4%EB%9D%BC_%EC%BD%98%EC%84%9C%ED%8A%B8_B-Free_5.jpg) |
| 빅나티 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:220521_%EB%8D%94%ED%81%AC%EB%9D%BC%EC%9D%B4%EA%B7%B8%EB%9D%BC%EC%9A%B4%EB%93%9C_%EB%B9%85%EB%82%98%ED%8B%B0.jpg) |
| 빅원 | SBS Radio 에라오 | [CC BY (YouTube)](https://www.youtube.com/t/creative_commons) | [Original file](https://www.youtube.com/watch?v=q2wrJWANY04) |
| 빈지노 | NewsInStar | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:190521_%EB%B9%88%EC%A7%80%EB%85%B8X%ED%99%8D%EC%A2%85%ED%98%84,_%EA%B0%90%ED%83%84%EB%82%98%EC%98%A4%EB%8A%94_%EB%A9%8B%EC%A7%90_%27%EB%B0%94%EC%9D%B4%EB%A0%88%EB%8F%84(BYREDO)%27_%ED%94%8C%EB%9E%98%EA%B7%B8%EC%8B%AD_%EC%8A%A4%ED%86%A0%EC%96%B4_%EC%98%A4%ED%94%88_%EA%B8%B0%EB%85%90%ED%96%89%EC%82%AC_36s.jpg) |
| 빈첸 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:190506_%EC%94%A8%ED%8E%98%EC%8A%A4%ED%8B%B0%EB%B2%8C_%EB%B9%88%EC%B2%B8.jpg) |
| 사이먼 도미닉 | May S. Young from Metro NYC, United States | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:AOMG,_Simon_Dominic_2014.jpg) |
| 산이 | http://hdpics.tistory.com/ | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:171014_SAN_E.jpg) |
| 상추 | USAG- Humphreys | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Sangchu_in_K-Force_Special_Show_-_Pyeongtaek,_South_Korea_-_7_March_2013.jpg) |
| 서사무엘 | OnCam! TV | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Samuel_Seo_-_K-pop_World_Festival_2016.jpg) |
| 서은광 | Little Boy | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:150110_BTOB_Seo_Eunkwang.jpg) |
| 서인국 | Marie Claire Korea | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Seo_In-Guk_210601.png) |
| 서인영 | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Seo_In-young_from_acrofan.jpg) |
| 선우정아 | 티비텐 (TV10) | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:%EC%84%A0%EC%9A%B0%EC%A0%95%EC%95%84_(SWJA)_-_GIRLS_ON_FIRE_PRESS_CONFERENCE.png) |
| 소울 다이브 | Ming J | [CC BY (YouTube)](https://www.youtube.com/t/creative_commons) | [Original file](https://www.youtube.com/watch?v=I17FKnWTH2Q) |
| 소율 | 포에버 (Forever5) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:(15.08.22)_CRAYON_POP_%ED%81%AC%EB%A0%88%EC%9A%A9%ED%8C%9D_%EC%9D%98%EC%A0%95%EB%B6%80_%EC%B0%A9%ED%95%9C%EC%BD%98%EC%84%9C%ED%8A%B8_(Soyul).jpg) |
| 소정 | Sjcontents | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Lee_So-jung_at_a_fansign_in_Shinsegae_inMarch_2016_03.jpg) |
| 소코도모 | Studio Flo | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Sokodomo.png) |
| 소향 | 로스트아크 LOST ARK | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Sohyang_in_June_2022.png) |
| 솔비 | TV10 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Solbi_in_February_2026.png) |
| 송민기 | Marie Claire Korea | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Mingi_(ATEEZ)_in_October_2024.png) |
| 송민호 | BITTER CHOCOLATE | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:180415_%EC%9C%84%EB%84%88_%EC%97%AC%EC%9D%98%EB%8F%84_%ED%8C%AC%EC%8B%B8_4.jpg) |
| 송지은 | Scrt2014 | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | [Original file](https://commons.wikimedia.org/wiki/File:SECRET_Song_Jieun_140811_01.png) |
| 쇼리 | Bryan Dorrough | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Mighty_Mouth.jpg) |
| 수퍼비 | STUDIO JEJUMBC _ 스튜디오 제주MBC | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:%EC%88%98%ED%8D%BC%EB%B9%84_%EC%A0%9C%EC%A3%BC%EC%97%90%EC%BD%94%EB%AE%A4%EC%A7%81%ED%8E%98%EC%8A%A4%ED%8B%B0%EB%B2%8C.jpg) |
| 슈가 | Dispatch | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Min_Yoon-gi_May_2018.jpg) |
| 슈프림팀 | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Supreme_Team_from_acrofan.jpg) |
| 스낵키챈 | Dynasty Muzik · 촬영 Byun Byul · 편집 Snacky Chan | [CC BY (YouTube)](https://www.youtube.com/t/creative_commons) | [Original file](https://www.youtube.com/watch?v=YFutQ04fRoY) |
| 스월비 | MIC SWG | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Swervy.png) |
| 스웨이디 | 스튜디오 틈새 | [CC BY (YouTube)](https://www.youtube.com/t/creative_commons) | [Original file](https://www.youtube.com/watch?v=MJ5cNdClU98) |
| 스윙스 | Linchpins | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:2017_%EC%8A%A4%EC%9C%99%EC%8A%A4.jpg) |
| 스컬 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:180802_%EB%B6%80%EC%82%B0%EB%B0%94%EB%8B%A4%EC%B6%95%EC%A0%9C_%EC%8A%A4%EC%BB%AC_1.jpg) |
| 슬리피 | SBS Radio 에라오 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:%EC%8A%AC%EB%A6%AC%ED%94%BC.jpg) |
| 슬릭 | PGNpictures | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:SLEEQ2021.png) |
| 승리 | NINE STARS | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:181001_%EC%8A%B9%EB%A6%AC_02.png) |
| 식케이 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:180801_%EB%B6%80%EC%82%B0%EB%B0%94%EB%8B%A4%EC%B6%95%EC%A0%9C_%EC%8B%9D%EC%BC%80%EC%9D%B4_2.jpg) |
| 신보라 | LG전자 | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Shin_Bo_Ra.jpg) |
| 신스 | Marie Claire Korea | [CC BY (YouTube)](https://www.youtube.com/t/creative_commons) | [Original file](https://www.youtube.com/watch?v=lyjf1hH9xR4) |
| 신승훈 | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Shin_Seung-hun_from_acrofan.jpg) |
| 신혜성 | D.E.M.O.N | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:141116_%EC%83%81%ED%95%98%EC%9D%B4_%EA%B3%B5%EC%97%B0_-_%EC%9D%B4%EB%AF%BC%EC%9A%B0%26%EC%8B%A0%ED%98%9C%EC%84%B1_10.jpg) |
| 씨잼 | Linchpins | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:2017_%EC%94%A8%EC%9E%BC.jpg) |
| 아웃사이더 | 서울종합예술실용학교 공식 영상채널 싹튜브 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:(%EC%8B%B9%ED%8A%9C%EB%B8%8C)_%EC%84%9C%EC%A2%85%EC%98%88_SAC%EC%8A%A4%ED%83%80%ED%8A%B9%EA%B0%95_%EB%9E%98%ED%8D%BC_%EC%95%84%EC%9B%83%EC%82%AC%EC%9D%B4%EB%8D%94_%EC%86%8C%ED%86%B5%EA%B5%90%EA%B0%90%EC%BD%98%EC%84%9C%ED%8A%B8_%EC%84%9C%EC%9A%B8%EC%A2%85%ED%95%A9%EC%98%88%EC%88%A0%EC%8B%A4%EC%9A%A9%ED%95%99%EA%B5%90_%EC%9E%AC%ED%95%99%EC%83%9D%ED%8A%B9%EA%B0%95_46s.jpg) |
| 안다 | shaq32 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:160326_18_F_W_%EC%84%9C%EC%9A%B8%ED%8C%A8%EC%85%98%EC%9C%84%ED%81%AC_%ED%8F%AC%ED%86%A0%EC%9B%94_(cropped).jpg) |
| 안병웅 | Marie Claire Korea | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Ahn_Byeong-woong_(%EC%95%88%EB%B3%91%EC%9B%85)_220724.jpg) |
| 알엠 | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:RM_at_W_Korea_Love_Your_W,_November_2023.jpg) |
| 애쉬 아일랜드 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:220521_%EB%8D%94%ED%81%AC%EB%9D%BC%EC%9D%B4%EA%B7%B8%EB%9D%BC%EC%9A%B4%EB%93%9C_%EC%95%A0%EC%89%AC%EC%95%84%EC%9D%BC%EB%9E%9C%EB%93%9C.jpg) |
| 양다일 | BRANDNEW MUSIC | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Yang_Da_Il_210915.png) |
| 양동근 | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Yang_Dong-geun_from_acrofan.jpg) |
| 양세형 | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Yangsehyungin2020.png) |
| 양요섭 | Marie Claire Korea | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:(Marie_Claire_Korea)_BEAST_is_BACK!_(2).jpg) |
| 양인모 | Zangelin21 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Inmo_Yang_2025_(cropped).jpg) |
| 양현석 | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:161110_%EC%96%91%ED%98%84%EC%84%9D.png) |
| 양희은 | 여니수니 | [CC BY 2.0 kr](https://creativecommons.org/licenses/by/2.0/kr/deed.en) | [Original file](https://commons.wikimedia.org/wiki/File:Yang_Hee-Eun.jpg) |
| 어글리덕 | Ming J | [CC BY (YouTube)](https://www.youtube.com/t/creative_commons) | [Original file](https://www.youtube.com/watch?v=WM683j1TI3U) |
| 언터쳐블 | USAG- Humphreys | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Untouchable_in_K-Force_Special_Show_-_Pyeongtaek,_South_Korea_-_7_March_2013.jpg) |
| 엄정화 | 티비텐 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Uhm_Junghwa_Kolon_Sports_50th_Anniversary_Event_1.jpg) |
| 엄지 | 8월의 축복 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:231102_%ED%95%9C%EA%B0%95_%EA%B2%8C%EB%A6%B4%EB%9D%BC_%EC%97%84%EC%A7%80_(5).jpg) |
| 업타운 | SBS Radio 에라오 | [CC BY (YouTube)](https://www.youtube.com/t/creative_commons) | [Original file](https://www.youtube.com/watch?v=3tKu376NFBI) |
| 에디킴 | 우연히현영 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:141211_%EA%B9%80%EC%98%88%EB%A6%BC%26%EC%97%90%EB%94%94%ED%82%B4_%EB%8D%94%EC%87%BC_in_%EC%BD%94%EC%97%91%EC%8A%A4_%EC%95%BC%EC%99%B8%EB%AC%B4%EB%8C%80_(%EC%97%90%EB%94%94%ED%82%B4).jpg) |
| 에픽하이 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:190322_%EC%97%90%ED%94%BD%ED%95%98%EC%9D%B4_%EC%BD%94%EC%97%91%EC%8A%A4_%EC%8A%A4%ED%83%80%ED%95%84%EB%93%9C_%ED%8C%AC%EC%8B%B8%EC%9D%B8%ED%9A%8C_2.jpg) |
| 엔젤 | Official Youtube account of 식신로드 (Gourmet Road) , its twitter account has a link to the YouTube account | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:%EC%9D%B4%EC%A7%80%ED%98%9C,_%EC%B1%84%EC%9D%80%EC%A0%95_%EC%B6%9C%EC%97%B0_58%EB%85%84_%EC%A0%84%ED%86%B5%EC%9D%98_%EC%96%91%EB%85%90_%EC%86%8C%EA%B0%88%EB%B9%84_%EC%A4%91%EA%B5%AC_%EC%9D%84%EC%A7%80%EB%A1%9C_%EB%A7%9B%EC%A7%91_%EC%A1%B0%EC%84%A0%EC%98%A5_(%EC%8B%9D%EC%8B%A0%EB%A1%9C%EB%93%9C_Gourmet_Road)_eps_21-2_%EC%B1%84%EC%9D%80%EC%A0%95.jpg) |
| 예지 | 허수아비 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:15.05.27_%EC%9B%90%EC%A3%BC_%EC%9C%84%EB%AC%B8%EC%97%B4%EC%B0%A8_%EC%A7%81%EC%B0%8D(_%ED%94%BC%EC%97%90%EC%8A%A4%ED%83%80_%EC%9E%AC%EC%9D%B4,_%EB%A6%B0%EC%A7%80,_%EC%98%88%EC%A7%80,_%ED%98%9C%EB%AF%B8,_%EC%B0%A8%EC%98%A4%EB%A3%A8_)_03.jpg) |
| 오디 | K-POPIT 케이팝잇 | [CC BY (YouTube)](https://www.youtube.com/t/creative_commons) | [Original file](https://www.youtube.com/watch?v=oa6Kv86Aynw) |
| 오케이션 | Cohortseoul | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Okasian.jpg) |
| 옥주현 | scene PLAYBILL | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:(%EC%94%AC%ED%94%8CTV)_%EC%94%AC%ED%94%8C%EB%A0%88%EC%9D%B4%EB%B9%8C_6%EC%9B%94%ED%98%B8_COVER_STORY_%27%EB%A7%88%ED%83%80%ED%95%98%EB%A6%AC%27%EC%98%A5%EC%A3%BC%ED%98%84_(2).jpg) |
| 옥택연 | mang2goon | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:221125_Ok_Taec-yeon.jpg) |
| 올티 | K-POPIT 케이팝잇 | [CC BY (YouTube)](https://www.youtube.com/t/creative_commons) | [Original file](https://www.youtube.com/watch?v=v5rlhWsSPHY) |
| 용준형 | Marie Claire Korea | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:2017%EB%85%84_11%EC%9B%94%ED%98%B8_Marie_Claire_Korea_%ED%95%98%EC%9D%B4%EB%9D%BC%EC%9D%B4%ED%8A%B8_05.png) |
| 우디 고차일드 | K-pop Profiles | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Woodiegochild.jpg) |
| 우원재 | SBS Radio | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Woo_Wonjae_190405.jpg) |
| 우주소녀 | HeyDay | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:170701_%EC%9A%B0%EC%A3%BC%EC%86%8C%EB%85%80_%EC%8B%A0%EC%B4%8C_%EA%B2%8C%EB%A6%B4%EB%9D%BC.jpg) |
| 우혜림 | 우혜림 • Lim's Diary | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Woo_Hye-rim_in_May_2023.png) |
| 웅산 | 실버아이TV | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Woongsan2021.png) |
| 원슈타인 | GROOVL1N | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Wonstein_(%EC%9B%90%EC%8A%88%ED%83%80%EC%9D%B8)_210601.jpg) |
| 원썬 | K-POPIT 케이팝잇 | [CC BY (YouTube)](https://www.youtube.com/t/creative_commons) | [Original file](https://www.youtube.com/watch?v=voB6Yk1yo00) |
| 유겸 | Marie Claire Korea | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Yugyeom_for_Marie_Claire_Korea_June_2024_issue_01.png) |
| 유리상자 | 유주샨*ROSA | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Yurisangja_in_2017.png) |
| 유빈 | SBS Radio | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Kim_Yu-bin_in_August_2022.png) |
| 유성은 | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Yoo_Sung-Eun_from_acrofan.jpg) |
| 유승우 | demical | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:14.10.18_%EC%84%9C%EC%9A%B8%EC%8B%9C%EC%B2%AD_%EC%9C%A0%EC%8A%B9%EC%9A%B0.jpg) |
| 유재석 | Republic of Korea | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Yoo_Jae-suk.jpg) |
| 유희열 | Original:LG전자, Cropped:Puramyun31 | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:You_Hee-Yeol.jpg) |
| 육지담 | Uekara mariko | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:150521_%EC%9C%A1%EC%A7%80%EB%8B%B4_-_%EC%96%BC%EB%A0%88%EB%A6%AC(Ulleri)_%ED%99%8D%EC%9D%B5%EB%8C%80%ED%95%99%EA%B5%90_%EA%B3%B5%EA%B0%9C%EB%B0%A9%EC%86%A1_%EC%A7%81%EC%BA%A0_0m_1s.jpg) |
| 윤도현 | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Yoon_Do-Hyun_from_acrofan.jpg) |
| 윤두준 | Marie Claire Korea | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:(Marie_Claire_Korea)_BEAST_is_BACK!_(8).jpg) |
| 윤미래 | LGEPR | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Yoon_Mi-rae.jpg) |
| 윤석철 | Studio FLO 스튜디오 플로 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:YunseokcheolStudioFLO2023.png) |
| 윤은혜 | SBS Radio | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Yoon_Eun-hye_in_April_2021.png) |
| 윤종신 | 디스패치 / Dispatch | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Yoon_Jong-shin_at_%22Persona%22_press_conference,_27_March_2019.jpg) |
| 윤하 | 티비텐 TV10 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Younha_at_Incheon_Airport_on_050123_(2).png) |
| 윤훼이 | SL8 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:%EC%9C%A4%ED%9B%BC%EC%9D%B4_2020.png) |
| 은지원 | 바나나우유 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:20180106_%EC%A0%9D%EC%8A%A4%ED%82%A4%EC%8A%A4_20%EC%A3%BC%EB%85%84%EC%BD%98%EC%84%9C%ED%8A%B8_@%EB%8C%80%EA%B5%AC_27.jpg) |
| 은하 | 티비텐 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Eunha_August_2024_(3x4_cropped).jpg) |
| 이그니토 | K-POPIT 케이팝잇 | [CC BY (YouTube)](https://www.youtube.com/t/creative_commons) | [Original file](https://www.youtube.com/watch?v=ZYXtXS1NDCU) |
| 이기광 | 티비텐 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Lee_Gikwang_Seoul_Fashion_Week_September_2024.jpg) |
| 이루펀트 | BRANDNEW MUSIC | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Eluphant_in_2019.png) |
| 이무진 | Marie Claire Korea | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:20210427%E2%80%94Lee_Mu-jin_%EC%9D%B4%EB%AC%B4%EC%A7%84,_interview,_Marie_Claire_Korea_screenshot_(05m55s).jpg) |
| 이문세 | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Lee_Moon-se_from_acrofan.jpg) |
| 이민혁 | Little Boy | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:150904_BTOB_Lee_Minhyuk.jpg) |
| 이병헌 | Desmond Herzfelder | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Lee_Byung-hun_2025_Toronto_(cropped).jpg) |
| 이상은 | Ltfan070624 | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Leesangeun140928.jpg) |
| 이서연 | NINE STARS | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:190611_%EC%9D%B4%EC%84%9C%EC%97%B0.jpg) |
| 이센스 | GET CHEE$E | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Esens_in_2017.png) |
| 이소라 | SJUN | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:180617_Lee_So-ra_at_Pilsner_Festival.png) |
| 이수영 | 서울종합예술실용학교 공식 영상채널 싹튜브 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:(%EC%8B%B9%ED%8A%9C%EB%B8%8C)_%EC%84%9C%EC%9A%B8%EC%A2%85%ED%95%A9%EC%98%88%EC%88%A0%EC%8B%A4%EC%9A%A9%ED%95%99%EA%B5%90_SAC_%EB%82%A0%EC%9E%90_%EC%97%B0%EC%98%88%EC%9D%B8_%EC%8A%A4%ED%83%80_%EC%B6%95%ED%95%98%EB%A9%94%EC%84%B8%EC%A7%80_1%ED%83%84_-_%EC%9D%B4%EC%88%98%EC%98%81.jpg) |
| 이수현 | Strawberry Kiss | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:141221_SBS_%EC%96%B4%EC%9B%8C%EC%A6%88_%EC%88%98%ED%98%84.jpg) |
| 이승기 | 프로스펙스 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:LeeSeunggi4.jpg) |
| 이승철 | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Lee_Seung-cheol_from_acrofan.jpg) |
| 이승환 | EXPO 2012 YEOSU KOREA | [CC BY 2.0 kr](https://creativecommons.org/licenses/by/2.0/kr/deed.en) | [Original file](https://commons.wikimedia.org/wiki/File:Lee_Seung-Hwan.jpg) |
| 이영지 | TV10 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Lee_Young-ji_in_February_2026.png) |
| 이적 | 여니수니 | [CC BY 2.0 kr](https://creativecommons.org/licenses/by/2.0/kr/deed.en) | [Original file](https://commons.wikimedia.org/wiki/File:Lee_Juck.jpg) |
| 이준 | Joh582 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Leejoon2.png) |
| 이진아 | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Lee_Jin-ah_(singer_born_1991)_on_July_30,_2015.jpg) |
| 이창섭 | leechapusopu | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:170617_Lee_Chang-sub_(4).jpg) |
| 이하늘 | LG전자 | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Lee_Ha-Neul.jpg) |
| 이해리 | http://dkyouholic.tistory.com/ | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:170114_%EB%B9%84%EB%B0%9C%EB%94%94%ED%8C%8C%ED%81%AC_%EB%9D%BC%EC%9D%B4%EB%94%A9_%EC%BD%98%EC%84%9C%ED%8A%B8_-_%EB%8B%A4%EB%B9%84%EC%B9%98_%EC%A7%81%EC%B0%8D_01.jpg) |
| 이현배 | 젬비씨 JEMBC | [CC BY (YouTube)](https://www.youtube.com/t/creative_commons) | [Original file](https://www.youtube.com/watch?v=bMR6mLwcVlE) |
| 이홍기 | 뉴스인스타 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:0208_%EC%98%A5%EC%88%98%EC%88%98_%EC%98%A4%EB%A6%AC%EC%A7%80%EB%84%90_%27%EB%84%88_%EB%AF%B8%EC%9B%8C!_%EC%A4%84%EB%A6%AC%EC%97%A3%27_%EC%A0%9C%EC%9E%91%EB%B0%9C%ED%91%9C%ED%9A%8C_%EC%9D%B4%ED%99%8D%EA%B8%B0.jpg) |
| 이효리 | Marie Claire Korea | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:(Marie_Claire_Korea)_Feel_The_Soul_-_%EC%9D%B4%ED%9A%A8%EB%A6%AC_(4).jpg) |
| 인순이 | livingocean | [CC BY 2.0 kr](https://creativecommons.org/licenses/by/2.0/kr/deed.en) | [Original file](https://commons.wikimedia.org/wiki/File:Insooni_at_the_Expo_2012_Yeosu11.jpg) |
| 임슬옹 | scene PLAYBILL | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:20170613%E2%80%94Lim_Seul-ong_%EC%9E%84%EC%8A%AC%EC%98%B9,_%22Mata_Hari%22_photo_shoot,_scene_PLAYBILL_screenshot_(00m37s).jpg) |
| 임정희 | Jinho.Jinho | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Lim_Jeong_Hee2.jpg) |
| 임창정 | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Lim_Chang-Jung_from_acrofan.jpg) |
| 자우림 | takato marui | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Jaurim_1.jpg) |
| 자이언티 | Pabian | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Zion.T_at_DMC_Festival_2015_MBC_Radio_DJ_Concert_02.jpg) |
| 장동민 | LG전자 | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:LG_XNOTE_%EC%9A%B8%ED%8A%B8%EB%9D%BC%EB%B6%81_Z330_-_9%EA%B0%80%EC%A7%80_%EC%9D%B4%EC%95%BC%EA%B8%B0_(6904453450)_(cropped).jpg) |
| 장현승 | Doolki | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Jang_Hyun-seung_at_V-Pop_Festival_Concert_on_January_2014_01_(cropped).jpg) |
| 재키와이 | Paul Hudson from United Kingdom | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:SXSW_2019_-_Jvcki_Wai_(46521236265).jpg) |
| 저스디스 | STUDIO JEJUMBC _ 스튜디오 제주MBC | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:%EC%A0%80%EC%8A%A4%EB%94%94%EC%8A%A4.jpg) |
| 전소연 | News in Star | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:0226_(%EC%97%AC%EC%9E%90)%EC%95%84%EC%9D%B4%EB%93%A4_%EC%86%8C%EC%97%B0_%ED%8F%AC%EC%BB%A4%EC%8A%A4%26%EC%84%B8%EB%A1%9C%EC%BA%A0,_2nd_%EB%AF%B8%EB%8B%88%EC%95%A8%EB%B2%94_%27I_made%27_%EC%87%BC%EC%BC%80%EC%9D%B4%EC%8A%A4_%ED%8F%AC%ED%86%A0%ED%83%80%EC%9E%84_(derived).jpg) |
| 전인권 | Trainholic | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Jeon_In_Gwon_2019.jpg) |
| 전지윤 | the.angrycamel from Singapore, Singapore | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Ji-yoon_cropped_2012.jpg) |
| 전효성 | Zscrertime | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | [Original file](https://commons.wikimedia.org/wiki/File:Jun_Hyoseong_150517_(3).jpg) |
| 정기고 | Korea.net / Korean Culture and Information Service (Jeon Han) | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:KOCIS_Korea_Mnet_Soyou_Junggigo_01_(12986804945).jpg) |
| 정상수 | 노래하는코트 풀영상채널 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:%EC%A0%95%EC%83%81_%EC%88%98.jpg) |
| 정아 | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Kim_Jungah_from_acrofan.jpg) |
| 정용화 | Marie Claire Korea | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:CNBLUE_%EC%94%A8%EC%97%94%EB%B8%94%EB%A3%A8_%EC%B4%AC%EC%98%81%EC%9E%A5_%EC%8A%A4%EC%BC%80%EC%B9%98_%EC%A0%95%EC%9A%A9%ED%99%94.jpg) |
| 정인 | 여니수니 | [CC BY 2.0 kr](https://creativecommons.org/licenses/by/2.0/kr/deed.en) | [Original file](https://commons.wikimedia.org/wiki/File:Choi_Jung-in,_2014_(cropped).jpg) |
| 정일훈 | SHAQ Photo | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Jung_Il-hoon_at_an_fansign_in_November_2016.jpg) |
| 정재용 | LG전자 | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Jung_Jae-Yong.jpg) |
| 정재일 | 쿄다방_ | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Jung_jaeil2.png) |
| 정준영 | Harry Cotter | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:160511_Jung_Joon-young.jpg) |
| 정준하 | Park Dae ung | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:140807_%EC%A0%95%EC%A4%80%ED%95%98.jpg) |
| 정진운 | 147 Company | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Jung_Jin-woon_at_Super_Race_Grid_Work,_in_April_2017_01.jpg) |
| 정채연 | TV10 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Jung_Chae-yeon_in_November_2025.png) |
| 정형돈 | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Jeong_Hyeong-don_from_acrofan.jpg) |
| 정훈희 | 여니수니 | [CC BY 2.0 kr](https://creativecommons.org/licenses/by/2.0/kr/deed.en) | [Original file](https://commons.wikimedia.org/wiki/File:Jung_Hoon-Hee.jpg) |
| 제리케이 | LET IT VIDEO | [CC BY (YouTube)](https://www.youtube.com/t/creative_commons) | [Original file](https://www.youtube.com/watch?v=U0qR8gk7HR4) |
| 제시 | SBS Radio | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Jessi_(%EC%A0%9C%EC%8B%9C)_in_October_2023.png) |
| 제아 | Mohanshe | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:37.2_JEA.jpg) |
| 제이제이케이 | MIC SWAGGER | [CC BY (YouTube)](https://www.youtube.com/t/creative_commons) | [Original file](https://www.youtube.com/watch?v=tLsGbtSJrSs) |
| 제이켠 | 이선재 | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:J%27Kyun_Soulcompany_Show.png) |
| 제이홉 | TV10 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:J-Hope_at_W_Korea_Breast_Cancer_Campaign,_15_October_2025.png) |
| 조PD | Original:Army Vet, Cropped:Puramyun31 | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Cho_PD.jpg) |
| 조광일 | SBS Radio 에라오 | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Jo_Gwangil_20220129.png) |
| 조규찬 | 여니수니 | [CC BY 2.0 kr](https://creativecommons.org/licenses/by/2.0/kr/deed.en) | [Original file](https://commons.wikimedia.org/wiki/File:Cho_Kyu-Chan.jpg) |
| 조여정 | Republic of Korea | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Cho_Yeo-jeong.jpg) |
| 조원우 | K-POPIT 케이팝잇 | [CC BY (YouTube)](https://www.youtube.com/t/creative_commons) | [Original file](https://www.youtube.com/watch?v=WHJzmNuyrhg) |
| 주비트레인 | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Buga_Kingz_from_acrofan.jpg) |
| 주영 | Nizzyool | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Jooyoung_in_2015_Greenplugged_Seoul.jpg) |
| 지드래곤 | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:G-Dragon_in_February_2025.png) |
| 지수연 | NINE STARS | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Suyeon_weki_meki_2018_1.jpg) |
| 지스트 | BRANDNEW MUSIC | [CC BY (YouTube)](https://www.youtube.com/t/creative_commons) | [Original file](https://www.youtube.com/watch?v=E9VfxH3HEZ0) |
| 지연 | photomami | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:170614_T-ARA_Park_Ji-yeon_at_What%27s_My_Name_Showcase.jpg) |
| 지오 | Republic of Korea | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:G.O_in_2013_K-Pop_World_Festival.jpg) |
| 지코 | Bonnielou2013 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Zico_2017_Monster_5_(cropped).jpg) |
| 지토 | Ming J | [CC BY (YouTube)](https://www.youtube.com/t/creative_commons) | [Original file](https://www.youtube.com/watch?v=I17FKnWTH2Q) |
| 지투 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:180801_%EB%B6%80%EC%82%B0%EB%B0%94%EB%8B%A4%EC%B6%95%EC%A0%9C_%EC%A7%80%ED%88%AC_3.jpg) |
| 진주 | KIYOUNG KIM | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Jin_Joo.jpg) |
| 진진 | http://intheholic.tistory.com/ | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:170602_Astro_07.jpg) |
| 진호 | Nine Stars | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Jinho_of_Pentagon_at_Music_Bank_190419.png) |
| 차오루 | OneS [147 Company] | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:160423_%EC%B0%A8%EC%98%A4%EB%A3%A8.jpg) |
| 창모 | SBS Radio | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:CHANGMO_200715.png) |
| 초아 | Shaq32 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Park_Cho-a,_2016_(cropped).jpg) |
| 최자 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:181013_%EC%9D%B4%ED%83%9C%EC%9B%90_%EC%A7%80%EA%B5%AC%EC%B4%8C_%EC%B6%95%EC%A0%9C_%EC%B0%A9%ED%95%9C%EC%BD%98%EC%84%9C%ED%8A%B8_%EC%B5%9C%EC%9E%90.jpg) |
| 치타 | 포에버 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:170924_%EC%B9%98%ED%83%80.png) |
| 케이시 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:190329_%EC%BC%80%EC%9D%B4%EC%8B%9C_%ED%99%8D%EB%8C%80_%EB%B2%84%EC%8A%A4%ED%82%B9.jpg) |
| 코요태 | SBS Radio | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Koyote_in_November_2024.png) |
| 쿠기 | Marie Claire Korea | [CC-BY-3.0](https://creativecommons.org/licenses/by/3.0/) | [Original file](https://en.wikipedia.org/wiki/File:Coogie_2023-09-27.png) |
| 쿤디판다 | 헌터퐝 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Khundi_Panda_2021.png) |
| 쿤타 | SBS Radio 에라오 | [CC BY (YouTube)](https://www.youtube.com/t/creative_commons) | [Original file](https://www.youtube.com/watch?v=ZM2Orff_fj4) |
| 퀸 와사비 | GROOVL1N | [CC BY (YouTube)](https://www.youtube.com/t/creative_commons) | [Original file](https://www.youtube.com/watch?v=29k4Cp2DBzA) |
| 크러쉬 | NewsInStar | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:190706_%EC%A7%9D%EA%BF%8D_%ED%8A%B9%EC%A7%91!_%EB%B9%84%EC%99%80%EC%9D%B4X%ED%81%AC%EB%9F%AC%EC%89%AC,_%EC%8A%A4%EC%9B%A9%EB%84%98%EC%B9%98%EB%8A%94_%EB%B8%8C%EC%9D%B4_(KBS_%ED%95%B4%ED%94%BC%ED%88%AC%EA%B2%8C%EB%8D%944_%EC%B6%9C%EA%B7%BC%EA%B8%B8)_1m_31s.jpg) |
| 크루셜 스타 | 권우찬 | [CC-BY-SA-3.0](http://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://ko.wikipedia.org/wiki/%ED%8C%8C%EC%9D%BC:Crucial.jpg) |
| 클래지 | Eat Your Kimchi | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:DJ_Clazzi.png) |
| 키드밀리 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:220521_%EB%8D%94%ED%81%AC%EB%9D%BC%EC%9D%B4%EA%B7%B8%EB%9D%BC%EC%9A%B4%EB%93%9C_%ED%82%A4%EB%93%9C%EB%B0%80%EB%A6%AC.jpg) |
| 키디비 | BRANDNEW MUSIC | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:KittiB_in_June_2019.png) |
| 키비 | Lamin | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:110618_%EA%B8%80%EB%A1%9C%EB%B2%8C_%EC%97%90%ED%8B%B0%EC%BC%93_%EC%BA%A0%ED%8E%98%EC%9D%B8_-_%ED%99%8D%EB%8C%80_%ED%9E%99%ED%95%A9_%EA%B2%8C%EB%A6%B4%EB%9D%BC_%EC%BD%98%EC%84%9C%ED%8A%B8_Eluphant_1.jpg) |
| 키썸 | SJ | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:%ED%82%A4%EC%8D%B8(Kisum)_%EC%97%B0%EC%84%B1%EB%8C%80%ED%95%99%EA%B5%90_%EC%B6%95%EC%A0%9C.jpg) |
| 타루 | o2news | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:091018_%EB%94%94%EC%A7%80%ED%84%B8_%EB%AE%A4%EC%A7%81%EC%96%B4%EC%9B%8C%EB%93%9C_%ED%83%80%EB%A3%A8.jpg) |
| 타블로 | pabian | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:140904_%ED%83%80%EB%B8%94%EB%A1%9C_02_(cropped).jpg) |
| 타이거 JK | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:181202_%EB%93%9C%EB%A0%81%ED%81%B0%ED%83%80%EC%9D%B4%EA%B1%B0_AK%ED%94%8C%EB%9D%BC%EC%9E%90_%EB%B6%84%EB%8B%B9%EC%A0%90_%ED%8C%AC%EC%8B%B8%EC%9D%B8%ED%9A%8C_2.jpg) |
| 타이미 | KIYOUNG KIM | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:E-Via_in_2010_Asia_Song_Festival.jpg) |
| 탑 | GOM | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:T.O.P_-_MADE_THE_MOVIE_Premiere_-_2.jpg) |
| 테드 박 | POPDUST | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Ted_Park_(born_1994)_in_a_2021_interview_for_Popdust.png) |
| 테이크원 | Ming J | [CC BY (YouTube)](https://www.youtube.com/t/creative_commons) | [Original file](https://www.youtube.com/watch?v=WM683j1TI3U) |
| 토니안 | f28star | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:161129_Tony_An_MMA.jpg) |
| 팔로알토 | Bonnielou2013 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Paloalto_5_cropped.jpg) |
| 펀치넬로 | Studio Flo | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:%ED%8E%80%EC%B9%98%EB%84%AC%EB%A1%9C_2021.png) |
| 페노메코 | Yoonwol | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:190406_Penomeco_performing_at_Penomeco%27s_Showroom.jpg) |
| 피오 | beautypl | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:2017_%ED%94%BC%EC%98%A4_01.png) |
| 하성운 | Importante | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Ha_Sung-woon_at_an_fansign_in_Daejeon_on_May_3,_2017.jpg) |
| 하하 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:180802_%EB%B6%80%EC%82%B0%EB%B0%94%EB%8B%A4%EC%B6%95%EC%A0%9C_%ED%95%98%ED%95%98_1.jpg) |
| 하현상 | Marie Claire Korea | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Ha_Hyun-Sang_220128.png) |
| 한선화 | 롯데엔터테인먼트 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Han_Sun-hwa_in_August_2024.png) |
| 한요한 | Linchpins | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:2017_%ED%95%9C%EC%9A%94%ED%95%9C.jpg) |
| 한해 | BRANDNEW MUSIC | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:150206_%ED%95%9C%ED%95%B4_05.png) |
| 해찬 | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:20231006_Haechan_(NCT).jpg) |
| 행주 | NewsInStar | [CC BY (YouTube)](https://www.youtube.com/t/creative_commons) | [Original file](https://www.youtube.com/watch?v=r9GOzoyEIvU) |
| 허각 | huindoong2 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:170131_%EB%A0%88%EB%93%9C%EB%B9%85%EC%8A%A4%ED%8E%98%EC%9D%B4%EC%8A%A4_%ED%97%88%EA%B0%81_%EC%9D%8C%EA%B0%90%ED%9A%8C_%EC%A7%81%EC%B0%8D.jpg) |
| 허성현 | SBS Radio 에라오 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:%ED%97%88%EC%84%B1%ED%98%84_2023.png) |
| 허클베리피 | Yellocean Show | [CC BY (YouTube)](https://www.youtube.com/t/creative_commons) | [Original file](https://www.youtube.com/watch?v=ojSU2e2agqs) |
| 혁오 | 뉴스인스타 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:180110_%ED%98%81%EC%98%A4%EB%B0%B4%EB%93%9C.jpg) |
| 형원 | Marie Claire Korea | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:HYUNGWON_MarieClarieKorea_2021.png) |
| 호란 | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Horan_from_acrofan.jpg) |
| 홍대광 | 려상 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:160904_%EC%95%88%EC%96%91_%EC%83%9D%EB%AA%85%EC%82%AC%EB%9E%91_%EA%B1%B7%EA%B8%B0%EB%8C%80%ED%9A%8C_%ED%99%8D%EB%8C%80%EA%B4%91_2.jpg) |
| 화나 | 권우찬 | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Fana.jpg) |
| 화영 | SJ | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:2017_%EC%95%84%EC%8B%9C%EC%95%84_%EB%AA%A8%EB%8D%B8_%ED%8E%98%EC%8A%A4%ED%8B%B0%EB%B2%8C_%EB%A0%88%EB%93%9C%EC%B9%B4%ED%8E%AB_(58).jpg) |
| 황광희 | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:KBS_N_%27%EC%B2%AD%EC%B6%98%ED%95%98%EB%9D%BC%27_%EB%B0%A9%EC%86%A1_%EA%B8%B0%EB%85%90_%EA%B8%B0%EC%9E%90%EA%B0%84%EB%8B%B4%ED%9A%8C_(%ED%99%A9%EA%B4%91%ED%9D%AC).jpg) |
| 황정민 | Republic of Korea | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Hwang_Jung-min_in_July_2026_(cropped).jpg) |
| 황치열 | Ten2 fan | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:HwangChiYeul.JPG) |
| 효민 | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Hyomin_in_October_2024.png) |
| 후이 | NewsInstar | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Hui_of_Pentagon_at_a_press_showcase_(190718).png) |
| 휘성 | KATV | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:181003_%ED%9C%98%EC%84%B1_%22%EC%82%AC%EB%9E%91%EC%9D%80_%EB%A7%9B%EC%9E%88%EB%8B%A4%22_%ED%99%94%EC%84%B1%EC%8B%9C,_%EB%AC%B8%ED%99%94%EB%A5%BC_%ED%8E%BC%EC%B9%98%EB%8B%A4_%EA%B3%B5%EC%97%B0.png) |

## Core artists requiring follow-up

| Artist | State | Reason | Next action |
| --- | --- | --- | --- |
| CB Mass | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| DJ 샤인 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| J-Kwondo | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| MBA | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| MFBTY | not-found | 공식 인사 영상에는 게스트 준오플로가 함께 출연해 MFBTY 3인의 단체 사진으로 사용 보류. 비지 개인 사진에는 본인만 크롭. | 타이거 JK·윤미래·비지 세 멤버로 구성된 단체 사진의 이용조건 확인 |
| MYK | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| QM | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| TBNY | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| XXX | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 골드부다 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 기린 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 긱스 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 김승민 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 김효은 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 노스페이스갓 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 노엘 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 노윤하 | identity-review | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 뉴챔프 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 니안 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 다민이 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 던말릭 | not-found | 촬영자가 던말릭으로 명시한 공연 영상을 찾았으나 얼굴이 작고 어두운 원경으로 사용 보류. | 던말릭 단독 클로즈업·공식 프로필의 재사용 조건 확인 |
| 데드피 | permission-needed | 한국어 구분 표기로 사진 파일을 찾았으나, 파일별 재사용 라이선스를 확인하지 못해 게시 보류. | 해당 사진의 촬영자·공식 프레스킷에서 재사용 조건 확인 또는 이용조건이 명확한 대체 사진 확보 |
| 돕선 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 디보 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 디액션 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 디젤 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 디지 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 레오케코아 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 로스 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 록스 펑크맨 | identity-review | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 루이 (호미들) | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 룸나인 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 리짓군즈 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 릴체리 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 릴타치 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 마미손 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 매니악 | not-found | TV텐 출연 영상은 인물을 확인했으나 역광으로 얼굴이 어두움. OUR MUZIK 티저에서도 선명한 얼굴 장면을 확보하지 못함. | 다른 단독 인터뷰·홍보 사진에서 얼굴 화질 및 재사용 조건 확인 |
| 맥대디 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 무웅 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 불리 다 바스타드 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 브린 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 블랙나인 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 블랙넛 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 블랭 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 블루 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 비즈니즈 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 비트박스 DG | not-found | acrofan 무대 사진의 원본과 이용조건은 확인했으나 후드와 마이크가 얼굴을 가려 보류. | 비트박스 DG의 얼굴이 드러난 촬영자 원본·공식 사진 확보 |
| 사포 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 서리 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 서출구 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 션이슬로우 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 손심바 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 수다쟁이 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 스토니스컹크 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 스트릿 베이비 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 씨케이 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 아넌딜라이트 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 아이언 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 아체 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 앤덥 | not-found | 본인 Andupinda 채널 후보는 앨범·사진첩 원경 또는 검은 화면으로 프로필에 쓸 얼굴을 확보하지 못함. | 안덥의 단독 인터뷰·촬영자 원본에서 선명한 얼굴과 이용조건 확인 |
| 얀키 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 양홍원 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 언에듀케이티드 키드 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 언오피셜보이 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 오담률 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 오르내림 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 오션검 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 오왼 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 오우릴고트 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 우탄 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 이로한 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 이케이 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 이현준 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 인피닛 플로우 | not-found | 브랜뉴뮤직 공식 영상 후보는 가사·앨범 그래픽 영상으로 아티스트 얼굴 사진이 아님. | 넋업샨·비즈니즈가 함께한 공식 단체 사진과 원본 이용조건 확인 |
| 일리닛 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 자메즈 | not-found | 제작자 공개 라이브 영상에서 인물을 확인했으나 저조도·측면 장면 위주로 얼굴 사진에 사용 보류. | 밝고 정면에 가까운 자메즈 인터뷰·프로필 후보 추가 검토 |
| 잠비노 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 재달 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 정연준 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 제이호 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 주석 | not-found | KMG Official 공연 영상은 확인했으나 얼굴이 작고 어두워 사용 보류. | 주석의 단독 인터뷰·공식 프레스킷에서 밝고 선명한 얼굴과 이용조건 확인 |
| 지구인 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 지미 페이지 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 지조 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 짱유 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 차메인 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 차붐 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 최삼 | retry | 뉴스타파의 MC 메타·최삼 제작 영상은 찾았으나 다운로드 오류로 최삼의 실제 프레임 검토를 완료하지 못함. | 영상 다운로드를 재시도하고 최삼 출연 장면의 얼굴·크롭 직접 확인 |
| 최엘비 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 친 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 칠린호미 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 타래 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 타쿠와 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 탁 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 톱밥 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 트레이드엘 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 트루디 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 팻두 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 폴로다레드 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 퓨처리스틱 스웨버 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 플루마 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 플리키뱅 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 피노다인 | identity-review | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 피타입 | permission-needed | 한국어 구분 표기로 사진 파일을 찾았으나, 파일별 재사용 라이선스를 확인하지 못해 게시 보류. | 해당 사진의 촬영자·공식 프레스킷에서 재사용 조건 확인 또는 이용조건이 명확한 대체 사진 확보 |
| 해쉬스완 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 허니 패밀리 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |
| 호미들 | not-found | Commons 캡션·Flickr·CC 영상까지 추가 검색했으나 게시할 사진을 아직 확보하지 못함. 후보에는 동명이인·음원·재업로드가 섞여 있음. | 이전 활동명·소속 그룹과 후보의 실제 출연자를 대조하고, 공식 사진·촬영자 원본의 이용조건과 얼굴 화질 확인 |

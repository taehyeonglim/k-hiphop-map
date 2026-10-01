# Portrait source audit

All included portraits were obtained from Wikimedia Commons or freely licensed Wikipedia file records. The collector accepts only explicitly declared CC BY, CC BY-SA, CC0 or public-domain licenses with source URL, author and license URL. It excludes local Wikipedia fair-use images. Permission is never inferred from an artist name, an image search, or a page license.

- Current catalogue artists: 2199
- Reusable portrait assets downloaded: 162
- Assets matching the current catalogue: 158
- Core artist coverage: 113/232 (48.7%)
- Output: 256×256 same-origin WebP files. People are cropped; group photographs retain the complete image with letterboxing. Crop changes are disclosed per asset.
- Portraits represent publicly documented artist images, not a claim of current appearance or endorsement. Missing portraits use the product’s initials fallback.

## Reproduction

`python3 scripts/collect-portraits.py --input data/seeds.json`

Python 3 and Pillow are required; optional OpenCV enables face-centred crops. API responses and downloaded inputs are cached under `.cache/portraits`; reruns skip already downloaded assets. Requests are sequential and retry transient errors. `--retry-missing` permits reconsidering unresolved artists.

## Included assets

| Artist | Author | License | Source |
|---|---|---|---|
| 가리온 | 뮤지스땅스 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Garion.png) |
| 타이거 JK | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:181202_%EB%93%9C%EB%A0%81%ED%81%B0%ED%83%80%EC%9D%B4%EA%B1%B0_AK%ED%94%8C%EB%9D%BC%EC%9E%90_%EB%B6%84%EB%8B%B9%EC%A0%90_%ED%8C%AC%EC%8B%B8%EC%9D%B8%ED%9A%8C_2.jpg) |
| 윤미래 | LGEPR | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Yoon_Mi-rae.jpg) |
| 드렁큰 타이거 | NewsInStar | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Drunken_tiger2018.png) |
| DJ DOC | Jinho Jung from Seoul, South Korea | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:DJ_DOC_@_Cyworld_Dream_Music_Festival_%EC%8B%B8%EC%9D%B4%EC%9B%94%EB%93%9C_%EB%93%9C%EB%A6%BC_%EB%AE%A4%EC%A7%81_%ED%8E%98%EC%8A%A4%ED%8B%B0%EB%B2%8C_42.jpg) |
| 김진표 | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Kim_Jin_Pyo_from_acrofan.jpg) |
| 리쌍 | Jinho Jung | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Leessang.jpg) |
| 개리 | Jinho Jung | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Kang_Gary.jpg) |
| 길 | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Gil_from_acrofan.jpg) |
| 다이나믹 듀오 | KoreaNews France | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Interview_with_Dynamic_Duo_for_Koreanews.fr_at_MIDEM_festival_2014_5s.jpg) |
| 개코 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:181013_%EC%9D%B4%ED%83%9C%EC%9B%90_%EC%A7%80%EA%B5%AC%EC%B4%8C_%EC%B6%95%EC%A0%9C_%EC%B0%A9%ED%95%9C%EC%BD%98%EC%84%9C%ED%8A%B8_%EA%B0%9C%EC%BD%94.jpg) |
| 최자 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:181013_%EC%9D%B4%ED%83%9C%EC%9B%90_%EC%A7%80%EA%B5%AC%EC%B4%8C_%EC%B6%95%EC%A0%9C_%EC%B0%A9%ED%95%9C%EC%BD%98%EC%84%9C%ED%8A%B8_%EC%B5%9C%EC%9E%90.jpg) |
| 데프콘 | zzal TV 고다쿠 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:(GO%EB%8B%A4%EC%BF%A0)_%EA%B3%A0%EB%8B%A4%EC%BF%A0%EC%97%90_%EB%B0%94%EB%9D%BC%EB%8A%94_%EA%B2%83%EC%9D%80_(%EC%8B%9C%EC%A6%8C2_%EC%B5%9C%EC%A2%85%ED%9A%8C)_1m48s.jpg) |
| 버벌진트 | Ming J | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Verbal_Jint_-_%EA%B8%B0%EB%A6%84%EA%B0%99%EC%9D%80%EA%B1%B8_%EB%81%BC%EC%96%B9%EB%82%98.jpg) |
| 김반장 | Bonnielou2013 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Windy_City_9_cropped.jpg) |
| 바스코 | Linchpins | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:2017_%EB%B9%8C%EC%8A%A4%ED%83%9D%EC%8A%A4.jpg) |
| 스컬 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:180802_%EB%B6%80%EC%82%B0%EB%B0%94%EB%8B%A4%EC%B6%95%EC%A0%9C_%EC%8A%A4%EC%BB%AC_1.jpg) |
| 도끼 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:180801_%EB%B6%80%EC%82%B0%EB%B0%94%EB%8B%A4%EC%B6%95%EC%A0%9C_%EB%8F%84%EB%81%BC_1.jpg) |
| 더 콰이엇 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:180801_%EB%B6%80%EC%82%B0%EB%B0%94%EB%8B%A4%EC%B6%95%EC%A0%9C_%EB%8D%94%EC%BD%B0%EC%9D%B4%EC%97%87_4.jpg) |
| 빈지노 | NewsInStar | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:190521_%EB%B9%88%EC%A7%80%EB%85%B8X%ED%99%8D%EC%A2%85%ED%98%84,_%EA%B0%90%ED%83%84%EB%82%98%EC%98%A4%EB%8A%94_%EB%A9%8B%EC%A7%90_%27%EB%B0%94%EC%9D%B4%EB%A0%88%EB%8F%84(BYREDO)%27_%ED%94%8C%EB%9E%98%EA%B7%B8%EC%8B%AD_%EC%8A%A4%ED%86%A0%EC%96%B4_%EC%98%A4%ED%94%88_%EA%B8%B0%EB%85%90%ED%96%89%EC%82%AC_36s.jpg) |
| 팔로알토 | Bonnielou2013 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Paloalto_5_cropped.jpg) |
| 산이 | http://hdpics.tistory.com/ | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:171014_SAN_E.jpg) |
| 스윙스 | Linchpins | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:2017_%EC%8A%A4%EC%9C%99%EC%8A%A4.jpg) |
| 이센스 | GET CHEE$E | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Esens_in_2017.png) |
| 사이먼 도미닉 | May S. Young from Metro NYC, United States | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:AOMG,_Simon_Dominic_2014.jpg) |
| 슈프림팀 | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Supreme_Team_from_acrofan.jpg) |
| 에픽하이 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:190322_%EC%97%90%ED%94%BD%ED%95%98%EC%9D%B4_%EC%BD%94%EC%97%91%EC%8A%A4_%EC%8A%A4%ED%83%80%ED%95%84%EB%93%9C_%ED%8C%AC%EC%8B%B8%EC%9D%B8%ED%9A%8C_2.jpg) |
| 타블로 | pabian | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:140904_%ED%83%80%EB%B8%94%EB%A1%9C_02_(cropped).jpg) |
| 미쓰라 | May S. Young from Metro NYC, United States | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:EpikHigh_061215_052_(18152025264).jpg) |
| 키비 | Lamin | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:110618_%EA%B8%80%EB%A1%9C%EB%B2%8C_%EC%97%90%ED%8B%B0%EC%BC%93_%EC%BA%A0%ED%8E%98%EC%9D%B8_-_%ED%99%8D%EB%8C%80_%ED%9E%99%ED%95%A9_%EA%B2%8C%EB%A6%B4%EB%9D%BC_%EC%BD%98%EC%84%9C%ED%8A%B8_Eluphant_1.jpg) |
| 이루펀트 | BRANDNEW MUSIC | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Eluphant_in_2019.png) |
| 매드클라운 | mang2goon | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:150425_%EB%A7%A4%EB%93%9C%ED%81%B4%EB%9D%BC%EC%9A%B4_02.jpg) |
| 루피 | Marie Claire Korea | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Loopy_200318.jpg) |
| 릴보이 | ENTmedia music | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Lil_Boi_170827.jpg) |
| 로꼬 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:220521_%EB%8D%94%ED%81%AC%EB%9D%BC%EC%9D%B4%EA%B7%B8%EB%9D%BC%EC%9A%B4%EB%93%9C_%EB%A1%9C%EA%BC%AC.jpg) |
| 박재범 | Tourism.Victoria | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Jay_Park_in_Flinders_Street_Station,_in_September_2012.png) |
| 펀치넬로 | Studio Flo | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:%ED%8E%80%EC%B9%98%EB%84%AC%EB%A1%9C_2021.png) |
| 미노이 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:230423_%EC%98%AC%ED%95%B4%EB%8F%84_%EA%B8%80%EB%A0%80%EB%82%98%EB%B4%84_(%EB%AF%B8%EB%85%B8%EC%9D%B4).jpg) |
| 크러쉬 | NewsInStar | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:190706_%EC%A7%9D%EA%BF%8D_%ED%8A%B9%EC%A7%91!_%EB%B9%84%EC%99%80%EC%9D%B4X%ED%81%AC%EB%9F%AC%EC%89%AC,_%EC%8A%A4%EC%9B%A9%EB%84%98%EC%B9%98%EB%8A%94_%EB%B8%8C%EC%9D%B4_(KBS_%ED%95%B4%ED%94%BC%ED%88%AC%EA%B2%8C%EB%8D%944_%EC%B6%9C%EA%B7%BC%EA%B8%B8)_1m_31s.jpg) |
| 딘 | Jae Chung (JDZ) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:DEAN,_Joombas_Music_Group_artist.png) |
| 자이언티 | Pabian | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Zion.T_at_DMC_Festival_2015_MBC_Radio_DJ_Concert_02.jpg) |
| 나플라 | GROOVL1N | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Nafla_200625.png) |
| 창모 | SBS Radio | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:CHANGMO_200715.png) |
| 쿤디판다 | 헌터퐝 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Khundi_Panda_2021.png) |
| 비와이 | f2.8 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:20161119_%EB%B9%84%EC%99%80%EC%9D%B4_%EB%A9%9C%EB%A1%A0%EB%AE%A4%EC%A7%81%EC%96%B4%EC%9B%8C%EB%93%9C_(2).jpg) |
| 기리보이 | Linchpins | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:2017_%EA%B8%B0%EB%A6%AC%EB%B3%B4%EC%9D%B4_(cropped).jpg) |
| 한요한 | Linchpins | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:2017_%ED%95%9C%EC%9A%94%ED%95%9C.jpg) |
| 키드밀리 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:220521_%EB%8D%94%ED%81%AC%EB%9D%BC%EC%9D%B4%EA%B7%B8%EB%9D%BC%EC%9A%B4%EB%93%9C_%ED%82%A4%EB%93%9C%EB%B0%80%EB%A6%AC.jpg) |
| 재키와이 | Paul Hudson from United Kingdom | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:SXSW_2019_-_Jvcki_Wai_(46521236265).jpg) |
| 페노메코 | Yoonwol | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:190406_Penomeco_performing_at_Penomeco%27s_Showroom.jpg) |
| 지코 | Bonnielou2013 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Zico_2017_Monster_5_(cropped).jpg) |
| 박경 | mduangdara from Midlothian, VA, United States | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Block_B_at_KCON_2015_in_Los_Angeles_-_3.jpg) |
| 피오 | beautypl | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:2017_%ED%94%BC%EC%98%A4_01.png) |
| 민호 | BITTER CHOCOLATE | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:180415_%EC%9C%84%EB%84%88_%EC%97%AC%EC%9D%98%EB%8F%84_%ED%8C%AC%EC%8B%B8_4.jpg) |
| 바비 | shaq32 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Bobby_-_2016_Gaon_Chart_K-pop_Awards_red_carpet.jpg) |
| 비아이 | Hikooksong | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:20221210_B.I_All_Day_Show_in_Seoul_Crop.jpg) |
| 알엠 | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:RM_at_W_Korea_Love_Your_W,_November_2023.jpg) |
| 슈가 | Dispatch | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Min_Yoon-gi_May_2018.jpg) |
| 제이홉 | TV10 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:J-Hope_at_W_Korea_Breast_Cancer_Campaign,_15_October_2025.png) |
| 지드래곤 | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:G-Dragon_in_February_2025.png) |
| 탑 | GOM | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:T.O.P_-_MADE_THE_MOVIE_Premiere_-_2.jpg) |
| CL | 티비텐 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:CL_%EC%8A%A4%ED%83%80%EC%9D%BC_%EC%96%B4%EC%9B%8C%EC%A6%88_2024_(2).jpg) |
| 치타 | 포에버 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:170924_%EC%B9%98%ED%83%80.png) |
| 제시 | SBS Radio | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Jessi_(%EC%A0%9C%EC%8B%9C)_in_October_2023.png) |
| 키썸 | SJ | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:%ED%82%A4%EC%8D%B8(Kisum)_%EC%97%B0%EC%84%B1%EB%8C%80%ED%95%99%EA%B5%90_%EC%B6%95%EC%A0%9C.jpg) |
| 예지 | 허수아비 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:15.05.27_%EC%9B%90%EC%A3%BC_%EC%9C%84%EB%AC%B8%EC%97%B4%EC%B0%A8_%EC%A7%81%EC%B0%8D(_%ED%94%BC%EC%97%90%EC%8A%A4%ED%83%80_%EC%9E%AC%EC%9D%B4,_%EB%A6%B0%EC%A7%80,_%EC%98%88%EC%A7%80,_%ED%98%9C%EB%AF%B8,_%EC%B0%A8%EC%98%A4%EB%A3%A8_)_03.jpg) |
| 타이미 | KIYOUNG KIM | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:E-Via_in_2010_Asia_Song_Festival.jpg) |
| 전소연 | News in Star | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:0226_(%EC%97%AC%EC%9E%90)%EC%95%84%EC%9D%B4%EB%93%A4_%EC%86%8C%EC%97%B0_%ED%8F%AC%EC%BB%A4%EC%8A%A4%26%EC%84%B8%EB%A1%9C%EC%BA%A0,_2nd_%EB%AF%B8%EB%8B%88%EC%95%A8%EB%B2%94_%27I_made%27_%EC%87%BC%EC%BC%80%EC%9D%B4%EC%8A%A4_%ED%8F%AC%ED%86%A0%ED%83%80%EC%9E%84_(derived).jpg) |
| 영지 | TV10 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Lee_Young-ji_in_February_2026.png) |
| 스월비 | MIC SWG | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Swervy.png) |
| 그리 | BRANDNEW MUSIC | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:GREE_201120.jpg) |
| 빅나티 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:220521_%EB%8D%94%ED%81%AC%EB%9D%BC%EC%9D%B4%EA%B7%B8%EB%9D%BC%EC%9A%B4%EB%93%9C_%EB%B9%85%EB%82%98%ED%8B%B0.jpg) |
| 소코도모 | Studio Flo | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Sokodomo.png) |
| 오케이션 | Cohortseoul | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Okasian.jpg) |
| 레디 | Bonnielou2013 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Reddy_1_2017_cropped_2.jpg) |
| 딥플로우 | GET CHEE$E | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Deepflow_Feb_2017.png) |
| 넉살 | Studio FLO | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Nucksal_210913.png) |
| 슬리피 | SBS Radio 에라오 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:%EC%8A%AC%EB%A6%AC%ED%94%BC.jpg) |
| 언터쳐블 | USAG- Humphreys | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Untouchable_in_K-Force_Special_Show_-_Pyeongtaek,_South_Korea_-_7_March_2013.jpg) |
| 베이식 | Pabian | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:%EB%B2%A0%EC%9D%B4%EC%8B%9D_(cropped).jpg) |
| 바비킴 | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Bobby_Kim_from_acrofan_cropped.JPG) |
| 배치기 | SBS Radio 에라오 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Baechigi_in_2020.png) |
| 마이티 마우스 | Bryan Dorrough | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Mighty_Mouth.jpg) |
| 아웃사이더 | 서울종합예술실용학교 공식 영상채널 싹튜브 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:(%EC%8B%B9%ED%8A%9C%EB%B8%8C)_%EC%84%9C%EC%A2%85%EC%98%88_SAC%EC%8A%A4%ED%83%80%ED%8A%B9%EA%B0%95_%EB%9E%98%ED%8D%BC_%EC%95%84%EC%9B%83%EC%82%AC%EC%9D%B4%EB%8D%94_%EC%86%8C%ED%86%B5%EA%B5%90%EA%B0%90%EC%BD%98%EC%84%9C%ED%8A%B8_%EC%84%9C%EC%9A%B8%EC%A2%85%ED%95%A9%EC%98%88%EC%88%A0%EC%8B%A4%EC%9A%A9%ED%95%99%EA%B5%90_%EC%9E%AC%ED%95%99%EC%83%9D%ED%8A%B9%EA%B0%95_46s.jpg) |
| MC 스나이퍼 | 1theK (원더케이) | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Mcsniper2015.png) |
| 뱃사공 | 코넛 - Conut HipHop Magazine | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Bassagong.jpg) |
| 라디 | o2news | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:091018_%EB%94%94%EC%A7%80%ED%84%B8_%EB%AE%A4%EC%A7%81%EC%96%B4%EC%9B%8C%EB%93%9C_Ra.D.jpg) |
| 서사무엘 | OnCam! TV | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Samuel_Seo_-_K-pop_World_Festival_2016.jpg) |
| 지투 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:180801_%EB%B6%80%EC%82%B0%EB%B0%94%EB%8B%A4%EC%B6%95%EC%A0%9C_%EC%A7%80%ED%88%AC_3.jpg) |
| 제이켠 | 이선재 | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:J%27Kyun_Soulcompany_Show.png) |
| 비오 | Marie Claire Korea | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:20211226%E2%80%94Be%27O,_interview,_Marie_Claire_Korea_(00m11s).jpg) |
| 리듬파워 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:180801_%EB%B6%80%EC%82%B0%EB%B0%94%EB%8B%A4%EC%B6%95%EC%A0%9C_%EB%A6%AC%EB%93%AC%ED%8C%8C%EC%9B%8C_1.jpg) |
| 이하늘 | LG전자 | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Lee_Ha-Neul.jpg) |
| 넋업샨 | 권우찬 | [CC-BY-SA-3.0](http://creativecommons.org/licenses/by-sa/3.0) | [Wikimedia file](https://ko.wikipedia.org/wiki/%ED%8C%8C%EC%9D%BC:Nuck.jpg) |
| 마이노스 | Lamin | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:110618_%EA%B8%80%EB%A1%9C%EB%B2%8C_%EC%97%90%ED%8B%B0%EC%BC%93_%EC%BA%A0%ED%8E%98%EC%9D%B8_-_%ED%99%8D%EB%8C%80_%ED%9E%99%ED%95%A9_%EA%B2%8C%EB%A6%B4%EB%9D%BC_%EC%BD%98%EC%84%9C%ED%8A%B8_Eluphant_3.jpg) |
| 저스디스 | STUDIO JEJUMBC _ 스튜디오 제주MBC | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:%EC%A0%80%EC%8A%A4%EB%94%94%EC%8A%A4.jpg) |
| 수퍼비 | STUDIO JEJUMBC _ 스튜디오 제주MBC | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:%EC%88%98%ED%8D%BC%EB%B9%84_%EC%A0%9C%EC%A3%BC%EC%97%90%EC%BD%94%EB%AE%A4%EC%A7%81%ED%8E%98%EC%8A%A4%ED%8B%B0%EB%B2%8C.jpg) |
| 우원재 | SBS Radio | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Woo_Wonjae_190405.jpg) |
| 쿠기 | Marie Claire Korea | [CC-BY-3.0](https://creativecommons.org/licenses/by/3.0/) | [Wikimedia file](https://en.wikipedia.org/wiki/File:Coogie_2023-09-27.png) |
| 애쉬 아일랜드 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:220521_%EB%8D%94%ED%81%AC%EB%9D%BC%EC%9D%B4%EA%B7%B8%EB%9D%BC%EC%9A%B4%EB%93%9C_%EC%95%A0%EC%89%AC%EC%95%84%EC%9D%BC%EB%9E%9C%EB%93%9C.jpg) |
| 릴러말즈 | Bamboo Studio | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:%EB%A6%B4%EB%9F%AC%EB%A7%90%EC%A6%88_2022.png) |
| 허성현 | SBS Radio 에라오 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:%ED%97%88%EC%84%B1%ED%98%84_2023.png) |
| 씨잼 | Linchpins | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:2017_%EC%94%A8%EC%9E%BC.jpg) |
| 윤훼이 | SL8 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:%EC%9C%A4%ED%9B%BC%EC%9D%B4_2020.png) |
| 김하온 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:190506_%EC%94%A8%ED%8E%98%EC%8A%A4%ED%8B%B0%EB%B2%8C_%EA%B9%80%ED%95%98%EC%98%A8.jpg) |
| 빈첸 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:190506_%EC%94%A8%ED%8E%98%EC%8A%A4%ED%8B%B0%EB%B2%8C_%EB%B9%88%EC%B2%B8.jpg) |
| 방재민 | 백일몽 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:170606_%EB%B0%A9%EC%9E%AC%EB%AF%BC_Bang_Jae-min.png) |
| 비프리 | Lamin | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:110618_%EA%B8%80%EB%A1%9C%EB%B2%8C_%EC%97%90%ED%8B%B0%EC%BC%93_%EC%BA%A0%ED%8E%98%EC%9D%B8_-_%ED%99%8D%EB%8C%80_%ED%9E%99%ED%95%A9_%EA%B2%8C%EB%A6%B4%EB%9D%BC_%EC%BD%98%EC%84%9C%ED%8A%B8_B-Free_5.jpg) |
| 부가킹즈 | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Buga_Kingz_from_acrofan.jpg) |
| 크루셜 스타 | 권우찬 | [CC-BY-SA-3.0](http://creativecommons.org/licenses/by-sa/3.0) | [Wikimedia file](https://ko.wikipedia.org/wiki/%ED%8C%8C%EC%9D%BC:Crucial.jpg) |
| 화나 | 권우찬 | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Fana.jpg) |
| 정상수 | 노래하는코트 풀영상채널 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:%EC%A0%95%EC%83%81_%EC%88%98.jpg) |
| 래원 | Studio FLO | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Layone_210913.png) |
| 머쉬베놈 | Marie Claire Korea | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Mushvenom_20210201.png) |
| pH-1 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:190506_%EC%94%A8%ED%8E%98%EC%8A%A4%ED%8B%B0%EB%B2%8C_pH-1.jpg) |
| 식케이 | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:180801_%EB%B6%80%EC%82%B0%EB%B0%94%EB%8B%A4%EC%B6%95%EC%A0%9C_%EC%8B%9D%EC%BC%80%EC%9D%B4_2.jpg) |
| 원슈타인 | GROOVL1N | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Wonstein_(%EC%9B%90%EC%8A%88%ED%83%80%EC%9D%B8)_210601.jpg) |
| 그레이 | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:GRAY_in_October_2024.png) |
| 나다 | Marie Claire Korea | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Nada_for_Marie_Claire_Korea_2016_(2).jpg) |
| 김창열 | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Kim_Chang-Ryeol_from_acrofan.jpg) |
| 쇼리 | Bryan Dorrough | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Mighty_Mouth.jpg) |
| 라임어택 | 이선재 | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Rhyme-A-_Soulcompany_Show.png) |
| Babylon | Marie Claire Korea | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:(Marie_Claire_Korea)_%EB%A7%88%EB%A6%AC%ED%94%8C%EB%A0%88%EC%9D%B4%EB%A6%AC%EC%8A%A4%ED%8A%B8_%EB%B2%A0%EC%9D%B4%EB%B9%8C%EB%A1%A0_%ED%8E%B8_15s.JPG) |
| mb-3dda8202-ce15-4031-862a-77bc6759d15e | Tourism.Victoria | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Jay_Park_in_Flinders_Street_Station,_in_September_2012.png) |
| Code Kunst | SBS Radio | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Code_Kunst_200306.jpg) |
| Heize | seono의 BOL4 story | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Heize_at_Zion.T_X_Heize_Concert_on_April_21,_2018_(4)_(cropped).jpg) |
| Chancellor | Neoaristocrats | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:2022%EB%85%84_%EC%B1%88%EC%8A%AC%EB%9F%AC_%EC%82%AC%EC%A7%84_%EC%B4%AC%EC%98%81.jpg) |
| mb-2b983abf-ef53-483e-a5f0-356e745008bd | Jae Chung (JDZ) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:DEAN,_Joombas_Music_Group_artist.png) |
| Ailee | 티비텐 TV10 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Ailee_in_March_2023_3.jpg) |
| Gummy | 관인생략 | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Gummy_20111124.jpg) |
| BoA | Dispatch | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:BoA_at_Incheon_Airport_on_May_15,_2019_(2).png) |
| TAEYANG | GOM | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Taeyang_-_MADE_THE_MOVIE_Premiere_(Chopped).png) |
| Kanto | Nine Stars | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Kanto_May_2018.png) |
| KittiB | BRANDNEW MUSIC | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:KittiB_in_June_2019.png) |
| TAEYEON | sublimitas_spes | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:250807_%ED%83%9C%EC%97%B0_%27%EC%95%85%EB%A7%88%EA%B0%80_%EC%9D%B4%EC%82%AC%EC%99%94%EB%8B%A4%27_VIP_Premiere_04_(cropped).jpg) |
| DPR LIVE | JLibert | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:DPR_Live_SXSW_Korea_Spotlight_2018.jpg) |
| Hyolyn | dispatchsns | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:%E2%80%9C%ED%9D%B0%ED%8B%B0%EC%97%90_%EC%B2%AD%EB%B0%94%EC%A7%80%EB%A7%8C_%EA%B1%B8%EC%B3%90%EB%8F%84%E2%80%9D_...%ED%9A%A8%EB%A6%B0,_%ED%95%AB%ED%95%9C_%EA%B3%B5%ED%95%AD%ED%8C%A8%EC%85%98_%ED%9A%A8%EB%A6%B0_(%EB%94%94%ED%8C%A8%EC%A7%A4)_2.png) |
| LEE HI | SBS Radio | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:LeeHi_2021_(derived).jpg) |
| GSoul | 아리랑TV | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:%EC%95%84%EB%A6%AC%EB%9E%91TV,_%EC%95%84%EC%9E%84%EB%9D%BC%EC%9D%B4%EB%B8%8C,_%EC%A7%80%EC%86%8C%EC%9A%B8_-_14%EC%9D%BC_%EB%B0%A9%EC%86%A1_2-1.jpg) |
| IU | 티비텐 TV10 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:250718_Lee_Ji-eun_(%EC%9D%B4%EC%A7%80%EC%9D%80).png) |
| HyunA | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:20230720_Kim_HyunA_in_July_2023_01_(cropped).png) |
| SEULGI | SeulRene 'IS' LOVE❤️ | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Kang_Seul-gi_at_Coca-Cola_Event_on_January_18,_2020_03.jpg) |
| Park Bom | Explicit | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:190330_%EB%B0%95%EB%B4%84_%EB%A1%AF%EB%8D%B0%EB%B0%B1%ED%99%94%EC%A0%90_%EC%9E%A0%EC%8B%A4_%ED%8C%AC%EC%8B%B8%EC%9D%B8%ED%9A%8C_2.jpg) |
| Lee Su Jeong | demical | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:%EB%B2%A0%EC%9D%B4%EB%B9%84_%EC%86%8C%EC%9A%B8.jpg) |
| BUMKEY | BRANDNEW MUSIC | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Bumkey_in_2021.png) |
| PSY | Korea.net / Korean Culture and Information Service (Jeon Han) | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:PSY(%EC%8B%B8%EC%9D%B4)_at_2015_Summer_K-POP_Festival.jpg) |
| Lyn | 여니수니 | [CC BY 2.0 kr](https://creativecommons.org/licenses/by/2.0/kr/deed.en) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Lyn_(singer).jpg) |
| CHUNG HA | Marie Claire Korea | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Chung_Ha_in_March_2025.png) |
| HWASA | TV10 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Hwasa_in_January_2026.png) |
| sogumm | Marie Claire Korea | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Sogumm_210522.png) |
| Eric Nam | Eric Nam | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Eric_Nam_(2021).jpg) |
| Malik B | TwinTurbo | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Malik_Arnell_Paz.png) |
| MAMAMOO | Galaxy Studio | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Mamamoo_in_2023.png) |
| Maliibu Miitch | Hoodforeign | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Maliibu_Miitch.jpg) |
| Talib Kweli | Tuomas Vitikainen | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Talib_Kweli_-_Ilosaarirock_2012.jpg) |
| WENDY | 오늘의 소녀 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Wendy_Son_at_Dream_Concert_on_May_12,_2018.jpg) |
| Sandara Park | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Sandara_Park_Airport_Departure_2022_2_(cropped).jpg) |
| Mahalia | Raph_PH | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Boardmaster21_(76)_(51385229597)_(cropped).jpg) |
| Krizz Kaliko | Mizery Made | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Krizz_Kaliko_on_2008-07-01.JPG) |
| SUNMI | 티비텐 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Lee_Sunmi_%EC%9D%B4%EC%84%A0%EB%AF%B8_2024_06.jpg) |
| YERIN | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:Yerin_September_2024_(3x4_cropped).jpg) |
| Suzy | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Wikimedia file](https://commons.wikimedia.org/wiki/File:20241128_Bae_Suzy_CELINE_photocall_(cropped).jpg) |

## Unresolved portraits

These artists remain available in the catalogue. Lack of a verified reusable photo does not remove an artist or imply that no photo exists.

- 주석: No identity-matched Commons image with complete reusable-license metadata.
- 쿤타: No identity-matched Commons image with complete reusable-license metadata.
- 인피닛 플로우: No identity-matched Commons image with complete reusable-license metadata.
- TBNY: No identity-matched Commons image with complete reusable-license metadata.
- MC 메타: No identity-matched Commons image with complete reusable-license metadata.
- 허클베리피: No identity-matched Commons image with complete reusable-license metadata.
- 주비트레인: No identity-matched Commons image with complete reusable-license metadata.
- 제이제이케이: No identity-matched Commons image with complete reusable-license metadata.
- 피타입: No identity-matched Commons image with complete reusable-license metadata.
- 나찰: No identity-matched Commons image with complete reusable-license metadata.
- 맥대디: No identity-matched Commons image with complete reusable-license metadata.
- 던말릭: No identity-matched Commons image with complete reusable-license metadata.
- QM: No identity-matched Commons image with complete reusable-license metadata.
- 자메즈: No identity-matched Commons image with complete reusable-license metadata.
- 블라세: No identity-matched Commons image with complete reusable-license metadata.
- 퀸 와사비: No identity-matched Commons image with complete reusable-license metadata.
- 칠린호미: No identity-matched Commons image with complete reusable-license metadata.
- 데드피: No identity-matched Commons image with complete reusable-license metadata.
- 제리케이: No identity-matched Commons image with complete reusable-license metadata.
- 비지: No identity-matched Commons image with complete reusable-license metadata.
- 블랙나인: No identity-matched Commons image with complete reusable-license metadata.
- 영비: No identity-matched Commons image with complete reusable-license metadata.
- 언에듀케이티드 키드: No identity-matched Commons image with complete reusable-license metadata.
- 보이비: No identity-matched Commons image with complete reusable-license metadata.
- 지구인: No identity-matched Commons image with complete reusable-license metadata.
- 행주: No identity-matched Commons image with complete reusable-license metadata.
- 오담률: No identity-matched Commons image with complete reusable-license metadata.
- 지조: No identity-matched Commons image with complete reusable-license metadata.
- 손심바: No identity-matched Commons image with complete reusable-license metadata.
- 릴타치: No identity-matched Commons image with complete reusable-license metadata.
- 김효은: No identity-matched Commons image with complete reusable-license metadata.
- 오르내림: No identity-matched Commons image with complete reusable-license metadata.
- 던밀스: No identity-matched Commons image with complete reusable-license metadata.
- 친: No identity-matched Commons image with complete reusable-license metadata.
- 씨케이: No identity-matched Commons image with complete reusable-license metadata.
- 루이 (호미들): not yet checked
- 디보: No identity-matched Commons image with complete reusable-license metadata.
- 트레이드엘: No identity-matched Commons image with complete reusable-license metadata.
- 디지: No identity-matched Commons image with complete reusable-license metadata.
- 면도: No identity-matched Commons image with complete reusable-license metadata.
- CB Mass: No identity-matched Commons image with complete reusable-license metadata.
- 허니 패밀리: No identity-matched Commons image with complete reusable-license metadata.
- 업타운: No identity-matched Commons image with complete reusable-license metadata.
- 45RPM: No identity-matched Commons image with complete reusable-license metadata.
- 톱밥: No identity-matched Commons image with complete reusable-license metadata.
- 얀키: No identity-matched Commons image with complete reusable-license metadata.
- 신스: No identity-matched Commons image with complete reusable-license metadata.
- 디젤: No identity-matched Commons image with complete reusable-license metadata.
- 비즈니즈: No identity-matched Commons image with complete reusable-license metadata.
- 상추: No identity-matched Commons image with complete reusable-license metadata.
- 차붐: No identity-matched Commons image with complete reusable-license metadata.
- 최엘비: No identity-matched Commons image with complete reusable-license metadata.
- 일리닛: No identity-matched Commons image with complete reusable-license metadata.
- 올티: No identity-matched Commons image with complete reusable-license metadata.
- 트루디: No identity-matched Commons image with complete reusable-license metadata.
- 골드부다: No identity-matched Commons image with complete reusable-license metadata.
- 해쉬스완: No identity-matched Commons image with complete reusable-license metadata.
- 뉴챔프: No identity-matched Commons image with complete reusable-license metadata.
- 지미페이지: No identity-matched Commons image with complete reusable-license metadata.
- 블랙넛: No identity-matched Commons image with complete reusable-license metadata.
- 오디: No identity-matched Commons image with complete reusable-license metadata.
- 오왼: No identity-matched Commons image with complete reusable-license metadata.
- 테드 박: No identity-matched Commons image with complete reusable-license metadata.
- 우디 고차일드: No identity-matched Commons image with complete reusable-license metadata.
- 이케이: No identity-matched Commons image with complete reusable-license metadata.
- 스토니스컹크: No identity-matched Commons image with complete reusable-license metadata.
- 탁: No identity-matched Commons image with complete reusable-license metadata.
- 어글리덕: No identity-matched Commons image with complete reusable-license metadata.
- 호미들: No identity-matched Commons image with complete reusable-license metadata.
- MFBTY: No identity-matched Commons image with complete reusable-license metadata.
- 이그니토: No identity-matched Commons image with complete reusable-license metadata.
- 비트박스 DG: No identity-matched Commons image with complete reusable-license metadata.
- 퓨처리스틱 스웨버: No identity-matched Commons image with complete reusable-license metadata.
- 스트릿 베이비: No identity-matched Commons image with complete reusable-license metadata.
- 릴체리: No identity-matched Commons image with complete reusable-license metadata.
- 차메인: No identity-matched Commons image with complete reusable-license metadata.
- 지스트: No identity-matched Commons image with complete reusable-license metadata.
- 노엘: No identity-matched Commons image with complete reusable-license metadata.
- 김심야: No identity-matched Commons image with complete reusable-license metadata.
- 룸나인: No identity-matched Commons image with complete reusable-license metadata.
- 무웅: No identity-matched Commons image with complete reusable-license metadata.
- 제이호: No identity-matched Commons image with complete reusable-license metadata.
- 수다쟁이: No identity-matched Commons image with complete reusable-license metadata.
- 디아크: No identity-matched Commons image with complete reusable-license metadata.
- 브린: No identity-matched Commons image with complete reusable-license metadata.
- 앤덥: No identity-matched Commons image with complete reusable-license metadata.
- 불리 다 바스타드: No identity-matched Commons image with complete reusable-license metadata.
- 플루마: No identity-matched Commons image with complete reusable-license metadata.
- 잠비노: No identity-matched Commons image with complete reusable-license metadata.
- 오션검: No identity-matched Commons image with complete reusable-license metadata.
- 오우릴고트: No identity-matched Commons image with complete reusable-license metadata.
- 긱스: No identity-matched Commons image with complete reusable-license metadata.
- 지토: No identity-matched Commons image with complete reusable-license metadata.
- 기린: No identity-matched Commons image with complete reusable-license metadata.
- 블랭: No identity-matched Commons image with complete reusable-license metadata.
- 슬릭: No identity-matched Commons image with complete reusable-license metadata.
- 소울 다이브: No identity-matched Commons image with complete reusable-license metadata.
- 우탄: No identity-matched Commons image with complete reusable-license metadata.
- 디테오: No identity-matched Commons image with complete reusable-license metadata.
- 블루: No identity-matched Commons image with complete reusable-license metadata.
- 니안: No identity-matched Commons image with complete reusable-license metadata.
- 언오피셜보이: No identity-matched Commons image with complete reusable-license metadata.
- 노스페이스갓: No identity-matched Commons image with complete reusable-license metadata.
- 폴로다레드: No identity-matched Commons image with complete reusable-license metadata.
- 플리키뱅: No identity-matched Commons image with complete reusable-license metadata.
- 루이 (긱스): No identity-matched Commons image with complete reusable-license metadata.
- 테이크원: No identity-matched Commons image with complete reusable-license metadata.
- 아넌딜라이트: No identity-matched Commons image with complete reusable-license metadata.
- 짱유: No identity-matched Commons image with complete reusable-license metadata.
- 아체: No identity-matched Commons image with complete reusable-license metadata.
- 재달: No identity-matched Commons image with complete reusable-license metadata.
- 다민이: No identity-matched Commons image with complete reusable-license metadata.
- 디액션: No identity-matched Commons image with complete reusable-license metadata.
- MBA: No identity-matched Commons image with complete reusable-license metadata.
- DJ 샤인: No identity-matched Commons image with complete reusable-license metadata.
- 정연준: No identity-matched Commons image with complete reusable-license metadata.
- J-Kwondo: No identity-matched Commons image with complete reusable-license metadata.
- 이현배: No identity-matched Commons image with complete reusable-license metadata.
- 간디: No identity-matched Commons image with complete reusable-license metadata.

# 데이터 갱신 / Catalog maintenance

[한국어 README](../README.md) · [English README](../README.en.md)

## 실행

Python 3.10+가 필요합니다. 수집기는 표준 라이브러리를 사용합니다. 사진 처리를 할 때만 Pillow 의존성을 설치합니다.

```sh
npm run data:collect
python3 -m pip install -r requirements.txt
python3 scripts/collect-portraits.py
npm run data:build
npm run data:validate:launch
```

The checked-in catalog is sufficient for browsing and local development. Python is needed only for collection and media tasks. Install `requirements.txt` for portrait processing; the metadata collector uses the standard library.

## 검토 원칙

- `data/seeds.json`: 발견용 이름과 명시적인 인물 식별자.
- `data/catalog.sqlite`: 원본 응답·수집 캐시. Git에서 제외합니다.
- `data/pending.json`: 동명이인, 역할·판본이 불명확한 검토 후보.
- `data/official.json`: 확인된 공식 발매 근거와 정정.
- `data/catalog.json`: 검토한 공개 원본.
- `public/data/`: 결정적으로 생성하는 지도·상세·manifest. 직접 수정하지 않습니다.

매주 실행되는 워크플로는 후보 자료만 모읍니다. 근거와 라이선스를 검토한 카탈로그를 커밋해야 공개 데이터가 바뀝니다. 검토 중인 인물·녹음·크레딧은 협업 근거로 승인하지 않습니다. 그룹의 작업을 멤버 개인 작업으로 추정하지 않습니다. 같은 녹음의 재발매는 중복 집계하지 않습니다.

The weekly workflow produces review candidates, not automatic publication. Resolve identity, performer role and recording version against sources before changing the accepted catalog. Groups remain distinct entities and repeated releases do not create extra ties.

## 데이터 모델과 근거

[구조](architecture.md), [수집 감사](data-audit.md), [출처 검증](source-verification.md), [사진 감사](image-audit.md)를 참고하세요. 커버리지는 수집한 증거의 범위이며 완전한 디스코그래피 비율이 아닙니다. 그래프 군집은 레이블이나 크루 소속을 뜻하지 않습니다.

Coverage describes collected evidence, not exhaustive discography completeness. Community colors describe the collaboration graph rather than label or crew membership.

# TOEIC 900 단어 학습 앱 🎓

매일 TOEIC 900 수준 영어 단어 10개씩 학습하는 웹앱입니다. 아침 5시를 기준으로 매일 다른 단어들이 자동으로 업데이트됩니다.

## 🌐 외부 접근 가능한 URL

**GitHub Pages를 통해 누구나 접근 가능합니다:**
👉 https://jinsim1119-alt.github.io/toeic-vocab-daily

(GitHub 로그인 불필요, 링크만으로 접근 가능)

## 🎯 주요 기능

### 학습 기능
- ✅ 30일 분할된 단어 구성 (Day 1 ~ Day 30)
- ✅ 매일 아침 5시 기준으로 자동 업데이트
- ✅ 이전 Day 학습 기록 조회 가능
- ✅ 각 단어별 외웠음 체크 기능
- ✅ 체크 상태 자동 저장 (localStorage)

### 학습 통계 & 복습
- 📊 학습 진행률 그래프
- 📝 오답 복습 모드 (틀린 문제만 모아서 학습)
- 🔄 전체 데이터 초기화 버튼

### 실습
- 🎯 실습 퀴즈 (3개 문제)
- ✓ 정답/오답 즉시 피드백
- 📌 오답 자동 기록

## 📁 파일 구조

| 파일 | 설명 |
|------|------|
| `index.html` | 화면 구조 및 레이아웃 |
| `style.css` | UI/UX 스타일링 |
| `app.js` | 핵심 앱 로직 (학습, 퀴즈, 통계) |
| `words.json` | 300개 TOEIC 900+ 비즈니스 단어 데이터 |

## 🚀 사용 방법

### 온라인 (추천)
1. https://jinsim1119-alt.github.io/toeic-vocab-daily 에 접속
2. 모든 기능 즉시 사용 가능 ✨

### 로컬 개발
```bash
git clone https://github.com/jinsim1119-alt/toeic-vocab-daily.git
cd toeic-vocab-daily
python3 -m http.server 8080
# 브라우저에서 http://localhost:8080 에 접속
```

## 💾 데이터 저장

모든 학습 기록은 **브라우저의 localStorage**에 저장됩니다:
- 같은 기기/브라우저에서는 데이터 유지
- 다른 기기/브라우저에서는 독립적인 학습 기록
- 초기화 버튼으로 언제든 초기화 가능

## 📊 학습 흐름

```
Day 1 (10단어) → Day 2 (10단어) → ... → Day 30 (10단어)
     ↓ 아침 5시 기준으로 자동 진행
  통계 확인 & 오답 복습 & 퀴즈 실습
```

## 🎓 포함된 단어

- **총 300개** TOEIC 900+ 비즈니스 영어 단어
- **카테고리**: HR, Finance, Sales, Marketing, Operations, Strategy, Legal, Hospitality 등
- **난이도**: 중상~상
- 각 단어마다: 영문 뜻, 한국어 뜻, 영어 예문, 한국어 해석

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (프레임워크 없음)
- **Storage**: LocalStorage API
- **Hosting**: GitHub Pages
- **No Backend Required** (완전 정적 클라이언트)

## 📝 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능합니다.

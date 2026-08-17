// 앱에서 사용할 저장소 키를 미리 정해 둡니다.
const CHECKED_STORAGE_KEY = 'toeic_vocab_checked';
const COMPLETED_DATE_KEY = 'toeic_vocab_completed_date';

// HTML 요소를 찾아서 변수로 저장합니다.
const wordListElement = document.getElementById('word-list');
const progressText = document.getElementById('progress-text');
const completeButton = document.getElementById('complete-btn');
const todayLabel = document.getElementById('today-label');

// 전역 변수: 오늘 보여줄 10개 단어를 저장합니다.
let todayWords = [];

// 오늘 날짜를 YYYY-MM-DD 형식으로 만들어 줍니다.
function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

// words.json에서 단어 목록을 불러옵니다.
async function loadWords() {
  try {
    const response = await fetch('words.json');

    if (!response.ok) {
      throw new Error('단어 데이터를 불러오지 못했습니다.');
    }

    const words = await response.json();
    return words;
  } catch (error) {
    console.error(error);
    wordListElement.innerHTML = `
      <div class="word-card">
        <p class="meaning">데이터를 불러오지 못했습니다.</p>
        <p class="example ko">브라우저에서 로컬 서버를 실행해 주세요. 예: python3 -m http.server 8000</p>
      </div>
    `;
    throw error;
  }
}

// 날짜를 기준으로 오늘의 단어 10개를 고르는 함수입니다.
function getTodayWords(words) {
  if (!Array.isArray(words) || words.length === 0) {
    return [];
  }

  const totalWords = words.length;
  const startIndex = (new Date().getDate() * 7 + new Date().getMonth() * 13) % (totalWords - 9);
  const selectedWords = words.slice(startIndex, startIndex + 10);

  // 만약 마지막 부분에서 10개가 안 나오면 앞쪽부터 이어서 채웁니다.
  if (selectedWords.length < 10) {
    return selectedWords.concat(words.slice(0, 10 - selectedWords.length));
  }

  return selectedWords;
}

// localStorage에서 체크 상태를 불러옵니다.
function getCheckedMap() {
  const savedData = localStorage.getItem(CHECKED_STORAGE_KEY);

  if (!savedData) {
    return {};
  }

  try {
    return JSON.parse(savedData);
  } catch (error) {
    console.error('체크 상태를 읽는 중 오류가 발생했습니다.', error);
    return {};
  }
}

// 체크 상태를 localStorage에 저장합니다.
function saveCheckedMap(checkedMap) {
  localStorage.setItem(CHECKED_STORAGE_KEY, JSON.stringify(checkedMap));
}

// 오늘 학습 완료 여부를 저장합니다.
function isTodayCompleted() {
  return localStorage.getItem(COMPLETED_DATE_KEY) === getTodayDateString();
}

// 진행 상태를 화면에 반영합니다.
function updateProgress() {
  const checkedMap = getCheckedMap();
  const completedCount = todayWords.filter((word) => checkedMap[word.id]).length;

  progressText.textContent = `${completedCount} / ${todayWords.length} 완료`;

  // 오늘 학습 완료 상태에 따라 버튼 텍스트를 바꿉니다.
  // 버튼은 비활성화하지 않고, 다시 눌러 취소할 수 있게 합니다.
  if (isTodayCompleted()) {
    completeButton.textContent = '오늘 학습 완료됨';
  } else {
    completeButton.textContent = '오늘 학습 완료';
  }
}

// word-card 하나를 화면에 그려주는 함수입니다.
function renderWords() {
  const checkedMap = getCheckedMap();
  wordListElement.innerHTML = '';

  todayWords.forEach((word) => {
    const card = document.createElement('article');
    card.className = 'word-card';

    const isChecked = Boolean(checkedMap[word.id]);

    card.innerHTML = `
      <div class="word-header">
        <h2 class="word-name">${word.word}</h2>
        <span class="word-tag">${word.category}</span>
      </div>

      <p class="meaning"><strong>뜻:</strong> ${word.meaning_ko}</p>

      <div class="example-box">
        <span class="example-label">영어 예문</span>
        <p class="example en">${word.sentence_en}</p>
      </div>

      <div class="example-box">
        <span class="example-label">한국어 해석</span>
        <p class="example ko">${word.sentence_ko}</p>
      </div>

      <div class="check-row">
        <label>
          <input type="checkbox" data-id="${word.id}" ${isChecked ? 'checked' : ''} />
          외웠음
        </label>
      </div>
    `;

    // 체크박스를 클릭했을 때 상태를 저장합니다.
    const checkbox = card.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', (event) => {
      const checkedMapNow = getCheckedMap();
      checkedMapNow[word.id] = event.target.checked;
      saveCheckedMap(checkedMapNow);
      updateProgress();
    });

    wordListElement.appendChild(card);
  });

  updateProgress();
}

// 오늘 학습 완료 버튼 클릭 시 실행되는 함수입니다.
// 이미 완료 상태라면 다시 누르면 취소로 돌아갑니다.
function handleCompleteStudy() {
  if (isTodayCompleted()) {
    localStorage.removeItem(COMPLETED_DATE_KEY);
    updateProgress();
    alert('오늘 학습 완료 상태가 취소되었습니다.');
    return;
  }

  // 현재 날짜를 저장해서 오늘 완료 상태를 유지합니다.
  localStorage.setItem(COMPLETED_DATE_KEY, getTodayDateString());
  updateProgress();
  alert('오늘의 학습을 완료했습니다!');
}

// 앱을 시작하는 함수입니다.
async function initApp() {
  try {
    const words = await loadWords();
    todayWords = getTodayWords(words);

    const todayString = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    todayLabel.textContent = `${todayString} · 오늘의 단어 ${todayWords.length}개`;

    renderWords();
    completeButton.addEventListener('click', handleCompleteStudy);
  } catch (error) {
    console.error('앱 초기화 중 오류가 발생했습니다.', error);
  }
}

// 페이지가 모두 로드된 뒤 앱을 실행합니다.
window.addEventListener('DOMContentLoaded', initApp);

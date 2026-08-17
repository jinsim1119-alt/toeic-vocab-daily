const CHECKED_STORAGE_KEY = 'toeic_vocab_checked_v2';
const COMPLETED_DATE_KEY = 'toeic_vocab_completed_date';
const MISTAKES_STORAGE_KEY = 'toeic_vocab_mistakes';
const START_DATE = new Date('2024-01-01T00:00:00');

const wordListElement = document.getElementById('word-list');
const progressText = document.getElementById('progress-text');
const completeButton = document.getElementById('complete-btn');
const todayLabel = document.getElementById('today-label');
const dayBadge = document.getElementById('day-badge');
const datePicker = document.getElementById('date-picker');
const daySummary = document.getElementById('day-summary');
const historyList = document.getElementById('history-list');
const progressRate = document.getElementById('progress-rate');
const progressBar = document.getElementById('progress-bar');
const todayDone = document.getElementById('today-done');
const mistakeCount = document.getElementById('mistake-count');
const mistakeList = document.getElementById('mistake-list');
const resetButton = document.getElementById('reset-btn');
const quizCard = document.getElementById('quiz-card');
const menuButtons = document.querySelectorAll('.menu-btn');
const panels = document.querySelectorAll('.panel');

let allWords = [];
let currentWords = [];
let selectedDate = null;
let quizQuestions = [];
let quizIndex = 0;

function toDateKey(date) {
  const localDate = new Date(date);
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
  return localDate.toISOString().slice(0, 10);
}

function formatDateLabel(date) {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function getEffectiveDate(date) {
  const newDate = new Date(date);
  if (newDate.getHours() < 5) {
    newDate.setDate(newDate.getDate() - 1);
  }
  return newDate;
}

function getStudyDayNumber(targetDate) {
  const baseDate = new Date(START_DATE);
  const safeDate = new Date(targetDate);
  baseDate.setHours(0, 0, 0, 0);
  safeDate.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((safeDate - baseDate) / 86400000);
  return ((diffDays % 30) + 30) % 30 + 1;
}

function getWordsForDate(date) {
  if (!Array.isArray(allWords) || allWords.length === 0) {
    return [];
  }

  const dayNumber = getStudyDayNumber(date);
  const startIndex = (dayNumber - 1) * 10;
  return allWords.slice(startIndex, startIndex + 10);
}

function getCheckedMap() {
  const raw = localStorage.getItem(CHECKED_STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    console.error('체크 상태를 읽는 중 오류가 발생했습니다.', error);
    return {};
  }
}

function saveCheckedMap(map) {
  localStorage.setItem(CHECKED_STORAGE_KEY, JSON.stringify(map));
}

function getDailyCheckedMap(date) {
  const key = toDateKey(date);
  const allMap = getCheckedMap();
  return allMap[key] && typeof allMap[key] === 'object' ? allMap[key] : {};
}

function saveDailyCheckedMap(date, dayMap) {
  const allMap = getCheckedMap();
  allMap[toDateKey(date)] = dayMap;
  saveCheckedMap(allMap);
}

function isDateCompleted(date) {
  return localStorage.getItem(COMPLETED_DATE_KEY) === toDateKey(date);
}

function getMistakes() {
  const raw = localStorage.getItem(MISTAKES_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('오답 기록을 읽어오지 못했습니다.', error);
    return [];
  }
}

function saveMistakes(list) {
  localStorage.setItem(MISTAKES_STORAGE_KEY, JSON.stringify(list));
}

function updateDaySelection() {
  const key = toDateKey(selectedDate);
  datePicker.value = key;

  const day = getStudyDayNumber(selectedDate);
  const viewDate = formatDateLabel(selectedDate);

  todayLabel.textContent = `${viewDate}`;
  dayBadge.textContent = `Day ${day}`;
  daySummary.textContent = `Day ${day} · ${currentWords.length}개 단어`;

  const isToday = key === toDateKey(getEffectiveDate(new Date()));
  completeButton.disabled = !isToday;
  completeButton.textContent = isDateCompleted(selectedDate) ? '오늘 학습 완료됨' : '오늘 학습 완료';
}

function updateProgress() {
  const dayMap = getDailyCheckedMap(selectedDate);
  const completedCount = currentWords.filter((word) => Boolean(dayMap[word.id])).length;

  progressText.textContent = `${completedCount} / ${currentWords.length} 완료`;

  const percent = currentWords.length ? Math.round((completedCount / currentWords.length) * 100) : 0;
  progressRate.textContent = `${percent}%`;
  progressBar.style.width = `${percent}%`;
  todayDone.textContent = `${completedCount} / ${currentWords.length}`;
}

function renderWords() {
  wordListElement.innerHTML = '';

  const checkedMap = getDailyCheckedMap(selectedDate);

  currentWords.forEach((word) => {
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

    const checkbox = card.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', (event) => {
      const nextMap = getDailyCheckedMap(selectedDate);
      nextMap[word.id] = event.target.checked;
      saveDailyCheckedMap(selectedDate, nextMap);
      updateProgress();
      renderHistory();
    });

    wordListElement.appendChild(card);
  });

  updateProgress();
}

function renderHistory() {
  const history = [];

  for (let day = 1; day <= 30; day += 1) {
    const date = new Date(selectedDate);
    const dayOffset = day - getStudyDayNumber(selectedDate);
    date.setDate(date.getDate() + dayOffset);

    const wordsForDay = getWordsForDate(date);
    const checkedMap = getDailyCheckedMap(date);
    const completedCount = wordsForDay.filter((word) => Boolean(checkedMap[word.id])).length;

    history.push({
      date,
      day,
      completedCount,
      total: wordsForDay.length,
      percent: wordsForDay.length ? Math.round((completedCount / wordsForDay.length) * 100) : 0
    });
  }

  historyList.innerHTML = history
    .map(({ date, day, completedCount, total, percent }) => {
      const active = toDateKey(date) === toDateKey(selectedDate) ? 'is-active' : '';
      return `
        <button type="button" class="history-item ${active}" data-date="${toDateKey(date)}">
          <span>Day ${day}</span>
          <strong>${completedCount}/${total}</strong>
          <small>${percent}%</small>
        </button>
      `;
    })
    .join('');

  historyList.querySelectorAll('.history-item').forEach((button) => {
    button.addEventListener('click', () => {
      const newDate = new Date(button.dataset.date);
      selectedDate = newDate;
      currentWords = getWordsForDate(selectedDate);
      updateDaySelection();
      renderWords();
      renderHistory();
    });
  });
}

function renderMistakes() {
  const mistakes = getMistakes();
  mistakeCount.textContent = `${mistakes.length}개`;

  if (!mistakes.length) {
    mistakeList.innerHTML = '<p class="empty-state">아직 오답 기록이 없습니다. 퀴즈를 풀어보세요.</p>';
    return;
  }

  mistakeList.innerHTML = mistakes
    .map((item) => `
      <div class="mistake-item">
        <div class="mistake-header">
          <strong>${item.word}</strong>
          <span>${item.date}</span>
        </div>
        <p>내 답: ${item.userAnswer}</p>
        <p>정답: ${item.correctAnswer}</p>
      </div>
    `)
    .join('');
}

function chooseQuizQuestions() {
  const pool = allWords.length ? [...allWords] : [];
  const chosen = [];

  while (chosen.length < 3 && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    chosen.push(pool.splice(index, 1)[0]);
  }

  return chosen;
}

function renderQuiz() {
  if (!quizQuestions.length) {
    quizCard.innerHTML = '<p class="quiz-status">퀴즈를 준비 중입니다.</p>';
    return;
  }

  const question = quizQuestions[quizIndex];
  const wrongOptions = allWords
    .filter((word) => word.id !== question.id)
    .map((word) => word.meaning_ko)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const options = [...wrongOptions, question.meaning_ko].sort(() => Math.random() - 0.5);

  quizCard.innerHTML = `
    <p class="quiz-title">문제 ${quizIndex + 1} / ${quizQuestions.length}</p>
    <h4>${question.word}</h4>
    <p class="quiz-question">다음 뜻으로 가장 적절한 것은?</p>
    <div class="quiz-options">
      ${options
        .map(
          (option) => `
            <button type="button" class="quiz-option" data-answer="${option}">${option}</button>
          `
        )
        .join('')}
    </div>
  `;

  quizCard.querySelectorAll('.quiz-option').forEach((button) => {
    button.addEventListener('click', () => {
      const selectedAnswer = button.dataset.answer;
      const isCorrect = selectedAnswer === question.meaning_ko;

      const buttonList = quizCard.querySelectorAll('.quiz-option');
      buttonList.forEach((optionButton) => {
        optionButton.disabled = true;
        if (optionButton.dataset.answer === question.meaning_ko) {
          optionButton.classList.add('is-correct');
        }
        if (optionButton === button && !isCorrect) {
          optionButton.classList.add('is-wrong');
        }
      });

      const feedback = document.createElement('div');
      feedback.className = `quiz-feedback ${isCorrect ? 'correct' : 'wrong'}`;
      feedback.textContent = isCorrect ? '정답입니다! 👍' : `오답입니다. 정답은 ${question.meaning_ko}입니다.`;
      quizCard.appendChild(feedback);

      if (!isCorrect) {
        const mistakes = getMistakes();
        const alreadyExists = mistakes.some((item) => item.word === question.word && item.date === toDateKey(selectedDate));
        if (!alreadyExists) {
          mistakes.push({
            word: question.word,
            userAnswer: selectedAnswer,
            correctAnswer: question.meaning_ko,
            date: toDateKey(selectedDate)
          });
          saveMistakes(mistakes);
        }
      }

      renderMistakes();

      setTimeout(() => {
        quizIndex += 1;
        if (quizIndex >= quizQuestions.length) {
          quizIndex = 0;
          quizQuestions = chooseQuizQuestions();
        }
        renderQuiz();
      }, 1200);
    });
  });
}

function handleCompleteStudy() {
  const todayKey = toDateKey(getEffectiveDate(new Date()));
  if (toDateKey(selectedDate) !== todayKey) {
    return;
  }

  if (isDateCompleted(selectedDate)) {
    localStorage.removeItem(COMPLETED_DATE_KEY);
    alert('오늘 학습 완료 상태가 취소되었습니다.');
  } else {
    localStorage.setItem(COMPLETED_DATE_KEY, todayKey);
    alert('오늘의 학습을 완료했습니다!');
  }

  updateDaySelection();
  renderHistory();
}

function resetAllData() {
  const confirmReset = window.confirm('모든 학습 기록과 오답 데이터를 초기화할까요?');
  if (!confirmReset) {
    return;
  }

  localStorage.removeItem(CHECKED_STORAGE_KEY);
  localStorage.removeItem(COMPLETED_DATE_KEY);
  localStorage.removeItem(MISTAKES_STORAGE_KEY);

  renderWords();
  renderHistory();
  renderMistakes();
}

function setActivePanel(viewName) {
  menuButtons.forEach((button) => {
    const isActive = button.dataset.view === viewName;
    button.classList.toggle('is-active', isActive);
  });

  panels.forEach((panel) => {
    const isActive = panel.id === `${viewName}-panel`;
    panel.classList.toggle('is-active', isActive);
  });
}

async function loadWords() {
  try {
    const response = await fetch('words.json');

    if (!response.ok) {
      throw new Error('단어 데이터를 불러오지 못했습니다.');
    }

    const words = await response.json();
    return Array.isArray(words) ? words : [];
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

function bindEvents() {
  completeButton.addEventListener('click', handleCompleteStudy);
  resetButton.addEventListener('click', resetAllData);
  datePicker.addEventListener('change', (event) => {
    const pickedDate = new Date(`${event.target.value}T12:00:00`);
    selectedDate = getEffectiveDate(pickedDate);
    currentWords = getWordsForDate(selectedDate);
    updateDaySelection();
    renderWords();
    renderHistory();
  });

  document.getElementById('prev-day-btn').addEventListener('click', () => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() - 1);
    selectedDate = getEffectiveDate(nextDate);
    currentWords = getWordsForDate(selectedDate);
    updateDaySelection();
    renderWords();
    renderHistory();
  });

  document.getElementById('next-day-btn').addEventListener('click', () => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    selectedDate = getEffectiveDate(nextDate);
    currentWords = getWordsForDate(selectedDate);
    updateDaySelection();
    renderWords();
    renderHistory();
  });

  menuButtons.forEach((button) => {
    button.addEventListener('click', () => setActivePanel(button.dataset.view));
  });
}

async function initApp() {
  try {
    allWords = await loadWords();
    selectedDate = getEffectiveDate(new Date());
    currentWords = getWordsForDate(selectedDate);

    bindEvents();
    updateDaySelection();
    renderWords();
    renderHistory();
    renderMistakes();
    quizQuestions = chooseQuizQuestions();
    renderQuiz();
    setActivePanel('learn');
  } catch (error) {
    console.error('앱 초기화 중 오류가 발생했습니다.', error);
  }
}

window.addEventListener('DOMContentLoaded', initApp);

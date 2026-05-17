let words = [];
let current = 0;
let correctCount = 0;
let wrongCount = 0;
let streak = 0;
let todayCount = 0;
let answered = false;

const $ = id => document.getElementById(id);

function show(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(screenId).classList.add('active');
}

function normalize(str) {
  return str.normalize('NFC').trim();
}

function loadWord() {
  const w = words[current];
  answered = false;

  $('arabic-input').value = '';
  $('arabic-input').className = 'arabic-input';
  $('feedback-correct').classList.remove('visible');
  $('btn-next').disabled = true;

  $('word-progress').textContent = `${current + 1} / ${words.length} 단어`;
  $('card-category').textContent = w.category;
  $('card-num').textContent = String(current + 1).padStart(2, '0');
  $('arabic-word').textContent = w.arabic;
  $('transliteration').textContent = w.transliteration;
  $('meaning-ko').textContent = w.meaning_ko;
  $('hint-text').textContent = `힌트: ${w.hint_len}글자, ${w.hint_start}으로 시작해요`;

  const pct = Math.round((current / words.length) * 100);
  $('progress-bar').style.width = pct + '%';
  $('pct-label').textContent = pct + '% 완료';
  $('score-label').textContent = `정답 ${correctCount} / 오답 ${wrongCount}`;

  $('streak-badge').textContent = `⚡ ${streak}연속`;
  $('arabic-input').focus();
}

function checkAnswer() {
  if (answered) return;
  const w = words[current];
  const input = $('arabic-input').value;
  if (!input.trim()) return;

  answered = true;
  todayCount++;

  if (normalize(input) === normalize(w.arabic)) {
    correctCount++;
    streak++;
    $('arabic-input').classList.add('correct');
    $('feedback-correct').classList.add('visible');
    $('feedback-word').textContent = w.arabic;
    $('btn-next').disabled = false;
    setTimeout(() => nextWord(), 1600);
  } else {
    wrongCount++;
    streak = 0;
    showWrongScreen(input, w);
  }

  updateHomeStats();
}

function showWrongScreen(myInput, w) {
  $('wrong-category').textContent = w.category;
  $('wrong-arabic').textContent = w.arabic;
  $('wrong-trans').textContent = w.transliteration;
  $('wrong-meaning').textContent = w.meaning_ko;
  $('my-answer').textContent = myInput;
  $('correct-answer').textContent = w.arabic;
  $('streak-badge-wrong').textContent = `⚡ ${streak}연속`;
  $('compare-note').textContent = `ⓘ 이런 부분이 달랐어요\n입력값과 정답의 모음 부호나 장단음이 다를 수 있어요.`;
  show('screen-wrong');
}

function nextWord() {
  current++;
  if (current >= words.length) {
    showComplete();
  } else {
    show('screen-practice');
    loadWord();
  }
}

function showComplete() {
  $('c-total').textContent = words.length;
  $('c-correct').textContent = correctCount;
  $('c-rate').textContent = Math.round((correctCount / words.length) * 100) + '%';
  show('screen-complete');
  updateHomeStats();
}

function updateHomeStats() {
  $('stat-today').textContent = todayCount;
  $('stat-streak').textContent = streak;
  const rate = (correctCount + wrongCount) > 0
    ? Math.round((correctCount / (correctCount + wrongCount)) * 100)
    : 0;
  $('stat-bar').style.width = rate + '%';
}

// ── 이벤트 바인딩 ──

$('btn-start').addEventListener('click', () => {
  current = 0; correctCount = 0; wrongCount = 0; streak = 0;
  show('screen-practice');
  loadWord();
});

$('arabic-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') checkAnswer();
});

$('arabic-input').addEventListener('input', () => {
  if (!answered && $('arabic-input').value.trim()) {
    $('arabic-input').classList.remove('wrong-input');
  }
});

$('btn-next').addEventListener('click', nextWord);

$('btn-skip').addEventListener('click', () => {
  if (!answered) {
    wrongCount++;
    streak = 0;
    updateHomeStats();
    nextWord();
  }
});

$('btn-back').addEventListener('click', () => show('screen-home'));

$('btn-retry').addEventListener('click', () => {
  show('screen-practice');
  $('arabic-input').value = '';
  $('arabic-input').className = 'arabic-input';
  $('feedback-correct').classList.remove('visible');
  $('btn-next').disabled = true;
  answered = false;
  $('arabic-input').focus();
});

$('btn-next-wrong').addEventListener('click', nextWord);
$('btn-back-wrong').addEventListener('click', () => show('screen-home'));
$('btn-home').addEventListener('click', () => show('screen-home'));

// ── 단어 로드 ──
fetch('words.json')
  .then(r => r.json())
  .then(data => { words = data; })
  .catch(() => {
    words = [
      { id:'b001', arabic:'مَرْحَبًا', transliteration:'mar·ha·ban', meaning_ko:'안녕하세요', category:'기초 단어', hint_len:7, hint_start:'م' },
      { id:'b002', arabic:'شُكْرًا', transliteration:'shuk·ran', meaning_ko:'감사합니다', category:'기초 단어', hint_len:6, hint_start:'ش' },
      { id:'b003', arabic:'نَعَم', transliteration:'na·am', meaning_ko:'네', category:'기초 단어', hint_len:4, hint_start:'ن' },
      { id:'b004', arabic:'لَا', transliteration:'laa', meaning_ko:'아니요', category:'기초 단어', hint_len:2, hint_start:'ل' },
      { id:'b005', arabic:'مَاء', transliteration:"maa'", meaning_ko:'물', category:'기초 단어', hint_len:3, hint_start:'م' },
    ];
  });

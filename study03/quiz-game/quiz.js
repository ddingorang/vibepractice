// Created: 2026-03-19 22:04:53
// ─── 상수 ────────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'quiz-rankings';
const TIMER_SEC   = 30;

const CATEGORIES = {
  'korean-history': { label: '한국사',   color: '#B91C1C' },
  'science':        { label: '과학',     color: '#0891B2' },
  'geography':      { label: '지리',     color: '#15803D' },
  'general':        { label: '일반상식', color: '#7C3AED' },
};

// ─── 문제 데이터 ──────────────────────────────────────────────────────────────
const QUESTIONS = [
  // ── 한국사 ──────────────────────────────────────────────────────────────────
  {
    id: 'kh1',
    category: 'korean-history',
    question: '고조선을 건국한 인물은 누구인가?',
    options: ['주몽', '단군왕검', '동명왕', '온조'],
    answer: 1,
    explanation: '단군왕검은 기원전 2333년에 고조선을 건국한 것으로 전해진다. 홍익인간의 이념을 바탕으로 나라를 세웠다.',
  },
  {
    id: 'kh2',
    category: 'korean-history',
    question: '삼국 중 나당연합군에 의해 가장 먼저 멸망한 나라는?',
    options: ['고구려', '신라', '백제', '가야'],
    answer: 2,
    explanation: '백제는 660년 나당연합군의 공격을 받아 멸망하였으며, 고구려는 그로부터 8년 후인 668년에 멸망하였다.',
  },
  {
    id: 'kh3',
    category: 'korean-history',
    question: '훈민정음(한글)을 창제한 왕은?',
    options: ['태조', '태종', '세종', '성종'],
    answer: 2,
    explanation: '세종대왕은 1443년 훈민정음을 창제하고 1446년에 반포하였다. 백성이 쉽게 글을 읽고 쓸 수 있도록 하기 위함이었다.',
  },
  {
    id: 'kh4',
    category: 'korean-history',
    question: '임진왜란이 일어난 해는?',
    options: ['1582년', '1592년', '1598년', '1602년'],
    answer: 1,
    explanation: '임진왜란은 1592년(임진년) 일본의 침략으로 시작되었으며, 7년간 지속되다 1598년에 끝났다.',
  },
  {
    id: 'kh5',
    category: 'korean-history',
    question: '동학농민운동이 일어난 해는?',
    options: ['1884년', '1889년', '1894년', '1898년'],
    answer: 2,
    explanation: '동학농민운동은 1894년(갑오년) 전봉준을 중심으로 일어난 반봉건·반외세 운동으로, 갑오개혁의 계기가 되었다.',
  },
  {
    id: 'kh6',
    category: 'korean-history',
    question: '3·1 운동이 일어난 해는?',
    options: ['1910년', '1915년', '1919년', '1922년'],
    answer: 2,
    explanation: '1919년 3월 1일 일제강점기에 독립을 선언하고 전국적으로 만세 시위를 벌인 독립운동이다. 상하이 임시정부 수립의 계기가 되었다.',
  },
  {
    id: 'kh7',
    category: 'korean-history',
    question: '조선을 건국한 인물은?',
    options: ['왕건', '이성계', '최영', '정도전'],
    answer: 1,
    explanation: '이성계는 1392년 고려를 멸하고 조선을 건국하여 태조가 되었다. 수도를 개경에서 한양(현재의 서울)으로 옮겼다.',
  },
  {
    id: 'kh8',
    category: 'korean-history',
    question: '6·25 전쟁이 발발한 연도는?',
    options: ['1945년', '1948년', '1950년', '1953년'],
    answer: 2,
    explanation: '6·25 전쟁은 1950년 6월 25일 북한의 남침으로 시작되었으며, 1953년 7월 27일 정전협정이 체결되었다.',
  },
  {
    id: 'kh9',
    category: 'korean-history',
    question: '대한민국의 초대 대통령은?',
    options: ['이승만', '김구', '윤보선', '박정희'],
    answer: 0,
    explanation: '이승만은 1948년 대한민국 정부 수립과 함께 초대 대통령으로 취임하였다. 1960년 4·19 혁명으로 하야하였다.',
  },
  {
    id: 'kh10',
    category: 'korean-history',
    question: '임진왜란 당시 수군을 이끌며 한산도 대첩을 승리로 이끈 장군은?',
    options: ['권율', '이순신', '곽재우', '김시민'],
    answer: 1,
    explanation: '이순신 장군은 거북선을 활용하고 한산도 대첩 등 여러 해전에서 승리하여 나라를 위기에서 구한 영웅이다.',
  },

  // ── 과학 ────────────────────────────────────────────────────────────────────
  {
    id: 'sc1',
    category: 'science',
    question: '빛이 진공 중에서 이동하는 속도는?',
    options: ['약 3만 km/s', '약 30만 km/s', '약 300만 km/s', '약 3,000만 km/s'],
    answer: 1,
    explanation: '빛의 속도는 약 초속 30만 km(299,792,458 m/s)이며, 자연계에서 가장 빠른 속도로 알려져 있다.',
  },
  {
    id: 'sc2',
    category: 'science',
    question: '물의 화학식은?',
    options: ['HO', 'H2O', 'H2O2', 'OH2'],
    answer: 1,
    explanation: '물은 수소(H) 2개와 산소(O) 1개로 이루어진 화합물이다. H2O2는 과산화수소이다.',
  },
  {
    id: 'sc3',
    category: 'science',
    question: '지구가 한 바퀴 자전하는 데 걸리는 시간은?',
    options: ['약 12시간', '약 24시간', '약 48시간', '약 365일'],
    answer: 1,
    explanation: '지구는 약 24시간(정확히는 23시간 56분 4초)에 한 번 자전하며, 이로 인해 낮과 밤이 생긴다.',
  },
  {
    id: 'sc4',
    category: 'science',
    question: 'DNA의 이중나선 구조를 최초로 논문 발표한 과학자는?',
    options: ['아인슈타인과 보어', '왓슨과 크릭', '퀴리와 다윈', '멘델레예프와 멘델'],
    answer: 1,
    explanation: '제임스 왓슨과 프랜시스 크릭은 1953년 DNA의 이중나선 구조를 발견하여 1962년 노벨 생리의학상을 수상하였다.',
  },
  {
    id: 'sc5',
    category: 'science',
    question: '원소 주기율표를 처음 체계적으로 만든 과학자는?',
    options: ['라부아지에', '패러데이', '멘델레예프', '보어'],
    answer: 2,
    explanation: '드미트리 멘델레예프는 1869년 원소를 원자량 순서로 배열한 주기율표를 발표하고, 아직 발견되지 않은 원소의 존재를 예측하였다.',
  },
  {
    id: 'sc6',
    category: 'science',
    question: '식물이 광합성을 할 때 흡수하는 기체는?',
    options: ['산소(O₂)', '질소(N₂)', '이산화탄소(CO₂)', '수소(H₂)'],
    answer: 2,
    explanation: '식물은 광합성 과정에서 이산화탄소(CO₂)와 물(H₂O)을 흡수하여 포도당과 산소를 생성한다.',
  },
  {
    id: 'sc7',
    category: 'science',
    question: '세포에서 에너지(ATP)를 생산하는 기관은?',
    options: ['핵', '엽록체', '미토콘드리아', '리보솜'],
    answer: 2,
    explanation: '미토콘드리아는 세포 호흡을 통해 포도당을 분해하여 ATP(에너지)를 생산하는 기관으로, "세포의 발전소"라고 불린다.',
  },
  {
    id: 'sc8',
    category: 'science',
    question: '소리가 상온의 공기 중에서 전달되는 속도는 약 얼마인가?',
    options: ['약 34 m/s', '약 340 m/s', '약 3,400 m/s', '약 34,000 m/s'],
    answer: 1,
    explanation: '소리는 상온(약 20°C) 공기 중에서 초속 약 343 m/s로 전달된다. 이는 빛의 속도보다 약 88만 배 느리다.',
  },
  {
    id: 'sc9',
    category: 'science',
    question: '지구에서 가장 가까운 별은?',
    options: ['시리우스', '알파 센타우리', '태양', '북극성'],
    answer: 2,
    explanation: '태양은 지구에서 약 1억 5천만 km 떨어진 가장 가까운 별이다. 빛이 태양에서 지구까지 도달하는 데 약 8분이 걸린다.',
  },
  {
    id: 'sc10',
    category: 'science',
    question: '뉴턴이 사과가 떨어지는 것을 보고 발견했다고 알려진 법칙은?',
    options: ['관성의 법칙', '전자기 유도 법칙', '만유인력의 법칙', '열역학 제2법칙'],
    answer: 2,
    explanation: '뉴턴은 사과가 땅으로 떨어지는 현상에서 영감을 받아 모든 물체 사이에 질량에 비례하는 인력이 작용한다는 만유인력의 법칙을 발견하였다.',
  },

  // ── 지리 ────────────────────────────────────────────────────────────────────
  {
    id: 'geo1',
    category: 'geography',
    question: '전통적인 측정 기준으로 세계에서 가장 긴 강은?',
    options: ['아마존 강', '나일 강', '양쯔 강', '미시시피 강'],
    answer: 1,
    explanation: '나일 강은 전통적으로 약 6,650km로 세계에서 가장 긴 강으로 알려져 있으며, 이집트·수단·에티오피아 등을 흐른다. 단, 수원 측정 방식에 따라 아마존 강이 더 길다는 주장도 있다.',
  },
  {
    id: 'geo2',
    category: 'geography',
    question: '프랑스의 수도는?',
    options: ['리옹', '마르세유', '파리', '보르도'],
    answer: 2,
    explanation: '파리는 프랑스의 수도이자 최대 도시로, 센 강변에 위치해 있으며 에펠탑, 루브르 박물관으로 유명하다.',
  },
  {
    id: 'geo3',
    category: 'geography',
    question: '해발 고도 기준으로 세계에서 가장 높은 산은?',
    options: ['K2', '에베레스트', '칸첸중가', '마칼루'],
    answer: 1,
    explanation: '에베레스트 산은 해발 8,848.86m로 해발 고도 기준 세계에서 가장 높은 산이며, 히말라야 산맥의 네팔-중국 국경에 위치한다.',
  },
  {
    id: 'geo4',
    category: 'geography',
    question: '국토 면적 기준으로 세계에서 가장 넓은 나라는?',
    options: ['캐나다', '미국', '중국', '러시아'],
    answer: 3,
    explanation: '러시아는 약 1,709만 km²의 면적으로 세계에서 가장 넓은 나라이며, 유럽과 아시아에 걸쳐 있다.',
  },
  {
    id: 'geo5',
    category: 'geography',
    question: '호주의 수도는?',
    options: ['시드니', '멜버른', '캔버라', '브리즈번'],
    answer: 2,
    explanation: '호주의 수도는 캔버라이다. 시드니와 멜버른이 더 크고 유명하지만, 두 도시 간 경쟁을 피하기 위해 캔버라가 수도로 지정되었다.',
  },
  {
    id: 'geo6',
    category: 'geography',
    question: '면적 기준으로 대한민국에서 가장 큰 섬은?',
    options: ['거제도', '진도', '제주도', '강화도'],
    answer: 2,
    explanation: '제주도는 면적 약 1,849km²로 대한민국에서 가장 큰 섬이며, 유네스코 세계자연유산으로 등재되어 있다.',
  },
  {
    id: 'geo7',
    category: 'geography',
    question: '아마존 강 유역의 대부분이 속한 나라는?',
    options: ['아르헨티나', '브라질', '페루', '콜롬비아'],
    answer: 1,
    explanation: '아마존 강의 대부분은 브라질을 흐르며, 세계에서 유량이 가장 많은 강으로 지구 담수의 약 20%를 차지한다.',
  },
  {
    id: 'geo8',
    category: 'geography',
    question: '사하라 사막이 위치한 대륙은?',
    options: ['아시아', '호주', '아프리카', '남아메리카'],
    answer: 2,
    explanation: '사하라 사막은 아프리카 북부에 위치한 세계 최대의 사막으로 면적이 약 940만 km²에 달한다.',
  },
  {
    id: 'geo9',
    category: 'geography',
    question: '해발 고도 기준으로 한반도에서 가장 높은 산은?',
    options: ['설악산', '지리산', '한라산', '백두산'],
    answer: 3,
    explanation: '백두산은 해발 2,744m로 한반도에서 가장 높은 산이며, 북한과 중국의 국경에 위치한다. 정상에는 천지라는 화구호가 있다.',
  },
  {
    id: 'geo10',
    category: 'geography',
    question: '일본의 수도는?',
    options: ['오사카', '교토', '도쿄', '나고야'],
    answer: 2,
    explanation: '도쿄는 일본의 수도이자 최대 도시로, 세계에서 인구가 가장 많은 도시 권역 중 하나이다.',
  },

  // ── 일반상식 ──────────────────────────────────────────────────────────────────
  {
    id: 'gen1',
    category: 'general',
    question: '하계 올림픽은 몇 년마다 열리나?',
    options: ['2년', '3년', '4년', '5년'],
    answer: 2,
    explanation: '하계 올림픽은 4년마다 열리며, 1896년 그리스 아테네에서 제1회 근대 올림픽이 개최되었다.',
  },
  {
    id: 'gen2',
    category: 'general',
    question: '셰익스피어의 4대 비극에 속하지 않는 작품은?',
    options: ['햄릿', '오셀로', '베니스의 상인', '리어왕'],
    answer: 2,
    explanation: '셰익스피어의 4대 비극은 햄릿, 오셀로, 리어왕, 맥베스이다. 베니스의 상인은 희극에 해당한다.',
  },
  {
    id: 'gen3',
    category: 'general',
    question: 'FIFA 월드컵 최다 우승국은?',
    options: ['독일', '아르헨티나', '이탈리아', '브라질'],
    answer: 3,
    explanation: '브라질은 1958, 1962, 1970, 1994, 2002년 등 총 5회 FIFA 월드컵을 우승한 최다 우승국이다.',
  },
  {
    id: 'gen4',
    category: 'general',
    question: '노벨상 시상식이 열리는 달은?',
    options: ['10월', '11월', '12월', '1월'],
    answer: 2,
    explanation: '노벨상 시상식은 알프레드 노벨의 기일인 12월 10일에 스웨덴 스톡홀름(평화상은 노르웨이 오슬로)에서 열린다.',
  },
  {
    id: 'gen5',
    category: 'general',
    question: '표준 피아노의 건반은 몇 개인가?',
    options: ['72개', '76개', '84개', '88개'],
    answer: 3,
    explanation: '표준 피아노는 흰 건반 52개와 검은 건반 36개, 총 88개의 건반으로 이루어져 있다.',
  },
  {
    id: 'gen6',
    category: 'general',
    question: '대한민국의 국화는?',
    options: ['장미', '진달래', '무궁화', '목련'],
    answer: 2,
    explanation: '무궁화는 대한민국의 국화로, "영원히 피고 또 피어서 지지 않는 꽃"이라는 의미를 지닌다.',
  },
  {
    id: 'gen7',
    category: 'general',
    question: 'GDP의 올바른 뜻은?',
    options: ['국민총생산', '국내총생산', '국가총자산', '국제총부채'],
    answer: 1,
    explanation: 'GDP(Gross Domestic Product)는 국내총생산으로, 한 나라 영토 안에서 일정 기간 생산된 모든 재화와 서비스의 총가치이다.',
  },
  {
    id: 'gen8',
    category: 'general',
    question: '태권도가 하계 올림픽 정식 종목으로 채택된 해는?',
    options: ['1988년', '1992년', '1996년', '2000년'],
    answer: 3,
    explanation: '태권도는 2000년 시드니 올림픽부터 하계 올림픽 정식 종목으로 채택되었다. 1988년 서울 올림픽에서는 시범 종목이었다.',
  },
  {
    id: 'gen9',
    category: 'general',
    question: '지구 표면에서 바다가 차지하는 비율은 약 얼마인가?',
    options: ['약 51%', '약 61%', '약 71%', '약 81%'],
    answer: 2,
    explanation: '지구 표면의 약 71%는 바다로 덮여 있으며, 나머지 29%가 육지이다.',
  },
  {
    id: 'gen10',
    category: 'general',
    question: '"WWW"가 뜻하는 것은?',
    options: ['World Wide Web', 'World Wire Web', 'Wide World Web', 'Web Wide World'],
    answer: 0,
    explanation: 'WWW는 World Wide Web의 약자로, 팀 버너스리가 1989년 제안하여 인터넷 정보 서비스의 기반이 되었다.',
  },
];

// ─── State ────────────────────────────────────────────────────────────────────
const state = {
  mode: 'all',       // 'all' 또는 카테고리 코드
  questions: [],     // 현재 세션 문제 배열
  currentIndex: 0,
  score: 0,
  correctCount: 0,
  answers: [],       // { id, correct, timeTaken } 기록
  timerInterval: null,
  timeLeft: TIMER_SEC,
};

let lastSavedAt = null;  // 방금 등록한 순위 항목의 playedAt 타임스탬프

// ─── 함수 구현 ────────────────────────────────────────────────────────────────

/** 지정한 id의 화면만 표시하고 나머지는 숨긴다. */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(el => {
    el.classList.toggle('active', el.id === id);
  });
}

/** Fisher-Yates 셔플 (원본 배열을 수정하지 않고 새 배열 반환) */
function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** 게임 시작 — mode에 따라 문제를 필터링하고 state를 초기화한다. */
function startGame(mode) {
  state.mode = mode;
  const pool = mode === 'all'
    ? QUESTIONS
    : QUESTIONS.filter(q => q.category === mode);
  state.questions    = shuffleArray(pool);
  state.currentIndex = 0;
  state.score        = 0;
  state.correctCount = 0;
  state.answers      = [];
  loadQuestion();
  showScreen('screen-quiz');
}

/** 현재 문제를 화면에 렌더링한다. */
function loadQuestion() {
  const q     = state.questions[state.currentIndex];
  const total = state.questions.length;
  const cat   = CATEGORIES[q.category];

  // 카테고리 뱃지
  const badge = document.getElementById('quiz-category-badge');
  badge.textContent   = cat.label;
  badge.style.background = cat.color;

  // 진행률
  document.getElementById('quiz-progress-text').textContent = `${state.currentIndex + 1} / ${total}`;
  document.getElementById('quiz-progress-fill').style.width = `${(state.currentIndex + 1) / total * 100}%`;

  // 점수
  document.getElementById('quiz-score').textContent = `점수: ${state.score}`;

  // 문제 텍스트
  document.getElementById('quiz-question').textContent = q.question;

  // 보기 생성 (원본 인덱스 보존 후 셔플)
  const shuffled = shuffleArray(q.options.map((text, i) => ({ text, originalIndex: i })));
  const labels   = ['①', '②', '③', '④'];
  const container = document.getElementById('quiz-options');
  container.innerHTML = '';
  shuffled.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.dataset.originalIndex = opt.originalIndex;
    btn.innerHTML = `<span class="option-number">${labels[i]}</span>${opt.text}`;
    btn.onclick = () => selectAnswer(btn);
    container.appendChild(btn);
  });

  startTimer();
}

/** 타이머를 시작한다 (Date.now() 기반으로 누적 오차 방지). */
function startTimer() {
  stopTimer();
  state.timeLeft = TIMER_SEC;

  const startTime = Date.now();
  const timerText = document.getElementById('quiz-timer-text');
  const timerFill = document.getElementById('quiz-timer-fill');

  timerText.textContent    = TIMER_SEC;
  timerFill.style.width    = '100%';
  timerFill.style.background = '';
  timerFill.classList.remove('pulse');

  const tick = () => {
    const left   = Math.max(0, TIMER_SEC - (Date.now() - startTime) / 1000);
    const display = Math.ceil(left);
    state.timeLeft = left;

    timerText.textContent  = display;
    timerFill.style.width  = `${left / TIMER_SEC * 100}%`;

    if (display <= 5) {
      timerFill.style.background = 'var(--color-wrong)';
      timerFill.classList.add('pulse');
    } else if (display <= 10) {
      timerFill.style.background = 'var(--color-warning)';
      timerFill.classList.remove('pulse');
    }

    if (left <= 0) {
      stopTimer();
      selectAnswer(null);
    }
  };

  state.timerInterval = setInterval(tick, 1000);
}

/** 타이머를 멈추고 interval을 정리한다. */
function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

/** 선택지 버튼 클릭(또는 시간 초과) 시 호출된다. */
function selectAnswer(btnElement) {
  stopTimer();

  const q       = state.questions[state.currentIndex];
  const allBtns = document.querySelectorAll('#quiz-options .option-btn');
  allBtns.forEach(b => (b.disabled = true));

  // 정답 판별
  let isCorrect = false;
  if (btnElement !== null) {
    isCorrect = parseInt(btnElement.dataset.originalIndex) === q.answer;
    btnElement.classList.add(isCorrect ? 'correct' : 'wrong');
  }

  // 정답 버튼 강조 (오답·시간초과 모두)
  if (!isCorrect) {
    allBtns.forEach(b => {
      if (parseInt(b.dataset.originalIndex) === q.answer) b.classList.add('correct');
    });
  }

  // 점수 계산
  let pointsEarned = 0;
  if (isCorrect) {
    pointsEarned = 10 + Math.floor(state.timeLeft * 0.5);
    state.score += pointsEarned;
    state.correctCount++;
    document.getElementById('quiz-score').textContent = `점수: ${state.score}`;
  }

  // 기록
  state.answers.push({
    id:        q.id,
    correct:   isCorrect,
    timeTaken: Math.round(TIMER_SEC - state.timeLeft),
  });

  setTimeout(() => showFeedback(isCorrect, pointsEarned), 600);
}

/** 즉시 피드백 화면에 정답 여부와 해설을 표시한다. */
function showFeedback(isCorrect, pointsEarned) {
  showScreen('screen-feedback');

  const q      = state.questions[state.currentIndex];
  const isLast = state.currentIndex === state.questions.length - 1;

  // 아이콘
  document.getElementById('feedback-icon').textContent = isCorrect ? '✅' : '❌';

  // 제목
  const titleEl = document.getElementById('feedback-title');
  titleEl.textContent   = isCorrect ? '정답입니다!' : '오답입니다';
  titleEl.style.color   = isCorrect ? 'var(--color-correct)' : 'var(--color-wrong)';

  // 획득 점수 (정답 시만)
  const pointsEl = document.getElementById('feedback-points');
  if (isCorrect) {
    pointsEl.textContent  = `+${pointsEarned}점`;
    pointsEl.style.display = 'block';
  } else {
    pointsEl.style.display = 'none';
  }

  // 정답 텍스트
  document.getElementById('feedback-answer').textContent = `정답: ${q.options[q.answer]}`;

  // 해설
  document.getElementById('feedback-explanation').textContent = q.explanation;

  // 다음 버튼 텍스트
  document.getElementById('feedback-next-btn').textContent = isLast ? '결과 보기' : '다음 문제 →';
}

/** 다음 문제로 이동하거나 결과 화면으로 전환한다. */
function nextQuestion() {
  state.currentIndex++;
  if (state.currentIndex < state.questions.length) {
    loadQuestion();
    showScreen('screen-quiz');
  } else {
    showResult();
  }
}

/** 최종 결과 화면을 렌더링한다. */
function showResult() {
  showScreen('screen-result');

  const total       = state.questions.length;
  const correctRate = Math.round(state.correctCount / total * 100);

  // 정답 수 표시
  document.getElementById('result-correct').textContent = `${state.correctCount} / ${total} 정답`;

  // 등급 계산 및 뱃지
  let grade, gradeLabel, gradeColor;
  if      (correctRate >= 90) { grade = 'S'; gradeLabel = '퀴즈마스터'; gradeColor = '#CA8A04'; }
  else if (correctRate >= 75) { grade = 'A'; gradeLabel = '지식인';     gradeColor = '#2563A8'; }
  else if (correctRate >= 60) { grade = 'B'; gradeLabel = '평균이상';   gradeColor = '#16A34A'; }
  else if (correctRate >= 40) { grade = 'C'; gradeLabel = '분발필요';   gradeColor = '#D97706'; }
  else                        { grade = 'D'; gradeLabel = '도전자';     gradeColor = '#6B7280'; }

  const gradeEl = document.getElementById('result-grade');
  gradeEl.textContent      = `${grade} · ${gradeLabel}`;
  gradeEl.style.background = gradeColor;

  // 카테고리별 성적 집계
  const catStats = {};
  state.questions.forEach((q, i) => {
    if (!catStats[q.category]) catStats[q.category] = { correct: 0, total: 0 };
    catStats[q.category].total++;
    if (state.answers[i]?.correct) catStats[q.category].correct++;
  });

  const tableEl = document.getElementById('result-category-table');
  tableEl.innerHTML = Object.entries(catStats).map(([cat, s]) => {
    const pct   = Math.round(s.correct / s.total * 100);
    const label = CATEGORIES[cat].label;
    const color = CATEGORIES[cat].color;
    return `
      <div class="cat-stat-row">
        <span class="cat-stat-name">${label}</span>
        <span class="cat-stat-score">${s.correct}/${s.total}</span>
        <div class="cat-stat-bar-wrap">
          <div class="cat-stat-bar" style="width:0;background:${color}" data-width="${pct}"></div>
        </div>
      </div>`;
  }).join('');

  // 카테고리 바 애니메이션 (한 프레임 후 실제 너비 적용)
  requestAnimationFrame(() => {
    tableEl.querySelectorAll('.cat-stat-bar').forEach(bar => {
      bar.style.width = bar.dataset.width + '%';
    });
  });

  // 점수 카운트업 애니메이션 (0 → 최종 점수, 800ms)
  const scoreEl    = document.getElementById('result-score');
  const finalScore = state.score;
  const duration   = 800;
  const startTime  = Date.now();
  const tick = () => {
    const elapsed  = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - (1 - progress) ** 3;   // ease-out cubic
    scoreEl.textContent = Math.round(eased * finalScore) + '점';
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  // 등록 버튼 초기화 (재도전 시 중복 등록 방지)
  const saveBtn = document.getElementById('result-save-btn');
  saveBtn.textContent = '순위 등록';
  saveBtn.disabled    = false;
  document.getElementById('result-nickname').value = '';
}

/** 순위표 화면을 렌더링한다. */
function showRanking() {
  showScreen('screen-ranking');

  const rankings = loadRankings();
  const list     = document.getElementById('ranking-list');
  list.innerHTML = '';

  if (rankings.length === 0) {
    list.innerHTML = '<li class="rank-empty">아직 기록이 없어요</li>';
    return;
  }

  const medals = ['🥇', '🥈', '🥉'];
  rankings.slice(0, 10).forEach((r, i) => {
    const li       = document.createElement('li');
    const isMyRank = lastSavedAt !== null && r.playedAt === lastSavedAt;
    if (isMyRank) li.classList.add('my-rank');

    const accuracy = r.totalCount
      ? Math.round(r.correctCount / r.totalCount * 100) + '%'
      : '--';
    const date = new Date(r.playedAt).toLocaleDateString('ko-KR');

    li.innerHTML = `
      <span class="rank-number">${medals[i] ?? i + 1}</span>
      <span class="rank-name">${r.nickname}</span>
      <span class="rank-accuracy">${accuracy}</span>
      <span class="rank-meta">${date}</span>
      <span class="rank-score">${r.score}점</span>
    `;
    list.appendChild(li);
  });
}

/** 닉네임과 점수를 localStorage에 저장한다. */
function saveRanking(nickname, score) {
  try {
    const name = nickname.trim().slice(0, 10) || '익명';
    const rankings = loadRankings();
    lastSavedAt = Date.now();
    rankings.push({
      nickname:     name,
      score,
      correctCount: state.correctCount,
      totalCount:   state.questions.length,
      mode:         state.mode,
      playedAt:     lastSavedAt,
    });
    rankings.sort((a, b) => b.score - a.score);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rankings.slice(0, 10)));
  } catch (e) {
    console.error('순위 저장 실패:', e);
  }
}

/** localStorage에서 순위 데이터를 불러온다. */
function loadRankings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

/** 앱 초기화 — 홈 화면을 표시하고 이벤트를 바인딩한다. */
function init() {
  showScreen('screen-home');

  // 최고 점수 표시
  const rankings = loadRankings();
  if (rankings.length > 0) {
    const el = document.getElementById('best-score');
    el.textContent  = `🏆 최고 점수: ${rankings[0].score}점`;
    el.style.display = 'block';
  }

  // 모드 선택 버튼
  document.getElementById('btn-all').addEventListener('click', () => startGame('all'));
  Object.keys(CATEGORIES).forEach(cat => {
    document.getElementById(`btn-${cat}`).addEventListener('click', () => startGame(cat));
  });

  // 순위표 내비
  document.getElementById('btn-ranking').addEventListener('click', showRanking);
  document.getElementById('ranking-home-btn').addEventListener('click', () => showScreen('screen-home'));

  // 피드백 → 다음 문제
  document.getElementById('feedback-next-btn').addEventListener('click', nextQuestion);

  // 결과 화면
  document.getElementById('result-save-btn').addEventListener('click', () => {
    const nickname = document.getElementById('result-nickname').value;
    saveRanking(nickname, state.score);
    const saveBtn = document.getElementById('result-save-btn');
    saveBtn.textContent = '등록 완료!';
    saveBtn.disabled    = true;
    // 홈 최고 점수 갱신
    const updated = loadRankings();
    if (updated.length > 0) {
      const bestEl = document.getElementById('best-score');
      bestEl.textContent  = `🏆 최고 점수: ${updated[0].score}점`;
      bestEl.style.display = 'block';
    }
  });
  document.getElementById('result-retry-btn').addEventListener('click', () => startGame(state.mode));
  document.getElementById('result-home-btn').addEventListener('click', () => showScreen('screen-home'));
  document.getElementById('result-ranking-btn').addEventListener('click', showRanking);

  // 키보드 단축키
  document.addEventListener('keydown', e => {
    const quizActive     = document.getElementById('screen-quiz').classList.contains('active');
    const feedbackActive = document.getElementById('screen-feedback').classList.contains('active');

    // 퀴즈 화면: 1~4 키로 보기 선택
    if (quizActive) {
      const idx = { '1': 0, '2': 1, '3': 2, '4': 3 }[e.key];
      if (idx !== undefined) {
        const btns = document.querySelectorAll('#quiz-options .option-btn:not([disabled])');
        btns[idx]?.click();
      }
    }

    // 피드백 화면: Space / Enter → 다음 문제
    if (feedbackActive && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      document.getElementById('feedback-next-btn').click();
    }
  });

  console.log('QUESTIONS.length:', QUESTIONS.length);
}

document.addEventListener('DOMContentLoaded', init);

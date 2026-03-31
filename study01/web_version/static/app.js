// Created: 2026-03-19 16:45:20

const canvas     = document.getElementById('canvas');
const ctx        = canvas.getContext('2d');
const statusText = document.getElementById('status-text');
const progressBar= document.getElementById('progress-bar');
const prediction = document.getElementById('prediction');
const confidence = document.getElementById('confidence');
const barsEl     = document.getElementById('bars');
const btnClear   = document.getElementById('btn-clear');
const btnPredict = document.getElementById('btn-predict');

const BRUSH_RADIUS = 14;
let drawing = false;
let modelReady = false;

// ── Canvas init ───────────────────────────────────────────────────────────────

ctx.fillStyle = '#000';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// ── Confidence bars ───────────────────────────────────────────────────────────

const barFills = [];
for (let i = 0; i < 10; i++) {
  const col   = document.createElement('div');
  col.className = 'bar-col';
  const track = document.createElement('div');
  track.className = 'bar-track';
  const fill  = document.createElement('div');
  fill.className = 'bar-fill';
  const label = document.createElement('div');
  label.className = 'bar-label';
  label.textContent = i;
  track.appendChild(fill);
  col.appendChild(track);
  col.appendChild(label);
  barsEl.appendChild(col);
  barFills.push(fill);
}

function updateBars(probs, predicted) {
  probs.forEach((p, i) => {
    barFills[i].style.height = (p * 100).toFixed(1) + '%';
    barFills[i].classList.toggle('active', i === predicted);
  });
}

// ── Training status polling ───────────────────────────────────────────────────

async function pollStatus() {
  try {
    const res  = await fetch('/status');
    const data = await res.json();
    statusText.textContent = data.status;
    progressBar.style.width = data.progress.toFixed(1) + '%';
    modelReady = data.ready;
    if (data.ready) {
      document.getElementById('progress-wrap').style.display = 'none';
    } else {
      setTimeout(pollStatus, 1000);
    }
  } catch {
    statusText.textContent = '서버 연결 실패. 새로고침 해주세요.';
  }
}

pollStatus();

// ── Drawing ───────────────────────────────────────────────────────────────────

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const src  = e.touches ? e.touches[0] : e;
  return { x: src.clientX - rect.left, y: src.clientY - rect.top };
}

function drawCircle(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, BRUSH_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
}

canvas.addEventListener('mousedown',  e => { drawing = true; drawCircle(...Object.values(getPos(e))); });
canvas.addEventListener('mousemove',  e => { if (drawing) drawCircle(...Object.values(getPos(e))); });
canvas.addEventListener('mouseup',    () => { drawing = false; if (modelReady) predict(); });
canvas.addEventListener('mouseleave', () => { if (drawing) { drawing = false; if (modelReady) predict(); } });

canvas.addEventListener('touchstart', e => { e.preventDefault(); drawing = true; drawCircle(...Object.values(getPos(e))); }, { passive: false });
canvas.addEventListener('touchmove',  e => { e.preventDefault(); if (drawing) drawCircle(...Object.values(getPos(e))); }, { passive: false });
canvas.addEventListener('touchend',   e => { e.preventDefault(); drawing = false; if (modelReady) predict(); }, { passive: false });

// ── Predict ───────────────────────────────────────────────────────────────────

async function predict() {
  if (!modelReady) {
    statusText.textContent = '모델 준비 중입니다. 잠시 후 다시 시도하세요.';
    return;
  }

  canvas.toBlob(async (blob) => {
    const form = new FormData();
    form.append('file', blob, 'canvas.png');

    try {
      const res  = await fetch('/predict', { method: 'POST', body: form });
      const data = await res.json();

      if (data.error) {
        statusText.textContent = data.error;
        return;
      }

      prediction.textContent = data.digit;
      confidence.textContent  = `${data.confidence.toFixed(1)}% 확신`;
      statusText.textContent  = `예측: ${data.digit} (${data.confidence.toFixed(1)}%)`;
      updateBars(data.probabilities, data.digit);
    } catch {
      statusText.textContent = '예측 요청 실패.';
    }
  }, 'image/png');
}

// ── Buttons ───────────────────────────────────────────────────────────────────

btnClear.addEventListener('click', () => {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  prediction.textContent = '—';
  confidence.textContent = '';
  statusText.textContent = '캔버스 초기화. 숫자를 그려보세요!';
  barFills.forEach(f => { f.style.height = '0%'; f.classList.remove('active'); });
});

btnPredict.addEventListener('click', predict);

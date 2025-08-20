const API_URL = "https://script.google.com/macros/s/AKfycby9atZYeYgYS-y9DApCervRwFjUIqd5Y1pGb_5nqQ/dev";
const QUESTION_COUNT = 5;
const POINT_PER_QUESTION = 10;

// 画面切り替え
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

// 氏名・学年取得(localStorage想定)
function getUserName() {
  return localStorage.getItem('nickname') || '';
}
function getUserGrade() {
  return localStorage.getItem('grade') || '';
}

// 問題取得
async function fetchQuestions(grade) {
  // トロッコタブから学年一致のデータをGETで取得（仮想例: action=getQuestions&grade=〇）
  const params = new URLSearchParams({
    action: 'getQuestions',
    grade: grade
  });
  const res = await fetch(`${API_URL}?${params.toString()}`);
  const data = await res.json();
  // data.questionsが [ {question, choice1, choice2, answer}, ... ] の形を仮定
  return data.questions || [];
}

// スコア保存
async function saveScore(nickname, score) {
  const res = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "saveScore",
      nickname: nickname,
      score: score
    }),
    headers: { "Content-Type": "application/json" }
  });
  const data = await res.json();
  return data;
}

// ゲーム本体
let questions = [];
let currentIndex = 0;
let correctCount = 0;

function startGame() {
  const nickname = getUserName();
  const grade = getUserGrade();

  if (!nickname) {
    alert("氏名が未登録です。map6に戻ります。");
    location.href = "map6.html";
    return;
  }
  showScreen("game-screen");
  currentIndex = 0;
  correctCount = 0;
  document.getElementById('score-text').textContent = '';

  fetchQuestions(grade).then(qs => {
    if (!qs.length) {
      alert('問題データがありません。map6に戻ります。');
      location.href = "map6.html";
      return;
    }
    // ランダムにQUESTION_COUNT件選ぶ
    questions = qs.sort(() => Math.random() - 0.5).slice(0, QUESTION_COUNT);
    showQuestion();
  });
}

function showQuestion() {
  if (currentIndex >= questions.length) {
    endGame();
    return;
  }
  const q = questions[currentIndex];
  document.getElementById('question-text').textContent = q.question;
  document.getElementById('choice1-btn').textContent = q.choice1;
  document.getElementById('choice2-btn').textContent = q.choice2;
  document.getElementById('result-text').textContent = '';
  document.getElementById('score-text').textContent = `正解数: ${correctCount}`;
}

function selectChoice(num) {
  const q = questions[currentIndex];
  let selected = num === 1 ? q.choice1 : q.choice2;
  let isCorrect = selected === q.answer;

  if (isCorrect) {
    correctCount++;
    document.getElementById('result-text').textContent = '正解！';
    currentIndex++;
    setTimeout(showQuestion, 1000);
    if (correctCount >= QUESTION_COUNT) {
      setTimeout(endGame, 1000);
    }
  } else {
    document.getElementById('result-text').textContent = '不正解…';
    setTimeout(endGame, 1000);
  }
}

function endGame() {
  showScreen("end-screen");
  const score = correctCount * POINT_PER_QUESTION;
  document.getElementById('final-score').textContent = `スコア: ${score}点`;

  // スコア保存
  const nickname = getUserName();
  saveScore(nickname, score).then(data => {
    if (data.status !== 'success') {
      alert('スコア保存に失敗しました。map6に戻ります。');
      location.href = "map6.html";
    }
  });
}

document.getElementById('start-btn').onclick = startGame;
document.getElementById('choice1-btn').onclick = () => selectChoice(1);
document.getElementById('choice2-btn').onclick = () => selectChoice(2);
document.getElementById('return-title-btn').onclick = () => showScreen('title-screen');

// 初期画面表示
showScreen("title-screen");
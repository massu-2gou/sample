const GAS_URL = 'https://script.google.com/macros/s/AKfycbyuGrOaIB4_xouWjfzSFBG5vKOiUlFJsgn1dEnNV6PGsrlfwUSmGHyyLtMC3e6JxME/exec';

// ニックネームと学年を取得
function getUserInfo() {
  const nickname = document.getElementById('nickname').value.trim();
  const grade = document.getElementById('grade').value;
  return { nickname, grade };
}

// キーワード保存
async function saveKeyword() {
  clearMessages();
  const { nickname, grade } = getUserInfo();
  const keyword = document.getElementById('keywordInput').value.trim();

  if (!nickname) {
    showError('ニックネームを入力してください。');
    return;
  }
  if (!grade) {
    showError('学年を選択してください。');
    return;
  }
  if (!keyword) {
    showError('キーワードを入力してください。');
    return;
  }

  const payload = {
    action: 'saveKeyword',
    nickname,
    keyword,
    grade
  };

  try {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (data.status === 'success') {
      showStatus('キーワードを保存しました。');
      document.getElementById('keywordInput').value = '';
      loadMyKeywords();
    } else {
      showError('保存に失敗しました。');
    }
  } catch (error) {
    showError('通信エラーが発生しました。');
  }
}

// 自分のキーワードを取得・表示
async function loadMyKeywords() {
  clearMessages();
  const { nickname, grade } = getUserInfo();
  if (!nickname) {
    document.getElementById('myKeywords').textContent = 'ニックネームを入力してください。';
    return;
  }

  const url = new URL(GAS_URL);
  url.searchParams.append('action', 'getKeywords');
  url.searchParams.append('nickname', nickname);
  url.searchParams.append('grade', grade);

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 'success') {
      const keywords = data.keywords;
      if (keywords.length === 0) {
        document.getElementById('myKeywords').textContent = 'まだキーワードがありません。';
        return;
      }
      const list = keywords.map(row => {
        const date = new Date(row[2]);
        return `<div>・${row[1]} （${date.toLocaleString()}）</div>`;
      }).join('');
      document.getElementById('myKeywords').innerHTML = list;
    } else {
      document.getElementById('myKeywords').textContent = 'キーワードの取得に失敗しました。';
    }
  } catch (error) {
    document.getElementById('myKeywords').textContent = '通信エラーが発生しました。';
  }
}

function showStatus(msg) {
  const el = document.getElementById('statusMessage');
  el.textContent = msg;
  el.style.color = 'green';
}

function showError(msg) {
  const el = document.getElementById('errorMessage');
  el.textContent = msg;
  el.style.color = 'red';
}

function clearMessages() {
  document.getElementById('statusMessage').textContent = '';
  document.getElementById('errorMessage').textContent = '';
}

// ボタンイベント設定
document.getElementById('saveKeywordBtn').addEventListener('click', saveKeyword);

// ニックネーム・学年が変わったらキーワード読み込み更新
document.getElementById('nickname').addEventListener('change', loadMyKeywords);
document.getElementById('grade').addEventListener('change', loadMyKeywords);

// トップページへ戻る
document.getElementById('goToIndexBtn').addEventListener('click', () => {
  window.location.href = 'index.html';
});

// ページロード時にキーワード読み込み
window.addEventListener('load', () => {
  loadMyKeywords();
});

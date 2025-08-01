const gasUrl = 'https://script.google.com/macros/s/AKfycbyuGrOaIB4_xouWjfzSFBG5vKOiUlFJsgn1dEnNV6PGsrlfwUSmGHyyLtMC3e6JxME/exec';

// ページ分岐（index.html）
const goToReflectionBtn = document.getElementById('goToReflection');
const goToKobakitalandBtn = document.getElementById('goToKobakitaland');
const registerBtn = document.getElementById('registerNickname');

if (goToReflectionBtn) {
    goToReflectionBtn.addEventListener('click', () => verifyNicknameAndRedirect('reflection.html'));
}
if (goToKobakitalandBtn) {
    goToKobakitalandBtn.addEventListener('click', () => verifyNicknameAndRedirect('kobakitaland/kobakitaland.html'));
}
if (registerBtn) {
    registerBtn.addEventListener('click', registerNickname);
}

async function verifyNicknameAndRedirect(targetPage) {
    const nickname = document.getElementById('nicknameInput').value.trim();
    const status = document.getElementById('statusMessage');

    if (!nickname) {
        status.textContent = 'ニックネームを入力してください。';
        status.style.color = 'red';
        return;
    }

    status.textContent = 'かくにん中...';
    status.style.color = 'black';

    try {
        const response = await fetch(`${gasUrl}?action=getKeywords&nickname=${encodeURIComponent(nickname)}`);
        const data = await response.json();

        if (data.status === 'success' && data.keywords.length > 0) {
            localStorage.setItem('nickname', nickname);
            status.textContent = '';
            window.location.href = targetPage;
        } else {
            status.textContent = 'もしかして初めて？下の四角にニックネームを入れてね。';
            status.style.color = 'red';
        }
    } catch (error) {
        status.textContent = '確認中にエラーが発生しました。';
        status.style.color = 'red';
        console.error(error);
    }
}

async function registerNickname() {
    const newNickname = document.getElementById('newNicknameInput').value.trim();
    const status = document.getElementById('statusMessage');

    if (!newNickname) {
        status.textContent = '新しいニックネームを入力してください。';
        status.style.color = 'red';
        return;
    }

    status.textContent = '登録確認中...';
    status.style.color = 'black';

    try {
        const response = await fetch(`${gasUrl}?action=getKeywords&nickname=${encodeURIComponent(newNickname)}`);
        const data = await response.json();

        if (data.status === 'success' && data.keywords.length === 0) {
            const saveResponse = await fetch(gasUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                },
                body: JSON.stringify({
                    action: 'newdata',
                    nickname: newNickname,
                    keyword: '初回登録'
                })
            });

            const saveData = await saveResponse.json();

            if (saveData.status === 'success') {
                localStorage.setItem('nickname', newNickname);
                window.location.href = 'reflection.html';
            } else {
                status.textContent = '登録に失敗しました。';
                status.style.color = 'red';
            }
        } else {
            status.textContent = 'このニックネームは既に使われています。別の名前にしてください。';
            status.style.color = 'red';
        }
    } catch (error) {
        status.textContent = '登録処理中にエラーが発生しました。';
        status.style.color = 'red';
        console.error(error);
    }
}

// reflection.html の処理
const saveKeywordBtn = document.getElementById('saveKeyword');
if (saveKeywordBtn) {
    saveKeywordBtn.addEventListener('click', async () => {
        const nicknameInput = document.getElementById('nickname');
        const keywordInput = document.getElementById('keywordInput');
        const saveStatus = document.getElementById('saveStatus');

        const nickname = nicknameInput.value.trim();
        const keyword = keywordInput.value.trim();

        if (!nickname || !keyword) {
            saveStatus.textContent = 'ニックネームとキーワードを入力してください。';
            saveStatus.style.color = 'red';
            return;
        }

        saveStatus.textContent = '保存中...';
        saveStatus.style.color = 'blue';

        try {
            const response = await fetch(gasUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                },
                body: JSON.stringify({
                    action: 'saveKeyword',
                    nickname: nickname,
                    keyword: keyword
                })
            });

            const data = await response.json();

            if (data.status === 'success') {
                saveStatus.textContent = 'キーワードが保存されました！';
                saveStatus.style.color = 'green';
                keywordInput.value = '';
            } else {
                saveStatus.textContent = '保存に失敗しました。' + (data.message || '');
                saveStatus.style.color = 'red';
            }
        } catch (error) {
            console.error('保存エラー:', error);
            saveStatus.textContent = '保存中にエラーが発生しました。ネットワーク接続を確認してください。';
            saveStatus.style.color = 'red';
        }
    });
}

// キーワード表示処理
const showKeywordsBtn = document.getElementById('showKeywords');
if (showKeywordsBtn) {
    showKeywordsBtn.addEventListener('click', async () => {
        const displayNicknameInput = document.getElementById('displayNickname');
        const keywordListContainer = document.getElementById('keywordListContainer');
        const displayStatus = document.getElementById('displayStatus');

        const nicknameToDisplay = displayNicknameInput.value.trim();

        if (!nicknameToDisplay) {
            displayStatus.textContent = 'ニックネームを入力してください。';
            displayStatus.style.color = 'red';
            return;
        }

        displayStatus.textContent = 'キーワードを取得中...';
        displayStatus.style.color = 'blue';
        keywordListContainer.innerHTML = '';

        try {
            const response = await fetch(`${gasUrl}?action=getKeywords&nickname=${encodeURIComponent(nicknameToDisplay)}`);
            const data = await response.json();

            if (data.status === 'success') {
                if (data.keywords.length > 0) {
                    const ul = document.createElement('ul');
                    data.keywords.forEach(item => {
                        const li = document.createElement('li');
                        const timestamp = new Date(item[2]);
                        const formattedDate = timestamp.toLocaleDateString('ja-JP').replace(/\//g, '.');
                        li.textContent = `[${formattedDate}] ${item[1]}`;
                        ul.appendChild(li);
                    });
                    keywordListContainer.appendChild(ul);
                    displayStatus.textContent = `${nicknameToDisplay}さんのキーワードを表示しました。`;
                    displayStatus.style.color = 'green';
                } else {
                    displayStatus.textContent = `${nicknameToDisplay}さんのキーワードは見つかりませんでした。`;
                    displayStatus.style.color = 'orange';
                }
            } else {
                displayStatus.textContent = '取得に失敗しました。' + (data.message || '');
                displayStatus.style.color = 'red';
            }
        } catch (error) {
            console.error('取得エラー:', error);
            displayStatus.textContent = 'キーワード取得中にエラーが発生しました。ネットワーク接続を確認してください。';
            displayStatus.style.color = 'red';
        }
    });
}

// localStorage の復元
window.addEventListener('DOMContentLoaded', () => {
    const savedNickname = localStorage.getItem('nickname');
    if (savedNickname) {
        const nicknameField = document.getElementById('nickname');
        const displayNicknameField = document.getElementById('displayNickname');
        if (nicknameField) nicknameField.value = savedNickname;
        if (displayNicknameField) displayNicknameField.value = savedNickname;
    }
});

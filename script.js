const gasUrl = 'https://script.google.com/macros/s/AKfycbyuGrOaIB4_xouWjfzSFBG5vKOiUlFJsgn1dEnNV6PGsrlfwUSmGHyyLtMC3e6JxME/exec';

document.getElementById('checkNickname').addEventListener('click', async () => {
    const nickname = document.getElementById('nicknameInput').value.trim();
    const status = document.getElementById('statusMessage');

    if (!nickname) {
        status.textContent = 'ニックネームを入力してください。';
        status.style.color = 'red';
        return;
    }

    status.textContent = '確認中...';
    status.style.color = 'black';

    try {
        const response = await fetch(`${gasUrl}?action=getKeywords&nickname=${encodeURIComponent(nickname)}`);
        const data = await response.json();

        if (data.status === 'success' && data.keywords.length > 0) {
            localStorage.setItem('nickname', nickname);
            window.location.href = 'reflection.html';
        } else {
            status.textContent = 'このニックネームは登録されていません。新しく始める方は下の欄から登録してください。';
            status.style.color = 'orange';
        }
    } catch (error) {
        status.textContent = '確認中にエラーが発生しました。';
        status.style.color = 'red';
        console.error(error);
    }
});

document.getElementById('registerNickname').addEventListener('click', async () => {
    const newNickname = document.getElementById('newNicknameInput').value.trim();
    const status = document.getElementById('statusMessage');

    if (!newNickname) {
        status.textContent = '新しいニックネームを入力してください。';
        status.style.color = 'red';
        return;
    }

    // 既に存在していないか確認（重複防止）
    status.textContent = '登録確認中...';

    try {
        const response = await fetch(`${gasUrl}?action=getKeywords&nickname=${encodeURIComponent(newNickname)}`);
        const data = await response.json();

        if (data.status === 'success' && data.keywords.length === 0) {
            // 新しいニックネームとして受け付ける
            localStorage.setItem('nickname', newNickname);
            window.location.href = 'reflection.html';
        } else {
            status.textContent = 'このニックネームは既に使われています。別の名前にしてください。';
            status.style.color = 'red';
        }
    } catch (error) {
        status.textContent = '登録確認中にエラーが発生しました。';
        status.style.color = 'red';
        console.error(error);
    }
});


// --- GAS WebアプリのURL ---
const gasWebAppUrl = 'https://script.google.com/macros/s/AKfycbyuGrOaIB4_xouWjfzSFBG5vKOiUlFJsgn1dEnNV6PGsrlfwUSmGHyyLtMC3e6JxME/exec';

// --- キーワード保存機能 ---
document.getElementById('saveKeyword').addEventListener('click', async () => {
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
        const response = await fetch(gasWebAppUrl, {
            method: 'POST',
            // GAS WebアプリへのPOSTはtext/plain;charset=utf-8が一般的です。
            // JSON形式でデータを送るため、Content-Typeを適切に設定します。
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify({
                action: 'saveKeyword', // GAS側で処理を分岐するためのアクション名
                nickname: nickname,
                keyword: keyword
            })
        });

        const data = await response.json();

        if (data.status === 'success') {
            saveStatus.textContent = 'キーワードが保存されました！';
            saveStatus.style.color = 'green';
            keywordInput.value = ''; // 入力欄をクリア
            // nicknameInput.value = '';
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

// --- キーワード表示機能 ---
document.getElementById('showKeywords').addEventListener('click', async () => {
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
    keywordListContainer.innerHTML = ''; // 以前のリストをクリア

    try {
        // GETリクエストでニックネームとアクションをクエリパラメータとして渡す
        const response = await fetch(${gasWebAppUrl}?action=getKeywords&nickname=${encodeURIComponent(nicknameToDisplay)});
        const data = await response.json();

        if (data.status === 'success' && data.keywords && data.keywords.length > 0) {
            const ul = document.createElement('ul');
            data.keywords.forEach(item => {
                const li = document.createElement('li');
                // GASから返されるデータ形式に合わせてインデックスを調整してください
                // 例: [ニックネーム, キーワード, タイムスタンプ]
                const timestamp = new Date(item[2]); // タイムスタンプは配列の3番目 (インデックス2)
                const formattedDate = timestamp.toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }).replace(/\//g, '.'); // YYYY.MM.DD形式に変換

                li.textContent = [${formattedDate}] ${item[1]}; // キーワードは配列の2番目 (インデックス1)
                ul.appendChild(li);
            });
            keywordListContainer.appendChild(ul);
            displayStatus.textContent = ${nicknameToDisplay}さんのキーワードを表示しました。;
            displayStatus.style.color = 'green';
        } else if (data.status === 'success' && data.keywords && data.keywords.length === 0) {
            displayStatus.textContent = ${nicknameToDisplay}さんのキーワードは見つかりませんでした。;
            displayStatus.style.color = 'orange';
        } else {
            displayStatus.textContent = 'キーワードの取得に失敗しました。' + (data.message || '');
            displayStatus.style.color = 'red';
        }
    } catch (error) {
        console.error('取得エラー:', error);
        displayStatus.textContent = 'キーワード取得中にエラーが発生しました。ネットワーク接続を確認してください。';
        displayStatus.style.color = 'red';
    }
});

// --- アコーディオンメニュー機能 ---
const accordionTitles = document.querySelectorAll('.accordion_title');

accordionTitles.forEach(title => {
    title.addEventListener('click', () => {
        const accordionItem = title.closest('.accordion_item');

        // .activeクラスがすでにあれば削除、なければ追加
        accordionItem.classList.toggle('active');

        // 他のアコーディオンを閉じる（オプション）
        accordionTitles.forEach(otherTitle => {
            const otherAccordionItem = otherTitle.closest('.accordion_item');
            if (otherAccordionItem !== accordionItem && otherAccordionItem.classList.contains('active')) {
                otherAccordionItem.classList.remove('active');
            }
        });
    });
});

// ページ読み込み時にlocalStorageからニックネームを読み込む
window.addEventListener('DOMContentLoaded', () => {
    const savedNickname = localStorage.getItem('nickname');
    if (savedNickname) {
        const nicknameField = document.getElementById('nickname');
        const displayNicknameField = document.getElementById('displayNickname');
        if (nicknameField) nicknameField.value = savedNickname;
        if (displayNicknameField) displayNicknameField.value = savedNickname;
    }
});

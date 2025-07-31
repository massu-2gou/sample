// --- GAS WebアプリのURL ---
const gasWebAppUrl = 'https://script.google.com/macros/s/AKfycbyuGrOaIB4_xouWjfzSFBG5vKOiUlFJsgn1dEnNV6PGsrlfwUSmGHyyLtMC3e6JxME/exec';

// --- キーワード保存機能 ---
document.getElementById('saveKeyword').addEventListener('click', async () => {
    const keyword = document.getElementById('keywordInput').value.trim();
    const saveStatus = document.getElementById('saveStatus');

    if (!keyword) {
        saveStatus.textContent = 'キーワードを入力してください。';
        saveStatus.style.color = 'red';
        return;
    }

    saveStatus.textContent = '保存中...';

    try {
        const response = await fetch('【GASのWebAppURL】', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify({ keyword }) // nicknameは送らない
        });

        const data = await response.json();
        if (data.status === 'success') {
            saveStatus.textContent = 'キーワードが保存されました！';
            saveStatus.style.color = 'green';
        } else {
            saveStatus.textContent = '保存に失敗しました。';
            saveStatus.style.color = 'red';
        }
    } catch (err) {
        saveStatus.textContent = '通信エラーが発生しました。';
        saveStatus.style.color = 'red';
    }
});


// --- キーワード表示機能 ---
document.getElementById('showKeywords').addEventListener('click', async () => {
    const displayStatus = document.getElementById('displayStatus');
    const container = document.getElementById('keywordListContainer');

    displayStatus.textContent = '読み込み中...';
    container.innerHTML = '';

    try {
        const response = await fetch(`【GASのWebAppURL】?action=getKeywords`);
        const data = await response.json();

        if (data.status === 'success') {
            const ul = document.createElement('ul');
            data.keywords.forEach(row => {
                const li = document.createElement('li');
                li.textContent = `[${new Date(row[2]).toLocaleDateString()}] ${row[1]}`;
                ul.appendChild(li);
            });
            container.appendChild(ul);
            displayStatus.textContent = 'あなたのキーワードを表示しました。';
        } else {
            displayStatus.textContent = 'キーワードが見つかりません。';
        }
    } catch (e) {
        displayStatus.textContent = '読み込みエラーが発生しました。';
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


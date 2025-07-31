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

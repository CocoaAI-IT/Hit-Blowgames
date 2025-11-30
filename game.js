// ========================================
// ゲーム設定と状態管理
// ========================================

const LEVEL_CONFIG = {
    1: { slots: 4, attempts: 8, name: "レベル1" },
    2: { slots: 5, attempts: 8, name: "レベル2" },
    3: { slots: 6, attempts: 8, name: "レベル3" }
};

const GAME_CONFIG = {
    COLORS: ["red", "blue", "green", "yellow", "purple", "orange"]
};

const gameState = {
    currentLevel: 1,
    maxAttempts: 8,
    slotCount: 4,
    currentAttempt: 0,
    currentSlotIndex: 0,
    selectedColor: null,
    solution: []
};

// ========================================
// ゲームロジック（純粋関数）
// ========================================

/**
 * ランダムな色を取得
 * @returns {string} ランダムに選択された色
 */
function getRandomColor() {
    return GAME_CONFIG.COLORS[Math.floor(Math.random() * GAME_CONFIG.COLORS.length)];
}

/**
 * 解答を生成
 * @param {number} slotCount - スロット数
 * @returns {string[]} ランダムな色の配列
 */
function generateSolution(slotCount) {
    return Array.from({ length: slotCount }, () => getRandomColor());
}

/**
 * 推測と解答を比較してHit/Blowを計算
 * @param {string[]} guess - プレイヤーの推測
 * @param {string[]} solution - 正解
 * @returns {{hits: number, blows: number}} Hit数とBlow数
 */
function checkGuess(guess, solution) {
    let hits = 0;
    let blows = 0;
    const solutionCopy = [...solution];

    // Hitのカウント（色と位置が一致）
    guess.forEach((color, index) => {
        if (color === solution[index]) {
            hits++;
            solutionCopy[index] = null; // カウント済みとしてマーク
        }
    });

    // Blowのカウント（色のみ一致）
    guess.forEach((color, index) => {
        if (color !== solution[index] && solutionCopy.includes(color)) {
            blows++;
            solutionCopy[solutionCopy.indexOf(color)] = null; // カウント済みとしてマーク
        }
    });

    return { hits, blows };
}

/**
 * ゲームが終了したかチェック
 * @param {number} hits - Hit数
 * @param {number} currentAttempt - 現在の試行回数
 * @returns {{isComplete: boolean, isSuccess: boolean}} ゲーム終了状態
 */
function isGameComplete(hits, currentAttempt) {
    const isSuccess = hits === gameState.slotCount;
    const isMaxAttempts = currentAttempt >= gameState.maxAttempts - 1;
    return {
        isComplete: isSuccess || isMaxAttempts,
        isSuccess: isSuccess
    };
}

// ========================================
// 画面遷移
// ========================================

/**
 * ホーム画面を表示
 */
function showHomeScreen() {
    document.getElementById("home-screen").style.display = "flex";
    document.getElementById("game-container").style.display = "none";
}

/**
 * ゲーム画面を表示
 */
function showGameScreen() {
    document.getElementById("home-screen").style.display = "none";
    document.getElementById("game-container").style.display = "flex";
}

// ========================================
// 動的DOM生成
// ========================================

/**
 * 試行スロットのHTMLを生成
 * @param {number} attemptIndex - 試行インデックス
 * @param {number} slotCount - スロット数
 * @returns {string} HTML文字列
 */
function createAttemptHTML(attemptIndex, slotCount) {
    const slots = Array.from({ length: slotCount }, (_, i) =>
        `<div class="slot" data-index="${i}"></div>`
    ).join('');

    const dots = Array.from({ length: slotCount }, () =>
        `<div class="dot"></div>`
    ).join('');

    return `
        <div class="attempt" data-attempt="${attemptIndex}">
            ${slots}
            <div class="result">
                <button class="ok-button">OK</button>
                ${dots}
            </div>
        </div>
    `;
}

/**
 * ゲーム画面を構築
 * @param {number} level - レベル
 */
function buildGameScreen(level) {
    const config = LEVEL_CONFIG[level];
    gameState.currentLevel = level;
    gameState.maxAttempts = config.attempts;
    gameState.slotCount = config.slots;

    // レベル表示を更新
    document.getElementById("current-level").textContent = `- ${config.name}`;

    // 解答スロットを生成
    const solutionContainer = document.getElementById("solution");
    solutionContainer.innerHTML = Array.from({ length: config.slots }, () =>
        '<div class="solution-slot"></div>'
    ).join('');

    // 試行スロットを生成
    const attemptsContainer = document.getElementById("attempts-container");
    const attemptsHTML = Array.from({ length: config.attempts }, (_, i) =>
        createAttemptHTML(config.attempts - 1 - i, config.slots)
    ).join('');
    attemptsContainer.innerHTML = attemptsHTML;

    // 結果表示のグリッドを調整
    adjustResultGrid(config.slots);
}

/**
 * 結果表示のグリッドを調整
 * @param {number} slotCount - スロット数
 */
function adjustResultGrid(slotCount) {
    const style = document.createElement('style');
    style.id = 'dynamic-result-style';

    // 既存のスタイルを削除
    const existingStyle = document.getElementById('dynamic-result-style');
    if (existingStyle) {
        existingStyle.remove();
    }

    // スロット数に応じてグリッドとサイズを調整
    let gridColumns, gridRows, width, height;

    if (slotCount === 4) {
        gridColumns = 'repeat(2, 1fr)';
        gridRows = 'repeat(2, 1fr)';
        width = height = '40px';
    } else if (slotCount === 5) {
        // サイコロの5の配置: 3x3グリッド
        gridColumns = 'repeat(3, 1fr)';
        gridRows = 'repeat(3, 1fr)';
        width = height = '60px';
    } else if (slotCount === 6) {
        // サイコロの6の配置: 2列3行
        gridColumns = 'repeat(2, 1fr)';
        gridRows = 'repeat(3, 1fr)';
        width = '40px';
        height = '60px';
    }

    let dotPositions = '';

    // スロット数に応じたドットの配置を設定
    if (slotCount === 5) {
        // サイコロの5: 四隅と中央
        dotPositions = `
            .dot:nth-child(2) { grid-area: 1 / 1; }  /* 左上 */
            .dot:nth-child(3) { grid-area: 1 / 3; }  /* 右上 */
            .dot:nth-child(4) { grid-area: 2 / 2; }  /* 中央 */
            .dot:nth-child(5) { grid-area: 3 / 1; }  /* 左下 */
            .dot:nth-child(6) { grid-area: 3 / 3; }  /* 右下 */
        `;
    } else if (slotCount === 6) {
        // サイコロの6: 左右3つずつ
        dotPositions = `
            .dot:nth-child(2) { grid-area: 1 / 1; }  /* 左上 */
            .dot:nth-child(3) { grid-area: 2 / 1; }  /* 左中 */
            .dot:nth-child(4) { grid-area: 3 / 1; }  /* 左下 */
            .dot:nth-child(5) { grid-area: 1 / 2; }  /* 右上 */
            .dot:nth-child(6) { grid-area: 2 / 2; }  /* 右中 */
            .dot:nth-child(7) { grid-area: 3 / 2; }  /* 右下 */
        `;
    }

    style.textContent = `
        .result {
            display: grid;
            grid-template-columns: ${gridColumns};
            grid-template-rows: ${gridRows};
            width: ${width};
            height: ${height};
        }

        .ok-button {
            width: ${width};
            height: ${height};
            line-height: ${height};
        }

        ${dotPositions}

        /* スマホ対応 */
        @media (max-width: 768px) {
            .result {
                width: ${slotCount === 4 ? '35px' : slotCount === 5 ? '52px' : '35px'};
                height: ${slotCount === 4 ? '35px' : slotCount === 5 ? '52px' : '52px'};
            }

            .ok-button {
                width: ${slotCount === 4 ? '35px' : slotCount === 5 ? '52px' : '35px'};
                height: ${slotCount === 4 ? '35px' : slotCount === 5 ? '52px' : '52px'};
                line-height: ${slotCount === 4 ? '35px' : slotCount === 5 ? '52px' : '52px'};
                font-size: 12px;
            }
        }

        @media (max-width: 480px) {
            .result {
                width: ${slotCount === 4 ? '30px' : slotCount === 5 ? '45px' : '30px'};
                height: ${slotCount === 4 ? '30px' : slotCount === 5 ? '45px' : '45px'};
            }

            .ok-button {
                width: ${slotCount === 4 ? '30px' : slotCount === 5 ? '45px' : '30px'};
                height: ${slotCount === 4 ? '30px' : slotCount === 5 ? '45px' : '45px'};
                line-height: ${slotCount === 4 ? '30px' : slotCount === 5 ? '45px' : '45px'};
                font-size: 10px;
            }
        }
    `;
    document.head.appendChild(style);
}

// ========================================
// UI操作（DOM操作）
// ========================================

/**
 * 現在のスロットをハイライト
 */
function highlightCurrentSlot() {
    const attemptSlots = getAttemptSlots(gameState.currentAttempt);
    attemptSlots.forEach((slot, index) => {
        slot.classList.toggle("highlight", index === gameState.currentSlotIndex);
    });
}

/**
 * スロットにボールを配置
 * @param {string} color - 配置する色
 */
function placeBallInSlot(color) {
    const attemptSlots = getAttemptSlots(gameState.currentAttempt);
    const currentSlot = attemptSlots[gameState.currentSlotIndex];

    currentSlot.style.backgroundColor = color;
    currentSlot.dataset.color = color;

    // 次のスロットに移動
    gameState.currentSlotIndex = (gameState.currentSlotIndex + 1) % gameState.slotCount;
    highlightCurrentSlot();

    // すべてのスロットが埋まったらOKボタンを表示
    if (isAttemptComplete(attemptSlots)) {
        showOkButton(gameState.currentAttempt);
    }
}

/**
 * 結果表示を更新
 * @param {HTMLElement} resultDisplay - 結果表示要素
 * @param {number} hits - Hit数
 * @param {number} blows - Blow数
 */
function updateResultDisplay(resultDisplay, hits, blows) {
    const dots = resultDisplay.querySelectorAll(".dot");
    dots.forEach((dot, index) => {
        if (index < hits) {
            // Hit表示（赤丸）- 黒丸と同じサイズで統一
            setDotStyle(dot, "red", "12px", "1px solid black");
        } else if (index < hits + blows) {
            // Blow表示（白丸）- 黒丸と同じサイズで統一
            setDotStyle(dot, "white", "12px", "1px solid black");
        } else {
            // 未使用（黒丸）
            setDotStyle(dot, "black", "12px", "none");
        }
    });
}

/**
 * ドットのスタイルを設定
 * @param {HTMLElement} dot - ドット要素
 * @param {string} color - 背景色
 * @param {string} size - サイズ
 * @param {string} border - ボーダー
 */
function setDotStyle(dot, color, size, border) {
    dot.style.backgroundColor = color;
    dot.style.width = size;
    dot.style.height = size;
    dot.style.border = border;
}

/**
 * 解答を表示
 */
function revealSolution() {
    const solutionSlots = document.querySelectorAll(".solution-slot");
    gameState.solution.forEach((color, index) => {
        solutionSlots[index].style.backgroundColor = color;
    });
}

/**
 * ポップアップを表示
 * @param {string} message - 表示するメッセージ
 * @param {boolean} isSuccess - 成功したかどうか
 */
function showPopup(message, isSuccess = false) {
    const popup = document.getElementById("popup");
    const popupMessage = document.getElementById("popup-message");
    const popupIcon = document.getElementById("popup-icon");

    popupMessage.textContent = message;

    // アイコンを設定
    if (isSuccess) {
        popupIcon.innerHTML = '<i data-lucide="trophy" style="color: #ffd700; width: 80px; height: 80px;"></i>';
    } else {
        popupIcon.innerHTML = '<i data-lucide="x-circle" style="color: #dc3545; width: 80px; height: 80px;"></i>';
    }

    popup.style.display = "block";

    // Lucideアイコンを初期化
    if (window.lucide) {
        lucide.createIcons();
    }
}

/**
 * 確認ポップアップを表示
 */
function showConfirmPopup() {
    const confirmPopup = document.getElementById("confirm-popup");
    confirmPopup.style.display = "block";
}

/**
 * 確認ポップアップを非表示
 */
function hideConfirmPopup() {
    const confirmPopup = document.getElementById("confirm-popup");
    confirmPopup.style.display = "none";
}

/**
 * OKボタンを表示
 * @param {number} attemptIndex - 試行インデックス
 */
function showOkButton(attemptIndex) {
    const okButton = getOkButton(attemptIndex);
    okButton.style.display = "block";
    okButton.addEventListener("click", handleOkButtonClick, { once: true });
}

/**
 * OKボタンを非表示
 * @param {number} attemptIndex - 試行インデックス
 */
function hideOkButton(attemptIndex) {
    const okButton = getOkButton(attemptIndex);
    okButton.style.display = "none";
}

/**
 * スロットのハイライトをリセット
 * @param {number} attemptIndex - 試行インデックス
 */
function resetSlotHighlight(attemptIndex) {
    const attemptSlots = getAttemptSlots(attemptIndex);
    attemptSlots.forEach((slot) => {
        slot.style.transform = "scale(1)";
        slot.classList.remove("highlight");
    });
}

// ========================================
// ヘルパー関数（DOM取得）
// ========================================

/**
 * 指定された試行のスロットを取得
 * @param {number} attemptIndex - 試行インデックス
 * @returns {NodeListOf<Element>} スロット要素のリスト
 */
function getAttemptSlots(attemptIndex) {
    const dataAttempt = gameState.maxAttempts - 1 - attemptIndex;
    return document.querySelectorAll(`.attempt[data-attempt="${dataAttempt}"] .slot`);
}

/**
 * 指定された試行のOKボタンを取得
 * @param {number} attemptIndex - 試行インデックス
 * @returns {Element} OKボタン要素
 */
function getOkButton(attemptIndex) {
    const dataAttempt = gameState.maxAttempts - 1 - attemptIndex;
    return document.querySelector(`.attempt[data-attempt="${dataAttempt}"] .ok-button`);
}

/**
 * 指定された試行の結果表示要素を取得
 * @param {number} attemptIndex - 試行インデックス
 * @returns {Element} 結果表示要素
 */
function getResultDisplay(attemptIndex) {
    const dataAttempt = gameState.maxAttempts - 1 - attemptIndex;
    return document.querySelector(`.attempt[data-attempt="${dataAttempt}"] .result`);
}

/**
 * 試行のすべてのスロットが埋まっているかチェック
 * @param {NodeListOf<Element>} attemptSlots - スロット要素のリスト
 * @returns {boolean} すべてのスロットが埋まっている場合true
 */
function isAttemptComplete(attemptSlots) {
    return Array.from(attemptSlots).every((slot) => slot.dataset.color);
}

// ========================================
// イベントハンドラー
// ========================================

/**
 * レベル選択時のハンドラー
 * @param {Event} event - クリックイベント
 */
function handleLevelSelect(event) {
    const levelCard = event.target.closest('.level-card');
    if (!levelCard) return;

    const level = parseInt(levelCard.dataset.level);
    startGame(level);
}

/**
 * ボール選択時のハンドラー
 * @param {Event} event - クリックイベント
 */
function handleBallClick(event) {
    const ball = event.target;
    if (!ball.classList.contains('ball')) return;

    gameState.selectedColor = ball.dataset.color;
    placeBallInSlot(gameState.selectedColor);
}

/**
 * スロットクリック時のハンドラー
 * @param {Event} event - クリックイベント
 */
function handleSlotClick(event) {
    const slot = event.target;
    if (!slot.classList.contains('slot')) return;

    const attemptElement = slot.closest(".attempt");
    const dataAttempt = parseInt(attemptElement.dataset.attempt);

    // 現在の試行のみクリック可能
    if (dataAttempt === gameState.maxAttempts - 1 - gameState.currentAttempt) {
        const attemptSlots = attemptElement.querySelectorAll(".slot");
        gameState.currentSlotIndex = Array.from(attemptSlots).indexOf(slot);
        highlightCurrentSlot();
    }
}

/**
 * OKボタンクリック時のハンドラー
 * @param {Event} event - クリックイベント
 */
function handleOkButtonClick(event) {
    hideOkButton(gameState.currentAttempt);

    // 最大試行回数チェック
    if (gameState.currentAttempt >= gameState.maxAttempts) {
        return;
    }

    // 推測を取得
    const attemptSlots = getAttemptSlots(gameState.currentAttempt);
    const guess = Array.from(attemptSlots).map((slot) => slot.dataset.color);

    // 未入力チェック
    if (guess.includes(undefined)) {
        showPopup("すべてのスロットにボールを配置してください。", false);
        return;
    }

    // Hit/Blowをチェック
    const { hits, blows } = checkGuess(guess, gameState.solution);
    const resultDisplay = getResultDisplay(gameState.currentAttempt);
    updateResultDisplay(resultDisplay, hits, blows);

    // スロットのハイライトをリセット
    resetSlotHighlight(gameState.currentAttempt);

    // ゲーム終了判定
    const gameResult = isGameComplete(hits, gameState.currentAttempt);
    if (gameResult.isComplete) {
        if (gameResult.isSuccess) {
            showPopup("おめでとうございます！\n正解です！", true);
        } else {
            showPopup("残念！\nまたチャレンジしてね！", false);
        }
        revealSolution();
    } else {
        // 次の試行へ
        gameState.currentAttempt++;
        gameState.currentSlotIndex = 0;
        highlightCurrentSlot();
    }
}

/**
 * リトライボタンクリック時のハンドラー
 */
function handleRetryClick() {
    const popup = document.getElementById("popup");
    popup.style.display = "none";
    startGame(gameState.currentLevel);
}

/**
 * ホームボタンクリック時のハンドラー（結果ポップアップから）
 */
function handleHomeClick() {
    const popup = document.getElementById("popup");
    popup.style.display = "none";
    showHomeScreen();
}

/**
 * ホームアイコンクリック時のハンドラー（ゲーム中）
 */
function handleHomeIconClick() {
    showPopup("中断しますか？", false);
}

/**
 * 確認ポップアップの「はい」ボタンクリック時のハンドラー
 */
function handleConfirmYes() {
    hideConfirmPopup();
    showHomeScreen();
}

/**
 * 確認ポップアップの「いいえ」ボタンクリック時のハンドラー
 */
function handleConfirmNo() {
    hideConfirmPopup();
}

// ========================================
// ゲーム開始・初期化
// ========================================

/**
 * ゲームを開始
 * @param {number} level - レベル
 */
function startGame(level) {
    // ゲーム画面を構築
    buildGameScreen(level);

    // ゲーム状態をリセット
    gameState.currentAttempt = 0;
    gameState.currentSlotIndex = 0;
    gameState.selectedColor = null;
    gameState.solution = generateSolution(gameState.slotCount);

    // イベントリスナーを再設定
    setupGameEventListeners();

    // ゲーム画面を表示
    showGameScreen();

    // 初期ハイライト
    highlightCurrentSlot();

    // Lucideアイコンを初期化
    if (window.lucide) {
        lucide.createIcons();
    }
}

/**
 * ゲーム用イベントリスナーを設定
 */
function setupGameEventListeners() {
    // ボール選択（イベント委譲）
    const ballSelection = document.getElementById("ball-selection");
    ballSelection.removeEventListener("click", handleBallClick);
    ballSelection.addEventListener("click", handleBallClick);

    // スロットクリック（イベント委譲）
    const attemptsContainer = document.getElementById("attempts-container");
    attemptsContainer.removeEventListener("click", handleSlotClick);
    attemptsContainer.addEventListener("click", handleSlotClick);
}

/**
 * アプリケーション全体の初期化
 */
function initApp() {
    // レベル選択（イベント委譲）
    const levelCards = document.querySelector('.level-cards');
    if (levelCards) {
        levelCards.addEventListener("click", handleLevelSelect);
    }

    // リトライボタン
    const retryButton = document.getElementById("retry");
    if (retryButton) {
        retryButton.addEventListener("click", handleRetryClick);
    }

    // ホームボタン（結果ポップアップから）
    const homeButton = document.getElementById("home-button");
    if (homeButton) {
        homeButton.addEventListener("click", handleHomeClick);
    }

    // ホームアイコン（ゲーム中）
    const homeIcon = document.getElementById("home-icon");
    if (homeIcon) {
        homeIcon.addEventListener("click", handleHomeIconClick);
    }

    // 確認ポップアップの「はい」ボタン
    const confirmYes = document.getElementById("confirm-yes");
    if (confirmYes) {
        confirmYes.addEventListener("click", handleConfirmYes);
    }

    // 確認ポップアップの「いいえ」ボタン
    const confirmNo = document.getElementById("confirm-no");
    if (confirmNo) {
        confirmNo.addEventListener("click", handleConfirmNo);
    }

    // ホーム画面を表示
    showHomeScreen();

    // Lucideアイコンを初期化
    if (window.lucide) {
        lucide.createIcons();
    }
}

// ========================================
// アプリケーション起動
// ========================================

// DOMの読み込みが完了したらアプリケーションを初期化
document.addEventListener("DOMContentLoaded", initApp);

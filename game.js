// ========================================
// ゲーム設定と状態管理
// ========================================

const GAME_CONFIG = {
    MAX_ATTEMPTS: 6,
    SLOT_COUNT: 4,
    COLORS: ["red", "blue", "green", "yellow", "purple", "orange"]
};

const gameState = {
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
 * @returns {string[]} ランダムな色の配列
 */
function generateSolution() {
    return Array.from({ length: GAME_CONFIG.SLOT_COUNT }, () => getRandomColor());
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
    const isSuccess = hits === GAME_CONFIG.SLOT_COUNT;
    const isMaxAttempts = currentAttempt >= GAME_CONFIG.MAX_ATTEMPTS - 1;
    return {
        isComplete: isSuccess || isMaxAttempts,
        isSuccess: isSuccess
    };
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
    gameState.currentSlotIndex = (gameState.currentSlotIndex + 1) % GAME_CONFIG.SLOT_COUNT;
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
            // Hit表示（赤丸）
            setDotStyle(dot, "red", "15px", "1px solid black");
        } else if (index < hits + blows) {
            // Blow表示（白丸）
            setDotStyle(dot, "white", "15px", "1px solid black");
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
 */
function showPopup(message) {
    const popup = document.getElementById("popup");
    const popupMessage = document.getElementById("popup-message");
    popupMessage.textContent = message;
    popup.style.display = "block";
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
    const dataAttempt = GAME_CONFIG.MAX_ATTEMPTS - 1 - attemptIndex;
    return document.querySelectorAll(`.attempt[data-attempt="${dataAttempt}"] .slot`);
}

/**
 * 指定された試行のOKボタンを取得
 * @param {number} attemptIndex - 試行インデックス
 * @returns {Element} OKボタン要素
 */
function getOkButton(attemptIndex) {
    const dataAttempt = GAME_CONFIG.MAX_ATTEMPTS - 1 - attemptIndex;
    return document.querySelector(`.attempt[data-attempt="${dataAttempt}"] .ok-button`);
}

/**
 * 指定された試行の結果表示要素を取得
 * @param {number} attemptIndex - 試行インデックス
 * @returns {Element} 結果表示要素
 */
function getResultDisplay(attemptIndex) {
    const dataAttempt = GAME_CONFIG.MAX_ATTEMPTS - 1 - attemptIndex;
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
 * ボール選択時のハンドラー
 * @param {Event} event - クリックイベント
 */
function handleBallClick(event) {
    const ball = event.target;
    gameState.selectedColor = ball.dataset.color;
    placeBallInSlot(gameState.selectedColor);
}

/**
 * スロットクリック時のハンドラー
 * @param {Event} event - クリックイベント
 */
function handleSlotClick(event) {
    const slot = event.target;
    const attemptElement = slot.closest(".attempt");
    const dataAttempt = parseInt(attemptElement.dataset.attempt);

    // 現在の試行のみクリック可能
    if (dataAttempt === GAME_CONFIG.MAX_ATTEMPTS - 1 - gameState.currentAttempt) {
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
    if (gameState.currentAttempt >= GAME_CONFIG.MAX_ATTEMPTS) {
        return;
    }

    // 推測を取得
    const attemptSlots = getAttemptSlots(gameState.currentAttempt);
    const guess = Array.from(attemptSlots).map((slot) => slot.dataset.color);

    // 未入力チェック
    if (guess.includes(undefined)) {
        showPopup("すべてのスロットにボールを配置してください。");
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
            showPopup("おめでとうございます！正解です！");
        } else {
            showPopup("残念ながら不正解です。");
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
    location.reload();
}

// ========================================
// 初期化
// ========================================

/**
 * イベントリスナーを設定
 */
function setupEventListeners() {
    // ボール選択
    document.querySelectorAll(".ball").forEach((ball) => {
        ball.addEventListener("click", handleBallClick);
    });

    // スロットクリック
    document.querySelectorAll(".slot").forEach((slot) => {
        slot.addEventListener("click", handleSlotClick);
    });

    // リトライボタン
    const retryButton = document.getElementById("retry");
    retryButton.addEventListener("click", handleRetryClick);
}

/**
 * ゲームを初期化して開始
 */
function initGame() {
    gameState.solution = generateSolution();
    gameState.currentAttempt = 0;
    gameState.currentSlotIndex = 0;
    gameState.selectedColor = null;

    setupEventListeners();
    highlightCurrentSlot();
}

// ========================================
// アプリケーション起動
// ========================================

// DOMの読み込みが完了したらゲームを初期化
document.addEventListener("DOMContentLoaded", initGame);

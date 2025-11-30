/**
 * カスタムアイコンライブラリ
 * Lucide Iconのスタイルに基づいた必要なアイコンのみを実装
 */

(function() {
    'use strict';

    // アイコンのSVGパス定義
    const icons = {
        'target': '<circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle>',
        'star': '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>',
        'zap': '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>',
        'flame': '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>',
        'home': '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',
        'arrow-left': '<line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline>',
        'refresh-cw': '<polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>',
        'trophy': '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>',
        'x-circle': '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>'
    };

    /**
     * すべてのアイコンを初期化
     */
    function createIcons() {
        const iconElements = document.querySelectorAll('[data-lucide]');

        iconElements.forEach(element => {
            const iconName = element.getAttribute('data-lucide');
            const iconSvg = icons[iconName];

            if (iconSvg) {
                // 既存のスタイル属性を保持
                const style = element.getAttribute('style') || '';
                const width = element.style.width || element.getAttribute('width') || '24';
                const height = element.style.height || element.getAttribute('height') || '24';
                const color = element.style.color || 'currentColor';

                // SVG要素を作成
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                svg.setAttribute('width', width);
                svg.setAttribute('height', height);
                svg.setAttribute('viewBox', '0 0 24 24');
                svg.setAttribute('fill', 'none');
                svg.setAttribute('stroke', color);
                svg.setAttribute('stroke-width', '2');
                svg.setAttribute('stroke-linecap', 'round');
                svg.setAttribute('stroke-linejoin', 'round');

                // スタイルをコピー
                if (style) {
                    svg.setAttribute('style', style);
                }

                // クラスをコピー
                const classes = element.className;
                if (classes) {
                    svg.setAttribute('class', classes);
                }

                // パスを追加
                svg.innerHTML = iconSvg;

                // 元の要素を置き換え
                element.parentNode.replaceChild(svg, element);
            }
        });
    }

    /**
     * 特定の要素内のアイコンを初期化
     */
    function createIconsInElement(element) {
        const iconElements = element.querySelectorAll('[data-lucide]');

        iconElements.forEach(iconElement => {
            const iconName = iconElement.getAttribute('data-lucide');
            const iconSvg = icons[iconName];

            if (iconSvg) {
                const style = iconElement.getAttribute('style') || '';
                const width = iconElement.style.width || '24';
                const height = iconElement.style.height || '24';
                const color = iconElement.style.color || 'currentColor';

                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                svg.setAttribute('width', width);
                svg.setAttribute('height', height);
                svg.setAttribute('viewBox', '0 0 24 24');
                svg.setAttribute('fill', 'none');
                svg.setAttribute('stroke', color);
                svg.setAttribute('stroke-width', '2');
                svg.setAttribute('stroke-linecap', 'round');
                svg.setAttribute('stroke-linejoin', 'round');

                if (style) {
                    svg.setAttribute('style', style);
                }

                const classes = iconElement.className;
                if (classes) {
                    svg.setAttribute('class', classes);
                }

                svg.innerHTML = iconSvg;
                iconElement.parentNode.replaceChild(svg, iconElement);
            }
        });
    }

    // グローバルオブジェクトとして公開
    window.lucide = {
        createIcons: createIcons,
        createIconsInElement: createIconsInElement
    };

    // DOM読み込み完了後に自動初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createIcons);
    } else {
        createIcons();
    }
})();

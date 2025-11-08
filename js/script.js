// Конфигурация
const CONFIG = {
    DEEPSEEK_API_KEY: 'sk-7f36fac6978e4df0b3ee1e97534d5fc4'
};

// Основной класс приложения
class GameFinderApp {
    constructor() {
        console.log('🎮 Initializing GameFinderApp...');
        this.gameSearchAI = new DirectGameSearchAI();
        this.priceAPI = window.priceAPI;
        this.initApp();
    }
    
    
   initApp() {
    try {
        this.initDOMElements();
        this.initEventListeners();
        this.initCurrencyDropdown();
        this.createParticles();
        this.createStars();
        this.createStarShower();
        
        // Добавляем все пасхалки
        this.initEasterEggs();
        this.initSecretClicks();
        this.initTouchGestures();
        this.initHiddenFeatures();
        
        this.setupNavigation();
        this.setupDownloadTracking();
        console.log('✅ GameFinderApp initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing GameFinderApp:', error);
    }
}

// Добавьте эти методы в класс GameFinderApp:

initEasterEggs() {
    let konamiCode = [];
    const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    
    let gameGodMode = [];
    const godModeSequence = ['KeyG', 'KeyO', 'KeyD'];
    
    let secretSearch = false;
    
    document.addEventListener('keydown', (e) => {
        // Конами код
        konamiCode.push(e.code);
        if (konamiCode.length > konamiSequence.length) {
            konamiCode.shift();
        }
        if (JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
            this.activateKonamiCode();
            konamiCode = [];
        }
        
        // God Mode
        gameGodMode.push(e.code);
        if (gameGodMode.length > godModeSequence.length) {
            gameGodMode.shift();
        }
        if (JSON.stringify(gameGodMode) === JSON.stringify(godModeSequence)) {
            this.activateGodMode();
            gameGodMode = [];
        }
        
        // Секретный поиск (нажать G затем F)
        if (e.code === 'KeyG') {
            secretSearch = true;
            setTimeout(() => {
                secretSearch = false;
            }, 2000);
        }
        if (secretSearch && e.code === 'KeyF') {
            this.activateSecretSearch();
            secretSearch = false;
        }
        
        // Секретный режим (Ctrl + Shift + M)
        if (e.ctrlKey && e.shiftKey && e.code === 'KeyM') {
            this.activateMatrixMode();
        }
    });
    
    console.log('🎮 Easter eggs loaded! Try: ↑↑↓↓←→←→BA or GOD');
}

initSecretClicks() {
    // Секретный клик по логотипу
    const logo = document.querySelector('.logo') || document.querySelector('.logo-left');
    if (logo) {
        let clickCount = 0;
        let lastClick = 0;
        
        logo.addEventListener('click', (e) => {
            const now = Date.now();
            if (now - lastClick < 500) { // Двойной клик
                clickCount++;
                if (clickCount >= 5) {
                    this.activateDeveloperMode();
                    clickCount = 0;
                }
            } else {
                clickCount = 1;
            }
            lastClick = now;
        });
    }
    
    // Секретный клик по фону (правой кнопкой)
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.activateSecretMenu(e.clientX, e.clientY);
    });
    
    // Секретный клик по заголовку
    const title = document.querySelector('.hero-title');
    if (title) {
        title.addEventListener('dblclick', () => {
            this.activateRainbowMode();
        });
    }
}

initTouchGestures() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchCount = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchCount = e.touches.length;
    });
    
    document.addEventListener('touchend', (e) => {
        if (e.changedTouches.length === 0) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        
        // Свайп вверх с двумя пальцами
        if (touchCount === 2 && Math.abs(diffY) > 100 && diffY < 0) {
            this.activateMobileSecret();
        }
        
        // Рисование круга
        if (Math.abs(diffX) > 50 && Math.abs(diffY) > 50) {
            this.checkGesture(diffX, diffY);
        }
        
        // Тап тремя пальцами
        if (touchCount === 3) {
            this.activateTouchSecret();
        }
    });
}

initHiddenFeatures() {
    // Секретный режим при загрузке с определенным параметром
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('debug') === 'true') {
        this.activateDeveloperMode();
    }
    
    // Секретный таймер - через 5 минут показываем подсказку
    setTimeout(() => {
        this.showEasterEggHint();
    }, 300000);
}

// Методы активации пасхалок
activateKonamiCode() {
    console.log('🎉 Konami Code Activated!');
    
    // Создаем эффект конфетти
    this.createConfetti();
    
    // Меняем тему на ретро-игровую
    document.body.style.background = 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7)';
    document.body.style.backgroundSize = '400% 400%';
    
    // Показываем сообщение
    this.showEasterEggMessage('🎮 Konami Code Activated! +30 Lives!', 'retro');
    
    // Добавляем 8-битный звук (вибрация)
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 100]);
    }
}

activateGodMode() {
    console.log('🌟 God Mode Activated!');
    
    // Делаем все карточки золотыми
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach(card => {
        card.style.background = 'linear-gradient(45deg, rgba(255,215,0,0.3), rgba(255,193,7,0.2))';
        card.style.borderColor = 'gold';
        card.style.boxShadow = '0 0 30px gold';
    });
    
    this.showEasterEggMessage('🌟 GOD MODE ACTIVATED! Unlimited Power!', 'god');
    
    // Добавляем сияющий эффект курсору
    this.addGodCursor();
}

activateSecretSearch() {
    console.log('🔍 Secret Search Activated!');
    
    // Автоматически заполняем поиск секретным запросом
    if (this.searchInput) {
        this.searchInput.value = 'игры которые изменили мою жизнь';
        this.autoResizeTextarea.call(this.searchInput);
        
        // Показываем подсказку
        const secretHint = document.createElement('div');
        secretHint.className = 'secret-hint';
        secretHint.innerHTML = '✨ Секретный поиск активирован! Нажмите поиск для магии...';
        this.searchInput.parentNode.appendChild(secretHint);
        
        setTimeout(() => {
            if (secretHint.parentNode) secretHint.remove();
        }, 3000);
    }
}

activateDeveloperMode() {
    console.log('👨‍💻 Developer Mode Activated!');
    
    // Добавляем отладочную информацию
    const debugPanel = document.createElement('div');
    debugPanel.className = 'debug-panel';
    debugPanel.innerHTML = `
        <div>👨‍💻 Developer Mode</div>
        <div>Games Loaded: ${this.currentGames ? this.currentGames.length : 0}</div>
        <div>AI API: DeepSeek</div>
        <div>Version: 2.0.1</div>
        <div>Easter Eggs: 6 active</div>
    `;
    document.body.appendChild(debugPanel);
    
    this.showEasterEggMessage('👨‍💻 Developer Mode Activated!', 'dev');
}

activateMatrixMode() {
    console.log('💚 Matrix Mode Activated!');
    
    // Зеленый матричный фон
    document.body.style.background = 'linear-gradient(45deg, #001100, #003300, #001100)';
    
    // Добавляем падающий код
    this.createMatrixRain();
    
    this.showEasterEggMessage('💚 Welcome to the Matrix!', 'matrix');
}

activateRainbowMode() {
    console.log('🌈 Rainbow Mode Activated!');
    
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.background = `linear-gradient(45deg, 
                hsl(${index * 30}, 100%, 50%, 0.3), 
                hsl(${index * 30 + 60}, 100%, 50%, 0.2))`;
            card.style.borderColor = `hsl(${index * 30}, 100%, 50%)`;
        }, index * 100);
    });
    
    this.showEasterEggMessage('🌈 Rainbow Mode! So colorful!', 'rainbow');
}

activateMobileSecret() {
    console.log('📱 Mobile Secret Activated!');
    
    // Специальные функции для мобильных
    document.body.classList.add('mobile-secret');
    
    // Вибрация (если поддерживается)
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }
    
    this.showEasterEggMessage('📱 Mobile Magic!', 'mobile');
}

activateTouchSecret() {
    console.log('👆 Touch Secret Activated!');
    
    // Создаем волну от точки касания
    this.createTouchRipple(touchStartX, touchStartY);
    this.showEasterEggMessage('👆 Triple Touch!', 'touch');
}

activateSecretMenu(x, y) {
    console.log('🎯 Secret Menu Activated!');
    
    const menu = document.createElement('div');
    menu.className = 'secret-menu';
    menu.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        background: rgba(0,0,0,0.9);
        color: white;
        padding: 10px;
        border-radius: 10px;
        border: 1px solid gold;
        z-index: 10000;
    `;
    menu.innerHTML = `
        <div style="margin-bottom: 5px;">🎯 Secret Menu</div>
        <div style="font-size: 12px; opacity: 0.8;">Easter Eggs Active!</div>
    `;
    
    document.body.appendChild(menu);
    
    setTimeout(() => {
        if (menu.parentNode) menu.remove();
    }, 2000);
}

// Вспомогательные методы
showEasterEggMessage(text, type = 'default') {
    const message = document.createElement('div');
    message.className = `easter-egg-message ${type}`;
    message.textContent = text;
    document.body.appendChild(message);
    
    setTimeout(() => {
        if (message.parentNode) {
            message.remove();
        }
    }, 3000);
}

createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#ff9ff3', '#f368e0'];
    
    for (let i = 0; i < 150; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.cssText = `
                left: ${Math.random() * 100}vw;
                --confetti-color: ${colors[Math.floor(Math.random() * colors.length)]};
                animation-duration: ${Math.random() * 3 + 2}s;
                transform: rotate(${Math.random() * 360}deg);
            `;
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                if (confetti.parentNode) confetti.remove();
            }, 5000);
        }, i * 20);
    }
}

addGodCursor() {
    const godCursor = document.createElement('div');
    godCursor.className = 'god-cursor';
    godCursor.innerHTML = '🌟';
    document.body.appendChild(godCursor);
    
    document.addEventListener('mousemove', (e) => {
        godCursor.style.left = e.clientX + 'px';
        godCursor.style.top = e.clientY + 'px';
    });
    
    // Убираем через 30 секунд
    setTimeout(() => {
        godCursor.remove();
    }, 30000);
}

createMatrixRain() {
    const chars = '01アイウエオカキクケコサシスセソ';
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const drop = document.createElement('div');
            drop.className = 'matrix-drop';
            drop.style.cssText = `
                position: fixed;
                left: ${Math.random() * 100}vw;
                top: -20px;
                color: #00ff00;
                font-family: monospace;
                font-size: 14px;
                animation: matrixFall ${Math.random() * 3 + 2}s linear forwards;
                z-index: -1;
            `;
            
            let text = '';
            for (let j = 0; j < 10; j++) {
                text += chars[Math.floor(Math.random() * chars.length)] + '<br>';
            }
            drop.innerHTML = text;
            
            document.body.appendChild(drop);
            
            setTimeout(() => {
                if (drop.parentNode) drop.remove();
            }, 5000);
        }, i * 100);
    }
}

showEasterEggHint() {
    const hints = [
        '💡 Подсказка: Попробуйте ввести "GOD" на клавиатуре',
        '🎮 Знаете код Конами? ↑↑↓↓←→←→BA',
        '👆 Дважды кликните по заголовку для сюрприза!',
        '📱 На мобильных: свайп вверх двумя пальцами'
    ];
    
    const randomHint = hints[Math.floor(Math.random() * hints.length)];
    this.showEasterEggMessage(randomHint, 'hint');
}

checkGesture(diffX, diffY) {
    // Простая проверка жестов
    if (Math.abs(diffX) > 100 && Math.abs(diffY) > 100) {
        this.showEasterEggMessage('👌 Nice gesture!', 'gesture');
    }
}

createTouchRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'touch-ripple';
    ripple.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255,255,255,0.3);
        transform: translate(-50%, -50%);
        animation: ripple 1s ease-out;
        pointer-events: none;
    `;
    document.body.appendChild(ripple);
    
    setTimeout(() => {
        if (ripple.parentNode) ripple.remove();
    }, 1000);
}

    initDOMElements() {
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.resultsSection = document.getElementById('results');
        this.gamesContainer = document.getElementById('gamesContainer');
        this.analysisContent = document.getElementById('aiAnalysis');
        this.exampleChips = document.querySelectorAll('.example-chip');

        console.log('📝 DOM elements loaded:', {
            searchInput: !!this.searchInput,
            searchBtn: !!this.searchBtn,
            resultsSection: !!this.resultsSection,
            gamesContainer: !!this.gamesContainer,
            exampleChips: this.exampleChips.length
        });
    }

initEasterEggs() {
    let konamiCode = [];
    const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    
    let gameGodMode = [];
    const godModeSequence = ['KeyG', 'KeyO', 'KeyD'];
    
    let rickroll = [];
    const rickrollSequence = ['KeyR', 'KeyI', 'KeyC', 'KeyK'];
    
    let secretSearch = false;
    let beatPattern = [];
    let lastBeatTime = 0;
    let mouseTrail = false;

    document.addEventListener('keydown', (e) => {
        // Конами код
        konamiCode.push(e.code);
        if (konamiCode.length > konamiSequence.length) {
            konamiCode.shift();
        }
        if (JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
            this.activateKonamiCode();
            konamiCode = [];
        }
        
        // God Mode
        gameGodMode.push(e.code);
        if (gameGodMode.length > godModeSequence.length) {
            gameGodMode.shift();
        }
        if (JSON.stringify(gameGodMode) === JSON.stringify(godModeSequence)) {
            this.activateGodMode();
            gameGodMode = [];
        }
        
        // Rickroll код
        rickroll.push(e.code);
        if (rickroll.length > rickrollSequence.length) {
            rickroll.shift();
        }
        if (JSON.stringify(rickroll) === JSON.stringify(rickrollSequence)) {
            this.activateRickroll();
            rickroll = [];
        }
        
        // Секретный поиск (нажать G затем F)
        if (e.code === 'KeyG') {
            secretSearch = true;
            setTimeout(() => {
                secretSearch = false;
            }, 2000);
        }
        if (secretSearch && e.code === 'KeyF') {
            this.activateSecretSearch();
            secretSearch = false;
        }
        
        // Музыкальный режим
        if (e.code === 'KeyM' && e.altKey) {
            this.activateMusicMode();
        }
        
        // Ритм-тапы
        if (e.code === 'Space' && e.ctrlKey) {
            this.recordBeat();
        }
        
        // Тетрис на фоне
        if (e.code === 'KeyT' && e.shiftKey) {
            this.activateTetrisBackground();
        }
        
        // Змейка
        if (e.code === 'KeyS' && e.altKey) {
            this.activateSnakeGame();
        }
        
        // Режим неона
        if (e.code === 'KeyN' && e.shiftKey) {
            this.activateNeonMode();
        }
        
        // Режим 8-бит
        if (e.code === 'Digit8' && e.altKey) {
            this.activate8BitMode();
        }
        
        // Инвертирование цветов
        if (e.code === 'KeyI' && e.ctrlKey) {
            this.activateInvertMode();
        }
        
        // След мыши
        if (e.code === 'KeyP' && e.shiftKey) {
            mouseTrail = !mouseTrail;
            if (mouseTrail) {
                this.activateMouseTrail();
                this.showEasterEggMessage('✨ Mouse Trail!', 'trail');
            }
        }
        
        // Matrix Mode
        if (e.ctrlKey && e.shiftKey && e.code === 'KeyM') {
            this.activateMatrixMode();
        }
        
        // Голосовые команды
        if (e.code === 'KeyV' && e.altKey) {
            this.initVoiceCommands();
        }
    });
    
    console.log('🎮 Easter eggs loaded! Try: ↑↑↓↓←→←→BA, GOD, RICK, and many more!');
}

// Добавьте эти методы в класс:

activateRickroll() {
    console.log('🎵 Never gonna give you up!');
    
    const video = document.createElement('div');
    video.className = 'rickroll-video';
    video.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                   background: black; padding: 20px; border-radius: 15px; z-index: 10000; text-align: center;">
            <div style="color: white; margin-bottom: 10px; font-size: 1.2rem;">🎵 Never gonna give you up! 🎵</div>
            <div style="color: #ccc; margin-bottom: 15px; font-size: 0.9rem;">Rick Astley - Never Gonna Give You Up</div>
            <iframe width="300" height="169" src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1" 
                    frameborder="0" allow="autoplay; encrypted-media" style="border-radius: 8px;"></iframe>
            <br>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="margin-top: 15px; padding: 8px 16px; background: #ff4444; color: white; 
                           border: none; border-radius: 5px; cursor: pointer;">
                ❌ Close
            </button>
        </div>
    `;
    document.body.appendChild(video);
    
    this.showEasterEggMessage('🎵 Never gonna give you up!', 'rickroll');
}

activateMusicMode() {
    console.log('🎵 Music Mode Activated!');
    
    this.showEasterEggMessage('🎵 Music Mode! Click for beats!', 'music');
    
    // Клики создают музыкальные круги
    const musicHandler = (e) => this.createMusicCircle(e);
    document.addEventListener('click', musicHandler);
    
    // Отключаем через 30 секунд
    setTimeout(() => {
        document.removeEventListener('click', musicHandler);
        this.showEasterEggMessage('🎵 Music Mode Ended', 'music');
    }, 30000);
}

createMusicCircle(e) {
    const circle = document.createElement('div');
    circle.className = 'music-circle';
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#ff9ff3'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    circle.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: ${color};
        transform: translate(-50%, -50%);
        animation: musicPulse 1s ease-out;
        pointer-events: none;
        z-index: 9999;
    `;
    
    document.body.appendChild(circle);
    
    setTimeout(() => {
        if (circle.parentNode) circle.remove();
    }, 1000);
}

recordBeat() {
    const now = Date.now();
    const timeDiff = lastBeatTime > 0 ? now - lastBeatTime : 0;
    
    if (timeDiff > 0 && timeDiff < 2000) {
        beatPattern.push(timeDiff);
        
        // Создаем визуальную обратную связь
        this.createBeatVisual();
        
        if (beatPattern.length >= 4) {
            this.checkBeatPattern();
        }
    }
    
    lastBeatTime = now;
    
    // Сбрасываем если прошло много времени
    setTimeout(() => {
        if (Date.now() - lastBeatTime > 3000) {
            beatPattern = [];
        }
    }, 3000);
}

createBeatVisual() {
    const visual = document.createElement('div');
    visual.className = 'beat-visual';
    visual.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff6b6b;
        color: white;
        padding: 5px 10px;
        border-radius: 10px;
        font-weight: bold;
        z-index: 10000;
        animation: beatFlash 0.3s ease;
    `;
    visual.textContent = `🥁 Beat ${beatPattern.length}`;
    
    document.body.appendChild(visual);
    
    setTimeout(() => {
        if (visual.parentNode) visual.remove();
    }, 1000);
}

checkBeatPattern() {
    const isRegular = beatPattern.every((beat, i, arr) => 
        i === 0 || Math.abs(beat - arr[0]) < 150
    );
    
    if (isRegular) {
        this.activateDrumMode();
        beatPattern = [];
    }
}

activateDrumMode() {
    console.log('🥁 Drum Mode Activated!');
    this.showEasterEggMessage('🥁 Drum Mode! Nice rhythm!', 'drum');
    
    // Создаем виртуальные барабаны
    this.createVirtualDrums();
}

createVirtualDrums() {
    const drums = document.createElement('div');
    drums.className = 'virtual-drums';
    drums.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.8);
        padding: 15px;
        border-radius: 15px;
        z-index: 10000;
        display: flex;
        gap: 10px;
    `;
    
    const drumPads = ['🥁', '🎸', '🎹', '🎺', '🎻'];
    drumPads.forEach((drum, index) => {
        const pad = document.createElement('div');
        pad.className = 'drum-pad';
        pad.innerHTML = drum;
        pad.style.cssText = `
            width: 50px;
            height: 50px;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            cursor: pointer;
            transition: all 0.1s ease;
        `;
        
        pad.addEventListener('click', () => {
            pad.style.transform = 'scale(0.9)';
            setTimeout(() => {
                pad.style.transform = 'scale(1)';
            }, 100);
            
            // Создаем звуковой эффект (визуальный)
            this.createSoundWave(pad);
        });
        
        drums.appendChild(pad);
    });
    
    document.body.appendChild(drums);
    
    setTimeout(() => {
        if (drums.parentNode) drums.remove();
    }, 10000);
}

createSoundWave(element) {
    const wave = document.createElement('div');
    wave.className = 'sound-wave';
    const rect = element.getBoundingClientRect();
    
    wave.style.cssText = `
        position: fixed;
        left: ${rect.left + rect.width / 2}px;
        top: ${rect.top + rect.height / 2}px;
        width: 10px;
        height: 10px;
        border: 2px solid #4ecdc4;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        animation: soundWave 1s ease-out;
    `;
    
    document.body.appendChild(wave);
    
    setTimeout(() => {
        if (wave.parentNode) wave.remove();
    }, 1000);
}

activateTetrisBackground() {
    console.log('🎮 Tetris Background Activated!');
    
    const tetrisContainer = document.createElement('div');
    tetrisContainer.className = 'tetris-background';
    tetrisContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -2;
        opacity: 0.1;
    `;
    
    // Создаем падающие блоки тетриса
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            this.createTetrisBlock(tetrisContainer);
        }, i * 800);
    }
    
    document.body.appendChild(tetrisContainer);
    this.showEasterEggMessage('🎮 Tetris Background!', 'tetris');
    
    setTimeout(() => {
        if (tetrisContainer.parentNode) tetrisContainer.remove();
    }, 20000);
}

createTetrisBlock(container) {
    const block = document.createElement('div');
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#ff9ff3'];
    
    block.className = 'tetris-block';
    block.style.cssText = `
        position: absolute;
        left: ${Math.random() * 100}vw;
        top: -50px;
        width: 30px;
        height: 30px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        animation: tetrisFall ${Math.random() * 8 + 4}s linear forwards;
        opacity: 0.4;
        border-radius: 4px;
    `;
    
    container.appendChild(block);
    
    setTimeout(() => {
        if (block.parentNode === container) {
            container.removeChild(block);
        }
    }, 12000);
}

activateSnakeGame() {
    console.log('🐍 Snake Game Activated!');
    
    const snakeContainer = document.createElement('div');
    snakeContainer.className = 'snake-game';
    snakeContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.95);
        padding: 20px;
        border-radius: 15px;
        border: 2px solid #00ff00;
        z-index: 10000;
        color: #00ff00;
        font-family: 'Courier New', monospace;
        text-align: center;
    `;
    
    snakeContainer.innerHTML = `
        <div style="font-size: 1.2rem; margin-bottom: 10px; text-shadow: 0 0 10px #00ff00;">🐍 SNAKE GAME</div>
        <div style="width: 200px; height: 200px; background: #001100; 
                   border: 1px solid #003300; margin: 0 auto; position: relative;">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                       color: #005500; font-size: 0.8rem;">
                Use WASD to move!<br>
                (Coming Soon)
            </div>
        </div>
        <button onclick="this.parentElement.remove()" 
                style="margin-top: 15px; padding: 8px 16px; background: #00ff00; color: black; 
                       border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
            CLOSE
        </button>
    `;
    
    document.body.appendChild(snakeContainer);
    this.showEasterEggMessage('🐍 Snake Game!', 'snake');
}

activateNeonMode() {
    console.log('💡 Neon Mode Activated!');
    
    document.body.classList.add('neon-mode');
    
    const elements = document.querySelectorAll('.glass-card, .nav-btn, .search-btn, .game-card');
    elements.forEach(el => {
        const randomHue = Math.floor(Math.random() * 360);
        el.style.boxShadow = `
            0 0 10px hsl(${randomHue}, 100%, 50%),
            0 0 20px hsl(${randomHue}, 100%, 50%),
            0 0 40px hsl(${randomHue}, 100%, 50%)
        `;
        el.style.transition = 'all 0.3s ease';
    });
    
    this.showEasterEggMessage('💡 Neon Mode! So bright!', 'neon');
    
    setTimeout(() => {
        document.body.classList.remove('neon-mode');
        elements.forEach(el => {
            el.style.boxShadow = '';
        });
    }, 30000);
}

activate8BitMode() {
    console.log('👾 8-Bit Mode Activated!');
    
    document.body.classList.add('eight-bit-mode');
    
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.style.imageRendering = 'pixelated';
        img.style.filter = 'contrast(150%) saturate(150%)';
    });
    
    document.body.style.fontFamily = "'Courier New', monospace";
    document.body.style.letterSpacing = '0px';
    
    this.showEasterEggMessage('👾 8-Bit Mode! Retro!', '8bit');
    
    setTimeout(() => {
        document.body.classList.remove('eight-bit-mode');
        images.forEach(img => {
            img.style.imageRendering = '';
            img.style.filter = '';
        });
        document.body.style.fontFamily = '';
    }, 30000);
}

activateInvertMode() {
    console.log('🔄 Invert Mode Activated!');
    
    document.body.classList.toggle('invert-mode');
    
    if (document.body.classList.contains('invert-mode')) {
        this.showEasterEggMessage('🔄 Colors Inverted!', 'invert');
    } else {
        this.showEasterEggMessage('🔄 Colors Normal!', 'invert');
    }
}

activateMouseTrail() {
    console.log('✨ Mouse Trail Activated!');
    
    const trailHandler = (e) => {
        for (let i = 0; i < 2; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'mouse-particle';
                const size = Math.random() * 6 + 3;
                const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
                
                particle.style.cssText = `
                    position: fixed;
                    left: ${e.clientX + (Math.random() * 20 - 10)}px;
                    top: ${e.clientY + (Math.random() * 20 - 10)}px;
                    width: ${size}px;
                    height: ${size}px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 9999;
                    animation: particleFloat ${Math.random() * 1.5 + 0.5}s ease-out forwards;
                `;
                
                document.body.appendChild(particle);
                
                setTimeout(() => {
                    if (particle.parentNode) particle.remove();
                }, 2000);
            }, i * 50);
        }
    };
    
    document.addEventListener('mousemove', trailHandler);
    
    setTimeout(() => {
        document.removeEventListener('mousemove', trailHandler);
        this.showEasterEggMessage('✨ Mouse Trail Ended', 'trail');
    }, 20000);
}

initVoiceCommands() {
    if (!('webkitSpeechRecognition' in window)) {
        this.showEasterEggMessage('🎤 Voice not supported', 'voice');
        return;
    }
    
    this.showEasterEggMessage('🎤 Listening... Say "hello"', 'voice');
    
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log('Voice command:', transcript);
        
        if (transcript.includes('hello')) {
            this.showEasterEggMessage('🎤 Hello! Try "magic" or "colors"', 'voice');
        }
        
        if (transcript.includes('magic') || transcript.includes('confetti')) {
            this.createConfetti();
            this.showEasterEggMessage('🎤 Magic!', 'voice');
        }
        
        if (transcript.includes('color') || transcript.includes('rainbow')) {
            this.activateRainbowMode();
            this.showEasterEggMessage('🎤 Colors!', 'voice');
        }
        
        if (transcript.includes('god mode')) {
            this.activateGodMode();
        }
        
        if (transcript.includes('music')) {
            this.activateMusicMode();
        }
    };
    
    recognition.onerror = () => {
        this.showEasterEggMessage('🎤 Voice error', 'voice');
    };
    
    recognition.start();
    
    console.log('🎮 Easter eggs loaded! Try: ↑↑↓↓←→←→BA or GOD');
}

activateKonamiCode() {
    console.log('🎉 Konami Code Activated!');
    
    // Создаем эффект конфетти
    this.createConfetti();
    
    // Меняем тему на ретро-игровую
    document.body.style.background = 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7)';
    document.body.style.backgroundSize = '400% 400%';
    document.body.style.animation = 'gradientShift 3s ease infinite';
    
    // Показываем сообщение
    this.showEasterEggMessage('🎮 Konami Code Activated! +30 Lives!', 'retro');
    
    // Добавляем ретро-звук (если нужно)
    this.playRetroSound();
}

activateGodMode() {
    console.log('🌟 God Mode Activated!');
    
    // Делаем все карточки золотыми
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach(card => {
        card.style.background = 'linear-gradient(45deg, rgba(255,215,0,0.3), rgba(255,193,7,0.2))';
        card.style.borderColor = 'gold';
        card.style.boxShadow = '0 0 30px gold';
    });
    
    this.showEasterEggMessage('🌟 GOD MODE ACTIVATED! Unlimited Power!', 'god');
    
    // Добавляем сияющий эффект курсору
    this.addGodCursor();
}

activateSecretSearch() {
    console.log('🔍 Secret Search Activated!');
    
    // Автоматически заполняем поиск секретным запросом
    if (this.searchInput) {
        this.searchInput.value = 'игры которые изменили мою жизнь';
        this.autoResizeTextarea.call(this.searchInput);
        
        // Показываем подсказку
        const secretHint = document.createElement('div');
        secretHint.className = 'secret-hint';
        secretHint.innerHTML = '✨ Секретный поиск активирован! Нажмите поиск для магии...';
        this.searchInput.parentNode.appendChild(secretHint);
        
        setTimeout(() => {
            if (secretHint.parentNode) secretHint.remove();
        }, 3000);
    }
}

    createStars() {
    const container = document.getElementById('stars');
    if (!container) {
        console.log('❌ Stars container not found');
        return;
    }

    console.log('⭐ Creating BIG stars...');

    const createStar = () => {
        const star = document.createElement('div');
        star.className = 'star';
        
        // БОЛЬШЕ РАЗМЕРОВ
        const sizes = ['tiny', 'small', 'medium', 'large', 'huge'];
        const size = sizes[Math.floor(Math.random() * sizes.length)];
        star.classList.add(size);
        
        // БОЛЬШЕ ЦВЕТОВ
        const colors = ['color-blue', 'color-purple', 'color-gold', 'color-pink', 'color-cyan', 'color-white', 'color-green'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        star.classList.add(color);
        
        // БОЛЬШЕ АНИМАЦИЙ
        const animations = ['starFall', 'starFallDiagonal', 'starFallReverse', 'starFallVertical'];
        const animation = animations[Math.floor(Math.random() * animations.length)];
        
        // РАЗНЫЕ СКОРОСТИ
        const duration = Math.random() * 6 + 2; // 2-8 секунд - БЫСТРЕЕ
        const delay = Math.random() * 1; // Меньше задержки
        
        star.style.cssText = `
            top: ${Math.random() * 100}vh;
            left: ${Math.random() * 100}vw;
            animation: ${animation} ${duration}s linear ${delay}s infinite;
        `;
        
        container.appendChild(star);

        // Удаляем старые звезды
        setTimeout(() => {
            if (star.parentNode === container) {
                container.removeChild(star);
            }
        }, (duration + delay) * 1000);
    };

    // СОЗДАЕМ ОЧЕНЬ МНОГО ЗВЕЗД СРАЗУ
    for (let i = 0; i < 50; i++) { // 50 звезд сразу!
        setTimeout(createStar, i * 100); // Быстрее создаем
    }

    // ЧАЩЕ СОЗДАЕМ НОВЫЕ ЗВЕЗДЫ
    setInterval(createStar, 200); // Новая звезда каждые 200ms
    
    console.log('✅ BIG stars created successfully');
}
createStarShower() {
    const container = document.getElementById('stars');
    if (!container) return;

    // Создаем "ливень" из звезд
    const createShower = () => {
        const showerCount = 10 + Math.floor(Math.random() * 15); // 10-25 звезд в ливне
        
        for (let i = 0; i < showerCount; i++) {
            setTimeout(() => {
                const star = document.createElement('div');
                star.className = 'star small color-white';
                
                const startX = Math.random() * 100;
                
                star.style.cssText = `
                    top: -20px;
                    left: ${startX}vw;
                    animation: starFallVertical ${1 + Math.random() * 2}s linear ${Math.random() * 0.5}s infinite;
                `;
                
                container.appendChild(star);

                setTimeout(() => {
                    if (star.parentNode === container) {
                        container.removeChild(star);
                    }
                }, 3000);
            }, i * 50); // Небольшая задержка между звездами в ливне
        }
    };

    // Запускаем звездные ливни каждые 3-8 секунд
    setInterval(createShower, 3000 + Math.random() * 5000);
}

    initDiscordButtons() {
    const discordButtons = document.querySelectorAll('.send-to-discord-btn');
    
    discordButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.stopPropagation();
            const gameData = JSON.parse(button.getAttribute('data-game'));
            console.log('🔄 Sending game to Discord:', gameData.name);
            
            // Показываем загрузку
            const originalText = button.innerHTML;
            button.innerHTML = '⏳ Отправляем...';
            button.disabled = true;
            
            try {
                await this.sendToDiscord(gameData);
            } catch (error) {
                console.error('❌ Error sending to Discord:', error);
            } finally {
                // Восстанавливаем кнопку
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.disabled = false;
                }, 2000);
            }
        });
    });
}

// Метод для отправки в Discord
async sendToDiscord(gameData) {
    try {
        console.log('📨 Sending to Discord:', gameData.name);
        
        // URL вашего API сервера - ВАЖНО: используйте правильный домен!
        const API_URL = 'https://api.gamefinders.org'; // или ваш домен где запущен api-server.js
        
        const response = await fetch(`${API_URL}/api/discord`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                game: gameData,
                user: 'Website Visitor',
                source: 'gamefinders.org',
                timestamp: new Date().toISOString()
            })
        });

        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Server error:', errorText);
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('📦 Response data:', result);
        
        if (result.ok) {
            console.log('✅ Sent to Discord successfully');
            this.showNotification('🎮 Запрос отправлен в Discord! Проверьте канал.', 'success');
        } else {
            throw new Error(result.error || 'Unknown error from server');
        }
    } catch (error) {
        console.error('❌ Error sending to Discord:', error);
        this.showNotification('❌ Ошибка отправки в Discord: ' + error.message, 'error');
        throw error;
    }
}

// Метод для показа уведомлений
showNotification(message, type = 'info') {
    // Удаляем старое уведомление если есть
    const oldNotification = document.querySelector('.notification');
    if (oldNotification) {
        oldNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            font-weight: 500;
            box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        ">
            ${message}
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 4000);
}
    initEventListeners() {
        // Кнопка поиска
        if (this.searchBtn) {
            console.log('🔄 Adding click listener to search button');
            this.searchBtn.addEventListener('click', () => {
                console.log('🎯 Search button clicked!');
                this.handleSearch();
            });
        } else {
            console.error('❌ Search button not found!');
        }

        // Enter в поиске
        if (this.searchInput) {
            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    console.log('⌨️ Enter pressed in search input');
                    this.handleSearch();
                }
            });

            this.searchInput.addEventListener('input', this.autoResizeTextarea);
        }

        // Быстрые примеры
        if (this.exampleChips.length > 0) {
            this.exampleChips.forEach(chip => {
                chip.addEventListener('click', () => {
                    const exampleText = chip.getAttribute('data-example');
                    console.log('💡 Example chip clicked:', exampleText);
                    if (this.searchInput) {
                        this.searchInput.value = exampleText;
                        this.autoResizeTextarea.call(this.searchInput);
                    }
                    this.handleSearch();
                });
            });
        }

        console.log('🎯 Event listeners attached');
    }

    autoResizeTextarea() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 200) + 'px';
    }
    

    async handleSearch() {
    try {
        const query = this.searchInput ? this.searchInput.value.trim() : '';
        console.log('🔍 Handle search called with query:', query);
        
        if (!query) {
            this.showError('Пожалуйста, введите описание того, что вы ищете');
            return;
        }

        if (query.length < 3) {
            this.showError('Запрос должен содержать хотя бы 3 символа');
            return;
        }

        this.setLoading(true);
        this.hideError();

        console.log('🚀 Starting AI search...');
        
        const results = await this.gameSearchAI.searchGames(query);
        console.log('✅ Search results received:', results);
        
        this.displayResults(results);
        
    } catch (error) {
        console.error('❌ Search error:', error);
        this.showError(error.message);
    } finally {
        this.setLoading(false);
    }
}

    setLoading(isLoading) {
        if (!this.searchBtn) {
            console.error('❌ Search button not found for loading state');
            return;
        }

        const btnText = this.searchBtn.querySelector('.btn-text');
        const loadingSpinner = this.searchBtn.querySelector('.loading-spinner');
        
        if (!btnText || !loadingSpinner) {
            console.error('❌ Loading elements not found');
            return;
        }

        if (isLoading) {
            btnText.classList.add('hidden');
            loadingSpinner.classList.remove('hidden');
            this.searchBtn.disabled = true;
            this.searchBtn.style.opacity = '0.7';
            console.log('⏳ Loading state: ON');
        } else {
            btnText.classList.remove('hidden');
            loadingSpinner.classList.add('hidden');
            this.searchBtn.disabled = false;
            this.searchBtn.style.opacity = '1';
            console.log('✅ Loading state: OFF');
        }
    }

    displayResults(results) {
        if (!this.resultsSection || !this.gamesContainer) {
            console.error('❌ Results section or games container not found');
            return;
        }

        console.log('📊 Displaying results...');
        this.resultsSection.classList.remove('hidden');
        this.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        if (results.analysis && this.analysisContent) {
            this.displayAIAnalysis(results.analysis);
        }
        
        this.displayGames(results.games);
        this.showStats(results.games.length);
        
        console.log('🎉 Results displayed successfully');
    }

    displayAIAnalysis(analysis) {
        if (!this.analysisContent) return;

        this.analysisContent.innerHTML = `
            <div class="analysis-header">
                <h3>🎯 AI анализ вашего запроса</h3>
            </div>
            <div class="analysis-content">
                <div class="analysis-item">
                    <strong>📊 Понятое настроение:</strong> ${analysis.understoodMood || 'Не определено'}
                </div>
                <div class="analysis-item">
                    <strong>🎨 Рекомендуемый стиль:</strong> ${analysis.recommendedStyle || 'Не определен'}
                </div>
                <div class="key-factors">
                    <strong>🔑 Ключевые факторы:</strong>
                    <div class="mood-tags">
                        ${(analysis.keyFactors || ['фактор1', 'фактор2']).map(factor => `<span class="mood-tag">${factor}</span>`).join('')}
                    </div>
                </div>
                <div class="reasoning">
                    <strong>💡 Объяснение подбора:</strong> ${analysis.reasoning || 'AI проанализировал ваш запрос и подобрал подходящие игры'}
                </div>
            </div>
        `;
    }

    displayGames(games) {
    if (!this.gamesContainer) return;

    console.log(`🎮 Displaying ${games.length} games`);
    
    const gamesToShow = games.slice(0, 20);
    
    this.gamesContainer.innerHTML = gamesToShow.map((game, index) => `
        <div class="game-card fade-in-up" style="animation-delay: ${index * 0.05}s" 
             data-game='${JSON.stringify(game).replace(/'/g, "&#39;")}'>
            
            <!-- остальная часть карточки без изменений -->
            <div class="game-header">
                <div class="game-title-section">
                    <h4 class="game-title clickable-title">${game.name || 'Название игры'}</h4>
                    <div class="game-meta">
                        <span class="game-genre">${game.genre || 'Жанр'}</span>
                        <span class="game-platforms">${game.platforms?.join(', ') || 'PC'}</span>
                    </div>
                </div>
                <div class="match-score">
                    <div class="score-circle">${Math.round((game.moodMatch || 0.8) * 100)}%</div>
                    <div class="score-label">Совпадение</div>
                </div>
            </div>

            <div class="game-details">
                <div class="detail-item">
                    <span class="detail-icon">⏱️</span>
                    <span>${game.playtime || 'Время не указано'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-icon">🎨</span>
                    <span>${game.vibe || 'Атмосфера не указана'}</span>
                </div>
            </div>

            <div class="game-description">
                ${game.description || 'Описание игры будет загружено...'}
            </div>

            <div class="game-reason">
                <div class="reason-title">🎯 Почему подходит:</div>
                ${game.whyPerfect || 'Идеально подходит под ваш запрос'}
            </div>

            <!-- ИЗМЕНЕННАЯ СЕКЦИЯ - вот эта часть -->
            <div class="stores-container">
                <h4>💸 Узнать цену и купить</h4>
                <div class="discord-price-mini">
                    <div class="discord-mini-content">
                        <span class="discord-mini-icon">🎮</span>
                        <span class="discord-mini-text">Актуальные цены в Discord</span>
                    </div>
                    <button class="discord-mini-btn send-to-discord-btn" 
                            data-game='${JSON.stringify(game).replace(/'/g, "&quot;")}'>
                        📩 Получить цену в Discord
                    </button>
                </div>
                <div class="price-note">
                    💡 Нажмите кнопку и бот пришлет актуальные цены со всех магазинов в Discord
                </div>
            </div>
        </div>
    `).join('');

    // Добавляем обработчики для новых кнопок
    this.initDiscordButtons();
    this.initGameClickHandlers();

    }

    initGameClickHandlers() {
        const gameTitles = document.querySelectorAll('.clickable-title');
        const gameCards = document.querySelectorAll('.game-card');
        
        console.log(`🎯 Adding click handlers to ${gameTitles.length} titles and ${gameCards.length} cards`);
        
        gameTitles.forEach((title, index) => {
            title.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('📱 Title clicked');
                const gameCard = title.closest('.game-card');
                const gameData = gameCard.getAttribute('data-game');
                this.openGameDetails(JSON.parse(gameData));
            });
        });
        
        gameCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Не открываем детали если кликнули на кнопку Discord
                if (!e.target.closest('.discord-mini-btn') && !e.target.closest('.store-btn')) {
                    console.log('🃏 Card clicked');
                    const gameData = card.getAttribute('data-game');
                    this.openGameDetails(JSON.parse(gameData));
                }
            });
        });
    }

    openGameDetails(game) {
        console.log('🔍 Opening game details:', game.name);
        sessionStorage.setItem('currentGame', JSON.stringify(game));
        window.location.href = 'game-details.html';
    }

    showStats(shownCount) {
        const gamesGrid = document.querySelector('.games-grid');
        if (!gamesGrid) return;

        const statsElement = document.createElement('div');
        statsElement.className = 'stats-info';
        statsElement.innerHTML = `
            <div class="stats-card">
                <span class="stats-icon">🤖</span>
                <span>DeepSeek AI нашёл <strong>${shownCount}</strong> игр</span>
            </div>
        `;
        
        const existingStats = gamesGrid.querySelector('.stats-info');
        if (existingStats) existingStats.remove();
        gamesGrid.insertBefore(statsElement, gamesGrid.querySelector('.games-container'));
    }

    hideLoadMoreButton() {
        const loadMoreBtn = document.querySelector('.load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.remove();
        }
    }

    initCurrencyDropdown() {
        const currencyToggle = document.getElementById('currencyToggle');
        const currencyMenu = document.querySelector('.currency-dropdown-menu');
        const currencyOptions = document.querySelectorAll('.currency-option');
        const currentCurrencySymbol = document.getElementById('currentCurrencySymbol');
        
        if (currencyToggle && currencyMenu) {
            currencyToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                currencyMenu.classList.toggle('show');
                currencyToggle.classList.toggle('active');
            });
            
            currencyOptions.forEach(option => {
                option.addEventListener('click', (e) => {
                    const currency = option.getAttribute('data-currency');
                    const symbol = option.querySelector('.currency-symbol').textContent;
                    
                    this.changeCurrency(currency);
                    
                    currentCurrencySymbol.textContent = symbol;
                    
                    currencyOptions.forEach(opt => opt.classList.remove('active'));
                    option.classList.add('active');
                    
                    currencyMenu.classList.remove('show');
                    currencyToggle.classList.remove('active');
                    
                    currencyToggle.classList.add('currency-spin');
                    setTimeout(() => {
                        currencyToggle.classList.remove('currency-spin');
                    }, 600);
                });
            });
            
            document.addEventListener('click', (e) => {
                if (!currencyToggle.contains(e.target) && !currencyMenu.contains(e.target)) {
                    currencyMenu.classList.remove('show');
                    currencyToggle.classList.remove('active');
                }
            });
            
            this.initCurrentCurrency();
        }
    }

    initCurrentCurrency() {
        const savedCurrency = this.priceAPI.getSavedCurrency() || 'USD';
        const currencyOptions = document.querySelectorAll('.currency-option');
        const currentCurrencySymbol = document.getElementById('currentCurrencySymbol');
        
        currencyOptions.forEach(option => {
            if (option.getAttribute('data-currency') === savedCurrency) {
                option.classList.add('active');
                const symbol = option.querySelector('.currency-symbol').textContent;
                currentCurrencySymbol.textContent = symbol;
            }
        });
    }

    async changeCurrency(currency) {
        this.priceAPI.setCurrency(currency);
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn[href^="#"]');
        
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = button.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    history.pushState(null, null, `#${targetId}`);
                }
            });
        });

        console.log('🎯 Navigation setup complete');
    }

    setupDownloadTracking() {
        const downloadButtons = document.querySelectorAll('[download], .download-btn');
        
        downloadButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                console.log('📥 Download button clicked');
            });
        });
    }

    showError(message) {
        this.hideError();
        if (!this.searchInput) return;

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 10px; background: rgba(255,0,0,0.1); border-radius: 8px; margin: 10px 0;">
                <span>⚠️</span>
                <span>${message}</span>
            </div>
        `;
        this.searchInput.parentNode.insertBefore(errorDiv, this.searchInput.nextSibling);
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    hideError() {
        const existingError = document.querySelector('.error-message');
        if (existingError) existingError.remove();
    }

    createParticles() {
        const container = document.getElementById('particles');
        if (!container) return;

        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                background: rgba(255, 255, 255, ${Math.random() * 0.2});
                border-radius: 50%;
                top: ${Math.random() * 100}vh;
                left: ${Math.random() * 100}vw;
                animation: floatParticle ${Math.random() * 15 + 10}s linear infinite;
                animation-delay: ${Math.random() * 5}s;
            `;
            container.appendChild(particle);
        }
        
    }
}

// Простая версия инициализации
function initializeApp() {
    console.log('🚀 Starting app initialization...');
    
    if (typeof GameFinderApp !== 'undefined') {
        window.gameFinderApp = new GameFinderApp();
        console.log('✅ GameFinderApp initialized successfully');
        return true;
    } else {
        console.log('🔄 GameFinderApp not found, waiting for dependencies...');
        return false;
    }
}

// Запуск при полной загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM fully loaded');
    
    if (!initializeApp()) {
        setTimeout(() => {
            if (!initializeApp()) {
                console.error('❌ Failed to initialize GameFinderApp after retry');
                
                // Fallback: добавляем базовые обработчики
                const searchBtn = document.getElementById('searchBtn');
                if (searchBtn) {
                    searchBtn.addEventListener('click', function() {
                        alert('Приложение загружается... Попробуйте обновить страницу');
                    });
                }
            }
        }, 500);
    }
});

// Глобальная функция для открытия магазинов
window.openStore = function(store, gameName) {
    const urls = {
        'steam': `https://store.steampowered.com/search/?term=${encodeURIComponent(gameName)}`,
        'epic': `https://store.epicgames.com/ru/browse?q=${encodeURIComponent(gameName)}`,
        'xbox': `https://www.xbox.com/ru-ru/search?q=${encodeURIComponent(gameName)}`,
        'ea': `https://www.ea.com/ru-ru/search?q=${encodeURIComponent(gameName)}`,
        'ubisoft': `https://store.ubi.com/ru/search/?q=${encodeURIComponent(gameName)}`
    };
    
    window.open(urls[store], '_blank');
};
// Тест кнопки поиска
console.log('🔧 Testing search button...');
const testBtn = document.getElementById('searchBtn');
if (testBtn) {
    console.log('✅ Search button found in DOM');
    testBtn.addEventListener('click', function() {
        console.log('🎯 TEST: Search button click works!');
    });
} else {
    console.error('❌ Search button NOT found in DOM');
}

// Проверяем textarea
const testInput = document.getElementById('searchInput');
if (testInput) {
    console.log('✅ Search input found in DOM');
} else {
    console.error('❌ Search input NOT found in DOM');
}

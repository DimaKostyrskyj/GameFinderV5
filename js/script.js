
// В начале script.js
let CONFIG = {
    DEEPSEEK_API_KEY: 'demo-deepseek-key',
    GEMINI_API_KEY: 'demo-gemini-key',
    ACTIVE_AI: 'deepseek'
};

let ADMIN_USERS = {
    'demo': 'demo123'
};

// Функция загрузки конфигурации
async function loadConfiguration() {
    try {
        // Пробуем загрузить локальный конфиг
        const localConfigModule = await import('./js/config.local.js');
        if (localConfigModule.LOCAL_CONFIG) {
            const localConfig = localConfigModule.LOCAL_CONFIG;
            
            // Обновляем CONFIG
            if (localConfig.API_KEYS) {
                CONFIG.DEEPSEEK_API_KEY = localConfig.API_KEYS.DEEPSEEK_API_KEY || CONFIG.DEEPSEEK_API_KEY;
                CONFIG.GEMINI_API_KEY = localConfig.API_KEYS.GEMINI_API_KEY || CONFIG.GEMINI_API_KEY;
            }
            
            // Обновляем ADMIN_USERS
            if (localConfig.ADMIN_USERS) {
                ADMIN_USERS = localConfig.ADMIN_USERS;
            }
            
            console.log('✅ Загружена локальная конфигурация');
            return true;
        }
    } catch (error) {
        console.log('⚠️ Локальная конфигурация не найдена, используем демо-режим');
    }
    
    console.warn('🚨 Работаем в демо-режиме! Создайте config/config.local.js');
    return false;
}

class AccessControlSystem {
    constructor() {
        this.currentUser = null;
        this.userRole = 'user';
        this.adminLogs = []; // ИНИЦИАЛИЗИРУЕМ ПУСТОЙ МАССИВ
        this.initAccessControl();
    }

    initAccessControl() {
        const savedSession = localStorage.getItem('gamefinder_admin_session');
        if (savedSession) {
            try {
                const session = JSON.parse(savedSession);
                if (session.expires > Date.now() && ADMIN_USERS[session.user]) {
                    this.currentUser = session.user;
                    this.userRole = 'admin';
                    console.log(`🔐 Админ вошел: ${this.currentUser}`);
                    this.enableAdminFeatures();
                }
            } catch (e) {
                localStorage.removeItem('gamefinder_admin_session');
            }
        }

        this.addAdminLoginButton();
    }

    addAdminLoginButton() {
        const adminBtn = document.createElement('button');
        adminBtn.innerHTML = '🔐';
        adminBtn.className = 'admin-access-btn';
        adminBtn.title = 'Вход для команды проекта';
        
        adminBtn.addEventListener('click', () => {
            this.showAdminLogin();
        });

        document.body.appendChild(adminBtn);
    }

    showAdminLogin() {
        if (this.userRole === 'admin') {
            this.showAdminPanel();
            return;
        }

        const loginHTML = `
            <div class="admin-login-modal">
                <div class="admin-login-content">
                    <div class="login-header">
                        <h3>🎮 Вход для команды GameFinders</h3>
                        <p>Доступ к логам и управлению</p>
                    </div>
                    
                    <div class="login-form">
                        <div class="input-group">
                            <label for="adminLogin">Логин команды:</label>
                            <input type="text" id="adminLogin" placeholder="Введите ваш логин">
                        </div>
                        
                        <div class="input-group">
                            <label for="adminPassword">Пароль:</label>
                            <input type="password" id="adminPassword" placeholder="Введите пароль">
                        </div>
                        
                        <div class="login-buttons">
                            <button id="adminLoginBtn" class="login-btn">
                                <span class="btn-icon">🔓</span>
                                Войти в систему
                            </button>
                            <button id="adminLoginClose" class="cancel-btn">
                                Отмена
                            </button>
                        </div>
                    </div>
                    
                    <div class="login-footer">
                        <small>Только для команды разработки</small>
                    </div>
                </div>
            </div>
        `;

        const overlay = document.createElement('div');
        overlay.innerHTML = loginHTML;
        document.body.appendChild(overlay);

        document.getElementById('adminLoginBtn').addEventListener('click', () => {
            this.handleAdminLogin();
        });

        document.getElementById('adminLoginClose').addEventListener('click', () => {
            overlay.remove();
        });

        overlay.addEventListener('click', (e) => {
            if (e.target.classList.contains('admin-login-modal')) {
                overlay.remove();
            }
        });

        document.getElementById('adminPassword').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleAdminLogin();
            }
        });

        // Фокус на поле логина
        setTimeout(() => {
            document.getElementById('adminLogin').focus();
        }, 100);
    }

    handleAdminLogin() {
        const login = document.getElementById('adminLogin').value.trim();
        const password = document.getElementById('adminPassword').value;

        if (!login || !password) {
            this.showNotification('❌ Заполните все поля', 'error');
            return;
        }

        if (ADMIN_USERS[login] === password) {
            this.currentUser = login;
            this.userRole = 'admin';
            
            const session = {
                user: login,
                expires: Date.now() + (24 * 60 * 60 * 1000) // 24 часа
            };
            localStorage.setItem('gamefinder_admin_session', JSON.stringify(session));

            this.enableAdminFeatures();
            document.querySelector('.admin-login-modal').remove();
            
            this.showNotification('✅ Успешный вход в систему администрирования', 'success');
        } else {
            this.showNotification('❌ Неверный логин или пароль', 'error');
            // Анимация тряски
            const form = document.querySelector('.admin-login-content');
            form.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => form.style.animation = '', 500);
        }
    }

    enableAdminFeatures() {
        console.log('🔧 Активированы функции администрирования');
        this.overrideConsoleLog();
        this.addGlobalAdminFunctions();
        this.createAdminPanel();
    }

    createAdminPanel() {
        const oldPanel = document.getElementById('adminPanel');
        if (oldPanel) oldPanel.remove();

        const panelHTML = `
            <div id="adminPanel" class="admin-panel">
                <div class="panel-header">
                    <div class="panel-title">
                        <span class="panel-icon">🔧</span>
                        Панель управления
                        <span class="user-badge">${this.currentUser}</span>
                    </div>
                    <div class="panel-controls">
                        <button class="panel-btn refresh-btn" title="Обновить логи">
                            🔄
                        </button>
                        <button class="panel-btn clear-btn" title="Очистить логи">
                            🗑️
                        </button>
                        <button class="panel-btn close-btn" title="Закрыть панель">
                            ✕
                        </button>
                    </div>
                </div>
                
                <div class="panel-stats">
                    <div class="stat-item">
                        <span class="stat-label">Логи:</span>
                        <span class="stat-value" id="logsCount">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Ошибки:</span>
                        <span class="stat-value error-count" id="errorsCount">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Сессия:</span>
                        <span class="stat-value" id="sessionTime">активна</span>
                    </div>
                </div>
                
                <div class="logs-container">
                    <div class="logs-header">
                        <span>Системные логи (последние 50):</span>
                        <button class="auto-scroll-btn" id="autoScrollBtn" title="Автопрокрутка">📜</button>
                    </div>
                    <div id="adminLogs" class="admin-logs">
                        <div class="log-placeholder">Логи будут отображаться здесь...</div>
                    </div>
                </div>
                
                <div class="panel-footer">
                    <button class="logout-btn" id="adminLogoutBtn">
                        🚪 Выйти
                    </button>
                    <span class="panel-version">v2.0</span>
                </div>
            </div>
        `;

        const panel = document.createElement('div');
        panel.innerHTML = panelHTML;
        document.body.appendChild(panel);

        // Обработчики событий
        document.querySelector('.close-btn').addEventListener('click', () => {
            panel.remove();
        });

        document.querySelector('.refresh-btn').addEventListener('click', () => {
            this.updateAdminLogs();
        });

        document.querySelector('.clear-btn').addEventListener('click', () => {
            this.adminLogs = [];
            this.updateAdminLogs();
            this.showNotification('🗑️ Логи очищены', 'info');
        });

        document.getElementById('adminLogoutBtn').addEventListener('click', () => {
            localStorage.removeItem('gamefinder_admin_session');
            location.reload();
        });

        document.getElementById('autoScrollBtn').addEventListener('click', (e) => {
            e.target.classList.toggle('active');
        });

        this.updateAdminLogs();
    }

    overrideConsoleLog() {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        console.log = (...args) => {
            this.adminLogs.push({
                type: 'log',
                timestamp: new Date().toLocaleTimeString(),
                message: args.join(' ')
            });
            originalLog(...args);
            this.updateAdminLogs();
        };

        console.error = (...args) => {
            this.adminLogs.push({
                type: 'error',
                timestamp: new Date().toLocaleTimeString(),
                message: args.join(' ')
            });
            originalError(...args);
            this.updateAdminLogs();
        };

        console.warn = (...args) => {
            this.adminLogs.push({
                type: 'warn',
                timestamp: new Date().toLocaleTimeString(),
                message: args.join(' ')
            });
            originalWarn(...args);
            this.updateAdminLogs();
        };
    }

    updateAdminLogs() {
        const logsContainer = document.getElementById('adminLogs');
        if (!logsContainer) return;

        const recentLogs = this.adminLogs.slice(-50);
        
        if (recentLogs.length === 0) {
            logsContainer.innerHTML = '<div class="log-placeholder">Нет записей в логах</div>';
            return;
        }

        logsContainer.innerHTML = recentLogs.map(log => `
            <div class="log-entry log-${log.type}">
                <span class="log-time">[${log.timestamp}]</span>
                <span class="log-message">${this.escapeHtml(log.message)}</span>
            </div>
        `).join('');

        // Автопрокрутка если включена
        const autoScrollBtn = document.getElementById('autoScrollBtn');
        if (autoScrollBtn && autoScrollBtn.classList.contains('active')) {
            logsContainer.scrollTop = logsContainer.scrollHeight;
        }

        // Обновляем статистику
        this.updateStats();
    }

    updateStats() {
        const logsCount = document.getElementById('logsCount');
        const errorsCount = document.getElementById('errorsCount');
        
        if (logsCount) {
            logsCount.textContent = this.adminLogs.length;
        }
        
        if (errorsCount) {
            const errorCount = this.adminLogs.filter(log => log.type === 'error').length;
            errorsCount.textContent = errorCount;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    addGlobalAdminFunctions() {
        window.admin = {
            getCurrentUser: () => this.currentUser,
            
            logout: () => {
                localStorage.removeItem('gamefinder_admin_session');
                location.reload();
            },
            
            togglePanel: () => {
                const panel = document.getElementById('adminPanel');
                if (panel) {
                    panel.remove();
                } else {
                    this.createAdminPanel();
                }
            },
            
            getStats: () => {
                return {
                    currentUser: this.currentUser,
                    totalLogs: this.adminLogs.length,
                    errorLogs: this.adminLogs.filter(log => log.type === 'error').length,
                    warningLogs: this.adminLogs.filter(log => log.type === 'warn').length,
                    sessionStart: new Date().toLocaleString()
                };
            },
            
            // Новая функция: экспорт логов
            exportLogs: () => {
                const data = JSON.stringify(this.adminLogs, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `gamefinder-logs-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
            }
        };

        console.log('🔧 Глобальные админ-функции загружены: window.admin');
        console.log('📋 Доступные команды: admin.getStats(), admin.togglePanel(), admin.exportLogs()');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `admin-notification admin-notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }
}


// Основной класс приложения
class GameFinderApp {
    constructor() {
        console.log('🎮 Initializing GameFinderApp...');
        
        // Ждем загрузки конфигурации перед инициализацией AI
        this.initAppWithConfig();
    }

    async initAppWithConfig() {
        // Ждем загрузки конфигурации
        await loadConfiguration();
        
        console.log('🔧 Конфигурация загружена:', {
            hasDeepseek: !!window.CONFIG.DEEPSEEK_API_KEY && window.CONFIG.DEEPSEEK_API_KEY !== 'demo-deepseek-key',
            hasGemini: !!window.CONFIG.GEMINI_API_KEY && window.CONFIG.GEMINI_API_KEY !== 'demo-gemini-key',
            activeAI: window.CONFIG.ACTIVE_AI
        });

        // Теперь инициализируем AI с правильными ключами
        setTimeout(() => {
            this.initializeAI();
        }, 100);
        
        this.priceAPI = window.priceAPI;
        this.currentAI = window.CONFIG.ACTIVE_AI;
        this.audioContext = null;
        
        this.initAudioSystem();
        this.initApp();
    }

    initializeAI() {
        console.log('🔧 Initializing AI...');
        
        // Проверяем доступность DirectGameSearchAI
        if (typeof DirectGameSearchAI === 'function') {
            this.gameSearchAI = new DirectGameSearchAI();
            console.log('✅ DirectGameSearchAI initialized successfully');
        } else {
            console.error('❌ DirectGameSearchAI class not found!');
            console.log('📋 Available globals:', Object.keys(window).filter(key => 
                typeof window[key] === 'function' && key.includes('AI') || key.includes('ai')
            ));
        }
    }
    
    
    initApp() {
        try {
            this.initDOMElements();
            this.initEventListeners();
            this.createParticles();
            this.createStars();
            this.createStarShower();
            
            // Инициализируем выбор AI
            this.initAISelector();
            
            this.initEasterEggs();
            this.initSecretClicks();
            this.initTouchGestures();
            this.initHiddenFeatures();
            
            this.setupNavigation();
            this.setupDownloadTracking();
            this.initScrollHeader();
            
            console.log('✅ GameFinderApp initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing GameFinderApp:', error);
        }
    
}
    
    initAudioSystem() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('🔊 Audio system initialized');
        } catch (error) {
            console.warn('🔇 Web Audio API not supported:', error);
        }
    }
    
    // Метод для воспроизведения звуков
    playSound(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = type;
            oscillator.frequency.value = frequency;
            
            gainNode.gain.value = volume;
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
            
        } catch (error) {
            console.warn('🔇 Sound error:', error);
        }
    }

     initAISelector() {
        const aiRadios = document.querySelectorAll('input[name="ai-model"]');
        const currentAiName = document.getElementById('current-ai-name');
        
        // Устанавливаем начальное значение
        this.updateAIDisplay();
        
        aiRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.currentAI = e.target.value;
                    console.log(`🤖 AI model changed to: ${this.currentAI}`);
                    this.updateAIDisplay();
                    
                    // Воспроизводим звук переключения
                    this.safePlaySound(523, 0.1, 'sine', 0.1);
                }
            });
        });
    }
     updateAIDisplay() {
        const currentAiName = document.getElementById('current-ai-name');
        if (currentAiName) {
            const aiNames = {
                'deepseek': ' (DeepSeek)',
                'gemini': ' (Gemini)'
            };
            currentAiName.textContent = aiNames[this.currentAI] || '';
        }
        
        // Также обновляем CONFIG для direct-ai.js
        if (typeof CONFIG !== 'undefined') {
            CONFIG.ACTIVE_AI = this.currentAI;
        }
    }

    getFallbackData(query = "общий запрос") {
        console.log('🔄 Using fallback data with popular games');
        
        return {
            analysis: {
                understoodMood: "Разнообразные игровые предпочтения",
                recommendedStyle: "Популярные игры разных жанров", 
                keyFactors: ["универсальность", "качество", "доступность", "разнообразие"],
                reasoning: "Подобраны 20 популярных игр, подходящих под разные вкусы и предпочтения"
            },
            games: [
                {
                    name: "The Witcher 3: Wild Hunt",
                    genre: "RPG",
                    description: "Эпическая RPG с богатым сюжетом и открытым миром, где вы - Геральт из Ривии, охотник на чудовищ.",
                    moodMatch: 0.95,
                    playtime: "50-100 часов",
                    vibe: "Эпическая фэнтези-сага",
                    whyPerfect: "Идеально подходит для любителей глубоких сюжетов и моральных выборов",
                    platforms: ["PC", "PS4", "XBOX", "Switch"],
                    reviewPercent: 93,
                    reviewCount: 850000
                },
                {
                    name: "Cyberpunk 2077",
                    genre: "Action RPG", 
                    description: "Футуристический экшен-RPG в открытом мире Найт-Сити с продвинутыми киберимплантами.",
                    moodMatch: 0.88,
                    playtime: "40-80 часов",
                    vibe: "Киберпанк-антиутопия",
                    whyPerfect: "Отличный выбор для любителей научной фантастики и нелинейных сюжетов",
                    platforms: ["PC", "PS5", "XBOX Series X"],
                    reviewPercent: 86,
                    reviewCount: 520000
                },
                {
                    name: "Red Dead Redemption 2",
                    genre: "Action-Adventure",
                    description: "Приключенческий боевик о жизни бандитов на Диком Западе в эпоху заката ковбоев.",
                    moodMatch: 0.92,
                    playtime: "60-100 часов", 
                    vibe: "Вестерн-эпопея",
                    whyPerfect: "Погружает в атмосферу Дикого Запада с детализированным миром",
                    platforms: ["PC", "PS4", "XBOX"],
                    reviewPercent: 90,
                    reviewCount: 680000
                },
                {
                    name: "Baldur's Gate 3",
                    genre: "RPG",
                    description: "Глубокая RPG на основе D&D с тактическими боями и множеством вариантов развития сюжета.",
                    moodMatch: 0.94,
                    playtime: "80-150 часов",
                    vibe: "Фэнтези-приключение", 
                    whyPerfect: "Идеальна для любителей тактических сражений и сложных диалогов",
                    platforms: ["PC", "PS5", "XBOX Series X"],
                    reviewPercent: 96,
                    reviewCount: 420000
                },
                {
                    name: "Elden Ring",
                    genre: "Action RPG",
                    description: "Сложная action-RPG с открытым миром от создателей Dark Souls.",
                    moodMatch: 0.87,
                    playtime: "70-120 часов",
                    vibe: "Мрачное фэнтези",
                    whyPerfect: "Подходит для игроков, ищущих сложный вызов и исследование",
                    platforms: ["PC", "PS4", "PS5", "XBOX"],
                    reviewPercent: 89,
                    reviewCount: 580000
                },
                {
                    name: "Grand Theft Auto V",
                    genre: "Action-Adventure", 
                    description: "Криминальный экшен в открытом мире Лос-Сантоса с тремя протагонистами.",
                    moodMatch: 0.85,
                    playtime: "30-80 часов",
                    vibe: "Криминальная сатира",
                    whyPerfect: "Отлично подходит для любителей свободы действий и черного юмора",
                    platforms: ["PC", "PS4", "PS5", "XBOX"],
                    reviewPercent: 91,
                    reviewCount: 1200000
                },
                {
                    name: "The Legend of Zelda: Breath of the Wild",
                    genre: "Action-Adventure",
                    description: "Приключенческий экшен с открытым миром Хайрула и физическим движком.",
                    moodMatch: 0.93,
                    playtime: "50-100 часов",
                    vibe: "Приключенческое фэнтези", 
                    whyPerfect: "Идеальна для исследователей и любителей головоломок",
                    platforms: ["Switch", "Wii U"],
                    reviewPercent: 94,
                    reviewCount: 350000
                },
                {
                    name: "God of War (2018)",
                    genre: "Action-Adventure",
                    description: "Эпическое приключение Кратоса и его сына Атрея по скандинавским мифам.",
                    moodMatch: 0.91,
                    playtime: "25-40 часов",
                    vibe: "Мифологический эпос",
                    whyPerfect: "Отличный выбор для любителей качественных нарративов и динамичных боев",
                    platforms: ["PC", "PS4"],
                    reviewPercent: 92,
                    reviewCount: 480000
                },
                {
                    name: "Minecraft",
                    genre: "Sandbox",
                    description: "Песочница с бесконечными возможностями для творчества и выживания.",
                    moodMatch: 0.82,
                    playtime: "Бесконечно",
                    vibe: "Творческая песочница",
                    whyPerfect: "Подходит для расслабленного творчества и строительства",
                    platforms: ["PC", "Все консоли", "Мобильные"],
                    reviewPercent: 88,
                    reviewCount: 2500000
                },
                {
                    name: "Counter-Strike 2", 
                    genre: "FPS",
                    description: "Командный тактический шутер с соревновательными матчами и точной стрельбой.",
                    moodMatch: 0.79,
                    playtime: "Бесконечно",
                    vibe: "Командное соперничество",
                    whyPerfect: "Идеален для любителей соревновательных игр и тактики",
                    platforms: ["PC"],
                    reviewPercent: 85,
                    reviewCount: 1800000
                }
            ]
        };
    }
    initScrollHeader() {
    let lastScrollY = window.scrollY;
    const header = document.querySelector('.header');
    const scrolledClass = 'scrolled';
    
    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 50) {
            header.classList.add(scrolledClass);
        } else {
            header.classList.remove(scrolledClass);
        }
        
        lastScrollY = currentScrollY;
    };
    
    // Оптимизация скролла
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // Инициализация при загрузке
    handleScroll();
}


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
    
    // Мемные божественные звуки
    this.playGodModeSounds();
    
    // Показываем фото Иисуса
    this.showJesusImage();
    
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach(card => {
        card.style.background = 'linear-gradient(45deg, rgba(255,215,0,0.3), rgba(255,193,7,0.2))';
        card.style.borderColor = 'gold';
        card.style.boxShadow = '0 0 30px gold';
    });
    
    this.showEasterEggMessage('🌟 GOD MODE ACTIVATED! Unlimited Power!', 'god');
    this.addGodCursor();
    
    // Добавляем божественные частицы
    this.createGodParticles();
}

showJesusImage() {
    console.log('🖼️ Showing Jesus PNG image...');
    
    const jesusContainer = document.createElement('div');
    jesusContainer.className = 'jesus-container';
    jesusContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: -300px;
        transform: translateY(-50%);
        z-index: 10001;
        animation: jesusSlideIn 1s ease-out forwards;
        pointer-events: none;
        text-align: center;
        font-family: Arial, sans-serif;
    `;
    
    // Список возможных имен PNG файлов
    const pngNames = [
        './images/jesus.png',
        './images/jesus-meme.png', 
        './images/jesus_christ.png',
        './images/Jesus.png',
        './images/god.png',
        './images/christ.png'
    ];
    
    const img = document.createElement('img');
    img.alt = "Jesus";
    img.style.cssText = `
        width: 250px; 
        height: 250px; 
        border-radius: 15px; 
        border: 4px solid gold; 
        box-shadow: 0 0 50px gold;
        object-fit: cover; 
        background: white;
    `;
    
    let currentImageIndex = 0;
    
    img.onload = function() {
        console.log(`✅ PNG image loaded: ${pngNames[currentImageIndex]}`);
    };
    
    img.onerror = function() {
        console.log(`❌ PNG image failed: ${pngNames[currentImageIndex]}`);
        currentImageIndex++;
        if (currentImageIndex < pngNames.length) {
            this.src = pngNames[currentImageIndex];
            console.log(`🔄 Trying: ${pngNames[currentImageIndex]}`);
        } else {
            console.log('❌ All PNGs failed, using emoji');
            this.style.display = 'none';
            const emojiFallback = document.createElement('div');
            emojiFallback.innerHTML = '👼';
            emojiFallback.style.cssText = `
                font-size: 120px; 
                animation: jesusFloat 3s ease-in-out infinite;
                filter: drop-shadow(0 0 20px gold);
            `;
            this.parentElement.appendChild(emojiFallback);
        }
    };
    
    // Начинаем загрузку с первого PNG
    img.src = pngNames[0];
    
    const imageContainer = document.createElement('div');
    imageContainer.style.cssText = 'animation: jesusFloat 3s ease-in-out infinite;';
    imageContainer.appendChild(img);
    
    jesusContainer.appendChild(imageContainer);
    
    const textDiv = document.createElement('div');
    textDiv.innerHTML = `
        <div style="color: gold; font-size: 1.8rem; font-weight: bold; margin-top: 15px;
                   text-shadow: 0 0 20px gold, 0 0 40px orange;">
            🙏 GOD MODE 🙏
        </div>
        <div style="color: #ffd700; font-size: 1.1rem; margin-top: 8px; opacity: 0.9;">
            Divine Power!
        </div>
    `;
    jesusContainer.appendChild(textDiv);
    
    document.body.appendChild(jesusContainer);
    
    setTimeout(() => {
        if (jesusContainer.parentNode) {
            jesusContainer.style.animation = 'jesusSlideOut 1s ease-in forwards';
            setTimeout(() => {
                if (jesusContainer.parentNode) jesusContainer.remove();
            }, 1000);
        }
    }, 5000);
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
        <div style="margin-bottom: 5px;">🎯 Ты это нашел. Молодец!</div>
        <div style="font-size: 12px; opacity: 0.8;">Ищи дальше пасхалки! (их тут много.)</div>
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
    
    // Клики создают музыкальные круги со звуками
    const musicHandler = (e) => {
        this.createMusicCircle(e);
        this.playMusicNote(e.clientX, e.clientY); // Звук зависит от позиции
    };
    
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
playMusicNote(x, y) {
    if (!this.audioContext) return;
    
    // Частота зависит от позиции на экране
    const frequency = 200 + (x / window.innerWidth) * 1000 + (y / window.innerHeight) * 500;
    const duration = 0.5;
    
    // Разные осцилляторы для разных "инструментов"
    const types = ['sine', 'square', 'sawtooth', 'triangle'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    this.playSound(frequency, duration, type, 0.2);
    
    // Дополнительный звук для обертонов
    setTimeout(() => {
        this.playSound(frequency * 1.5, duration * 0.7, type, 0.1);
    }, 50);
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
    this.showEasterEggMessage('🥁 Drum Mode! Click drums!', 'drum');
    
    // Создаем виртуальные барабаны со звуками
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
        background: rgba(0,0,0,0.9);
        padding: 20px;
        border-radius: 15px;
        z-index: 10000;
        display: flex;
        gap: 15px;
        border: 2px solid #ff6b6b;
    `;
    
    const drumSounds = [
        { emoji: '🥁', freq: 150, type: 'sine' },    // Bass drum
        { emoji: '🎸', freq: 300, type: 'square' },  // Snare
        { emoji: '🎹', freq: 400, type: 'sine' },    // Hi-hat
        { emoji: '🎺', freq: 500, type: 'sawtooth' }, // Tom
        { emoji: '🎻', freq: 600, type: 'triangle' } // Cymbal
    ];
    
    drumSounds.forEach((drum, index) => {
        const pad = document.createElement('div');
        pad.className = 'drum-pad';
        pad.innerHTML = drum.emoji;
        pad.style.cssText = `
            width: 60px;
            height: 60px;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
            cursor: pointer;
            transition: all 0.1s ease;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        `;
        
        pad.addEventListener('click', () => {
            // Визуальная обратная связь
            pad.style.transform = 'scale(0.9)';
            pad.style.background = 'linear-gradient(45deg, #ff4444, #22d3ee)';
            
            // Звук барабана
            this.playDrumSound(drum.freq, drum.type);
            
            // Создаем звуковую волну
            this.createSoundWave(pad);
            
            setTimeout(() => {
                pad.style.transform = 'scale(1)';
                pad.style.background = 'linear-gradient(45deg, #ff6b6b, #4ecdc4)';
            }, 100);
        });
        
        // Добавляем клавиши для барабанов (1-5)
        document.addEventListener('keydown', (e) => {
            if (e.code === `Digit${index + 1}`) {
                pad.click();
            }
        });
        
        drums.appendChild(pad);
    });
    
    // Инструкция
    const instruction = document.createElement('div');
    instruction.style.cssText = `
        color: white;
        text-align: center;
        margin-top: 10px;
        font-size: 0.8rem;
        opacity: 0.8;
    `;
    instruction.textContent = 'Press 1-5 or click drums!';
    drums.appendChild(instruction);
    
    document.body.appendChild(drums);
    
    setTimeout(() => {
        if (drums.parentNode) drums.remove();
        this.showEasterEggMessage('🥁 Drum Mode Ended', 'drum');
    }, 15000);
}
playDrumSound(frequency, type) {
    if (!this.audioContext) return;
    
    try {
        // Основной звук
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        
        // Энвелопа для барабанного звука
        gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
        
        // Шум для атаки
        setTimeout(() => {
            this.playSound(frequency * 2, 0.1, 'square', 0.1);
        }, 10);
        
    } catch (error) {
        console.warn('🔇 Drum sound error:', error);
    }
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
    
    // Звуковая последовательность для кода Конами
    this.playSoundSequence([523, 587, 659, 698, 784, 880, 988, 1047]);
    
    this.createConfetti();
    document.body.style.background = 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7)';
    this.showEasterEggMessage('🎮 Konami Code Activated! +30 Lives!', 'retro');
}

activateGodMode() {
    console.log('🌟 God Mode Activated!');
    
    // Эпический аккорд
    this.playChord([261, 329, 392, 523]); // C major chord
    
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach(card => {
        card.style.background = 'linear-gradient(45deg, rgba(255,215,0,0.3), rgba(255,193,7,0.2))';
        card.style.borderColor = 'gold';
        card.style.boxShadow = '0 0 30px gold';
    });
    
    this.showEasterEggMessage('🌟 GOD MODE ACTIVATED! Unlimited Power!', 'god');
    this.addGodCursor();
}

activateRickroll() {
    console.log('🎵 Never gonna give you up!');
    
    // Начальные ноты песни
    this.playSoundSequence([392, 440, 494, 523, 587, 659, 698, 784]);
    
    const video = document.createElement('div');
    video.className = 'rickroll-video';
    video.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                   background: black; padding: 20px; border-radius: 15px; z-index: 10000; text-align: center;">
            <div style="color: white; margin-bottom: 10px; font-size: 1.2rem;">🎵 Never gonna give you up! 🎵</div>
            <audio id="rickrollAudio" controls autoplay style="margin-bottom: 15px;">
                <source src="https://www.soundjay.com/misc/sounds/fail-buzzer-02.wav" type="audio/wav">
            </audio>
            <br>
            <button onclick="this.parentElement.parentElement.remove(); document.getElementById('rickrollAudio')?.pause();" 
                    style="margin-top: 10px; padding: 8px 16px; background: #ff4444; color: white; 
                           border: none; border-radius: 5px; cursor: pointer;">
                ❌ Close
            </button>
        </div>
    `;
    document.body.appendChild(video);
    
    this.showEasterEggMessage('🎵 Never gonna give you up!', 'rickroll');
}

// Вспомогательные методы для звуков
playSoundSequence(frequencies, interval = 150) {
    frequencies.forEach((freq, index) => {
        setTimeout(() => {
            this.playSound(freq, 0.3, 'sine', 0.2);
        }, index * interval);
    });
}

playChord(frequencies) {
    frequencies.forEach(freq => {
        this.playSound(freq, 1.0, 'sine', 0.15);
    });
}

playErrorSound() {
    this.playSoundSequence([220, 196, 185, 175], 100);
}

playSuccessSound() {
    this.playSoundSequence([523, 659, 784], 200);
}

activateGodMode() {
    console.log('🌟 God Mode Activated!');
    
    // Мемные божественные звуки
    this.playGodModeSounds();
    
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach(card => {
        card.style.background = 'linear-gradient(45deg, rgba(255,215,0,0.3), rgba(255,193,7,0.2))';
        card.style.borderColor = 'gold';
        card.style.boxShadow = '0 0 30px gold';
    });
    
    this.showEasterEggMessage('🌟 GOD MODE ACTIVATED! Unlimited Power!', 'god');
    this.addGodCursor();
    
    // Добавляем божественные частицы
    this.createGodParticles();
}

playGodModeSounds() {
    if (!this.audioContext) return;
    
    try {
        // 1. Звук хора ангелов (мемный)
        this.playAngelChoir();
        
        // 2. Звук божественного сияния
        setTimeout(() => {
            this.playDivineSparkle();
        }, 500);
        
        // 3. Эпичный бас-дроп (мем)
        setTimeout(() => {
            this.playEpicBassDrop();
        }, 1000);
        
        // 4. Звук небесных врат
        setTimeout(() => {
            this.playHeavenlyGates();
        }, 1500);
        
    } catch (error) {
        console.warn('🔇 God mode sound error:', error);
    }
}

playAngelChoir() {
    // Хор ангелов (мемная версия)
    const frequencies = [329, 392, 440, 523, 659]; // E4, G4, A4, C5, E5
    const types = ['sine', 'triangle'];
    
    frequencies.forEach((freq, index) => {
        setTimeout(() => {
            const type = types[index % types.length];
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = type;
            oscillator.frequency.value = freq;
            
            // Плавное нарастание и затухание как у хора
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.5);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 2);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 2);
            
        }, index * 100);
    });
}

playDivineSparkle() {
    // Божественное сияние (звонкие высокие частоты)
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const freq = 1000 + Math.random() * 1000;
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.value = freq;
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);
            
        }, i * 50);
    }
}

playEpicBassDrop() {
    // Эпичный бас-дроп (мемный)
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = 'sawtooth';
    
    // Падение частоты для эффекта "дропа"
    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 1);
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1.5);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 1.5);
    
    // Добавляем шум для мощности
    setTimeout(() => {
        this.playSound(80, 0.5, 'square', 0.2);
    }, 200);
}

playHeavenlyGates() {
    // Звук открывающихся небесных врат
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = 'sine';
    
    // Медленное нарастание как открывающиеся врата
    oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(400, this.audioContext.currentTime + 2);
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.25, this.audioContext.currentTime + 1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 3);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 3);
}

createGodParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'god-particles';
    particleContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9998;
    `;
    
    document.body.appendChild(particleContainer);
    
    // Создаем нимб из частиц
    this.createHaloParticles(particleContainer);
    
    // Удаляем через 5 секунд
    setTimeout(() => {
        if (particleContainer.parentNode) {
            particleContainer.remove();
        }
    }, 5000);
}

createHaloParticles(container) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const radius = 150; // Увеличиваем радиус чтобы был вокруг Иисуса
    
    // Создаем нимб из частиц вокруг Иисуса
    for (let i = 0; i < 36; i++) {
        const angle = (i / 36) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        const particle = document.createElement('div');
        particle.className = 'halo-particle';
        particle.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 6px;
            height: 6px;
            background: gold;
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            animation: haloFloat 3s ease-in-out infinite;
            animation-delay: ${i * 0.08}s;
            box-shadow: 0 0 8px gold, 0 0 16px gold;
        `;
        
        container.appendChild(particle);
    }
    
    // Добавляем случайные божественные частицы
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            this.createFloatingParticle(container);
        }, i * 100);
    }
}

createFloatingParticle(container) {
    const particle = document.createElement('div');
    const colors = ['gold', '#ffd700', '#fffacd', '#ffff00'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    particle.className = 'floating-particle';
    particle.style.cssText = `
        position: fixed;
        left: ${Math.random() * window.innerWidth}px;
        top: ${Math.random() * window.innerHeight}px;
        width: ${Math.random() * 6 + 4}px;
        height: ${Math.random() * 6 + 4}px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        animation: floatDivine ${Math.random() * 3 + 2}s ease-in-out infinite;
        box-shadow: 0 0 8px ${color};
    `;
    
    container.appendChild(particle);
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
                this.playSound(659, 0.1, 'sine', 0.1);
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

            // ПРОВЕРКА: существует ли gameSearchAI
            if (!this.gameSearchAI) {
                this.showError('AI система не инициализирована. Пожалуйста, обновите страницу.');
                console.error('❌ gameSearchAI is null or undefined');
                return;
            }

            // ПРОВЕРКА: является ли searchGames функцией
            if (typeof this.gameSearchAI.searchGames !== 'function') {
                this.showError('Метод поиска недоступен. Проверьте консоль для деталей.');
                console.error('❌ gameSearchAI.searchGames is not a function');
                console.log('🔍 gameSearchAI object:', this.gameSearchAI);
                console.log('🔍 Available methods:', Object.keys(this.gameSearchAI));
                return;
            }

            this.setLoading(true);
            this.hideError();

            console.log(`🚀 Starting ${this.currentAI} AI search...`);
            console.log('🔧 gameSearchAI object:', this.gameSearchAI);
            
            // Обновляем CONFIG перед поиском
            if (typeof CONFIG !== 'undefined') {
                CONFIG.ACTIVE_AI = this.currentAI;
            }
            
            const results = await this.gameSearchAI.searchGames(query);
            console.log('✅ Search results received:', results);
            
            this.displayResults(results);
            
        } catch (error) {
            console.error('❌ Search error:', error);
            this.showError('Ошибка при поиске: ' + error.message);
        } finally {
            this.setLoading(false);
        }
    }


safePlaySound(frequency, duration, type = 'sine', volume = 0.3) {
    if (!this.audioContext) {
        this.initAudioSystem();
        if (!this.audioContext) return;
    }
    
    // Если контекст приостановлен (браузерная политика)
    if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().then(() => {
            this.playSound(frequency, duration, type, volume);
        });
    } else {
        this.playSound(frequency, duration, type, volume);
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
    
    this.gamesContainer.innerHTML = gamesToShow.map((game, index) => {
        // Генерируем случайный процент отзывов (если нет реальных данных)
        const reviewPercent = game.reviewPercent || Math.floor(Math.random() * 30) + 70; // 70-99%
        const reviewCount = game.reviewCount || Math.floor(Math.random() * 50000) + 1000; // 1000-51000 отзывов
        
        // Определяем цвет в зависимости от процента
        let reviewColor = '#4ecdc4'; // зеленый для высоких оценок
        if (reviewPercent < 70) reviewColor = '#ffd700'; // желтый для средних
        if (reviewPercent < 50) reviewColor = '#ff6b6b'; // красный для низких
        
        return `
        <div class="game-card fade-in-up" style="animation-delay: ${index * 0.05}s" 
             data-game='${JSON.stringify(game).replace(/'/g, "&#39;")}'>
            
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

            <!-- БЛОК ОТЗЫВОВ - ДОБАВЛЕНО -->
            <div class="game-reviews">
                <div class="review-stats">
                    <div class="review-percent" style="color: ${reviewColor}">
                        ${reviewPercent}%
                    </div>
                    <div class="review-info">
                        <div class="review-label">Положительные отзывы</div>
                        <div class="review-count">${reviewCount.toLocaleString()} отзывов</div>
                    </div>
                </div>
                <div class="review-bar">
                    <div class="review-fill" style="width: ${reviewPercent}%; background: ${reviewColor}"></div>
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
        `;
    }).join('');

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
                <span>AI нашёл <strong>${shownCount}</strong> игр</span>
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
window.CONFIG = CONFIG;
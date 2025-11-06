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
            this.setupNavigation();
            this.setupDownloadTracking();
            console.log('✅ GameFinderApp initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing GameFinderApp:', error);
        }
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
        
        const response = await fetch('https://gamefinders.org', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                game: gameData,
                user: 'Website User',
                source: 'website',
                timestamp: new Date().toISOString()
            })
        });

        const result = await response.json();
        
        if (result.ok) {
            console.log('✅ Sent to Discord successfully');
            this.showNotification('🎮 Запрос отправлен в Discord! Проверьте канал.', 'success');
        } else {
            throw new Error(result.error || 'Unknown error');
        }
    } catch (error) {
        console.error('❌ Error sending to Discord:', error);
        this.showNotification('❌ Ошибка отправки в Discord', 'error');
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

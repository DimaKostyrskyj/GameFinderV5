class CatalogManager {
    constructor() {
        this.games = [];
        this.filteredGames = [];
        this.currentPage = 1;
        this.gamesPerPage = 12;
        this.init();
    }

    init() {
        this.loadGames();
        this.initEventListeners();
        this.createParticles();
        this.createStars();
    }

    async loadGames() {
        // Загружаем игры из API или используем демо-данные
        try {
            // Временные демо-данные
            this.games = await this.getDemoGames();
            this.filteredGames = [...this.games];
            this.displayGames();
            this.updateStats();
        } catch (error) {
            console.error('Error loading games:', error);
        }
    }

    getDemoGames() {
        return [
            {
                id: 1,
                name: "Cyberpunk 2077",
                genre: "RPG",
                platforms: ["PC", "Steam", "GOG"],
                image: "https://via.placeholder.com/300x400/1a1a2e/ffffff?text=Cyberpunk+2077",
                description: "Приключение в открытом мире Найт-Сити",
                ourPrice: 1499,
                originalPrice: 2999,
                discount: 50,
                features: ["Открытый мир", "RPG", "Киберпанк"],
                rating: 4.5,
                reviews: 12500
            },
            {
                id: 2,
                name: "Baldur's Gate 3",
                genre: "RPG",
                platforms: ["PC", "Steam"],
                image: "https://via.placeholder.com/300x400/16213e/ffffff?text=Baldur's+Gate+3",
                description: "Эпическая RPG от создателей Divinity",
                ourPrice: 1999,
                originalPrice: 2499,
                discount: 20,
                features: ["RPG", "Тактика", "Фэнтези"],
                rating: 4.8,
                reviews: 8900
            },
            {
                id: 3,
                name: "Elden Ring",
                genre: "RPG",
                platforms: ["PC", "Steam"],
                image: "https://via.placeholder.com/300x400/0f3460/ffffff?text=Elden+Ring",
                description: "Открытый мир в стиле Souls",
                ourPrice: 2499,
                originalPrice: 3499,
                discount: 29,
                features: ["Открытый мир", "RPG", "Сложность"],
                rating: 4.7,
                reviews: 15600
            },
            {
                id: 4,
                name: "Hades II",
                genre: "Roguelike",
                platforms: ["PC", "Steam"],
                image: "https://via.placeholder.com/300x400/533483/ffffff?text=Hades+II",
                description: "Продолжение культового roguelike",
                ourPrice: 1299,
                originalPrice: 1599,
                discount: 19,
                features: ["Roguelike", "Экшен", "Мифология"],
                rating: 4.6,
                reviews: 6700
            },
            {
                id: 5,
                name: "Starfield",
                genre: "RPG",
                platforms: ["PC", "Steam", "Xbox"],
                image: "https://via.placeholder.com/300x400/1f4068/ffffff?text=Starfield",
                description: "Космическая RPG от Bethesda",
                ourPrice: 2999,
                originalPrice: 3999,
                discount: 25,
                features: ["Космос", "RPG", "Исследование"],
                rating: 4.3,
                reviews: 11200
            },
            {
                id: 6,
                name: "Call of Duty: Modern Warfare III",
                genre: "Шутер",
                platforms: ["PC", "Steam", "Battle.net"],
                image: "https://via.placeholder.com/300x400/1b1b2f/ffffff?text=COD+MW3",
                description: "Легендарный шутер возвращается",
                ourPrice: 3499,
                originalPrice: 4499,
                discount: 22,
                features: ["Шутер", "Мультиплеер", "Экшен"],
                rating: 4.2,
                reviews: 8900
            }
        ];
    }

    initEventListeners() {
        // Поиск
        const searchInput = document.getElementById('catalogSearch');
        const searchBtn = document.getElementById('catalogSearchBtn');
        
        if (searchInput && searchBtn) {
            searchBtn.addEventListener('click', () => this.handleSearch());
            searchInput.addEventListener('input', () => this.handleSearch());
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleSearch();
            });
        }

        // Фильтры
        const filters = ['genreFilter', 'priceFilter', 'platformFilter'];
        filters.forEach(filterId => {
            const filter = document.getElementById(filterId);
            if (filter) {
                filter.addEventListener('change', () => this.applyFilters());
            }
        });

        // Кнопка "Показать еще"
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMore());
        }
    }

    handleSearch() {
        const searchInput = document.getElementById('catalogSearch');
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        
        this.applyFilters(searchTerm);
    }

    applyFilters(searchTerm = '') {
        const genreFilter = document.getElementById('genreFilter');
        const priceFilter = document.getElementById('priceFilter');
        const platformFilter = document.getElementById('platformFilter');

        const selectedGenre = genreFilter ? genreFilter.value : '';
        const selectedPrice = priceFilter ? priceFilter.value : '';
        const selectedPlatform = platformFilter ? platformFilter.value : '';

        this.filteredGames = this.games.filter(game => {
            // Поиск по названию
            const matchesSearch = searchTerm === '' || 
                game.name.toLowerCase().includes(searchTerm) ||
                game.description.toLowerCase().includes(searchTerm);

            // Фильтр по жанру
            const matchesGenre = selectedGenre === '' || 
                game.genre.toLowerCase().includes(selectedGenre);

            // Фильтр по платформе
            const matchesPlatform = selectedPlatform === '' ||
                game.platforms.some(platform => 
                    platform.toLowerCase().includes(selectedPlatform)
                );

            // Фильтр по цене
            let matchesPrice = true;
            if (selectedPrice) {
                const [min, max] = selectedPrice.split('-').map(Number);
                if (max) {
                    matchesPrice = game.ourPrice >= min && game.ourPrice <= max;
                } else {
                    matchesPrice = game.ourPrice >= min;
                }
            }

            return matchesSearch && matchesGenre && matchesPlatform && matchesPrice;
        });

        this.currentPage = 1;
        this.displayGames();
        this.updateStats();
    }

    displayGames() {
        const catalogGrid = document.getElementById('catalogGrid');
        if (!catalogGrid) return;

        const startIndex = (this.currentPage - 1) * this.gamesPerPage;
        const endIndex = startIndex + this.gamesPerPage;
        const gamesToShow = this.filteredGames.slice(0, endIndex);

        catalogGrid.innerHTML = gamesToShow.map(game => this.createGameCard(game)).join('');

        // Показываем/скрываем кнопку "Показать еще"
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = endIndex >= this.filteredGames.length ? 'none' : 'block';
        }

        this.initGameCardEvents();
    }

    createGameCard(game) {
        const discountBadge = game.discount ? `
            <div class="discount-badge">-${game.discount}%</div>
        ` : '';

        const originalPrice = game.originalPrice ? `
            <div class="original-price">${game.originalPrice} руб</div>
        ` : '';

        const platforms = game.platforms.map(platform => 
            `<span class="platform-tag">${platform}</span>`
        ).join('');

        const features = game.features.map(feature => 
            `<span class="feature-tag">${feature}</span>`
        ).join('');

        return `
            <div class="catalog-game-card" data-game-id="${game.id}">
                <div class="game-image">
                    <img src="${game.image}" alt="${game.name}" onerror="this.src='https://via.placeholder.com/300x400/2d3748/ffffff?text=No+Image'">
                    ${discountBadge}
                </div>
                
                <div class="game-info">
                    <h3 class="game-title">${game.name}</h3>
                    <div class="game-genre">${game.genre}</div>
                    
                    <div class="game-description">${game.description}</div>
                    
                    <div class="game-platforms">
                        ${platforms}
                    </div>
                    
                    <div class="game-features">
                        ${features}
                    </div>
                    
                    <div class="game-rating">
                        <div class="stars">${'★'.repeat(Math.floor(game.rating))}${'☆'.repeat(5-Math.floor(game.rating))}</div>
                        <span class="rating-text">${game.rating} (${game.reviews.toLocaleString()} отзывов)</span>
                    </div>
                </div>
                
                <div class="game-purchase">
                    <div class="price-section">
                        ${originalPrice}
                        <div class="current-price">${game.ourPrice} руб</div>
                    </div>
                    
                    <button class="buy-btn" data-game-id="${game.id}">
                        <span class="btn-icon">🛒</span>
                        Купить сейчас
                    </button>
                    
                    <div class="price-comparison">
                        <div class="comparison-title">Цены в других магазинах:</div>
                        <div class="other-prices">
                            <div class="other-price">
                                <span>Steam:</span>
                                <span class="price-higher">${Math.round(game.ourPrice * 1.1)} руб</span>
                            </div>
                            <div class="other-price">
                                <span>Epic Games:</span>
                                <span class="price-higher">${Math.round(game.ourPrice * 1.05)} руб</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="delivery-info">
                        <span class="delivery-icon">⚡</span>
                        Мгновенная доставка ключа
                    </div>
                </div>
            </div>
        `;
    }

    initGameCardEvents() {
        // Обработчики для кнопок покупки
        const buyButtons = document.querySelectorAll('.buy-btn');
        buyButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const gameId = button.getAttribute('data-game-id');
                this.handlePurchase(gameId);
            });
        });

        // Клик по карточке игры
        const gameCards = document.querySelectorAll('.catalog-game-card');
        gameCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.buy-btn')) {
                    const gameId = card.getAttribute('data-game-id');
                    this.showGameDetails(gameId);
                }
            });
        });
    }

    handlePurchase(gameId) {
        const game = this.games.find(g => g.id == gameId);
        if (!game) return;

        console.log('Purchasing game:', game.name);
        
        // Здесь будет логика покупки
        this.showPurchaseModal(game);
    }

    showPurchaseModal(game) {
        // Создаем модальное окно покупки
        const modal = document.createElement('div');
        modal.className = 'purchase-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(10px);
        `;

        modal.innerHTML = `
            <div class="modal-content" style="
                background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 20px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                color: white;
            ">
                <h2 style="margin-bottom: 20px; text-align: center;">Покупка "${game.name}"</h2>
                
                <div style="margin-bottom: 20px;">
                    <div style="font-size: 2rem; font-weight: bold; text-align: center; color: #4ecdc4;">
                        ${game.ourPrice} руб
                    </div>
                    ${game.originalPrice ? `
                        <div style="text-align: center; text-decoration: line-through; opacity: 0.7;">
                            ${game.originalPrice} руб
                        </div>
                    ` : ''}
                </div>

                <div style="margin-bottom: 25px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">Email для получения ключа:</label>
                    <input type="email" id="purchaseEmail" placeholder="your@email.com" style="
                        width: 100%;
                        padding: 12px;
                        border-radius: 10px;
                        border: 1px solid rgba(255,255,255,0.3);
                        background: rgba(255,255,255,0.1);
                        color: white;
                        font-size: 16px;
                    ">
                </div>

                <div style="display: flex; gap: 10px;">
                    <button id="confirmPurchase" style="
                        flex: 1;
                        padding: 15px;
                        background: linear-gradient(45deg, #4ecdc4, #44a08d);
                        border: none;
                        border-radius: 10px;
                        color: white;
                        font-weight: bold;
                        cursor: pointer;
                    ">Оплатить ${game.ourPrice} руб</button>
                    
                    <button id="cancelPurchase" style="
                        padding: 15px 20px;
                        background: rgba(255,255,255,0.1);
                        border: 1px solid rgba(255,255,255,0.3);
                        border-radius: 10px;
                        color: white;
                        cursor: pointer;
                    ">Отмена</button>
                </div>

                <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px; font-size: 0.9rem;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <span>⚡</span>
                        <span>Мгновенная доставка ключа на email</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span>🛡️</span>
                        <span>Безопасная оплата через ЮKassa</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Обработчики для модального окна
        document.getElementById('confirmPurchase').addEventListener('click', () => {
            this.processPayment(game);
        });

        document.getElementById('cancelPurchase').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    processPayment(game) {
        const emailInput = document.getElementById('purchaseEmail');
        const email = emailInput.value.trim();

        if (!email || !this.isValidEmail(email)) {
            alert('Пожалуйста, введите корректный email адрес');
            return;
        }

        // Здесь будет интеграция с платежной системой
        console.log('Processing payment for:', game.name, 'Email:', email);
        
        // Временная заглушка
        alert(`Покупка "${game.name}" за ${game.ourPrice} руб\nКлюч будет отправлен на: ${email}\n\n(Это демо-версия, реальная оплата не производится)`);
        
        // Закрываем модальное окно
        const modal = document.querySelector('.purchase-modal');
        if (modal) modal.remove();
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showGameDetails(gameId) {
        const game = this.games.find(g => g.id == gameId);
        if (!game) return;

        // Сохраняем игру в sessionStorage и переходим на страницу деталей
        sessionStorage.setItem('currentGame', JSON.stringify(game));
        window.location.href = 'game-details.html';
    }

    loadMore() {
        this.currentPage++;
        this.displayGames();
    }

    updateStats() {
        const totalGames = document.getElementById('totalGames');
        const discountedGames = document.getElementById('discountedGames');

        if (totalGames) {
            totalGames.textContent = this.filteredGames.length;
        }

        if (discountedGames) {
            const discountedCount = this.filteredGames.filter(game => game.discount > 0).length;
            discountedGames.textContent = discountedCount;
        }
    }

    createParticles() {
        const container = document.getElementById('particles');
        if (!container) return;

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 3 + 1}px;
                height: ${Math.random() * 3 + 1}px;
                background: rgba(255, 255, 255, ${Math.random() * 0.1});
                border-radius: 50%;
                top: ${Math.random() * 100}vh;
                left: ${Math.random() * 100}vw;
                animation: floatParticle ${Math.random() * 10 + 5}s linear infinite;
                animation-delay: ${Math.random() * 5}s;
            `;
            container.appendChild(particle);
        }
    }

    createStars() {
        const container = document.getElementById('stars');
        if (!container) return;

        for (let i = 0; i < 30; i++) {
            const star = document.createElement('div');
            star.className = 'star small';
            star.style.cssText = `
                top: ${Math.random() * 100}vh;
                left: ${Math.random() * 100}vw;
                animation: starFall ${Math.random() * 5 + 3}s linear infinite;
                animation-delay: ${Math.random() * 2}s;
            `;
            container.appendChild(star);
        }
    }
}

// Инициализация каталога при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    window.catalogManager = new CatalogManager();
});
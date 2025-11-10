// Добавьте в начало direct-ai.js
console.log('🔧 Loading DirectGameSearchAI class...');

class DirectGameSearchAI {
    constructor() {
        this.validateConfig();
        this.deepseekBaseURL = 'https://api.deepseek.com/chat/completions';
        this.geminiBaseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
        
        console.log('🔧 DirectGameSearchAI инициализирован с конфигом:', {
            hasDeepseekKey: this.deepseekApiKey !== 'demo-deepseek-key',
            hasGeminiKey: this.geminiApiKey !== 'demo-gemini-key',
            activeAI: window.CONFIG?.ACTIVE_AI || 'deepseek'
        });
    }

    validateConfig() {
        const config = window.CONFIG || {};
        
        this.deepseekApiKey = config.DEEPSEEK_API_KEY || 'demo-deepseek-key';
        this.geminiApiKey = config.GEMINI_API_KEY || 'demo-gemini-key';
        
        // Логируем статус ключей
        console.log('🔐 Статус API ключей:', {
            deepseek: this.deepseekApiKey !== 'demo-deepseek-key' ? '✅ Реальный' : '⚠️ Демо',
            gemini: this.geminiApiKey !== 'demo-gemini-key' ? '✅ Реальный' : '⚠️ Демо'
        });
    }

    async searchGames(userQuery) {
        const activeAI = window.CONFIG?.ACTIVE_AI || 'deepseek';
        console.log(`🎯 Используем AI: ${activeAI}`);
        
        try {
            if (activeAI === 'gemini') {
                return await this.searchWithGemini(userQuery);
            } else {
                return await this.searchWithDeepSeek(userQuery);
            }
        } catch (error) {
            console.error('❌ Ошибка поиска:', error);
            return this.getFallbackData(userQuery);
        }
    }

    async searchWithGemini(userQuery) {
        console.log('🚀 Using Gemini AI');
        
        // Проверяем API ключ
        if (!this.geminiApiKey || this.geminiApiKey === 'demo-gemini-key') {
            console.warn('⚠️ Используется демо-ключ Gemini, переключаемся на DeepSeek');
            return await this.searchWithDeepSeek(userQuery);
        }
        
        try {
            const prompt = this.createGeminiPrompt(userQuery);
            
            const requestData = {
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 8000,
                    topP: 0.8,
                    topK: 40
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_NONE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH", 
                        threshold: "BLOCK_NONE"
                    }
                ]
            };

            console.log('📡 Making API request to Gemini...');
            
            const response = await fetch(
                `${this.geminiBaseURL}?key=${this.geminiApiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    'X-Goog-Api-Key': this.geminiApiKey
                    },
                    body: JSON.stringify(requestData)
                }
            );
            
            console.log('📥 Gemini response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Gemini API error:', response.status, errorText);
                
                let errorMessage = 'Ошибка сервера Gemini';
                if (response.status === 400) errorMessage = 'Неверный запрос к Gemini';
                if (response.status === 403) errorMessage = 'Неверный API ключ Gemini';
                if (response.status === 429) errorMessage = 'Слишком много запросов к Gemini';
                if (response.status === 404) errorMessage = 'Модель не найдена';
                
                throw new Error(`Gemini API: ${errorMessage}`);
            }

            const data = await response.json();
            console.log('✅ Gemini raw response received:', data);

            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                console.error('❌ Invalid Gemini response structure:', data);
                throw new Error('Некорректный ответ от Gemini API');
            }

            const content = data.candidates[0].content.parts[0].text;
            console.log('📝 Gemini content received:', content.substring(0, 500) + '...');

            if (!content) {
                throw new Error('Пустой ответ от Gemini');
            }

            const results = this.parseAIResponse(content);
            
            if (!results.games || results.games.length === 0) {
                throw new Error('Gemini не нашел подходящих игр');
            }
            
            console.log(`🎯 Gemini found ${results.games.length} games`);
            return results;
            
        } catch (error) {
            console.error('❌ Gemini search error:', error);
            // Если Gemini не работает, пробуем DeepSeek как fallback
            console.log('🔄 Falling back to DeepSeek');
            return await this.searchWithDeepSeek(userQuery);
        }
    }

    async searchWithDeepSeek(userQuery) {
        console.log('🚀 Using DeepSeek AI');
        
        // Проверяем API ключ
        if (!this.deepseekApiKey || this.deepseekApiKey === 'demo-deepseek-key') {
            console.warn('⚠️ Используется демо-ключ DeepSeek, возвращаем fallback данные');
            return this.getFallbackData(userQuery);
        }
        
        try {
            const prompt = this.createDeepSeekPrompt(userQuery);
            
            const requestData = {
                'model': 'deepseek-chat',
                'messages': [
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ],
                'max_tokens': 8000,
                'temperature': 0.7,
                'stream': false
            };

            console.log('📡 Making API request to DeepSeek...');
            
            const response = await fetch(this.deepseekBaseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.deepseekApiKey,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
            
            console.log('📥 DeepSeek response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ DeepSeek API error:', response.status, errorText);
                
                let errorMessage = 'Ошибка сервера DeepSeek';
                if (response.status === 401) errorMessage = 'Неверный API ключ DeepSeek';
                if (response.status === 429) errorMessage = 'Превышен лимит запросов DeepSeek';
                if (response.status === 400) errorMessage = 'Неверный запрос к DeepSeek';
                
                throw new Error(`DeepSeek API: ${errorMessage}`);
            }

            const data = await response.json();
            console.log('✅ DeepSeek raw response received');

            if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
                throw new Error('Некорректный ответ от DeepSeek API');
            }

            const content = data.choices[0].message.content;
            console.log('📝 DeepSeek content received:', content.substring(0, 500) + '...');

            if (!content) {
                throw new Error('Пустой ответ от DeepSeek');
            }

            const results = this.parseAIResponse(content);
            
            if (!results.games || results.games.length === 0) {
                throw new Error('DeepSeek не нашел подходящих игр');
            }
            
            console.log(`🎯 DeepSeek found ${results.games.length} games`);
            return results;
            
        } catch (error) {
            console.error('❌ DeepSeek search error:', error);
            // Возвращаем fallback данные если оба AI не работают
            console.log('🔄 Returning fallback data');
            return this.getFallbackData(userQuery);
        }
    }

    createGeminiPrompt(query) {
        return `Ты - эксперт по видеоиграм. Пользователь ищет игры по запросу: "${query}".

ВАЖНЫЕ ИНСТРУКЦИИ:
1. ВЕРНИ ТОЛЬКО JSON БЕЗ ЛЮБЫХ ДОПОЛНИТЕЛЬНЫХ ТЕКСТОВ, КОММЕНТАРИЕВ ИЛИ MARKDOWN
2. В массиве games ДОЛЖНО БЫТЬ РОВНО 20 ИГР
3. Все игры должны быть реально существующими и популярными
4. Используй актуальные данные на 2024-2025 год
5. Все поля должны быть заполнены

JSON структура:

{
    "analysis": {
        "understoodMood": "краткое описание настроения запроса (2-3 слова)",
        "recommendedStyle": "основной стиль игр", 
        "keyFactors": ["ключевой фактор 1", "ключевой фактор 2", "ключевой фактор 3"],
        "reasoning": "краткое объяснение подбора (1 предложение)"
    },
    "games": [
        {
            "name": "Реальное название игры",
            "genre": "Основной жанр",
            "description": "Краткое описание игры (2-3 предложения)",
            "moodMatch": 0.95,
            "playtime": "Основное время прохождения",
            "vibe": "Атмосфера игры",
            "whyPerfect": "Почему подходит под запрос",
            "platforms": ["PC", "PS5", "XBOX"],
            "reviewPercent": 95,
            "reviewCount": 500000
        }
    ]
}

Пример заполнения для запроса "эпические RPG":
{
    "analysis": {
        "understoodMood": "эпические приключения",
        "recommendedStyle": "сюжетные RPG", 
        "keyFactors": ["глубина сюжета", "масштаб мира", "развитие персонажа"],
        "reasoning": "Подобраны лучшие RPG с богатым сюжетом и огромными мирами"
    },
    "games": [
        {
            "name": "The Witcher 3: Wild Hunt",
            "genre": "RPG",
            "description": "Эпическая RPG в мире фэнтези, где вы Геральт из Ривии, охотник на чудовищ. Исследуйте огромный мир, принимайте моральные выборы и сражайтесь с опасными существами.",
            "moodMatch": 0.98,
            "playtime": "50-100 часов",
            "vibe": "Темное фэнтези",
            "whyPerfect": "Одна из лучших RPG всех времен с глубоким сюжетом",
            "platforms": ["PC", "PS4", "PS5", "XBOX", "Switch"],
            "reviewPercent": 93,
            "reviewCount": 850000
        }
    ]
}

ВЕРНИ РОВНО 20 ИГР В МАССИВЕ GAMES!`;
    }

    createDeepSeekPrompt(query) {
        return `Ты - эксперт по видеоиграм. Пользователь ищет игры по запросу: "${query}".

ВАЖНЫЕ ИНСТРУКЦИИ:
1. ВЕРНИ ТОЛЬКО JSON БЕЗ ЛЮБЫХ ДОПОЛНИТЕЛЬНЫХ ТЕКСТОВ, КОММЕНТАРИЕВ ИЛИ MARKDOWN
2. В массиве games ДОЛЖНО БЫТЬ РОВНО 20 ИГР
3. Все игры должны быть реально существующими и популярными
4. Используй актуальные данные на 2024-2025 год
5. Все поля должны быть заполнены

JSON структура:

{
    "analysis": {
        "understoodMood": "краткое описание настроения запроса",
        "recommendedStyle": "основной стиль игр", 
        "keyFactors": ["ключевой фактор 1", "ключевой фактор 2", "ключевой фактор 3"],
        "reasoning": "краткое объяснение подбора"
    },
    "games": [
        {
            "name": "Реальное название игры",
            "genre": "Основной жанр",
            "description": "Краткое описание игры",
            "moodMatch": 0.95,
            "playtime": "Основное время прохождения",
            "vibe": "Атмосфера игры",
            "whyPerfect": "Почему подходит под запрос",
            "platforms": ["PC", "PS5"],
            "reviewPercent": 95,
            "reviewCount": 500000
        }
    ]
}

ВЕРНИ РОВНО 20 ИГР В МАССИВЕ GAMES! Игры должны быть реально существующими и популярными на 2024-2025 год.`;
    }

    parseAIResponse(content) {
        try {
            console.log('🔧 Starting JSON parsing...');
            console.log('📄 Raw content length:', content.length);
            
            let cleanContent = content.trim();
            
            // Выводим первые 500 символов для отладки
            console.log('📝 First 500 chars:', cleanContent.substring(0, 500));
            
            // Удаляем Markdown code blocks если есть
            if (cleanContent.startsWith('```json')) {
                cleanContent = cleanContent.substring(7);
            }
            if (cleanContent.endsWith('```')) {
                cleanContent = cleanContent.substring(0, cleanContent.length - 3);
            }
            cleanContent = cleanContent.trim();

            // Пытаемся найти JSON в тексте если он не чистый
            let jsonStart = cleanContent.indexOf('{');
            let jsonEnd = cleanContent.lastIndexOf('}');
            
            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
            }

            console.log('🧹 Cleaned content length:', cleanContent.length);
            
            // ДОПОЛНИТЕЛЬНАЯ ОЧИСТКА - исправляем распространенные ошибки AI
            cleanContent = this.fixCommonJSONErrors(cleanContent);
            
            // Проверяем, есть ли очевидные ошибки
            this.validateJSONStructure(cleanContent);

            console.log('🔍 Final JSON to parse:', cleanContent.substring(0, 300) + '...');

            const parsed = JSON.parse(cleanContent);
            console.log('✅ JSON parsed successfully');
            
            // Базовая валидация структуры
            if (!parsed.analysis) {
                parsed.analysis = {
                    understoodMood: "Настроение из запроса",
                    recommendedStyle: "Различные стили",
                    keyFactors: ["Настроение", "Предпочтения", "Стиль игры"],
                    reasoning: "AI проанализировал ваш запрос и подобрал разнообразные игры"
                };
            }

            if (!parsed.games || !Array.isArray(parsed.games)) {
                throw new Error('Games array is missing or invalid');
            }

            // Ограничиваем количество игр до 20 и валидируем
            parsed.games = parsed.games.slice(0, 20).map((game, index) => ({
                name: game.name || `Игра ${index + 1}`,
                genre: game.genre || "Жанр не указан",
                description: game.description || "Интересная игра с увлекательным геймплеем",
                moodMatch: typeof game.moodMatch === 'number' ? Math.min(Math.max(game.moodMatch, 0.7), 0.98) : (0.85 + index * 0.005),
                playtime: game.playtime || "10-30 часов", 
                vibe: game.vibe || "Захватывающая атмосфера",
                whyPerfect: game.whyPerfect || "Отлично подходит под ваш запрос",
                platforms: Array.isArray(game.platforms) ? game.platforms : ["PC"],
                reviewPercent: typeof game.reviewPercent === 'number' ? Math.min(Math.max(game.reviewPercent, 50), 99) : (85 + Math.random() * 10),
                reviewCount: typeof game.reviewCount === 'number' ? game.reviewCount : Math.floor(Math.random() * 400000) + 10000
            }));

            return parsed;
            
        } catch (error) {
            console.error('❌ Failed to parse AI response:', error);
            console.log('📄 Problematic content (full):', content);
            // Создаем fallback результат вместо выброса ошибки
            return this.createFallbackResult(content);
        }
    }

    fixCommonJSONErrors(jsonString) {
        let fixed = jsonString;
        
        // 1. Исправляем незакрытые кавычки
        fixed = fixed.replace(/([^\\])"/g, '$1\\"');
        
        // 2. Удаляем лишние запятые перед закрывающими скобками
        fixed = fixed.replace(/,\s*}/g, '}');
        fixed = fixed.replace(/,\s*]/g, ']');
        
        // 3. Исправляем экранированные символы
        fixed = fixed.replace(/\\n/g, ' ');
        fixed = fixed.replace(/\\t/g, ' ');
        fixed = fixed.replace(/\\r/g, ' ');
        
        // 4. Удаляем контрольные символы
        fixed = fixed.replace(/[\x00-\x1F\x7F]/g, '');
        
        // 5. Исправляем неправильные escape-последовательности
        fixed = fixed.replace(/\\'/g, "'");
        fixed = fixed.replace(/\\"/g, '"');
        
        return fixed;
    }

    validateJSONStructure(content) {
        // Проверяем базовую структуру перед парсингом
        const hasOpeningBrace = content.includes('{');
        const hasClosingBrace = content.includes('}');
        const hasGamesArray = content.includes('"games"') || content.includes("'games'");

        if (!hasOpeningBrace || !hasClosingBrace) {
            console.warn('⚠️ JSON missing braces');
        }
        
        if (!hasGamesArray) {
            console.warn('⚠️ JSON missing games array');
        }
    }

    createFallbackResult(originalContent) {
        console.log('🔄 Creating fallback result from AI response');
        
        // Пытаемся извлечь хотя бы названия игр из текста
        const gameMatches = originalContent.match(/"name":\s*"([^"]+)"/g) || 
                           originalContent.match(/'name':\s*'([^']+)'/g) ||
                           [];
        
        const extractedGames = gameMatches.slice(0, 20).map((match, index) => {
            const name = match.replace(/"name":\s*"([^"]+)"/, '$1').replace(/'name':\s*'([^']+)'/, '$1');
            return {
                name: name || `Игра ${index + 1}`,
                genre: "Жанр не определен",
                description: "Описание недоступно - ошибка парсинга AI ответа",
                moodMatch: 0.85 + index * 0.01,
                playtime: "10-30 часов",
                vibe: "Атмосфера не определена",
                whyPerfect: "AI рекомендует эту игру",
                platforms: ["PC"],
                reviewPercent: 80 + Math.random() * 15,
                reviewCount: Math.floor(Math.random() * 400000) + 10000
            };
        });

        return {
            analysis: {
                understoodMood: "Ошибка анализа запроса",
                recommendedStyle: "Различные жанры", 
                keyFactors: ["доступность", "популярность", "качество"],
                reasoning: "AI предоставил ответ с ошибками формата, но мы извлекли некоторые рекомендации"
            },
            games: extractedGames.length > 0 ? extractedGames : this.getPopularGames()
        };
    }

    getPopularGames() {
        // Fallback список популярных игр
        return [
            {
                name: "The Witcher 3: Wild Hunt",
                genre: "RPG",
                description: "Эпическая RPG с богатым сюжетом и открытым миром",
                moodMatch: 0.95,
                playtime: "50-100 часов",
                vibe: "Фэнтези-эпопея",
                whyPerfect: "Классика жанра RPG",
                platforms: ["PC", "PS4", "XBOX", "Switch"],
                reviewPercent: 93,
                reviewCount: 850000
            },
            {
                name: "Cyberpunk 2077",
                genre: "Action RPG", 
                description: "Футуристический экшен-RPG в открытом мире Найт-Сити",
                moodMatch: 0.88,
                playtime: "40-80 часов",
                vibe: "Киберпанк-антиутопия",
                whyPerfect: "Отличный выбор для любителей научной фантастики",
                platforms: ["PC", "PS5", "XBOX Series X"],
                reviewPercent: 86,
                reviewCount: 520000
            },
            {
                name: "Red Dead Redemption 2",
                genre: "Action-Adventure",
                description: "Приключенческий боевик о жизни бандитов на Диком Западе",
                moodMatch: 0.92,
                playtime: "60-100 часов", 
                vibe: "Вестерн-эпопея",
                whyPerfect: "Погружает в атмосферу Дикого Запада",
                platforms: ["PC", "PS4", "XBOX"],
                reviewPercent: 90,
                reviewCount: 680000
            },
            {
                name: "Baldur's Gate 3",
                genre: "RPG",
                description: "Глубокая RPG на основе D&D с тактическими боями",
                moodMatch: 0.94,
                playtime: "80-150 часов",
                vibe: "Фэнтези-приключение", 
                whyPerfect: "Идеальна для любителей тактических сражений",
                platforms: ["PC", "PS5", "XBOX Series X"],
                reviewPercent: 96,
                reviewCount: 420000
            },
            {
                name: "Elden Ring",
                genre: "Action RPG",
                description: "Сложная action-RPG с открытым миром",
                moodMatch: 0.87,
                playtime: "70-120 часов",
                vibe: "Мрачное фэнтези",
                whyPerfect: "Подходит для игроков, ищущих сложный вызов",
                platforms: ["PC", "PS4", "PS5", "XBOX"],
                reviewPercent: 89,
                reviewCount: 580000
            }
        ].slice(0, 20);
    }
}

// Экспортируем класс
if (typeof window !== 'undefined') {
    window.DirectGameSearchAI = DirectGameSearchAI;
    console.log('🌐 DirectGameSearchAI added to window object with methods');
}
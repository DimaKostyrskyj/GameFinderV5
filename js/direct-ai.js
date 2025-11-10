// Добавьте в начало direct-ai.js
console.log('🔧 Loading DirectGameSearchAI class...');

class DirectGameSearchAI {
    constructor() {
        this.deepseekApiKey = 'sk-7f36fac6978e4df0b3ee1e97534d5fc4';
        this.deepseekBaseURL = 'https://api.deepseek.com/chat/completions';
        
        // ПРАВИЛЬНЫЙ URL для Gemini - используем gemini-2.5-flash
        this.geminiBaseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
        this.geminiApiKey = 'AIzaSyAQhlLbVo9GRHCaeLOfCMxh9GiFfIOEpO0';
    }

    // ДОБАВЬТЕ ВСЕ МЕТОДЫ КЛАССА:

    async searchGames(userQuery) {
        console.log('🎯 DirectGameSearchAI.searchGames method called with:', userQuery);
        
        try {
            if (!userQuery || userQuery.trim() === '') {
                throw new Error('Поисковый запрос не может быть пустым');
            }

            console.log('🤖 Using AI model:', CONFIG?.ACTIVE_AI || 'deepseek');

            if (CONFIG?.ACTIVE_AI === 'gemini') {
                return await this.searchWithGemini(userQuery);
            } else {
                return await this.searchWithDeepSeek(userQuery);
            }
            
        } catch (error) {
            console.error('❌ AI search error:', error);
            throw error;
        }
    }

    async searchWithGemini(userQuery) {
        console.log('🚀 Using Gemini AI');
        
        try {
            const prompt = this.createGeminiPrompt(userQuery);
            
            const requestData = {
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 4000,
                }
            };

            console.log('📡 Making API request to Gemini...');
            
            // ПРАВИЛЬНЫЙ URL с правильной моделью
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.geminiApiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
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
            console.log('✅ Gemini raw response received');

            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                throw new Error('Некорректный ответ от Gemini API');
            }

            const content = data.candidates[0].content.parts[0].text;
            console.log('📝 Gemini content received');

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
                'max_tokens': 4000,
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
                throw new Error(`DeepSeek API error: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ DeepSeek raw response received');

            if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
                throw new Error('Некорректный ответ от DeepSeek API');
            }

            const content = data.choices[0].message.content;
            console.log('📝 DeepSeek content received');

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
            throw error;
        }
    }

    createGeminiPrompt(query) {
        return `Пользователь ищет игры по запросу: "${query}". 

Верни ТОЛЬКО JSON без каких-либо дополнительных текстов:

{
    "analysis": {
        "understoodMood": "краткое описание настроения",
        "recommendedStyle": "стиль игр", 
        "keyFactors": ["фактор1", "фактор2", "фактор3"],
        "reasoning": "краткое объяснение подбора"
    },
    "games": [
        {
            "name": "Название игры 1",
            "genre": "Жанр",
            "description": "Описание игры",
            "moodMatch": 0.95,
            "playtime": "Время игры",
            "vibe": "Атмосфера",
            "whyPerfect": "Почему подходит",
            "platforms": ["PC", "PS5"],
            "reviewPercent": 95,
            "reviewCount": 500000
        }
    ]
}

ВАЖНО: Верни РОВНО 20 игр в массиве games. Игры должны быть реально существующими и популярными.`;
    }

    createDeepSeekPrompt(query) {
        return `Пользователь ищет игры по запросу: "${query}". 

Верни ТОЛЬКО JSON без каких-либо дополнительных текстов:

{
    "analysis": {
        "understoodMood": "краткое описание настроения",
        "recommendedStyle": "стиль игр", 
        "keyFactors": ["фактор1", "фактор2", "фактор3"],
        "reasoning": "краткое объяснение подбора"
    },
    "games": [
        {
            "name": "Название игры 1",
            "genre": "Жанр",
            "description": "Описание игры",
            "moodMatch": 0.95,
            "playtime": "Время игры",
            "vibe": "Атмосфера",
            "whyPerfect": "Почему подходит",
            "platforms": ["PC", "PS5"],
            "reviewPercent": 95,
            "reviewCount": 500000
        }
    ]
}

ВАЖНО: Верни РОВНО 20 игр в массиве games. Игры должны быть реально существующими и популярными на дату 08.11.2025 года.`;
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
        
        const extractedGames = gameMatches.slice(0, 10).map((match, index) => {
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
            games: extractedGames.length > 0 ? extractedGames : [
                {
                    name: "The Witcher 3: Wild Hunt",
                    genre: "RPG",
                    description: "Эпическая RPG с богатым сюжетом",
                    moodMatch: 0.95,
                    playtime: "50-100 часов",
                    vibe: "Фэнтези-эпопея",
                    whyPerfect: "Классика жанра RPG",
                    platforms: ["PC", "PS4", "XBOX"],
                    reviewPercent: 93,
                    reviewCount: 850000
                }
            ]
        };
    }
}

// Экспортируем класс
if (typeof window !== 'undefined') {
    window.DirectGameSearchAI = DirectGameSearchAI;
    console.log('🌐 DirectGameSearchAI added to window object with methods');
}
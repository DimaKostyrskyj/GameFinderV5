// api/search.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, ai } = req.body;

  try {
    let result;
    
    if (ai === 'gemini') {
      // Вызываем Gemini endpoint
      const response = await fetch(`${req.headers.origin}/api/gemini-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });
      result = await response.json();
    } else {
      // Вызываем DeepSeek endpoint
      const response = await fetch(`${req.headers.origin}/api/deepseek-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });
      result = await response.json();
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Search failed', details: error.message });
  }
}
import express from 'express';
import { createServer as createViteServer } from 'vite';
import * as cheerio from 'cheerio';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import path from 'path';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/analyze', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      // Ensure URL has protocol
      let targetUrl = url;
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }

      // Fetch the website content
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SEOAnalyzerBot/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract basic SEO elements
      const title = $('title').text() || '';
      const description = $('meta[name="description"]').attr('content') || '';
      const h1s = [];
      $('h1').each((_, el) => h1s.push($(el).text().trim()));
      
      const h2s = [];
      $('h2').each((_, el) => h2s.push($(el).text().trim()));

      let imagesCount = 0;
      let missingAltCount = 0;
      $('img').each((_, el) => {
        imagesCount++;
        if (!$(el).attr('alt')) {
          missingAltCount++;
        }
      });

      const extractedData = {
        title,
        description,
        h1Count: h1s.length,
        h1s,
        h2Count: h2s.length,
        imagesCount,
        missingAltCount,
        wordCount: $('body').text().split(/\\s+/).length,
      };

      // Define Schema for AI response
      const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.INTEGER, description: 'Overall SEO score from 0 to 100.' },
          overview: { type: Type.STRING, description: 'A short overview of the SEO state.' },
          liveKeywords: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: 'Top 10-15 recommended live keywords based on the site content.' 
          },
          errors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                issue: { type: Type.STRING, description: 'The SEO error or warning.' },
                severity: { type: Type.STRING, enum: ['High', 'Medium', 'Low', 'Info'] },
                fixCommand: { type: Type.STRING, description: 'An exact AI command prompt or actionable fix to resolve this issue.' }
              },
              required: ['issue', 'severity', 'fixCommand']
            }
          },
          successes: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: 'Things the website is doing well in terms of SEO.' 
          }
        },
        required: ['score', 'overview', 'liveKeywords', 'errors', 'successes']
      };

      // Prompt Gemini to analyze the data and generate fixes
      const prompt = `Analyze the following extracted SEO data for a website and provide an SEO report.
      
Extracted Data:
${JSON.stringify(extractedData, null, 2)}

Provide the following:
1. An overall SEO score (0-100).
2. A short overview.
3. Live Keywords: Suggest 10-15 high-value, relevant keywords the site should target or is seemingly targeting based on the content.
4. Errors & Warnings: Identify SEO mistakes, mismatches, and warnings (e.g., missing meta tags, missing alts, multiple H1s, word count issues). For EACH issue, provide a "fixCommand" which is an AI prompt or direct instruction the user can copy to fix the issue.
5. Successes: Identify what they did right (e.g., has Title, has H1).
`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
        }
      });

      const aiResultParse = JSON.parse(aiResponse.text() || '{}');
      
      res.json({
        extractedData,
        analysis: aiResultParse
      });

    } catch (error: any) {
      console.error("SEO Analysis Error: ", error);
      res.status(500).json({ error: error.message || 'An error occurred during analysis.' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(\`Server running on http://localhost:\${PORT}\`);
  });
}

startServer();

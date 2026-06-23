import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // AI Route Example: Generate a grading rubric
  app.post('/api/ai/generate-rubric', async (req, res) => {
    try {
      const { topic, gradeLevel, criteria, type = 'rubric' } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is missing' });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      let prompt = `Generate a comprehensive grading rubric for a ${gradeLevel} assignment on "${topic}". Include the following criteria: ${criteria.join(', ')}. Return the output in Markdown format.`;
      
      if (type === 'lesson') {
        prompt = `Generate a comprehensive lesson plan for a ${gradeLevel} class on "${topic}". Include these learning objectives: ${criteria.join(', ')}. Return the output in Markdown format.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      res.json({ rubric: response.text });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to generate content.' });
    }
  });

  // AI Route: Generate parent communication log template
  app.post('/api/ai/generate-communication', async (req, res) => {
    try {
      const { studentName, performance, themes, tone } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is missing' });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Generate a personalized email draft to a parent regarding their student, ${studentName}.
Performance level: ${performance}
Key themes to address: ${themes.join(', ')}
Tone: ${tone}

IMPORTANT: Provide the output in Markdown format. Keep placeholders like [Teacher Name] or [Date] in brackets.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      res.json({ communication: response.text });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to generate communication template.' });
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
    // Production serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

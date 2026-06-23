import express from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();

// Parse JSON bodies
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

// Export the Express API for Vercel's serverless functions
export default app;

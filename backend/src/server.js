import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { z } from 'zod'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: true }))
app.use(express.json())

app.use((err, _req, res, next) => {
  if (err && (err.type === 'entity.parse.failed' || err instanceof SyntaxError)) {
    return res.status(400).json({ error: 'Invalid JSON body' })
  }
  next(err)
})

const bodySchema = z.object({
  topic: z.string().min(1, 'Topic is required').max(100),
  count: z.number().int().min(1).max(50),
  includeAnswers: z.boolean().optional().default(false),
})

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  console.error('Gemini API key not configured on server')
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.post('/generate-exam', async (req, res) => {
  const parse = bodySchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid input', details: parse.error.flatten() })
  }

  if (!genAI) {
    return res.status(500).json({ error: 'Gemini API key not configured on server' })
  }

  const { topic, count, includeAnswers } = parse.data

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const questionCount = count
    const generateAnswerKey = !!includeAnswers

    let prompt = `Generate a math exam for a primary school student with ${questionCount} questions on the topic of "${topic}".

Requirements:
- Each question should be age-appropriate for primary school students (ages 6-12)
- Questions should be clearly numbered (1., 2., 3., etc.)
- Include a variety of question types when possible
- Make sure questions are related to the topic: ${topic}
- Format the output as a clean, printable exam paper in PLAIN TEXT only
- DO NOT use any markdown formatting (no **, __, -, etc.)
- DO NOT use bold, italic, or any special formatting
- Use simple plain text formatting only
- Include the title "Math Exam - ${topic}" at the top

Example format:
Math Exam - ${topic}
Name: _______________  Date: _______________

1. [Question 1]
2. [Question 2]
...`;

    if (generateAnswerKey) {
      prompt += `

Also provide an answer key at the end with the format:
Answer Key:
1. [Answer 1]
2. [Answer 2]
...

IMPORTANT: Use only plain text formatting. No markdown symbols like ** or __ should appear in the output.`
    }

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    res.json({ exam: text })
  } catch (err) {
    console.error('Gemini error', err)
    res.status(500).json({ error: 'Failed to generate exam' })
  }
})


if (process.env.NODE_ENV === 'production') {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const distPath = path.resolve(__dirname, '../../frontend/dist')
  app.use(express.static(distPath))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`)
})

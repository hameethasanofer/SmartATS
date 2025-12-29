const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdf = require('pdf-parse'); // Kept as fall back or just remove if unused
const { createCanvas } = require('canvas');
const Tesseract = require('tesseract.js');
// using pdfjs-dist below
const Groq = require('groq-sdk');

// Helper: Node Canvas Factory for PDF.js
function NodeCanvasFactory() { }
NodeCanvasFactory.prototype = {
    create: function (width, height) {
        const canvas = createCanvas(width, height);
        const context = canvas.getContext("2d");
        return { canvas, context };
    },
    reset: function (canvasAndContext, width, height) {
        canvasAndContext.canvas.width = width;
        canvasAndContext.canvas.height = height;
    },
    destroy: function (canvasAndContext) {
        canvasAndContext.canvas = null;
        canvasAndContext.context = null;
    },
};
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Multer setup for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Groq Setup
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', provider: 'Groq', model: 'llama3-8b-8192' });
});

app.get('/', (req, res) => {
    res.send('SmartATS Backend is Running (Powered by Groq)');
});

const uploadMiddleware = upload.single('resume');

app.post('/api/analyze', (req, res, next) => {
    console.log('Request received at /api/analyze'); // Log entry
    uploadMiddleware(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.error('Multer Error:', err);
            return res.status(400).json({ error: 'File Upload Error', details: err.message });
        } else if (err) {
            console.error('Unknown Upload Error:', err);
            return res.status(500).json({ error: 'Upload Failed', details: err.message });
        }
        next();
    });
}, async (req, res) => {
    try {
        // Validation: Environment Variable
        if (!process.env.GROQ_API_KEY) {
            console.error('SERVER ERROR: GROQ_API_KEY is missing in .env file');
            return res.status(500).json({
                error: 'Server Misconfiguration',
                details: 'GROQ_API_KEY is missing. Please add it to backend/.env'
            });
        }

        // Validation: File Upload
        if (!req.file) {
            console.error('Error: No file received in req.file'); // Log missing file
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log(`Processing file: ${req.file.originalname} (${req.file.size} bytes)`);

        const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

        // ...

        // 1. Extract Text from PDF (using pdfjs-dist)
        let resumeText = '';
        try {
            console.log('Parsing PDF with pdfjs-dist...');

            // Allow pdfjs to process binary data
            const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(req.file.buffer) });
            const pdfDocument = await loadingTask.promise;

            let fullText = '';
            for (let i = 1; i <= pdfDocument.numPages; i++) {
                const page = await pdfDocument.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n';
            }

            resumeText = fullText.trim();
            console.log(`PDF Parsed successfully. Text length: ${resumeText.length}`);
            console.log('Sample text:', resumeText.substring(0, 100));

            // Validation: Ensure we actually got text. If not, try OCR.
            if (!resumeText || resumeText.length < 50) {
                console.warn(`⚠️ Text Extraction Low/Empty (${resumeText.length}). Attempting OCR (Optical Character Recognition)...`);

                let ocrText = '';
                const canvasFactory = new NodeCanvasFactory();

                for (let i = 1; i <= pdfDocument.numPages; i++) {
                    const page = await pdfDocument.getPage(i);
                    const viewport = page.getViewport({ scale: 1.5 });
                    const canvasAndContext = canvasFactory.create(viewport.width, viewport.height);

                    await page.render({
                        canvasContext: canvasAndContext.context,
                        viewport: viewport,
                        canvasFactory: canvasFactory
                    }).promise;

                    const imageBuffer = canvasAndContext.canvas.toBuffer();
                    const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng');
                    ocrText += text + '\n';

                    console.log(`OCR Page ${i} complete. Found ${text.length} chars.`);
                }

                resumeText = ocrText.trim();
                console.log(`OCR Complete. Total Text length: ${resumeText.length}`);

                if (!resumeText || resumeText.length < 50) {
                    throw new Error('OCR failed to extract sufficient text. File might be blank or unclear.');
                }
            }

        } catch (pdfError) {
            console.error('PDF Parse Error:', pdfError);
            return res.status(500).json({ error: 'Failed to read PDF file.', details: pdfError.message });
        }

        // 2. Prepare Prompt
        const prompt = `
            You are an expert ATS (Applicant Tracking System) scanner. Analyze the following resume text.
            Return a JSON object ONLY, with no extra text or markdown formatting.
            The JSON structure must be:
            {
                "score": <number 0-100, be strict and realistic, do NOT default to 85>,
                "grade": "<string Excellent/Good/Needs Improvement>",
                ...
                "summary": "<string brief summary of the resume>",
                "issues": {
                    "critical": <number count of critical issues>,
                    "warnings": <number count of warnings>,
                    "good": <number count of good points>
                },
                "metrics": [
                    { "label": "<string e.g. Contact Info>", "status": "<string pass/warning/fail>", "message": "<string explanation>" },
                    ... (at least 5 metrics: Contact Info, Keywords, Formatting, Education, Experience)
                ],
                "suggestions": [
                    { 
                        "id": <number>, 
                        "type": "<string critical/warning/success>", 
                        "title": "<string issue title>", 
                        "impact": "<string High/Medium/Low>", 
                        "description": "<string actionable advice>" 
                    },
                    ... (CRITICAL: You MUST provide at least 3 specific, actionable suggestions based on the resume content. Do not return an empty array.)
                ]
            }
            
            RESUME TEXT:
            ${resumeText.substring(0, 15000)}
        `;

        // 3. Groq Analysis
        let resultText = '';
        try {
            console.log('Attempting analysis with Groq (llama-3.3-70b-versatile)...');
            const chatCompletion = await groq.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.5,
                max_tokens: 2048,
                top_p: 1,
                stream: false
                // response_format: { type: 'json_object' } // Removed to avoid potential 400/500 errors with Llama 3
            });

            resultText = chatCompletion.choices[0]?.message?.content || '';
            console.log('✅ Success with Groq');

        } catch (groqError) {
            console.error('Groq API Error:', groqError);
            throw new Error(`Groq Analysis Failed: ${groqError.message}`);
        }

        // Clean up response
        const jsonStr = resultText.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const analysisData = JSON.parse(jsonStr);
            console.log('Analysis successful, score:', analysisData.score);

            // Log suggestions count
            console.log('Suggestions count:', analysisData.suggestions ? analysisData.suggestions.length : 0);

            if (analysisData.suggestions && analysisData.suggestions.length > 0) {
                console.log('Sample Suggestion:', JSON.stringify(analysisData.suggestions[0]));
            }
            res.json(analysisData);
        } catch (jsonError) {
            console.error('JSON Parse Error:', jsonError);
            console.error('Raw AI Response:', text);
            res.status(500).json({ error: 'Failed to parse AI response', details: 'AI returned invalid JSON' });
        }

    } catch (error) {
        console.error('General Server Error:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Global Error:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

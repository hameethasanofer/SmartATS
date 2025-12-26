const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
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

// Gemini Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING_API_KEY');

// Initialize active model safely
global.activeModelName = global.activeModelName || "gemini-2.0-flash";

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', model: global.activeModelName, mode: 'dynamic' });
});

app.get('/', (req, res) => {
    res.send('SmartATS Backend is Running');
});

const uploadMiddleware = upload.single('resume');

app.post('/api/analyze', (req, res, next) => {
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
        if (!process.env.GEMINI_API_KEY) {
            console.error('SERVER ERROR: GEMINI_API_KEY is missing in .env file');
            return res.status(500).json({
                error: 'Server Misconfiguration',
                details: 'GEMINI_API_KEY is missing. Please add it to backend/.env'
            });
        }

        // Validation: File Upload
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log(`Processing file: ${req.file.originalname} (${req.file.size} bytes)`);

        // 1. Extract Text from PDF
        let resumeText = '';
        try {
            console.log('Parsing PDF...');
            const pdfData = await pdf(req.file.buffer);
            resumeText = pdfData.text;
            console.log(`PDF Parsed successfully. Text length: ${resumeText.length}`);

            if (!resumeText || resumeText.length < 50) {
                return res.status(400).json({ error: 'Could not extract text from PDF. It might be image-based.' });
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
                "score": <number 0-100>,
                "grade": "<string Excellent/Good/Needs Improvement>",
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

        // 3. Dynamic Model Selection (Gemini)
        // Updated based on confirmed available models and checking for quota
        const CANDIDATE_MODELS = [
            "gemini-flash-latest",       // Likely 1.5 Flash (Stable)
            "gemini-2.0-flash-lite",     // Lighter, maybe better quota
            "gemini-2.0-flash-exp",      // Experimental
            "gemini-2.5-flash",          // Newest
            "gemini-2.0-flash",          // (Quota exceeded earlier, keep as backup)
            "gemini-pro"                 // Fallback
        ];
        let result = null;
        let lastError = null;

        for (const modelName of CANDIDATE_MODELS) {
            try {
                console.log(`Attempting analysis with model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                result = await model.generateContent(prompt);

                console.log(`✅ Success with model: ${modelName}`);
                global.activeModelName = modelName;
                break;
            } catch (e) {
                console.warn(`⚠️ Model ${modelName} failed: ${e.message}`);
                lastError = e;
            }
        }

        if (!result) {
            console.error("All models failed.");
            throw lastError || new Error("All available Gemini models failed.");
        }

        const response = await result.response;
        const text = response.text();

        // Clean up response
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

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

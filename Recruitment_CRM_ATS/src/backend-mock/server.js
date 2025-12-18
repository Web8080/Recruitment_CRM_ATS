const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
const db = require('./database/db');
const jobBoards = require('./integrations/jobBoards');
const interviewsRouter = require('./routes/interviews');
const notesRouter = require('./routes/notes');
const exportRouter = require('./routes/export');
const aiEnhancedRouter = require('./routes/ai-enhanced');

// PDF parsing - pdf-parse v1.1.1 exports function directly
let pdfParse;
try {
  pdfParse = require('pdf-parse');
  if (typeof pdfParse !== 'function') {
    console.warn('pdf-parse is not a function, will use fallback methods');
    pdfParse = null;
  }
} catch (error) {
  console.warn('pdf-parse not available, will use alternative methods:', error.message);
  pdfParse = null;
}
const app = express();
const PORT = 7071;

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'];
    if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(pdf|docx|doc|txt)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, DOC, and TXT files are allowed.'));
    }
  }
});

app.use(cors());
app.use(express.json());

// Interview routes
app.use('/api/interviews', authenticateToken, interviewsRouter);

// Notes routes
app.use('/api/notes', authenticateToken, notesRouter);

// Export routes
app.use('/api/export', authenticateToken, exportRouter);

// Enhanced AI routes
app.use('/api/ai-enhanced', authenticateToken, aiEnhancedRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Recruitment CRM/ATS Backend API',
    version: '1.0.0',
    status: 'running',
    baseUrl: '/api',
    documentation: 'All API endpoints are under /api',
    endpoints: {
      health: 'GET /api',
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register'
      },
      candidates: 'GET /api/candidates',
      jobs: 'GET /api/jobs',
      applications: 'GET /api/applications',
      analytics: 'GET /api/analytics',
      ai: {
        parseResume: 'POST /api/ai/parse-resume',
        parseResumeFile: 'POST /api/ai/parse-resume-file',
        matchCandidate: 'POST /api/ai/match-candidate'
      }
    }
  });
});

// Health check endpoint
app.get('/api', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Recruitment CRM/ATS API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth/login, /api/auth/register',
      candidates: '/api/candidates',
      jobs: '/api/jobs',
      applications: '/api/applications',
      analytics: '/api/analytics',
      ai: '/api/ai/parse-resume, /api/ai/parse-resume-file, /api/ai/match-candidate'
    }
  });
});

// Database is initialized in db.js with 30 sample candidates
// PLACEHOLDER: Replace with actual database connection in production

// Rate limiting (simple in-memory)
const rateLimits = new Map();
function checkRateLimit(identifier, maxRequests = 100) {
  const now = Date.now();
  const key = `${identifier}-${Math.floor(now / 60000)}`;
  const count = rateLimits.get(key) || 0;
  if (count >= maxRequests) return false;
  rateLimits.set(key, count + 1);
  return true;
}

// Analytics endpoint
app.get('/api/analytics', authenticateToken, async (req, res) => {
  try {
    const analytics = await db.getAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Auth endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.getUserByEmail(email);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // PLACEHOLDER: In production, verify password hash with bcrypt
    // const bcrypt = require('bcrypt');
    // const isValid = await bcrypt.compare(password, user.passwordHash);
    // if (!isValid) {
    //   return res.status(401).json({ error: 'Invalid email or password' });
    // }
    
    // PLACEHOLDER: Generate JWT token
    // const jwt = require('jsonwebtoken');
    // const token = jwt.sign(
    //   { id: user.id, email: user.email, role: user.role },
    //   process.env.JWT_SECRET,
    //   { expiresIn: '24h' }
    // );
    
    const token = `mock-jwt-token-${user.id}`;
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    
    if (await db.getUserByEmail(email)) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // PLACEHOLDER: Hash password with bcrypt
    // const bcrypt = require('bcrypt');
    // const passwordHash = await bcrypt.hash(password, 10);
    
    const user = await db.createUser({
      email,
      passwordHash: '$2a$10$PlaceholderHash', // Replace with actual hash
      firstName,
      lastName,
      role: role || 'Recruiter'
    });
    
    // PLACEHOLDER: Generate JWT token
    const token = `mock-jwt-token-${user.id}`;
    
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password endpoint
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }
    
    const user = await db.getUserByEmail(req.user?.email || '');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // PLACEHOLDER: Verify current password
    // const bcrypt = require('bcrypt');
    // const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    // if (!isValid) {
    //   return res.status(401).json({ error: 'Current password is incorrect' });
    // }
    
    // PLACEHOLDER: Hash new password
    // const passwordHash = await bcrypt.hash(newPassword, 10);
    // await db.updateUser(user.id, { passwordHash });
    
    // For now, just log the change (in production, actually update password)
    console.log(`Password change requested for user: ${user.email}`);
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Source tracking algorithm
function detectSource(req) {
  // 1. Check URL parameters (for webhook/API calls)
  const urlSource = req.query.source || req.query.utm_source;
  if (urlSource) return urlSource;
  
  // 2. Check request body
  const bodySource = req.body.source || req.body.utm_source;
  if (bodySource) return bodySource;
  
  // 3. Check referrer header
  const referrer = req.headers.referer || req.headers.referrer;
  if (referrer) {
    if (referrer.includes('linkedin.com')) return 'LinkedIn';
    if (referrer.includes('indeed.com')) return 'Indeed';
    if (referrer.includes('glassdoor.com')) return 'Glassdoor';
    if (referrer.includes('monster.com')) return 'Monster';
  }
  
  // 4. Check webhook source header
  const webhookSource = req.headers['x-webhook-source'] || req.headers['x-source'];
  if (webhookSource) return webhookSource;
  
  // 5. Default to Company Website
  return 'Company Website';
}

// Authentication middleware (PLACEHOLDER: Use JWT in production)
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    // For development, allow requests without auth
    // In production, return 401
    req.user = { id: 1, role: 'SuperAdmin' };
    return next();
  }
  
  // PLACEHOLDER: Verify JWT token
  // const jwt = require('jsonwebtoken');
  // try {
  //   const decoded = jwt.verify(token, process.env.JWT_SECRET);
  //   req.user = decoded;
  //   next();
  // } catch (error) {
  //   return res.status(403).json({ error: 'Invalid token' });
  // }
  
  req.user = { id: 1, role: 'SuperAdmin' };
  next();
}

// Candidate endpoints
app.get('/api/candidates', authenticateToken, async (req, res) => {
  try {
    if (!checkRateLimit('candidates', 100)) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    
    const filters = {
      search: req.query.search,
      status: req.query.status,
      source: req.query.source
    };
    
    const candidates = await db.getCandidates(filters);
    res.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/candidates/:id', authenticateToken, async (req, res) => {
  try {
    const candidate = await db.getCandidateById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.json(candidate);
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/candidates', authenticateToken, async (req, res) => {
  try {
    if (!checkRateLimit('create-candidate', 50)) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    
    // Auto-detect source if not provided
    const detectedSource = detectSource(req);
    const candidateData = {
      ...req.body,
      source: req.body.source || detectedSource,
    };
    
    const candidate = await db.createCandidate(candidateData);
    res.status(201).json(candidate);
  } catch (error) {
    console.error('Error creating candidate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/candidates/:id', authenticateToken, async (req, res) => {
  try {
    const candidate = await db.updateCandidate(req.params.id, req.body);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.json(candidate);
  } catch (error) {
    console.error('Error updating candidate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/candidates/:id', authenticateToken, async (req, res) => {
  try {
    const deleted = await db.deleteCandidate(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Job endpoints
app.get('/api/jobs', authenticateToken, async (req, res) => {
  try {
    if (!checkRateLimit('jobs', 100)) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    
    const filters = {
      status: req.query.status,
      search: req.query.search
    };
    
    const jobs = await db.getJobs(filters);
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/jobs/:id', authenticateToken, async (req, res) => {
  try {
    const job = await db.getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/jobs', authenticateToken, async (req, res) => {
  try {
    if (!checkRateLimit('create-job', 50)) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    
    const job = await db.createJob(req.body);
    
    // Auto-post to job boards if enabled
    const autoPost = req.body.autoPostToBoards !== false; // Default to true
    if (autoPost && job.status === 'Open') {
      try {
        const boardResults = await jobBoards.postToAllBoards(job, ['linkedin', 'indeed']);
        job.jobBoardUrls = boardResults;
        console.log('Job posted to boards:', boardResults);
      } catch (error) {
        console.error('Error posting to job boards:', error);
        // Don't fail job creation if board posting fails
      }
    }
    
    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/jobs/:id', authenticateToken, async (req, res) => {
  try {
    const job = await db.updateJob(req.params.id, req.body);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/jobs/:id', authenticateToken, async (req, res) => {
  try {
    const deleted = await db.deleteJob(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Application endpoints
app.get('/api/applications', authenticateToken, async (req, res) => {
  try {
    if (!checkRateLimit('applications', 100)) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    
    const filters = {
      candidateId: req.query.candidateId,
      jobId: req.query.jobId,
      status: req.query.status
    };
    
    const applications = await db.getApplications(filters);
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/applications/:id', authenticateToken, async (req, res) => {
  try {
    const applications = await db.getApplications({});
    const application = applications.find(a => a.id === parseInt(req.params.id));
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/applications', authenticateToken, async (req, res) => {
  try {
    if (!checkRateLimit('create-application', 50)) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    
    // Auto-calculate match score if not provided
    let matchScore = req.body.matchScore;
    if (matchScore === undefined && req.body.candidateId && req.body.jobId) {
      try {
        const candidate = await db.getCandidateById(req.body.candidateId);
        const job = await db.getJobById(req.body.jobId);
        
        if (candidate && job) {
          const candidateProfile = JSON.stringify({
            skills: candidate.skills || [],
            experience: candidate.experience || [],
            education: candidate.education || [],
            summary: candidate.summary || '',
          });
          
          const jobDescription = `${job.title}\n${job.description || ''}\n${job.requirements || ''}`;
          
          const matchResult = await fetch(`${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: process.env.OLLAMA_MODEL || 'llama2',
              prompt: `Calculate match score (0-100) between candidate and job. Return JSON: {"matchScore": number, "breakdown": {"skillsMatch": number, "experienceMatch": number, "educationMatch": number, "keywordsMatch": number}}\n\nCandidate: ${candidateProfile}\n\nJob: ${jobDescription}`,
              stream: false
            })
          });
          
          if (matchResult.ok) {
            const data = await matchResult.json();
            const responseText = data.response || '';
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              matchScore = parsed.matchScore || 0;
            }
          }
        }
      } catch (error) {
        console.error('Error calculating match score:', error);
        // Continue without match score if calculation fails
      }
    }
    
    const applicationData = {
      ...req.body,
      source: req.body.source || detectedSource,
      trackingCode: trackingCode,
      matchScore: matchScore || null
    };
    
    // Update candidate source if creating new candidate
    if (req.body.candidateId) {
      const candidate = await db.getCandidateById(req.body.candidateId);
      if (candidate && !candidate.source) {
        await db.updateCandidate(req.body.candidateId, { source: detectedSource });
      }
    }
    
    const application = await db.createApplication(applicationData);
    res.status(201).json(application);
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/applications/:id', authenticateToken, async (req, res) => {
  try {
    const application = await db.updateApplication(req.params.id, req.body);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json(application);
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/applications/:id', authenticateToken, async (req, res) => {
  try {
    const deleted = await db.deleteApplication(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Extract text from PDF using Ollama multimodal (if vision model available)
async function extractTextFromPDFWithOllama(filePath) {
  try {
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    
    // Check if Ollama is available
    const modelsResponse = await fetch(`${ollamaUrl}/api/tags`);
    if (!modelsResponse.ok) {
      throw new Error('Ollama not available');
    }
    
    const models = await modelsResponse.json();
    const visionModels = models.models?.filter(m => 
      m.name && (m.name.includes('llava') || m.name.includes('vision') || m.name.includes('multimodal'))
    ) || [];
    
    if (visionModels.length === 0) {
      throw new Error('No vision models available. Install one: ollama pull llava');
    }
    
    // Read PDF as base64
    const pdfBuffer = fs.readFileSync(filePath);
    const base64Pdf = pdfBuffer.toString('base64');
    
    // Use the first available vision model
    const visionModel = visionModels[0].name;
    
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: visionModel,
        prompt: 'Extract all text content from this PDF document. Return only the raw text content, preserving structure. No explanations, just the text.',
        images: [base64Pdf],
        stream: false
      })
    });
    
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.response || '';
  } catch (error) {
    console.warn('Ollama PDF extraction failed:', error.message);
    throw error;
  }
}

// AI endpoints
async function extractTextFromFile(filePath, mimeType) {
  const TIMEOUT_MS = 30000; // 30 seconds timeout
  
  try {
    if (mimeType === 'application/pdf' || filePath.toLowerCase().endsWith('.pdf')) {
      const dataBuffer = fs.readFileSync(filePath);
      const fileSizeMB = (dataBuffer.length / (1024 * 1024)).toFixed(2);
      console.log(`Parsing PDF file (${fileSizeMB} MB)...`);
      
      // Method 1: Try pdf-parse (v1.1.1 exports function directly) with timeout
      if (pdfParse && typeof pdfParse === 'function') {
        try {
          console.log('Attempting pdf-parse...');
          const parsePromise = pdfParse(dataBuffer);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('pdf-parse timeout after 30 seconds')), TIMEOUT_MS)
          );
          
          const data = await Promise.race([parsePromise, timeoutPromise]);
          const text = data.text || '';
          console.log(`pdf-parse successful, extracted ${text.length} characters`);
          return text;
        } catch (pdfError) {
          console.warn('pdf-parse failed:', pdfError.message);
          if (pdfError.message.includes('timeout')) {
            console.warn('pdf-parse timed out, trying alternative method...');
          }
        }
      }
      
      // Method 2: Try pdfjs-dist as fallback with timeout
      try {
        console.log('Attempting pdfjs-dist...');
        const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');
        
        const loadingPromise = pdfjs.getDocument({ data: dataBuffer }).promise;
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('pdfjs-dist timeout after 30 seconds')), TIMEOUT_MS)
        );
        
        const pdfDocument = await Promise.race([loadingPromise, timeoutPromise]);
        let fullText = '';
        
        // Limit to first 10 pages to avoid timeout on large PDFs
        const maxPages = Math.min(pdfDocument.numPages, 10);
        console.log(`Extracting text from ${maxPages} of ${pdfDocument.numPages} pages...`);
        
        for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
          const page = await pdfDocument.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n';
        }
        
        if (pdfDocument.numPages > 10) {
          console.warn(`PDF has ${pdfDocument.numPages} pages, only extracted first 10 pages`);
        }
        
        console.log(`pdfjs-dist successful, extracted ${fullText.length} characters`);
        return fullText.trim();
      } catch (pdfjsError) {
        console.warn('pdfjs-dist failed:', pdfjsError.message);
        if (pdfjsError.message.includes('timeout')) {
          console.warn('pdfjs-dist timed out, trying Ollama...');
        }
      }
      
      // Method 3: Try Ollama multimodal parsing (if vision model available) - skip for now as it's slow
      // Only try if file is small (< 5MB) to avoid timeout
      if (dataBuffer.length < 5 * 1024 * 1024) {
        try {
          console.log('Attempting Ollama multimodal parsing...');
          const ollamaText = await Promise.race([
            extractTextFromPDFWithOllama(filePath),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Ollama timeout after 30 seconds')), TIMEOUT_MS)
            )
          ]);
          if (ollamaText && ollamaText.trim().length > 0) {
            console.log(`Ollama successful, extracted ${ollamaText.length} characters`);
            return ollamaText;
          }
        } catch (ollamaError) {
          console.warn('Ollama PDF parsing failed:', ollamaError.message);
        }
      } else {
        console.warn('PDF too large for Ollama parsing, skipping...');
      }
      
      throw new Error(`PDF parsing failed. File size: ${fileSizeMB}MB. Solutions: 1) Try a smaller PDF file, 2) Ensure pdf-parse is installed: npm install pdf-parse@1.1.1, 3) Restart backend server`);
      
    } else if (mimeType.includes('wordprocessingml') || mimeType.includes('msword') || 
               filePath.toLowerCase().endsWith('.docx') || filePath.toLowerCase().endsWith('.doc')) {
      console.log('Parsing Word document...');
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value || '';
    } else if (mimeType.includes('text') || filePath.toLowerCase().endsWith('.txt')) {
      console.log('Reading text file...');
      return fs.readFileSync(filePath, 'utf8');
    }
    throw new Error(`Unsupported file type: ${mimeType}`);
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
}

async function parseResumeWithAI(resumeText) {
  const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  // Use smaller model if specified, fallback to llama2
  // Recommended: Set OLLAMA_MODEL=llama2:7b in .env for faster responses
  const model = process.env.OLLAMA_MODEL || 'llama2';
  
  // Shorten prompt to reduce processing time
  const resumePreview = resumeText.substring(0, 6000); // Reduced from 8000
  
  const prompt = `Extract resume info as JSON only:
{
  "fullName": "string or null",
  "firstName": "string or null",
  "lastName": "string or null",
  "email": "string or null",
  "phone": "string or null",
  "skills": ["string"],
  "experience": [{"company": "string", "position": "string", "duration": "string", "description": "string"}],
  "education": [{"institution": "string", "degree": "string", "year": "string"}],
  "summary": "string or null"
}

Resume: ${resumePreview}

Return ONLY valid JSON, no markdown, no code blocks.`;

  try {
    // Warm up Ollama with a quick test first (optional but helps with cold starts)
    try {
      console.log('Warming up Ollama model...');
      const warmupController = new AbortController();
      const warmupTimeout = setTimeout(() => warmupController.abort(), 5000);
      
      await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: 'test',
          stream: false,
          options: { num_predict: 5 } // Very short response
        }),
        signal: warmupController.signal
      }).catch(() => {}); // Ignore warmup errors
      
      clearTimeout(warmupTimeout);
    } catch (warmupError) {
      console.warn('Warmup failed, continuing anyway:', warmupError.message);
    }
    
    // Create AbortController for timeout - increased to 180 seconds for slow Ollama
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn('Ollama timeout approaching, aborting...');
      controller.abort();
    }, 180000); // 180 second timeout (3 minutes)
    
    const startTime = Date.now();
    console.log(`Calling Ollama with model: ${model}, timeout: 180s, prompt length: ${prompt.length}`);
    
    try {
      const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: { 
            temperature: 0.1, // Lower temperature for more consistent JSON
            num_predict: 1500, // Reduced from 2000 to speed up
            top_p: 0.9,
            top_k: 40
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`Ollama responded in ${elapsed}s`);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Ollama API error: ${response.statusText} - ${errorText.substring(0, 100)}`);
      }

      const data = await response.json();
      let extractedText = data.response;
      
      if (!extractedText) {
        throw new Error('Ollama returned empty response');
      }
      
      console.log(`Ollama response length: ${extractedText.length} characters`);
      
      extractedText = extractedText.trim();
      if (extractedText.startsWith('```json')) {
        extractedText = extractedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      } else if (extractedText.startsWith('```')) {
        extractedText = extractedText.replace(/```\n?/g, '').trim();
      }
    
      return JSON.parse(extractedText);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      
      // Check if it's a timeout error (including headers timeout)
      if (fetchError.name === 'AbortError' || 
          fetchError.cause?.code === 'UND_ERR_HEADERS_TIMEOUT' ||
          fetchError.message?.includes('timeout') ||
          fetchError.code === 'UND_ERR_HEADERS_TIMEOUT') {
        console.warn(`Ollama request timed out after ${elapsed}s, trying OpenAI fallback...`);
        if (process.env.OPENAI_API_KEY) {
          return await parseResumeWithOpenAI(resumeText, prompt);
        }
        throw new Error(`Ollama request timeout after ${elapsed}s. Ollama is very slow. Solutions: 1) Use smaller model: ollama pull llama2:7b, 2) Set OPENAI_API_KEY for faster fallback, 3) Check Ollama performance: ollama ps`);
      }
      throw fetchError;
    }
  } catch (error) {
    // If Ollama fails, try OpenAI fallback
    if (process.env.OPENAI_API_KEY) {
      console.warn('Ollama failed, trying OpenAI fallback...', error.message);
      return await parseResumeWithOpenAI(resumeText, prompt);
    }
    throw error;
  }
}

app.post('/api/ai/parse-resume-file', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path;
  let resumeText = null;

  try {
    console.log(`Processing resume file: ${req.file.originalname} (${(req.file.size / 1024).toFixed(2)} KB)`);
    
    // Extract text with timeout handling (45 seconds)
    const extractPromise = extractTextFromFile(filePath, req.file.mimetype);
    const extractTimeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('File extraction timeout after 45 seconds')), 45000)
    );
    
    resumeText = await Promise.race([extractPromise, extractTimeoutPromise]);
    
    // Clean up file immediately after extraction
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Failed to extract text from file',
        details: 'The file appears to be empty or could not be parsed',
        suggestion: 'Please ensure the file is a valid PDF, DOCX, DOC, or TXT file'
      });
    }
    
    console.log(`Extracted ${resumeText.length} characters from resume`);
    
    // PRIORITY: Use OpenAI if available (fastest and most reliable)
    const useOpenAI = process.env.OPENAI_API_KEY && 
                      process.env.OPENAI_API_KEY !== 'your-openai-api-key-here' &&
                      process.env.OPENAI_API_KEY.trim().length > 0;
    
    if (useOpenAI) {
      console.log('Using OpenAI for resume parsing (fastest option)');
      const prompt = `Extract the following information from this resume in valid JSON format only (no markdown, no code blocks, just JSON):
{
  "fullName": "string or null",
  "firstName": "string or null",
  "lastName": "string or null",
  "email": "string or null",
  "phone": "string or null",
  "skills": ["string"],
  "experience": [{"company": "string", "position": "string", "duration": "string", "description": "string"}],
  "education": [{"institution": "string", "degree": "string", "year": "string"}],
  "summary": "string or null"
}

Resume text:
${resumeText.substring(0, 6000)}

Return ONLY valid JSON, nothing else.`;
      
      try {
        const extractedData = await parseResumeWithOpenAI(resumeText, prompt);
        console.log('Resume parsing completed successfully with OpenAI');
        
        return res.json({
          extractedData,
          rawText: resumeText.substring(0, 1000),
          provider: 'OpenAI'
        });
      } catch (openaiError) {
        console.error('OpenAI failed, falling back to Ollama:', openaiError.message);
        // Fall through to Ollama fallback
      }
    }
    
    // FALLBACK: Use Ollama if OpenAI not available or failed
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    let ollamaAvailable = false;
    
    try {
      const healthCheck = await fetch(`${ollamaUrl}/api/tags`, { 
        method: 'GET',
        signal: AbortSignal.timeout(2000) // 2 second timeout
      });
      ollamaAvailable = healthCheck.ok;
    } catch (healthError) {
      console.warn('Ollama health check failed:', healthError.message);
      ollamaAvailable = false;
    }
    
    if (!ollamaAvailable) {
      return res.status(503).json({ 
        error: 'Failed to process resume', 
        details: 'Neither OpenAI nor Ollama is available. OpenAI is recommended for faster, more reliable parsing.',
        suggestion: 'Configure OPENAI_API_KEY in .env file. Get key from: https://platform.openai.com/api-keys',
        help: 'OpenAI is fast (2-5 seconds) and costs ~$0.0015 per resume',
        extractedText: resumeText.substring(0, 500) // Return partial text for debugging
      });
    }
    
    // Parse with Ollama (has its own 180s timeout)
    console.log('Parsing resume with Ollama (may be slow, 60-180 seconds)...');
    const extractedData = await parseResumeWithAI(resumeText);
    
    console.log('Resume parsing completed successfully');
    
    res.json({
      extractedData,
      rawText: resumeText.substring(0, 1000) // Return first 1000 chars for preview
    });
  } catch (error) {
    // Clean up file on error
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    console.error('Error parsing resume file:', error);
    
    const errorMessage = error.message || 'Unknown error';
    const isTimeout = errorMessage.includes('timeout');
    const isOllamaError = errorMessage.includes('Ollama') || errorMessage.includes('fetch failed') || errorMessage.includes('ECONNREFUSED');
    
    if (isTimeout) {
      return res.status(504).json({ 
        error: 'Request timeout', 
        details: 'The resume parsing took too long. This may be due to a large file or slow AI service.',
        suggestion: 'Try with a smaller file or ensure Ollama/OpenAI is responding quickly',
        extractedText: resumeText ? resumeText.substring(0, 500) : null
      });
    }
    
    if (isOllamaError && !process.env.OPENAI_API_KEY) {
      return res.status(503).json({ 
        error: 'Failed to process resume', 
        details: 'Cannot connect to Ollama service. Please ensure Ollama is running on localhost:11434',
        suggestion: 'Run: ollama serve (or check if Ollama is installed)',
        fallback: 'You can also configure OPENAI_API_KEY in .env for automatic fallback'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to process resume', 
      details: errorMessage,
      suggestion: 'Please check the file format and try again',
      extractedText: resumeText ? resumeText.substring(0, 500) : null
    });
  }
});

app.post('/api/ai/parse-resume', async (req, res) => {
  const { resumeText } = req.body;
  
  if (!resumeText) {
    return res.status(400).json({ error: 'Resume text is required' });
  }

  try {
    const extractedData = await parseResumeWithAI(resumeText);
    res.json({ extractedData, rawText: resumeText });
  } catch (error) {
    console.error('Error parsing resume:', error);
    res.status(500).json({ error: 'AI service unavailable', details: error.message });
  }
});

app.post('/api/ai/match-candidate', async (req, res) => {
  const { candidateProfile, jobDescription } = req.body;
  
  if (!candidateProfile || !jobDescription) {
    return res.status(400).json({ error: 'Candidate profile and job description are required' });
  }

  try {
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const model = process.env.OLLAMA_MODEL || 'llama2';
    
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: `Analyze the match between this candidate profile and job description. Provide a match score (0-100) and detailed analysis in JSON format.

Candidate Profile:
${candidateProfile}

Job Description:
${jobDescription}`,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Parse AI response to extract match score and breakdown
    let matchScore = 0;
    let breakdown = {
      skillsMatch: 0,
      experienceMatch: 0,
      educationMatch: 0,
      keywordsMatch: 0
    };
    
    try {
      // Try to extract JSON from AI response
      const responseText = data.response || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        matchScore = parsed.matchScore || parsed.score || 0;
        breakdown = parsed.breakdown || breakdown;
      } else {
        // Fallback: Calculate basic score from keywords
        const profileLower = candidateProfile.toLowerCase();
        const jobLower = jobDescription.toLowerCase();
        const commonWords = profileLower.split(/\s+/).filter(word => 
          word.length > 3 && jobLower.includes(word)
        );
        matchScore = Math.min(100, Math.floor((commonWords.length / 10) * 100));
        breakdown.keywordsMatch = matchScore;
      }
    } catch (parseError) {
      // If parsing fails, use default calculation
      const profileLower = candidateProfile.toLowerCase();
      const jobLower = jobDescription.toLowerCase();
      const commonWords = profileLower.split(/\s+/).filter(word => 
        word.length > 3 && jobLower.includes(word)
      );
      matchScore = Math.min(100, Math.floor((commonWords.length / 10) * 100));
      breakdown.keywordsMatch = matchScore;
    }
    
    res.json({ 
      matchScore,
      breakdown,
      analysis: data.response,
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error('Error matching candidate:', error);
    
    if (process.env.OPENAI_API_KEY) {
      try {
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || 'gpt-4',
            messages: [
              { role: 'system', content: 'You are a helpful assistant specialized in recruitment and HR tasks.' },
              { role: 'user', content: `Match this candidate to this job:\n\nCandidate: ${candidateProfile}\n\nJob: ${jobDescription}` }
            ],
            max_tokens: 2000
          })
        });
        
        const openaiData = await openaiResponse.json();
        res.json({ matchAnalysis: openaiData.choices[0].message.content, timestamp: new Date().toISOString() });
      } catch (fallbackError) {
        res.status(500).json({ error: 'Both AI services failed', details: fallbackError.message });
      }
    } else {
      res.status(500).json({ error: 'AI service unavailable', details: error.message });
    }
  }
});

// PLACEHOLDER: Azure Blob Storage integration
app.post('/api/files/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // PLACEHOLDER: Upload to Azure Blob Storage
    // const { BlobServiceClient } = require('@azure/storage-blob');
    // const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
    // const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_BLOB_CONTAINER_NAME || 'resumes');
    // const blobName = `${Date.now()}-${req.file.originalname}`;
    // const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    // await blockBlobClient.uploadFile(req.file.path);
    // const url = blockBlobClient.url;
    
    // For now, return placeholder
    res.json({
      url: `https://placeholder.blob.core.windows.net/resumes/${req.file.originalname}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      message: 'PLACEHOLDER: File upload - configure Azure Blob Storage in production'
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// PLACEHOLDER: Calendar integration endpoints
app.post('/api/calendar/create-event', authenticateToken, async (req, res) => {
  try {
    const { title, startTime, endTime, attendees, description } = req.body;
    
    // PLACEHOLDER: Office365 Calendar integration
    // const { Client } = require('@microsoft/microsoft-graph-client');
    // const { ClientCredentialProvider } = require('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');
    // const { ClientSecretCredential } = require('@azure/identity');
    // 
    // const credential = new ClientSecretCredential(
    //   process.env.AZURE_TENANT_ID,
    //   process.env.OFFICE365_CLIENT_ID,
    //   process.env.OFFICE365_CLIENT_SECRET
    // );
    // 
    // const authProvider = new ClientCredentialProvider(credential);
    // const client = Client.initWithMiddleware({ authProvider });
    // 
    // const event = {
    //   subject: title,
    //   start: { dateTime: startTime, timeZone: 'UTC' },
    //   end: { dateTime: endTime, timeZone: 'UTC' },
    //   attendees: attendees.map(email => ({ emailAddress: { address: email }, type: 'required' })),
    //   body: { contentType: 'HTML', content: description }
    // };
    // 
    // const createdEvent = await client.api('/me/calendar/events').post(event);
    
    // PLACEHOLDER: Google Calendar backup
    // const { google } = require('googleapis');
    // const oauth2Client = new google.auth.OAuth2(
    //   process.env.GOOGLE_CLIENT_ID,
    //   process.env.GOOGLE_CLIENT_SECRET,
    //   process.env.GOOGLE_REDIRECT_URI
    // );
    // oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    // const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    // 
    // const event = {
    //   summary: title,
    //   start: { dateTime: startTime, timeZone: 'UTC' },
    //   end: { dateTime: endTime, timeZone: 'UTC' },
    //   attendees: attendees.map(email => ({ email })),
    //   description: description
    // };
    // 
    // const createdEvent = await calendar.events.insert({ calendarId: 'primary', resource: event });
    
    res.json({
      eventId: 'placeholder-event-id',
      office365EventId: null, // PLACEHOLDER
      googleEventId: null, // PLACEHOLDER
      message: 'PLACEHOLDER: Calendar event - configure Office365/Google Calendar in production'
    });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
});

// PLACEHOLDER: Email automation endpoints
app.post('/api/email/send', authenticateToken, async (req, res) => {
  try {
    const { to, subject, body, templateId } = req.body;
    
    // PLACEHOLDER: SendGrid integration
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // 
    // const msg = {
    //   to,
    //   from: process.env.SENDGRID_FROM_EMAIL,
    //   subject,
    //   html: body
    // };
    // 
    // await sgMail.send(msg);
    
    res.json({
      messageId: 'placeholder-message-id',
      status: 'sent',
      message: 'PLACEHOLDER: Email sent - configure SendGrid in production'
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// PLACEHOLDER: Export endpoint
app.get('/api/export/candidates', authenticateToken, async (req, res) => {
  try {
    const candidates = await db.getCandidates(req.query);
    
    // PLACEHOLDER: Generate CSV/Excel
    // const ExcelJS = require('exceljs');
    // const workbook = new ExcelJS.Workbook();
    // const worksheet = workbook.addWorksheet('Candidates');
    // worksheet.columns = [
    //   { header: 'First Name', key: 'firstName' },
    //   { header: 'Last Name', key: 'lastName' },
    //   { header: 'Email', key: 'email' },
    //   { header: 'Status', key: 'status' }
    // ];
    // candidates.forEach(c => worksheet.addRow(c));
    // 
    // res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    // res.setHeader('Content-Disposition', 'attachment; filename=candidates.xlsx');
    // await workbook.xlsx.write(res);
    
    // For now, return JSON
    res.json(candidates);
  } catch (error) {
    console.error('Error exporting candidates:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // PLACEHOLDER: Log to Application Insights
  // const appInsights = require('applicationinsights');
  // appInsights.defaultClient.trackException({ exception: err });
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`Mock backend server running on http://localhost:${PORT}`);
  console.log('AI Provider: Ollama (primary), OpenAI (fallback)');
  console.log('PLACEHOLDERS: Database, Azure Blob, Calendar, Email, Monitoring');
  console.log(`Sample data: ${db.candidates.length} candidates, ${db.jobs.length} jobs, ${db.applications.length} applications`);
});

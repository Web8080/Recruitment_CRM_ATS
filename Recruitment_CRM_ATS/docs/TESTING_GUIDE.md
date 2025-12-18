# 🧪 Testing Guide - Recruitment CRM/ATS

## Quick Start

1. **Backend**: Already running on `http://localhost:7071`
2. **Frontend**: Starting on `http://localhost:5173`

## Test Accounts

### Create Your First Account
1. Go to `http://localhost:5173`
2. Click "Register" or navigate to `/register`
3. Fill in the registration form:
   - First Name: Your name
   - Last Name: Your surname
   - Email: your-email@example.com
   - Password: (any password)
   - Role: Select from dropdown (SuperAdmin, Admin, Recruiter, Manager)

### Default Test User (if needed)
- Email: admin@test.com
- Password: password123
- Role: SuperAdmin

## Feature Testing Checklist

### ✅ 1. Authentication
- [ ] Register a new account
- [ ] Login with credentials
- [ ] Logout functionality
- [ ] Protected routes (try accessing /dashboard without login)

### ✅ 2. Dashboard
- [ ] View key metrics (Total Candidates, Active Jobs, etc.)
- [ ] Check welcome card animation
- [ ] Verify stat cards display correctly
- [ ] Test responsive layout

### ✅ 3. Candidates Management
- [ ] View candidates list (should show 30 sample candidates)
- [ ] Search candidates by name/email
- [ ] Filter by status (Active, Inactive, etc.)
- [ ] **Upload Resume** (PDF/DOCX):
   - Drag and drop a resume file
   - Verify AI parsing extracts:
     - Name, email, phone
     - Skills (displayed as badges)
     - Experience
     - Education
   - Auto-populate form fields
- [ ] Create new candidate manually
- [ ] Edit existing candidate
- [ ] View candidate details
- [ ] Delete candidate

### ✅ 4. Jobs Management
- [ ] View jobs list
- [ ] Create new job posting:
   - Title, description, requirements
   - Location, salary range
   - Status (Open, Closed, Draft)
- [ ] Edit existing job
- [ ] Delete job
- [ ] Filter jobs by status

### ✅ 5. Applications Management
- [ ] View applications list
- [ ] Create new application:
   - Link candidate to job
   - Set application status
   - Add notes
- [ ] Edit application status
- [ ] Delete application
- [ ] Filter by status (Applied, Interviewing, Offered, Rejected)

### ✅ 6. AI Services
- [ ] Go to AI Services page
- [ ] **Test Resume Parsing**:
   - Upload a resume file (PDF/DOCX/DOC/TXT)
   - Verify AI extracts:
     - Personal information
     - Skills array
     - Work experience
     - Education
     - Summary
- [ ] Check AI response format (JSON)
- [ ] Test with different resume formats

### ✅ 7. Analytics
- [ ] View analytics dashboard
- [ ] Check key metrics:
   - Total Candidates
   - Active Candidates
   - AI Processed
   - Time to Hire
- [ ] Verify charts:
   - Pipeline distribution (pie chart)
   - Applications over time (line chart)
   - Top skills (bar chart)
- [ ] Check performance metrics table
- [ ] Verify data is connected (30 sample candidates)

### ✅ 8. UI/UX Features
- [ ] **Dark Mode Toggle**:
   - Click theme toggle button (top right)
   - Verify dark theme applies
   - Toggle back to light mode
- [ ] Toast notifications:
   - Create/update/delete operations
   - Success/error messages
- [ ] Loading states:
   - Form submissions
   - File uploads
   - Data fetching
- [ ] Responsive design (resize browser)
- [ ] Logo click (navigates to dashboard)
- [ ] Footer displays correctly

### ✅ 9. Navigation
- [ ] Sidebar navigation works
- [ ] Active route highlighting
- [ ] User menu (top right):
   - Display user name and role
   - Logout option

## Sample Resume for Testing

Create a test resume file (PDF or DOCX) with:
- Name: John Doe
- Email: john.doe@example.com
- Phone: +1-555-0123
- Skills: JavaScript, React, Node.js, TypeScript
- Experience: Software Engineer at Tech Corp (2020-2024)
- Education: BS Computer Science, University XYZ

## Expected Behaviors

### AI Resume Parsing
- Should extract structured JSON data
- Skills should appear as badges
- Form should auto-populate
- If Ollama fails, should fallback to OpenAI (if API key provided)

### Data Persistence
- Currently using in-memory storage
- Data persists during session
- Refresh page to see sample data reset

### Error Handling
- Invalid file types show error toast
- Network errors display user-friendly messages
- Form validation prevents invalid submissions

## Troubleshooting

### Backend not responding
```bash
cd src/backend-mock
npm start
```

### Frontend not loading
```bash
cd src/frontend
npm run dev
```

### Ollama not working
- Check if Ollama is running: `ollama list`
- Start Ollama: `ollama serve`
- Pull model: `ollama pull llama2`

### Port conflicts
- Backend: Change PORT in `.env` or `server.js`
- Frontend: Vite will auto-select next available port

## Test Data

The system comes pre-loaded with:
- 30 sample candidates
- 10 sample jobs
- 20 sample applications

All data is in-memory and resets on server restart.

## Next Steps After Testing

1. Verify all features work as expected
2. Test edge cases (empty data, large files, etc.)
3. Check browser console for errors
4. Test on different browsers
5. Verify mobile responsiveness (if needed)

---

**Happy Testing! 🚀**

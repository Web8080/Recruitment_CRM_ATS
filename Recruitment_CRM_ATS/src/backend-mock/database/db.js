// Database abstraction layer
// Placeholder for Azure SQL Database or Dataverse connection

// In production, replace this with:
// - Azure SQL: Use mssql or tedious
// - Dataverse: Use @microsoft/powerplatform-dataverse-client

class Database {
  constructor() {
    // PLACEHOLDER: In-memory storage for development
    // Replace with actual database connection in production
    this.candidates = [];
    this.jobs = [];
    this.applications = [];
    this.users = [];
    this.interviews = [];
    this.notes = [];
    this.activityLog = [];
    this.initializeSampleData();
  }

  // PLACEHOLDER: Azure SQL Database Connection
  async connectAzureSQL() {
    // const sql = require('mssql');
    // const config = {
    //   server: process.env.AZURE_SQL_SERVER,
    //   database: process.env.AZURE_SQL_DATABASE,
    //   authentication: {
    //     type: 'default',
    //     options: {
    //       userName: process.env.AZURE_SQL_USER,
    //       password: process.env.AZURE_SQL_PASSWORD
    //     }
    //   },
    //   options: {
    //     encrypt: true,
    //     trustServerCertificate: false
    //   }
    // };
    // return await sql.connect(config);
    console.log('PLACEHOLDER: Azure SQL Database connection');
  }

  // PLACEHOLDER: Dataverse Connection
  async connectDataverse() {
    // const { ServiceClient } = require('@microsoft/powerplatform-dataverse-client');
    // const connectionString = `AuthType=ClientSecret;Url=${process.env.DATAVERSE_URL};ClientId=${process.env.DATAVERSE_CLIENT_ID};ClientSecret=${process.env.DATAVERSE_CLIENT_SECRET}`;
    // return new ServiceClient(connectionString);
    console.log('PLACEHOLDER: Dataverse connection');
  }

  initializeSampleData() {
    // Initialize with 30 sample candidates for analytics
    const skills = ['C#', 'JavaScript', 'Python', 'React', 'Azure', 'SQL', 'Node.js', 'TypeScript', 'Java', 'Angular'];
    const statuses = ['Active', 'Active', 'Hired', 'Active', 'Interview', 'Active', 'Rejected', 'Active', 'Hired', 'Active', 'OnHold', 'Active', 'Interview', 'Active', 'Hired', 'Active', 'Active', 'Interview', 'Active', 'Rejected', 'Active', 'Hired', 'Active', 'OnHold', 'Active', 'Interview', 'Active', 'Hired', 'Active', 'Active'];
    const sources = ['LinkedIn', 'Indeed', 'Referral', 'LinkedIn', 'Company Website', 'LinkedIn', 'Indeed', 'Referral', 'LinkedIn', 'Indeed', 'Company Website', 'LinkedIn', 'Referral', 'LinkedIn', 'Indeed', 'Company Website', 'LinkedIn', 'Referral', 'Indeed', 'LinkedIn', 'Company Website', 'Referral', 'LinkedIn', 'Indeed', 'LinkedIn', 'Company Website', 'Referral', 'LinkedIn', 'Indeed', 'LinkedIn'];
    
    const names = [
      ['John', 'Smith'], ['Sarah', 'Johnson'], ['Michael', 'Williams'], ['Emily', 'Brown'], ['David', 'Jones'],
      ['Jessica', 'Garcia'], ['Christopher', 'Miller'], ['Amanda', 'Davis'], ['James', 'Rodriguez'], ['Ashley', 'Martinez'],
      ['Robert', 'Hernandez'], ['Michelle', 'Lopez'], ['Daniel', 'Wilson'], ['Stephanie', 'Anderson'], ['Matthew', 'Thomas'],
      ['Nicole', 'Taylor'], ['Andrew', 'Moore'], ['Lauren', 'Jackson'], ['Kevin', 'White'], ['Rachel', 'Harris'],
      ['Brian', 'Martin'], ['Kimberly', 'Thompson'], ['Ryan', 'Garcia'], ['Samantha', 'Martinez'], ['Justin', 'Robinson'],
      ['Brittany', 'Clark'], ['Brandon', 'Rodriguez'], ['Megan', 'Lewis'], ['Tyler', 'Lee'], ['Amber', 'Walker']
    ];

    for (let i = 0; i < 30; i++) {
      const daysAgo = 30 - i;
      const [firstName, lastName] = names[i];
      const candidate = {
        id: `candidate-${i + 1}`,
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
        phone: `+44 7${String(100 + (i % 900)).padStart(3, '0')} ${String(100 + (i % 900)).padStart(3, '0')} ${String(100 + (i % 900)).padStart(3, '0')}`,
        status: statuses[i],
        source: sources[i],
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
        skills: skills.slice(0, Math.floor(Math.random() * 5) + 3),
        experience: [
          {
            company: `Tech Company ${Math.floor(Math.random() * 10) + 1}`,
            position: ['Software Engineer', 'Senior Developer', 'Tech Lead', 'Full Stack Developer'][Math.floor(Math.random() * 4)],
            duration: `${Math.floor(Math.random() * 5) + 1} years`
          }
        ],
        education: [
          {
            institution: ['University of Technology', 'State University', 'Tech Institute'][Math.floor(Math.random() * 3)],
            degree: ['Bachelor of Science', 'Master of Science'][Math.floor(Math.random() * 2)],
            year: 2015 + Math.floor(Math.random() * 10)
          }
        ]
      };
      this.candidates.push(candidate);
    }

    // Initialize sample jobs
    const jobTitles = [
      'Senior Software Engineer', 'Full Stack Developer', 'DevOps Engineer', 
      'Frontend Developer', 'Backend Developer', 'Cloud Architect', 
      'Data Engineer', 'Machine Learning Engineer', 'Product Manager', 'QA Engineer'
    ];

    for (let i = 0; i < 10; i++) {
      this.jobs.push({
        id: `job-${i + 1}`,
        title: jobTitles[i],
        department: ['Engineering', 'Product', 'Data'][Math.floor(Math.random() * 3)],
        location: ['Remote', 'New York', 'San Francisco', 'London'][Math.floor(Math.random() * 4)],
        status: ['Open', 'Open', 'Open', 'Closed', 'OnHold'][Math.floor(Math.random() * 5)],
        createdAt: new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    // Initialize sample applications
    for (let i = 0; i < 20; i++) {
      this.applications.push({
        id: `app-${i + 1}`,
        candidateId: `candidate-${Math.floor(Math.random() * 30) + 1}`,
        jobId: `job-${Math.floor(Math.random() * 10) + 1}`,
        status: ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'][Math.floor(Math.random() * 6)],
        appliedAt: new Date(Date.now() - (20 - i) * 24 * 60 * 60 * 1000).toISOString(),
        matchScore: Math.floor(Math.random() * 40) + 60
      });
    }

    // Initialize users (including super admin)
    this.users = [
      {
        id: 1,
        email: 'admin@recruitmentcrm.com',
        passwordHash: '$2a$10$PlaceholderHashForAdmin123!', // In production, use bcrypt
        firstName: 'Super',
        lastName: 'Admin',
        role: 'SuperAdmin',
        isActive: true
      },
      {
        id: 2,
        email: 'recruiter@recruitmentcrm.com',
        passwordHash: '$2a$10$PlaceholderHash',
        firstName: 'John',
        lastName: 'Recruiter',
        role: 'Recruiter',
        isActive: true
      },
      {
        id: 3,
        email: 'manager@recruitmentcrm.com',
        passwordHash: '$2a$10$PlaceholderHash',
        firstName: 'Jane',
        lastName: 'Manager',
        role: 'Manager',
        isActive: true
      }
    ];
  }

  // Candidate methods
  async getCandidates(filters = {}) {
    let results = [...this.candidates];
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      results = results.filter(c => 
        c.firstName.toLowerCase().includes(search) ||
        c.lastName.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search)
      );
    }
    
    if (filters.status) {
      results = results.filter(c => c.status === filters.status);
    }
    
    if (filters.source) {
      results = results.filter(c => c.source === filters.source);
    }
    
    return results;
  }

  async getCandidateById(id) {
    return this.candidates.find(c => c.id === id || c.id === parseInt(id));
  }

  async createCandidate(candidate) {
    const newCandidate = {
      id: `candidate-${this.candidates.length + 1}`,
      ...candidate,
      status: candidate.status || 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.candidates.push(newCandidate);
    return newCandidate;
  }

  async updateCandidate(id, updates) {
    const index = this.candidates.findIndex(c => c.id === id || c.id === parseInt(id));
    if (index === -1) return null;
    this.candidates[index] = { ...this.candidates[index], ...updates, updatedAt: new Date().toISOString() };
    return this.candidates[index];
  }

  async deleteCandidate(id) {
    const index = this.candidates.findIndex(c => c.id === id || c.id === parseInt(id));
    if (index === -1) return false;
    this.candidates.splice(index, 1);
    return true;
  }

  // Job methods
  async getJobs(filters = {}) {
    let results = [...this.jobs];
    if (filters.status) {
      results = results.filter(j => j.status === filters.status);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      results = results.filter(j => j.title.toLowerCase().includes(search));
    }
    return results;
  }

  async getJobById(id) {
    return this.jobs.find(j => j.id === id || j.id === parseInt(id));
  }

  async createJob(job) {
    const newJob = {
      id: `job-${this.jobs.length + 1}`,
      ...job,
      status: job.status || 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.jobs.push(newJob);
    return newJob;
  }

  async updateJob(id, updates) {
    const index = this.jobs.findIndex(j => j.id === id || j.id === parseInt(id));
    if (index === -1) return null;
    this.jobs[index] = { ...this.jobs[index], ...updates, updatedAt: new Date().toISOString() };
    return this.jobs[index];
  }

  async deleteJob(id) {
    const index = this.jobs.findIndex(j => j.id === id || j.id === parseInt(id));
    if (index === -1) return false;
    this.jobs.splice(index, 1);
    return true;
  }

  // Application methods
  async getApplications(filters = {}) {
    let results = [...this.applications];
    if (filters.candidateId) {
      results = results.filter(a => a.candidateId === filters.candidateId || a.candidateId === parseInt(filters.candidateId));
    }
    if (filters.jobId) {
      results = results.filter(a => a.jobId === filters.jobId || a.jobId === parseInt(filters.jobId));
    }
    if (filters.status) {
      results = results.filter(a => a.status === filters.status);
    }
    return results.map(app => ({
      ...app,
      candidate: this.candidates.find(c => c.id === app.candidateId || c.id === parseInt(app.candidateId)),
      job: this.jobs.find(j => j.id === app.jobId || j.id === parseInt(app.jobId))
    }));
  }

  async createApplication(application) {
    const newApp = {
      id: `app-${this.applications.length + 1}`,
      ...application,
      status: 'Applied',
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.applications.push(newApp);
    return newApp;
  }

  async updateApplication(id, updates) {
    const index = this.applications.findIndex(a => a.id === id || a.id === parseInt(id));
    if (index === -1) return null;
    this.applications[index] = { ...this.applications[index], ...updates, updatedAt: new Date().toISOString() };
    return this.applications[index];
  }

  async deleteApplication(id) {
    const index = this.applications.findIndex(a => a.id === id || a.id === parseInt(id));
    if (index === -1) return false;
    this.applications.splice(index, 1);
    return true;
  }

  // User/Auth methods
  async getUserByEmail(email) {
    return this.users.find(u => u.email === email);
  }

  async createUser(user) {
    const newUser = {
      id: this.users.length + 1,
      ...user,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    return newUser;
  }

  // Analytics methods
  async getAnalytics() {
    return {
      totalCandidates: this.candidates.length,
      activeCandidates: this.candidates.filter(c => c.status === 'Active').length,
      hiredCandidates: this.candidates.filter(c => c.status === 'Hired').length,
      totalJobs: this.jobs.length,
      openJobs: this.jobs.filter(j => j.status === 'Open').length,
      totalApplications: this.applications.length,
      statusDistribution: this.getStatusDistribution(),
      sourceDistribution: this.getSourceDistribution(),
      monthlyTrends: this.getMonthlyTrends()
    };
  }

  getStatusDistribution() {
    const distribution = {};
    this.candidates.forEach(c => {
      distribution[c.status] = (distribution[c.status] || 0) + 1;
    });
    return distribution;
  }

  getSourceDistribution() {
    const distribution = {};
    this.candidates.forEach(c => {
      distribution[c.source] = (distribution[c.source] || 0) + 1;
    });
    return distribution;
  }

  getMonthlyTrends() {
    const trends = {};
    this.candidates.forEach(c => {
      const month = new Date(c.createdAt).toISOString().substring(0, 7);
      trends[month] = (trends[month] || 0) + 1;
    });
    return trends;
  }

  // Interview methods
  async getInterviews(filters = {}) {
    let results = [...this.interviews];
    if (filters.applicationId) {
      results = results.filter(i => i.applicationId === filters.applicationId);
    }
    if (filters.status) {
      results = results.filter(i => i.status === filters.status);
    }
    return results.map(interview => ({
      ...interview,
      candidate: this.candidates.find(c => {
        const app = this.applications.find(a => a.id === interview.applicationId);
        return app && (c.id === app.candidateId || c.id === parseInt(app.candidateId));
      }),
      job: this.jobs.find(j => {
        const app = this.applications.find(a => a.id === interview.applicationId);
        return app && (j.id === app.jobId || j.id === parseInt(app.jobId));
      })
    }));
  }

  async getInterviewById(id) {
    return this.interviews.find(i => i.id === id || i.id === parseInt(id));
  }

  async createInterview(interview) {
    const newInterview = {
      id: `interview-${this.interviews.length + 1}`,
      ...interview,
      status: interview.status || 'Scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.interviews.push(newInterview);
    return newInterview;
  }

  async updateInterview(id, updates) {
    const index = this.interviews.findIndex(i => i.id === id || i.id === parseInt(id));
    if (index === -1) return null;
    this.interviews[index] = { ...this.interviews[index], ...updates, updatedAt: new Date().toISOString() };
    return this.interviews[index];
  }

  async deleteInterview(id) {
    const index = this.interviews.findIndex(i => i.id === id || i.id === parseInt(id));
    if (index === -1) return false;
    this.interviews.splice(index, 1);
    return true;
  }

  // Notes methods
  async getNotes(entityType, entityId) {
    return this.notes.filter(n => n.entityType === entityType && (n.entityId === entityId || n.entityId === parseInt(entityId)));
  }

  async createNote(note) {
    const newNote = {
      id: `note-${this.notes.length + 1}`,
      ...note,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.notes.push(newNote);
    return newNote;
  }

  async updateNote(id, updates) {
    const index = this.notes.findIndex(n => n.id === id || n.id === parseInt(id));
    if (index === -1) return null;
    this.notes[index] = { ...this.notes[index], ...updates, updatedAt: new Date().toISOString() };
    return this.notes[index];
  }

  async deleteNote(id) {
    const index = this.notes.findIndex(n => n.id === id || n.id === parseInt(id));
    if (index === -1) return false;
    this.notes.splice(index, 1);
    return true;
  }

  // Activity log methods
  async logActivity(activity) {
    const newActivity = {
      id: `activity-${this.activityLog.length + 1}`,
      ...activity,
      createdAt: new Date().toISOString()
    };
    this.activityLog.push(newActivity);
    return newActivity;
  }

  async getActivityLog(entityType, entityId) {
    return this.activityLog.filter(a => a.entityType === entityType && (a.entityId === entityId || a.entityId === parseInt(entityId)));
  }
}

// Export singleton instance
module.exports = new Database();


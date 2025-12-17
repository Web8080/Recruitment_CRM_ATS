import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7071/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface Candidate {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  status: string
  source?: string
  createdAt?: string
  updatedAt?: string
  skills?: string | string[]
  experience?: string | Array<{
    company: string
    position: string
    duration: string
    description?: string
  }>
  education?: string | Array<{
    institution: string
    degree: string
    year?: string
  }>
  summary?: string
  resumeUrl?: string
  matchScore?: number
}

export interface CandidateRequest {
  firstName: string
  lastName: string
  email: string
  phone?: string
  skills?: string
  experience?: string
  education?: string
  summary?: string
  resumeUrl?: string
}

export interface Job {
  id: string
  title: string
  department: string
  location: string
  status: string
  description?: string
  requirements?: string
  salaryMin?: number
  salaryMax?: number
  employmentType?: string
  createdAt?: string
  updatedAt?: string
  closingDate?: string
}

export interface JobRequest {
  title: string
  department: string
  location: string
  description: string
  requirements?: string
  status?: string
  closingDate?: string
}

export interface Application {
  id: string
  candidateId: string
  jobId: string
  status: string
  appliedAt: string
  interviewDate?: string
  notes?: string
  matchScore?: number
  candidate?: Candidate
  job?: Job
}

export interface ApplicationRequest {
  candidateId: string
  jobId: string
  notes?: string
  matchScore?: number
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: string
}

export const candidateService = {
  getAll: async (filters?: { search?: string; status?: string; source?: string }): Promise<Candidate[]> => {
    const params = new URLSearchParams()
    if (filters?.search) params.append('search', filters.search)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.source) params.append('source', filters.source)
    const response = await apiClient.get<Candidate[]>(`/candidates?${params.toString()}`)
    return response.data
  },

  create: async (candidate: CandidateRequest): Promise<Candidate> => {
    const response = await apiClient.post<Candidate>('/candidates', candidate)
    return response.data
  },

  getById: async (id: string): Promise<Candidate> => {
    const response = await apiClient.get<Candidate>(`/candidates/${id}`)
    return response.data
  },

  update: async (id: string, candidate: Partial<CandidateRequest>): Promise<Candidate> => {
    const response = await apiClient.put<Candidate>(`/candidates/${id}`, candidate)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/candidates/${id}`)
  },
}

export const jobService = {
  getAll: async (filters?: { status?: string; search?: string }): Promise<Job[]> => {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.search) params.append('search', filters.search)
    const response = await apiClient.get<Job[]>(`/jobs?${params.toString()}`)
    return response.data
  },

  getById: async (id: string): Promise<Job> => {
    const response = await apiClient.get<Job>(`/jobs/${id}`)
    return response.data
  },

  create: async (job: JobRequest): Promise<Job> => {
    const response = await apiClient.post<Job>('/jobs', job)
    return response.data
  },

  update: async (id: string, job: Partial<JobRequest>): Promise<Job> => {
    const response = await apiClient.put<Job>(`/jobs/${id}`, job)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/jobs/${id}`)
  },
}

export const applicationService = {
  getAll: async (filters?: { candidateId?: string; jobId?: string; status?: string }): Promise<Application[]> => {
    const params = new URLSearchParams()
    if (filters?.candidateId) params.append('candidateId', filters.candidateId)
    if (filters?.jobId) params.append('jobId', filters.jobId)
    if (filters?.status) params.append('status', filters.status)
    const response = await apiClient.get<Application[]>(`/applications?${params.toString()}`)
    return response.data
  },

  getById: async (id: string): Promise<Application> => {
    const response = await apiClient.get<Application>(`/applications/${id}`)
    return response.data
  },

  create: async (application: ApplicationRequest): Promise<Application> => {
    const response = await apiClient.post<Application>('/applications', application)
    return response.data
  },

  update: async (id: string, application: Partial<ApplicationRequest>): Promise<Application> => {
    const response = await apiClient.put<Application>(`/applications/${id}`, application)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/applications/${id}`)
  },
}

export const authService = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password })
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  register: async (email: string, password: string, firstName: string, lastName: string, role?: string) => {
    const response = await apiClient.post('/auth/register', { email, password, firstName, lastName, role })
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token')
  },
}

export interface ParsedResume {
  fullName?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  skills?: string[]
  experience?: Array<{
    company: string
    position: string
    duration: string
    description?: string
  }>
  education?: Array<{
    institution: string
    degree: string
    year?: string
  }>
  summary?: string
}

export interface Analytics {
  totalCandidates: number
  activeCandidates: number
  hiredCandidates: number
  totalJobs: number
  openJobs: number
  totalApplications: number
  statusDistribution: Record<string, number>
  sourceDistribution: Record<string, number>
  monthlyTrends: Record<string, number>
}

export const analyticsService = {
  getAnalytics: async (): Promise<Analytics> => {
    const response = await apiClient.get<Analytics>('/analytics')
    return response.data
  },
}

export const aiService = {
  parseResume: async (resumeText: string) => {
    const response = await apiClient.post('/ai/parse-resume', {
      resumeText,
    })
    return response.data
  },

  parseResumeFile: async (file: File): Promise<{ extractedData: ParsedResume; rawText: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await axios.post(`${API_BASE_URL}/ai/parse-resume-file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  matchCandidate: async (candidateProfile: string, jobDescription: string) => {
    const response = await apiClient.post('/ai/match-candidate', {
      candidateProfile,
      jobDescription,
    })
    return response.data
  },
}

export default apiClient


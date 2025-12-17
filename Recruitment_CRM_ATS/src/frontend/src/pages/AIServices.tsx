import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Button,
  makeStyles,
  tokens,
  Text,
  Card,
  CardHeader,
  Field,
  Spinner,
  Select,
  ProgressBar,
  Badge,
} from '@fluentui/react-components'
import { aiService, jobService, Job } from '../services/api'
import FileUpload from '../components/FileUpload'
import { toast } from '../components/Toast'
import { useNavigate } from 'react-router-dom'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXL,
  },
  title: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: tokens.spacingVerticalL,
  },
  card: {
    padding: tokens.spacingVerticalXXL,
  },
  uploadSection: {
    marginBottom: tokens.spacingVerticalXL,
  },
  jobSelect: {
    marginBottom: tokens.spacingVerticalL,
  },
  matchScore: {
    marginTop: tokens.spacingVerticalL,
    padding: tokens.spacingVerticalL,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
  },
  scoreBreakdown: {
    marginTop: tokens.spacingVerticalM,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  scoreItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  parsedData: {
    marginTop: tokens.spacingVerticalL,
    padding: tokens.spacingVerticalL,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
  },
  actionButtons: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalL,
  },
})

export default function AIServices() {
  const styles = useStyles()
  const navigate = useNavigate()
  const [selectedJob, setSelectedJob] = useState<string>('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<any>(null)
  const [matchScore, setMatchScore] = useState<number | null>(null)
  const [scoreBreakdown, setScoreBreakdown] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const { data: jobs = [], isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ['jobs'],
    queryFn: () => jobService.getAll({ status: 'Open' }),
  })

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file)
    setParsedData(null)
    setMatchScore(null)
    setScoreBreakdown(null)
    
    if (!selectedJob) {
      toast.info('Please select a job first to calculate match score')
      return
    }

    await processResumeWithJob(file, selectedJob)
  }

  const processResumeWithJob = async (file: File, jobId: string) => {
    setIsProcessing(true)
    try {
      // Parse resume file
      const parseResult = await aiService.parseResumeFile(file)
      setParsedData(parseResult.extractedData)

      // Get job details
      const job = jobs.find(j => j.id === jobId)
      if (!job) {
        toast.error('Job not found')
        return
      }

      // Calculate match score with job description
      const candidateProfile = JSON.stringify({
        skills: parseResult.extractedData.skills || [],
        experience: parseResult.extractedData.experience || [],
        education: parseResult.extractedData.education || [],
        summary: parseResult.extractedData.summary || '',
      })

      const jobDescription = `${job.title}\n${job.description || ''}\n${job.requirements || ''}`
      
      const matchResult = await aiService.matchCandidate(candidateProfile, jobDescription)
      
      setMatchScore(matchResult.matchScore || 0)
      setScoreBreakdown(matchResult.breakdown || {
        skillsMatch: 0,
        experienceMatch: 0,
        educationMatch: 0,
        keywordsMatch: 0,
      })

      toast.success('Resume parsed and matched successfully!')
    } catch (error) {
      console.error('Error processing resume:', error)
      toast.error('Failed to process resume. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleJobChange = async (jobId: string) => {
    setSelectedJob(jobId)
    setMatchScore(null)
    setScoreBreakdown(null)

    if (uploadedFile && jobId) {
      await processResumeWithJob(uploadedFile, jobId)
    }
  }

  const handleCreateCandidate = () => {
    if (!parsedData) {
      toast.error('No parsed data available')
      return
    }

    // Navigate to candidates page with pre-filled data
    const candidateData = {
      firstName: parsedData.firstName || parsedData.fullName?.split(' ')[0] || '',
      lastName: parsedData.lastName || parsedData.fullName?.split(' ').slice(1).join(' ') || '',
      email: parsedData.email || '',
      phone: parsedData.phone || '',
      skills: Array.isArray(parsedData.skills) ? parsedData.skills.join(', ') : parsedData.skills || '',
      experience: parsedData.experience || '',
      education: parsedData.education || '',
      summary: parsedData.summary || '',
      source: 'Manual Upload',
      matchScore: matchScore || 0,
    }

    // Store in sessionStorage to pre-fill form
    sessionStorage.setItem('prefillCandidate', JSON.stringify(candidateData))
    sessionStorage.setItem('selectedJobId', selectedJob)
    
    navigate('/candidates')
    toast.success('Redirecting to create candidate with parsed data...')
  }

  const getScoreColor = (score: number): 'success' | 'warning' | 'danger' => {
    if (score >= 80) return 'success'
    if (score >= 60) return 'warning'
    return 'danger'
  }

  return (
    <div className={styles.container}>
      <Text className={styles.title}>AI-Powered Resume Parser & Matching</Text>
      
      <Text size={300} style={{ color: tokens.colorNeutralForeground2, marginBottom: tokens.spacingVerticalL }}>
        Upload a candidate resume and select a job to automatically parse the resume and calculate match score.
      </Text>

      <Card className={styles.card}>
        <CardHeader 
          header={
            <div>
              <Text weight="semibold">Step 1: Select Target Job</Text>
              <Text size={200} style={{ color: tokens.colorNeutralForeground2, display: 'block', marginTop: tokens.spacingVerticalXS }}>
                Choose the job you want to match the candidate against
              </Text>
            </div>
          } 
        />
        
        <Field label="Select Job" required className={styles.jobSelect}>
          <Select
            value={selectedJob}
            onChange={(_, data) => handleJobChange(data.value)}
            disabled={jobsLoading || isProcessing}
          >
            <option value="">-- Select a Job --</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} - {job.department} ({job.location})
              </option>
            ))}
          </Select>
        </Field>

        {jobs.length === 0 && !jobsLoading && (
          <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>
            No open jobs available. Create a job first to use this feature.
          </Text>
        )}
      </Card>

      <Card className={styles.card}>
        <CardHeader 
          header={
            <div>
              <Text weight="semibold">Step 2: Upload Resume</Text>
              <Text size={200} style={{ color: tokens.colorNeutralForeground2, display: 'block', marginTop: tokens.spacingVerticalXS }}>
                Upload PDF, DOCX, DOC, or TXT file. The system will automatically parse and match against the selected job.
              </Text>
            </div>
          } 
        />
        
        <div className={styles.uploadSection}>
          <FileUpload
            onFileUpload={handleFileUpload}
            accept={{ 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'application/msword': ['.doc'], 'text/plain': ['.txt'] }}
            disabled={!selectedJob || isProcessing}
          />
        </div>

        {isProcessing && (
          <div style={{ marginTop: tokens.spacingVerticalL }}>
            <Text size={300} style={{ marginBottom: tokens.spacingVerticalS }}>Processing resume...</Text>
            <ProgressBar />
          </div>
        )}

        {parsedData && (
          <div className={styles.parsedData}>
            <Text weight="semibold" size={400} style={{ marginBottom: tokens.spacingVerticalM }}>
              Parsed Candidate Information
            </Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS }}>
              <Text size={300}>
                <strong>Name:</strong> {parsedData.firstName || parsedData.fullName || 'N/A'} {parsedData.lastName || ''}
              </Text>
              <Text size={300}>
                <strong>Email:</strong> {parsedData.email || 'N/A'}
              </Text>
              <Text size={300}>
                <strong>Phone:</strong> {parsedData.phone || 'N/A'}
              </Text>
              {parsedData.skills && (
                <div>
                  <Text size={300} weight="semibold">Skills:</Text>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacingHorizontalXS, marginTop: tokens.spacingVerticalXS }}>
                    {(Array.isArray(parsedData.skills) ? parsedData.skills : []).map((skill: string, idx: number) => (
                      <Badge key={idx}>{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {parsedData.experience && Array.isArray(parsedData.experience) && parsedData.experience.length > 0 && (
                <div>
                  <Text size={300} weight="semibold">Experience:</Text>
                  {parsedData.experience.map((exp: any, idx: number) => (
                    <Text key={idx} size={300} style={{ display: 'block', marginTop: tokens.spacingVerticalXS }}>
                      {exp.position} at {exp.company} ({exp.duration})
                    </Text>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {matchScore !== null && (
          <div className={styles.matchScore}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacingVerticalM }}>
              <Text weight="semibold" size={500}>Match Score</Text>
              <Badge appearance="filled" color={getScoreColor(matchScore)} size="large">
                {matchScore}%
              </Badge>
            </div>
            
            <ProgressBar value={matchScore} max={100} />

            {scoreBreakdown && (
              <div className={styles.scoreBreakdown}>
                <Text weight="semibold" size={300} style={{ marginBottom: tokens.spacingVerticalXS }}>
                  Score Breakdown:
                </Text>
                <div className={styles.scoreItem}>
                  <Text size={300}>Skills Match</Text>
                  <Text size={300} weight="semibold">{scoreBreakdown.skillsMatch || 0}%</Text>
                </div>
                <div className={styles.scoreItem}>
                  <Text size={300}>Experience Relevance</Text>
                  <Text size={300} weight="semibold">{scoreBreakdown.experienceMatch || 0}%</Text>
                </div>
                <div className={styles.scoreItem}>
                  <Text size={300}>Education Match</Text>
                  <Text size={300} weight="semibold">{scoreBreakdown.educationMatch || 0}%</Text>
                </div>
                <div className={styles.scoreItem}>
                  <Text size={300}>Keywords Match</Text>
                  <Text size={300} weight="semibold">{scoreBreakdown.keywordsMatch || 0}%</Text>
                </div>
              </div>
            )}

            <Text size={200} style={{ color: tokens.colorNeutralForeground2, marginTop: tokens.spacingVerticalM }}>
              <strong>How it works:</strong> Match score is calculated based on skills (40%), experience relevance (30%), 
              education match (15%), and keywords found in the resume (15%).
            </Text>
          </div>
        )}

        {parsedData && (
          <div className={styles.actionButtons}>
            <Button
              appearance="primary"
              onClick={handleCreateCandidate}
              disabled={!selectedJob}
            >
              Create Candidate with Parsed Data
            </Button>
            <Button
              appearance="secondary"
              onClick={() => {
                setParsedData(null)
                setMatchScore(null)
                setScoreBreakdown(null)
                setUploadedFile(null)
              }}
            >
              Clear & Start Over
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}

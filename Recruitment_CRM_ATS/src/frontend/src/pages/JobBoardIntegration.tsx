import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Button,
  Card,
  CardHeader,
  makeStyles,
  tokens,
  Text,
  Input,
  Field,
  Checkbox,
  Badge,
  Textarea,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
  Spinner,
} from '@fluentui/react-components'
import {
  Link24Regular,
  Globe24Regular,
  Code24Regular,
  Copy24Regular,
  Checkmark24Regular,
} from '@fluentui/react-icons'
import { jobService, Job } from '../services/api'
import { toast } from '../components/Toast'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXL,
  },
  title: {
    fontSize: tokens.fontSizeHero800,
    fontWeight: tokens.fontWeightBold,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  card: {
    padding: tokens.spacingVerticalXXL,
  },
  section: {
    marginBottom: tokens.spacingVerticalXL,
  },
  sectionTitle: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: tokens.spacingVerticalM,
    color: tokens.colorBrandForeground1,
  },
  boardCard: {
    padding: tokens.spacingVerticalL,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    marginBottom: tokens.spacingVerticalM,
  },
  trackingCode: {
    fontFamily: 'monospace',
    backgroundColor: tokens.colorNeutralBackground2,
    padding: tokens.spacingVerticalS,
    borderRadius: tokens.borderRadiusSmall,
    marginTop: tokens.spacingVerticalXS,
  },
  codeBlock: {
    fontFamily: 'monospace',
    fontSize: tokens.fontSizeBase200,
    backgroundColor: tokens.colorNeutralBackground2,
    padding: tokens.spacingVerticalM,
    borderRadius: tokens.borderRadiusSmall,
    whiteSpace: 'pre-wrap',
    overflowX: 'auto',
    marginTop: tokens.spacingVerticalS,
  },
  copyButton: {
    marginTop: tokens.spacingVerticalXS,
  },
})

interface JobBoardConfig {
  id: string
  name: string
  enabled: boolean
  autoPost: boolean
  apiKey?: string
  accessToken?: string
  status: 'connected' | 'disconnected' | 'pending'
}

export default function JobBoardIntegration() {
  const styles = useStyles()
  const queryClient = useQueryClient()
  const [selectedJob, setSelectedJob] = useState<string>('')
  const [showEmbedCode, setShowEmbedCode] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const { data: jobs = [] } = useQuery<Job[]>({
    queryKey: ['jobs'],
    queryFn: () => jobService.getAll(),
  })

  const { data: boardConfigs = [] } = useQuery<JobBoardConfig[]>({
    queryKey: ['jobBoardConfigs'],
    queryFn: async () => {
      const response = await fetch('/api/job-boards/config')
      if (!response.ok) throw new Error('Failed to fetch board configs')
      return response.json()
    },
  })

  const updateBoardConfigMutation = useMutation({
    mutationFn: async (config: Partial<JobBoardConfig>) => {
      const response = await fetch(`/api/job-boards/config/${config.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (!response.ok) throw new Error('Failed to update board config')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobBoardConfigs'] })
      toast.success('Configuration updated')
    },
    onError: () => toast.error('Failed to update configuration'),
  })

  const generateEmbedCode = (jobId: string) => {
    const baseUrl = window.location.origin
    const trackingCode = `JOB-${jobId}-${Date.now().toString(36).toUpperCase()}`
    
    return `<!-- Recruitment CRM Job Application Form -->
<!-- Copy this code to your company website -->
<div id="recruitment-crm-form"></div>
<script>
  (function() {
    const jobId = '${jobId}';
    const trackingCode = '${trackingCode}';
    const apiUrl = '${baseUrl}/api/webhooks/job-application';
    
    // Form HTML
    const formHTML = \`
      <form id="job-application-form" style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h3>Apply for Position</h3>
        <input type="hidden" name="job_id" value="\${jobId}">
        <input type="hidden" name="source" value="company_website">
        <input type="hidden" name="tracking_code" value="\${trackingCode}">
        
        <div style="margin-bottom: 15px;">
          <label>First Name *</label>
          <input type="text" name="firstName" required style="width: 100%; padding: 8px; margin-top: 5px;">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label>Last Name *</label>
          <input type="text" name="lastName" required style="width: 100%; padding: 8px; margin-top: 5px;">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label>Email *</label>
          <input type="email" name="email" required style="width: 100%; padding: 8px; margin-top: 5px;">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label>Phone</label>
          <input type="tel" name="phone" style="width: 100%; padding: 8px; margin-top: 5px;">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label>Resume (PDF, DOCX) *</label>
          <input type="file" name="resume" accept=".pdf,.docx,.doc" required style="width: 100%; padding: 8px; margin-top: 5px;">
        </div>
        
        <button type="submit" style="background: #667eea; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">
          Submit Application
        </button>
      </form>
    \`;
    
    document.getElementById('recruitment-crm-form').innerHTML = formHTML;
    
    // Handle form submission
    document.getElementById('job-application-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      const formData = new FormData(this);
      
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          alert('Application submitted successfully!');
          this.reset();
        } else {
          alert('Error submitting application. Please try again.');
        }
      } catch (error) {
        alert('Error submitting application. Please try again.');
      }
    });
  })();
</script>`
  }

  const handleCopyCode = (code: string, type: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(type)
    toast.success('Code copied to clipboard!')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleToggleBoard = (config: JobBoardConfig) => {
    updateBoardConfigMutation.mutate({
      id: config.id,
      enabled: !config.enabled,
    })
  }

  const handleToggleAutoPost = (config: JobBoardConfig) => {
    updateBoardConfigMutation.mutate({
      id: config.id,
      autoPost: !config.autoPost,
    })
  }

  const getTrackingUrl = (jobId: string, source: string) => {
    const baseUrl = window.location.origin
    const trackingCode = `JOB-${jobId}-${Date.now().toString(36).toUpperCase()}`
    return `${baseUrl}/apply?job=${jobId}&source=${source}&tracking_code=${trackingCode}&utm_source=${source}&utm_medium=job_board`
  }

  return (
    <div className={styles.container}>
      <Text className={styles.title}>Job Board Integration</Text>

      <Card className={styles.card}>
        <CardHeader
          header={
            <Text weight="semibold" size={500}>Configure Job Boards</Text>
          }
        />
        <div className={styles.section}>
          <Text size={300} style={{ color: tokens.colorNeutralForeground2, marginBottom: tokens.spacingVerticalL }}>
            Connect your job boards to automatically post jobs and track candidate sources
          </Text>

          {boardConfigs.map((config) => (
            <div key={config.id} className={styles.boardCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacingVerticalM }}>
                <div>
                  <Text weight="semibold" size={400}>{config.name}</Text>
                  <Badge
                    appearance={config.status === 'connected' ? 'filled' : 'outline'}
                    color={config.status === 'connected' ? 'success' : 'informative'}
                    style={{ marginLeft: tokens.spacingHorizontalS }}
                  >
                    {config.status}
                  </Badge>
                </div>
                <Checkbox
                  checked={config.enabled}
                  onChange={() => handleToggleBoard(config)}
                  label="Enable"
                />
              </div>
              
              {config.enabled && (
                <>
                  <Checkbox
                    checked={config.autoPost}
                    onChange={() => handleToggleAutoPost(config)}
                    label="Auto-post jobs when status changes to 'Open'"
                    style={{ marginBottom: tokens.spacingVerticalM }}
                  />
                  
                  {config.name === 'LinkedIn' && (
                    <Field label="LinkedIn OAuth">
                      <Button
                        appearance="primary"
                        onClick={() => {
                          // PLACEHOLDER: LinkedIn OAuth flow
                          toast.info('LinkedIn OAuth integration - configure in production')
                        }}
                      >
                        Connect LinkedIn
                      </Button>
                    </Field>
                  )}
                  
                  {config.name === 'Indeed' && (
                    <Field label="Indeed Publisher ID">
                      <Input
                        value={config.apiKey || ''}
                        placeholder="Enter Indeed Publisher ID"
                        onChange={(_, data) => {
                          updateBoardConfigMutation.mutate({
                            id: config.id,
                            apiKey: data.value,
                          })
                        }}
                      />
                    </Field>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className={styles.card}>
        <CardHeader
          header={
            <Text weight="semibold" size={500}>Company Website Integration</Text>
          }
        />
        <div className={styles.section}>
          <Text size={300} style={{ color: tokens.colorNeutralForeground2, marginBottom: tokens.spacingVerticalL }}>
            Generate embeddable forms and tracking codes for your company website
          </Text>

          <Field label="Select Job">
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              style={{
                width: '100%',
                padding: tokens.spacingVerticalM,
                borderRadius: tokens.borderRadiusMedium,
                border: `1px solid ${tokens.colorNeutralStroke1}`,
              }}
            >
              <option value="">-- Select a Job --</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} - {job.location}
                </option>
              ))}
            </select>
          </Field>

          {selectedJob && (
            <>
              <div style={{ marginTop: tokens.spacingVerticalL }}>
                <Text weight="semibold" size={400} style={{ marginBottom: tokens.spacingVerticalM }}>
                  Tracking URL
                </Text>
                <div className={styles.trackingCode}>
                  {getTrackingUrl(selectedJob, 'company_website')}
                </div>
                <Button
                  appearance="subtle"
                  icon={copiedCode === 'url' ? <Checkmark24Regular /> : <Copy24Regular />}
                  onClick={() => handleCopyCode(getTrackingUrl(selectedJob, 'company_website'), 'url')}
                  className={styles.copyButton}
                >
                  Copy URL
                </Button>
              </div>

              <div style={{ marginTop: tokens.spacingVerticalL }}>
                <Text weight="semibold" size={400} style={{ marginBottom: tokens.spacingVerticalM }}>
                  Embeddable Form Code
                </Text>
                <Button
                  appearance="subtle"
                  onClick={() => setShowEmbedCode(!showEmbedCode)}
                >
                  {showEmbedCode ? 'Hide' : 'Show'} Embed Code
                </Button>
                {showEmbedCode && (
                  <>
                    <Textarea
                      value={generateEmbedCode(selectedJob)}
                      readOnly
                      className={styles.codeBlock}
                      style={{ marginTop: tokens.spacingVerticalM }}
                    />
                    <Button
                      appearance="subtle"
                      icon={copiedCode === 'embed' ? <Checkmark24Regular /> : <Copy24Regular />}
                      onClick={() => handleCopyCode(generateEmbedCode(selectedJob), 'embed')}
                      className={styles.copyButton}
                    >
                      Copy Embed Code
                    </Button>
                    <Text size={200} style={{ color: tokens.colorNeutralForeground2, marginTop: tokens.spacingVerticalS }}>
                      Copy this code and paste it into your company website where you want the application form to appear
                    </Text>
                  </>
                )}
              </div>

              <div style={{ marginTop: tokens.spacingVerticalL, padding: tokens.spacingVerticalM, backgroundColor: tokens.colorNeutralBackground2, borderRadius: tokens.borderRadiusMedium }}>
                <Text weight="semibold" size={300} style={{ marginBottom: tokens.spacingVerticalXS }}>
                  How It Works:
                </Text>
                <ul style={{ margin: 0, paddingLeft: tokens.spacingHorizontalL }}>
                  <li>Applications submitted through the form are automatically tracked with source "Company Website"</li>
                  <li>Each job gets a unique tracking code for analytics</li>
                  <li>Resumes are automatically parsed using AI</li>
                  <li>Candidates are automatically added to the system</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </Card>

      <Card className={styles.card}>
        <CardHeader
          header={
            <Text weight="semibold" size={500}>Source Tracking Algorithm</Text>
          }
        />
        <div className={styles.section}>
          <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>
            The system automatically tracks candidate sources using:
          </Text>
          <ul style={{ marginTop: tokens.spacingVerticalM, paddingLeft: tokens.spacingHorizontalL }}>
            <li><strong>URL Parameters:</strong> utm_source, source, tracking_code</li>
            <li><strong>Referrer Header:</strong> HTTP referrer from job board</li>
            <li><strong>Webhook Source:</strong> Source field from webhook payload</li>
            <li><strong>Application Metadata:</strong> Source tracking from LinkedIn/Indeed APIs</li>
          </ul>
          <Text size={300} style={{ color: tokens.colorNeutralForeground2, marginTop: tokens.spacingVerticalM }}>
            All sources are automatically assigned when candidates are added or applications are received.
          </Text>
        </div>
      </Card>
    </div>
  )
}


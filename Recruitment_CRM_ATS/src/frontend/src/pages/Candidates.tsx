import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  makeStyles,
  tokens,
  Text,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Input,
  Field,
  Spinner,
  Card,
  Badge,
  Divider,
  Select,
} from '@fluentui/react-components'
import {
  Add24Regular,
  DocumentArrowUpRegular,
  Sparkle24Filled,
  Person24Regular,
  Search24Regular,
  Edit24Regular,
  Delete24Regular,
} from '@fluentui/react-icons'
import { candidateService, CandidateRequest, aiService, ParsedResume, Candidate, jobService, Job, applicationService } from '../services/api'
import FileUpload from '../components/FileUpload'
import { toast } from '../components/Toast'
import { formatPhoneForDisplay } from '../utils/phoneFormatter'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXL,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacingVerticalL,
  },
  title: {
    fontSize: tokens.fontSizeHero800,
    fontWeight: tokens.fontWeightBold,
    background: `linear-gradient(135deg, ${tokens.colorBrandForeground1} 0%, ${tokens.colorPaletteBlueForeground2} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  actionButtons: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
  },
  tableCard: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.12)',
    borderRadius: tokens.borderRadiusXLarge,
    border: '1px solid rgba(102, 126, 234, 0.1)',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 12px 32px rgba(102, 126, 234, 0.18)',
    },
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
    borderBottom: '2px solid rgba(102, 126, 234, 0.2)',
  },
  tableRow: {
    transition: 'all 0.2s ease',
    borderBottom: '1px solid rgba(102, 126, 234, 0.05)',
    '&:hover': {
      background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
      transform: 'translateX(4px)',
      boxShadow: 'inset 4px 0 0 linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
    },
  },
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    minWidth: '600px',
  },
  uploadSection: {
    padding: tokens.spacingVerticalL,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusLarge,
    border: `1px dashed ${tokens.colorNeutralStroke1}`,
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  twoColumn: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: tokens.spacingHorizontalM,
  },
  skillsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingVerticalXS,
    marginTop: tokens.spacingVerticalXS,
  },
  skillBadge: {
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
  },
  parsedInfo: {
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorBrandBackground2,
    borderRadius: tokens.borderRadiusMedium,
    marginTop: tokens.spacingVerticalM,
  },
  statusBadge: {
    borderRadius: tokens.borderRadiusCircular,
    paddingLeft: tokens.spacingHorizontalM,
    paddingRight: tokens.spacingHorizontalM,
  },
  emptyState: {
    textAlign: 'center',
    padding: tokens.spacingVerticalXXL,
    color: tokens.colorNeutralForeground3,
  },
})

export default function Candidates() {
  const styles = useStyles()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [parsedData, setParsedData] = useState<ParsedResume | null>(null)
  const [selectedJobId, setSelectedJobId] = useState<string>('')
  const [matchScore, setMatchScore] = useState<number | null>(null)
  const [isCalculatingMatch, setIsCalculatingMatch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [formData, setFormData] = useState<CandidateRequest>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })

  const { data: candidates = [], isLoading } = useQuery<Candidate[]>({
    queryKey: ['candidates', { search: searchQuery, status: statusFilter, source: sourceFilter }],
    queryFn: () => candidateService.getAll({ search: searchQuery, status: statusFilter || undefined, source: sourceFilter || undefined }),
  })

  const { data: jobs = [] } = useQuery<Job[]>({
    queryKey: ['jobs'],
    queryFn: () => jobService.getAll({ status: 'Open' }),
  })

  const createMutation = useMutation({
    mutationFn: async (data: CandidateRequest) => {
      const candidate = await candidateService.create(data)
      
      // If job is selected, create application with match score
      if (selectedJobId && matchScore !== null) {
        try {
          await applicationService.create({
            candidateId: candidate.id,
            jobId: selectedJobId,
            matchScore: matchScore,
          })
        } catch (error) {
          console.error('Error creating application:', error)
        }
      }
      
      return candidate
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      setIsDialogOpen(false)
      setFormData({ firstName: '', lastName: '', email: '', phone: '' })
      setParsedData(null)
      setSelectedJobId('')
      setMatchScore(null)
      toast.success('Candidate created successfully' + (matchScore !== null ? ` (Match Score: ${matchScore}%)` : ''))
    },
    onError: () => {
      toast.error('Failed to create candidate')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: candidateService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      toast.success('Candidate deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete candidate')
    },
  })

  const calculateMatchScore = async (candidateData: any, jobId: string) => {
    if (!jobId || !candidateData) return

    setIsCalculatingMatch(true)
    try {
      const job = jobs.find(j => j.id === jobId)
      if (!job) return

      const candidateProfile = JSON.stringify({
        skills: candidateData.skills || parsedData?.skills || [],
        experience: candidateData.experience || parsedData?.experience || [],
        education: candidateData.education || parsedData?.education || [],
        summary: candidateData.summary || parsedData?.summary || '',
      })

      const jobDescription = `${job.title}\n${job.description || ''}\n${job.requirements || ''}`
      
      const matchResult = await aiService.matchCandidate(candidateProfile, jobDescription)
      setMatchScore(matchResult.matchScore || 0)
    } catch (error) {
      console.error('Error calculating match score:', error)
    } finally {
      setIsCalculatingMatch(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const result = await aiService.parseResumeFile(file)
      const extracted = result.extractedData
      setParsedData(extracted)
      
      // Auto-populate form
      if (extracted.firstName || extracted.lastName) {
        setFormData({
          firstName: extracted.firstName || extracted.fullName?.split(' ')[0] || '',
          lastName: extracted.lastName || extracted.fullName?.split(' ').slice(1).join(' ') || '',
          email: extracted.email || '',
          phone: extracted.phone ? formatPhoneForInput(extracted.phone) : '',
        })
      } else if (extracted.fullName) {
        const nameParts = extracted.fullName.split(' ')
        setFormData({
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: extracted.email || '',
          phone: extracted.phone ? formatPhoneForInput(extracted.phone) : '',
        })
      }

      // Auto-calculate match score if job is selected
      if (selectedJobId) {
        await calculateMatchScore(extracted, selectedJobId)
      }
    } catch (error: any) {
      console.error('Error parsing resume:', error)
      const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message || 'Failed to parse resume'
      const suggestion = error.response?.data?.suggestion || ''
      toast.error(errorMessage + (suggestion ? ` - ${suggestion}` : ''))
    } finally {
      setIsUploading(false)
    }
  }

  const handleJobChange = async (jobId: string) => {
    setSelectedJobId(jobId)
    setMatchScore(null)
    
    if (jobId && (parsedData || formData.firstName)) {
      await calculateMatchScore(parsedData || formData, jobId)
    }
  }

  const handleSubmit = () => {
    createMutation.mutate(formData)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setFormData({ firstName: '', lastName: '', email: '', phone: '' })
    setParsedData(null)
    setSelectedJobId('')
    setMatchScore(null)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <Text className={styles.title}>Candidates</Text>
          <Text size={300} style={{ color: tokens.colorNeutralForeground2, marginTop: tokens.spacingVerticalXS }}>
            Manage and track candidate profiles
          </Text>
        </div>
        <div className={styles.actionButtons}>
          <Button
            appearance="primary"
            icon={<Add24Regular />}
            onClick={() => setIsDialogOpen(true)}
            size="large"
          >
            Add Candidate
          </Button>
        </div>
      </div>

      <Card className={styles.tableCard} style={{ padding: tokens.spacingVerticalL }}>
        <div style={{ display: 'flex', gap: tokens.spacingHorizontalM, marginBottom: tokens.spacingVerticalL, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <Input
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(_, data) => setSearchQuery(data.value)}
              contentBefore={<Search24Regular />}
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(_, data) => setStatusFilter(data.value || '')}
            style={{ minWidth: '150px' }}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Interview">Interview</option>
            <option value="Hired">Hired</option>
            <option value="Rejected">Rejected</option>
            <option value="OnHold">On Hold</option>
          </Select>
          <Select
            value={sourceFilter}
            onChange={(_, data) => setSourceFilter(data.value || '')}
            style={{ minWidth: '150px' }}
          >
            <option value="">All Sources</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Indeed">Indeed</option>
            <option value="Referral">Referral</option>
            <option value="Company Website">Company Website</option>
          </Select>
        </div>

        <Table className={styles.table}>
          <TableHeader className={styles.tableHeader}>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>Phone</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Source</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} style={{ textAlign: 'center', padding: tokens.spacingVerticalXXL }}>
                  <Spinner size="medium" />
                </TableCell>
              </TableRow>
            ) : candidates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className={styles.emptyState}>
                    <Person24Regular style={{ fontSize: '48px', marginBottom: tokens.spacingVerticalM }} />
                    <Text size={400}>No candidates found</Text>
                    <Text size={300} style={{ marginTop: tokens.spacingVerticalXS }}>
                      Click "Add Candidate" to get started
                    </Text>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              candidates.map((candidate) => (
                <TableRow key={candidate.id} className={styles.tableRow}>
                  <TableCell>
                    <Button
                      appearance="subtle"
                      onClick={() => navigate(`/candidates/${candidate.id}`)}
                      style={{ textAlign: 'left', padding: 0 }}
                    >
                      <Text weight="semibold">
                        {candidate.firstName} {candidate.lastName}
                      </Text>
                    </Button>
                  </TableCell>
                  <TableCell>{candidate.email}</TableCell>
                  <TableCell>{candidate.phone ? formatPhoneForDisplay(candidate.phone) : '-'}</TableCell>
                  <TableCell>
                    <Badge
                      appearance={candidate.status === 'Active' ? 'filled' : 'outline'}
                      color={candidate.status === 'Active' ? 'success' : 'informative'}
                      className={styles.statusBadge}
                    >
                      {candidate.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge appearance="outline">{candidate.source || 'Manual'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', gap: tokens.spacingHorizontalXS }}>
                      <Button
                        appearance="subtle"
                        icon={<Edit24Regular />}
                        onClick={() => navigate(`/candidates/${candidate.id}`)}
                        title="Edit"
                      />
                      <Button
                        appearance="subtle"
                        icon={<Delete24Regular />}
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${candidate.firstName} ${candidate.lastName}?`)) {
                            deleteMutation.mutate(candidate.id)
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        title="Delete"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(_, data) => !data.open && handleDialogClose()}>
        <DialogSurface style={{ maxWidth: '800px' }}>
          <DialogTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalM }}>
              <DocumentArrowUpRegular />
              <Text size={500} weight="semibold">Add New Candidate</Text>
            </div>
          </DialogTitle>
          <DialogBody>
            <DialogContent className={styles.dialogContent}>
              <div className={styles.uploadSection}>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS, marginBottom: tokens.spacingVerticalM }}>
                  <Sparkle24Filled style={{ color: tokens.colorBrandForeground1 }} />
                  <Text weight="semibold">Upload Resume (AI-Powered Parsing)</Text>
                </div>
                <FileUpload
                  onFileUpload={handleFileUpload}
                  onError={(error) => console.error('Upload error:', error)}
                  disabled={isUploading}
                />
                {isUploading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS, marginTop: tokens.spacingVerticalM }}>
                    <Spinner size="small" />
                    <Text size={300}>AI is parsing your resume...</Text>
                  </div>
                )}
              </div>

              {parsedData && (
                <div className={styles.parsedInfo}>
                  <Text weight="semibold" size={400} style={{ marginBottom: tokens.spacingVerticalS }}>
                    ✨ Parsed Information
                  </Text>
                  {parsedData.skills && parsedData.skills.length > 0 && (
                    <div>
                      <Text size={300} weight="semibold">Skills:</Text>
                      <div className={styles.skillsContainer}>
                        {parsedData.skills.slice(0, 10).map((skill, idx) => (
                          <Badge key={idx} className={styles.skillBadge}>
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Divider />

              <div className={styles.formSection}>
                <Field label="Select Job (Optional - for match score calculation)">
                  <Select
                    value={selectedJobId}
                    onChange={(_, data) => handleJobChange(data.value)}
                  >
                    <option value="">-- No Job Selected --</option>
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title} - {job.department} ({job.location})
                      </option>
                    ))}
                  </Select>
                </Field>

                {matchScore !== null && (
                  <div style={{ 
                    marginTop: tokens.spacingVerticalM, 
                    padding: tokens.spacingVerticalM, 
                    backgroundColor: tokens.colorNeutralBackground2, 
                    borderRadius: tokens.borderRadiusMedium,
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacingHorizontalM
                  }}>
                    <Text weight="semibold">Match Score:</Text>
                    <Badge 
                      appearance="filled" 
                      color={matchScore >= 80 ? 'success' : matchScore >= 60 ? 'warning' : 'danger'}
                      size="large"
                    >
                      {matchScore}%
                    </Badge>
                    {isCalculatingMatch && <Spinner size="tiny" />}
                  </div>
                )}

                <Text weight="semibold" size={400} style={{ marginTop: tokens.spacingVerticalL }}>Candidate Information</Text>
                <div className={styles.twoColumn}>
                  <Field label="First Name" required>
                    <Input
                      value={formData.firstName}
                      onChange={(_, data) =>
                        setFormData({ ...formData, firstName: data.value })
                      }
                      placeholder="Enter first name"
                    />
                  </Field>
                  <Field label="Last Name" required>
                    <Input
                      value={formData.lastName}
                      onChange={(_, data) =>
                        setFormData({ ...formData, lastName: data.value })
                      }
                      placeholder="Enter last name"
                    />
                  </Field>
                </div>
                <Field label="Email" required>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(_, data) =>
                      setFormData({ ...formData, email: data.value })
                    }
                    placeholder="candidate@example.com"
                  />
                </Field>
                <Field label="Phone">
                  <Input
                    value={formData.phone}
                    onChange={(_, data) =>
                      setFormData({ ...formData, phone: data.value })
                    }
                    placeholder="07xxx xxx xxx"
                  />
                </Field>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={handleDialogClose}>
                Cancel
              </Button>
              <Button
                appearance="primary"
                onClick={handleSubmit}
                disabled={!formData.firstName || !formData.lastName || !formData.email || createMutation.isPending}
                icon={createMutation.isPending ? <Spinner size="tiny" /> : undefined}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Candidate'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  )
}

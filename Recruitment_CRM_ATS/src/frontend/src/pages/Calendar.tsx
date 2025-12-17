import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  Input,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
  Badge,
  Textarea,
} from '@fluentui/react-components'
import {
  CalendarMonth24Regular,
  Add24Regular,
  Edit24Regular,
  Delete24Regular,
  Video24Regular,
  Location24Regular,
  Clock24Regular,
} from '@fluentui/react-icons'
import { toast } from '../components/Toast'
import { applicationService, candidateService, jobService, Application, Candidate, Job } from '../services/api'

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
  calendarView: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: tokens.spacingVerticalS,
    marginTop: tokens.spacingVerticalL,
  },
  dayHeader: {
    padding: tokens.spacingVerticalM,
    textAlign: 'center',
    fontWeight: tokens.fontWeightSemibold,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
  },
  dayCell: {
    minHeight: '120px',
    padding: tokens.spacingVerticalS,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  eventCard: {
    padding: tokens.spacingVerticalXS,
    marginBottom: tokens.spacingVerticalXS,
    backgroundColor: tokens.colorBrandBackground2,
    borderRadius: tokens.borderRadiusSmall,
    cursor: 'pointer',
    fontSize: tokens.fontSizeBase200,
  },
  viewSelector: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalL,
  },
})

interface Interview {
  id: string
  applicationId: string
  interviewType: string
  scheduledAt: string
  durationMinutes: number
  interviewerId: string
  location?: string
  videoLink?: string
  status: string
  candidate?: {
    firstName: string
    lastName: string
    email: string
  }
  job?: {
    title: string
  }
}

export default function Calendar() {
  const styles = useStyles()
  const queryClient = useQueryClient()
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    candidateId: '',
    jobId: '',
    applicationId: '',
    interviewType: 'Video',
    scheduledAt: '',
    durationMinutes: 60,
    location: '',
    videoLink: '',
  })

  const { data: candidates = [] } = useQuery<Candidate[]>({
    queryKey: ['candidates'],
    queryFn: () => candidateService.getAll(),
  })

  const { data: jobs = [] } = useQuery<Job[]>({
    queryKey: ['jobs'],
    queryFn: () => jobService.getAll(),
  })

  const { data: applications = [] } = useQuery<Application[]>({
    queryKey: ['applications'],
    queryFn: () => applicationService.getAll(),
  })

  // Filter applications based on selected candidate and job
  const filteredApplications = applications.filter(app => {
    if (formData.candidateId && app.candidateId !== formData.candidateId) return false
    if (formData.jobId && app.jobId !== formData.jobId) return false
    return true
  })

  const { data: interviews = [], isLoading } = useQuery<Interview[]>({
    queryKey: ['interviews'],
    queryFn: async () => {
      const response = await fetch('/api/interviews')
      if (!response.ok) throw new Error('Failed to fetch interviews')
      return response.json()
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to create interview')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] })
      toast.success('Interview scheduled successfully')
      setIsDialogOpen(false)
    },
    onError: () => toast.error('Failed to schedule interview'),
  })

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const getInterviewsForDate = (date: Date | null) => {
    if (!date) return []
    const dateStr = date.toISOString().split('T')[0]
    return interviews.filter((interview) => {
      const interviewDate = new Date(interview.scheduledAt).toISOString().split('T')[0]
      return interviewDate === dateStr
    })
  }

  const days = getDaysInMonth(selectedDate)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const handleSubmit = () => {
    // If application is selected, use it. Otherwise, create application first
    let applicationIdToUse = formData.applicationId
    
    if (!applicationIdToUse && formData.candidateId && formData.jobId) {
      // Create application if not selected
      applicationService.create({
        candidateId: formData.candidateId,
        jobId: formData.jobId,
        status: 'Applied',
      }).then(app => {
        createMutation.mutate({
          applicationId: app.id,
          interviewType: formData.interviewType,
          scheduledAt: new Date(formData.scheduledAt).toISOString(),
          durationMinutes: formData.durationMinutes,
          location: formData.location,
          videoLink: formData.videoLink,
        })
      }).catch(() => {
        toast.error('Failed to create application')
      })
      return
    }

    if (!applicationIdToUse) {
      toast.error('Please select a candidate and job, or an existing application')
      return
    }

    createMutation.mutate({
      applicationId: applicationIdToUse,
      interviewType: formData.interviewType,
      scheduledAt: new Date(formData.scheduledAt).toISOString(),
      durationMinutes: formData.durationMinutes,
      location: formData.location,
      videoLink: formData.videoLink,
    })
  }

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text className={styles.title}>Interview Calendar</Text>
        <Button
          appearance="primary"
          icon={<Add24Regular />}
          onClick={() => setIsDialogOpen(true)}
        >
          Schedule Interview
        </Button>
      </div>

      <div className={styles.viewSelector}>
        <Button
          appearance={view === 'month' ? 'primary' : 'subtle'}
          onClick={() => setView('month')}
        >
          Month
        </Button>
        <Button
          appearance={view === 'week' ? 'primary' : 'subtle'}
          onClick={() => setView('week')}
        >
          Week
        </Button>
        <Button
          appearance={view === 'day' ? 'primary' : 'subtle'}
          onClick={() => setView('day')}
        >
          Day
        </Button>
      </div>

      <Card>
        <CardHeader
          header={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text weight="semibold">
                {selectedDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </Text>
              <div style={{ display: 'flex', gap: tokens.spacingHorizontalS }}>
                <Button
                  appearance="subtle"
                  onClick={() => {
                    const newDate = new Date(selectedDate)
                    newDate.setMonth(newDate.getMonth() - 1)
                    setSelectedDate(newDate)
                  }}
                >
                  Previous
                </Button>
                <Button
                  appearance="subtle"
                  onClick={() => setSelectedDate(new Date())}
                >
                  Today
                </Button>
                <Button
                  appearance="subtle"
                  onClick={() => {
                    const newDate = new Date(selectedDate)
                    newDate.setMonth(newDate.getMonth() + 1)
                    setSelectedDate(newDate)
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          }
        />

        {view === 'month' && (
          <div style={{ padding: tokens.spacingVerticalL }}>
            <div className={styles.calendarView}>
              {dayNames.map((day) => (
                <div key={day} className={styles.dayHeader}>
                  {day}
                </div>
              ))}
              {days.map((day, idx) => {
                const dayInterviews = getInterviewsForDate(day)
                return (
                  <div key={idx} className={styles.dayCell}>
                    {day && (
                      <>
                        <Text size={300} weight="semibold">
                          {day.getDate()}
                        </Text>
                        {dayInterviews.map((interview) => (
                          <div
                            key={interview.id}
                            className={styles.eventCard}
                            onClick={() => {
                              // TODO: Open interview details
                            }}
                          >
                            <Text size={200} weight="semibold">
                              {interview.candidate?.firstName} {interview.candidate?.lastName}
                            </Text>
                            <Text size={100}>
                              {new Date(interview.scheduledAt).toLocaleTimeString('en-GB', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </Text>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {view === 'week' && (
          <div style={{ padding: tokens.spacingVerticalL }}>
            <Text>Week view - Coming soon</Text>
          </div>
        )}

        {view === 'day' && (
          <div style={{ padding: tokens.spacingVerticalL }}>
            <Text>Day view - Coming soon</Text>
          </div>
        )}
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(_, data) => !data.open && setIsDialogOpen(false)}>
        <DialogSurface style={{ maxWidth: '600px' }}>
          <DialogTitle>
            <Text weight="semibold">Schedule Interview</Text>
          </DialogTitle>
          <DialogBody>
            <DialogContent>
              <Field label="Candidate" required>
                <Select
                  value={formData.candidateId}
                  onChange={(_, data) => {
                    setFormData({ ...formData, candidateId: data.value, applicationId: '' })
                  }}
                >
                  <option value="">Select candidate...</option>
                  {candidates.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.firstName} {candidate.lastName} ({candidate.email})
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Job" required>
                <Select
                  value={formData.jobId}
                  onChange={(_, data) => {
                    setFormData({ ...formData, jobId: data.value, applicationId: '' })
                  }}
                >
                  <option value="">Select job...</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} - {job.department} ({job.location})
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Application (Optional - auto-created if not selected)">
                <Select
                  value={formData.applicationId}
                  onChange={(_, data) => setFormData({ ...formData, applicationId: data.value })}
                >
                  <option value="">Auto-create from candidate and job...</option>
                  {filteredApplications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.candidate?.firstName} {app.candidate?.lastName} → {app.job?.title}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Interview Type" required>
                <Select
                  value={formData.interviewType}
                  onChange={(_, data) => setFormData({ ...formData, interviewType: data.value })}
                >
                  <option value="Phone">Phone</option>
                  <option value="Video">Video</option>
                  <option value="InPerson">In Person</option>
                  <option value="Panel">Panel</option>
                </Select>
              </Field>
              <Field label="Date & Time" required>
                <Input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(_, data) => setFormData({ ...formData, scheduledAt: data.value })}
                />
              </Field>
              <Field label="Duration (minutes)">
                <Input
                  type="number"
                  value={formData.durationMinutes.toString()}
                  onChange={(_, data) =>
                    setFormData({ ...formData, durationMinutes: parseInt(data.value) || 60 })
                  }
                />
              </Field>
              {formData.interviewType === 'Video' && (
                <Field label="Video Link">
                  <Input
                    value={formData.videoLink}
                    onChange={(_, data) => setFormData({ ...formData, videoLink: data.value })}
                    placeholder="Zoom, Teams, or Google Meet link"
                  />
                </Field>
              )}
              {formData.interviewType === 'InPerson' && (
                <Field label="Location">
                  <Input
                    value={formData.location}
                    onChange={(_, data) => setFormData({ ...formData, location: data.value })}
                    placeholder="Office address"
                  />
                </Field>
              )}
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                appearance="primary"
                onClick={handleSubmit}
                disabled={createMutation.isPending || (!formData.applicationId && (!formData.candidateId || !formData.jobId)) || !formData.scheduledAt}
              >
                {createMutation.isPending ? 'Scheduling...' : 'Schedule Interview'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  )
}


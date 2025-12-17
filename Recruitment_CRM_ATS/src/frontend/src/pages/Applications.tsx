import { useState } from 'react'
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
  Select,
} from '@fluentui/react-components'
import {
  Add24Regular,
  Edit24Regular,
  Delete24Regular,
  Search24Regular,
  Document24Regular,
} from '@fluentui/react-icons'
import { applicationService, jobService, candidateService, Application } from '../services/api'
import { toast } from '../components/Toast'

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
  tableCard: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.12)',
    borderRadius: tokens.borderRadiusXLarge,
    border: '1px solid rgba(102, 126, 234, 0.1)',
    overflow: 'hidden',
    padding: tokens.spacingVerticalL,
  },
  tableHeader: {
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
    borderBottom: '2px solid rgba(102, 126, 234, 0.2)',
  },
  tableRow: {
    transition: 'all 0.2s ease',
    '&:hover': {
      background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
    },
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: tokens.spacingHorizontalL,
    marginBottom: tokens.spacingVerticalL,
  },
})

export default function Applications() {
  const styles = useStyles()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingApplication, setEditingApplication] = useState<Application | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [formData, setFormData] = useState({
    candidateId: '',
    jobId: '',
    status: 'Applied',
  })
  const queryClient = useQueryClient()

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications', { status: statusFilter }],
    queryFn: () => applicationService.getAll({ status: statusFilter || undefined }),
  })

  const { data: candidates = [] } = useQuery({
    queryKey: ['candidates'],
    queryFn: () => candidateService.getAll(),
  })

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: (application: Partial<Application>) => {
      const appRequest = {
        candidateId: application.candidateId || '',
        jobId: application.jobId || '',
        notes: application.notes,
        matchScore: application.matchScore,
      }
      return applicationService.create(appRequest)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      toast.success('Application created successfully')
      handleDialogClose()
    },
    onError: () => toast.error('Failed to create application'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Application> }) => applicationService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      toast.success('Application updated successfully')
      handleDialogClose()
    },
    onError: () => toast.error('Failed to update application'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => applicationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      toast.success('Application deleted successfully')
    },
    onError: () => toast.error('Failed to delete application'),
  })

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingApplication(null)
    setFormData({
      candidateId: '',
      jobId: '',
      status: 'Applied',
    })
  }

  const handleEdit = (application: Application) => {
    setEditingApplication(application)
    setFormData({
      candidateId: application.candidateId,
      jobId: application.jobId,
      status: application.status,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = () => {
    if (editingApplication) {
      updateMutation.mutate({ id: editingApplication.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <Text className={styles.title}>Applications</Text>
          <Text size={300} style={{ color: tokens.colorNeutralForeground2, marginTop: tokens.spacingVerticalXS }}>
            Track candidate applications and their status
          </Text>
        </div>
        <Button
          appearance="primary"
          icon={<Add24Regular />}
          onClick={() => setIsDialogOpen(true)}
          size="large"
        >
          Add Application
        </Button>
      </div>

      <Card className={styles.tableCard}>
        <div style={{ display: 'flex', gap: tokens.spacingHorizontalM, marginBottom: tokens.spacingVerticalL }}>
          <Select
            value={statusFilter}
            onChange={(_, data) => setStatusFilter(data.value || '')}
            style={{ minWidth: '200px' }}
          >
            <option value="">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Screening">Screening</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Hired">Hired</option>
            <option value="Rejected">Rejected</option>
          </Select>
        </div>

        <Table>
          <TableHeader className={styles.tableHeader}>
            <TableRow>
              <TableHeaderCell>Candidate</TableHeaderCell>
              <TableHeaderCell>Job</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Match Score</TableHeaderCell>
              <TableHeaderCell>Applied Date</TableHeaderCell>
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
            ) : applications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div style={{ textAlign: 'center', padding: tokens.spacingVerticalXXL }}>
                    <Document24Regular style={{ fontSize: '48px', marginBottom: tokens.spacingVerticalM }} />
                    <Text size={400}>No applications found</Text>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              applications.map((application) => (
                <TableRow key={application.id} className={styles.tableRow}>
                  <TableCell>
                    <Text weight="semibold">
                      {application.candidate?.firstName} {application.candidate?.lastName}
                    </Text>
                  </TableCell>
                  <TableCell>{application.job?.title}</TableCell>
                  <TableCell>
                    <Badge
                      appearance={application.status === 'Hired' ? 'filled' : 'outline'}
                      color={application.status === 'Hired' ? 'success' : 'informative'}
                    >
                      {application.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {application.matchScore ? (
                      <Badge appearance="outline" color={application.matchScore >= 80 ? 'success' : 'informative'}>
                        {application.matchScore}%
                      </Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(application.appliedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', gap: tokens.spacingHorizontalXS }}>
                      <Button
                        appearance="subtle"
                        icon={<Edit24Regular />}
                        onClick={() => handleEdit(application)}
                        title="Edit"
                      />
                      <Button
                        appearance="subtle"
                        icon={<Delete24Regular />}
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this application?')) {
                            deleteMutation.mutate(application.id)
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
        <DialogSurface style={{ maxWidth: '600px' }}>
          <DialogTitle>
            <Text size={500} weight="semibold">
              {editingApplication ? 'Edit Application' : 'Create New Application'}
            </Text>
          </DialogTitle>
          <DialogBody>
            <DialogContent>
              <div className={styles.formGrid}>
                <Field label="Candidate" required>
                  <Select
                    value={formData.candidateId}
                    onChange={(_, data) => setFormData({ ...formData, candidateId: data.value || '' })}
                    required
                  >
                    <option value="">Select candidate</option>
                    {candidates.map((candidate) => (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.firstName} {candidate.lastName}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Job" required>
                  <Select
                    value={formData.jobId}
                    onChange={(_, data) => setFormData({ ...formData, jobId: data.value || '' })}
                    required
                  >
                    <option value="">Select job</option>
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Status">
                  <Select
                    value={formData.status}
                    onChange={(_, data) => setFormData({ ...formData, status: data.value || 'Applied' })}
                  >
                    <option value="Applied">Applied</option>
                    <option value="Screening">Screening</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Hired">Hired</option>
                    <option value="Rejected">Rejected</option>
                  </Select>
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
                disabled={!formData.candidateId || !formData.jobId || createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingApplication ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  )
}

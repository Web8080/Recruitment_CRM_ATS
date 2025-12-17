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
  Textarea,
  Select,
} from '@fluentui/react-components'
import {
  Add24Regular,
  Edit24Regular,
  Delete24Regular,
  Search24Regular,
  Briefcase24Regular,
} from '@fluentui/react-icons'
import { jobService, Job } from '../services/api'
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

export default function Jobs() {
  const styles = useStyles()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    status: 'Open',
    description: '',
    requirements: '',
    salaryMin: '',
    salaryMax: '',
    employmentType: 'Full-time',
  })
  const queryClient = useQueryClient()

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs', { search: searchQuery, status: statusFilter }],
    queryFn: () => jobService.getAll({ search: searchQuery, status: statusFilter || undefined }),
  })

  const createMutation = useMutation({
    mutationFn: (job: Partial<Job>) => jobService.create(job),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Job created successfully')
      handleDialogClose()
    },
    onError: () => toast.error('Failed to create job'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Job> }) => jobService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Job updated successfully')
      handleDialogClose()
    },
    onError: () => toast.error('Failed to update job'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => jobService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Job deleted successfully')
    },
    onError: () => toast.error('Failed to delete job'),
  })

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingJob(null)
    setFormData({
      title: '',
      department: '',
      location: '',
      status: 'Open',
      description: '',
      requirements: '',
      salaryMin: '',
      salaryMax: '',
      employmentType: 'Full-time',
    })
  }

  const handleEdit = (job: Job) => {
    setEditingJob(job)
    setFormData({
      title: job.title,
      department: job.department,
      location: job.location,
      status: job.status,
      description: job.description || '',
      requirements: job.requirements || '',
      salaryMin: job.salaryMin?.toString() || '',
      salaryMax: job.salaryMax?.toString() || '',
      employmentType: job.employmentType || 'Full-time',
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = () => {
    const jobData = {
      ...formData,
      salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : undefined,
      salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : undefined,
    }

    if (editingJob) {
      updateMutation.mutate({ id: editingJob.id, data: jobData })
    } else {
      createMutation.mutate(jobData)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <Text className={styles.title}>Jobs</Text>
          <Text size={300} style={{ color: tokens.colorNeutralForeground2, marginTop: tokens.spacingVerticalXS }}>
            Manage job postings and openings
          </Text>
        </div>
        <Button
          appearance="primary"
          icon={<Add24Regular />}
          onClick={() => setIsDialogOpen(true)}
          size="large"
        >
          Add Job
        </Button>
      </div>

      <Card className={styles.tableCard}>
        <div style={{ display: 'flex', gap: tokens.spacingHorizontalM, marginBottom: tokens.spacingVerticalL, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <Input
              placeholder="Search jobs..."
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
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
            <option value="Draft">Draft</option>
            <option value="OnHold">On Hold</option>
          </Select>
        </div>

        <Table>
          <TableHeader className={styles.tableHeader}>
            <TableRow>
              <TableHeaderCell>Title</TableHeaderCell>
              <TableHeaderCell>Department</TableHeaderCell>
              <TableHeaderCell>Location</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} style={{ textAlign: 'center', padding: tokens.spacingVerticalXXL }}>
                  <Spinner size="medium" />
                </TableCell>
              </TableRow>
            ) : jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <div style={{ textAlign: 'center', padding: tokens.spacingVerticalXXL }}>
                    <Briefcase24Regular style={{ fontSize: '48px', marginBottom: tokens.spacingVerticalM }} />
                    <Text size={400}>No jobs found</Text>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job.id} className={styles.tableRow}>
                  <TableCell>
                    <Text weight="semibold">{job.title}</Text>
                  </TableCell>
                  <TableCell>{job.department}</TableCell>
                  <TableCell>{job.location}</TableCell>
                  <TableCell>
                    <Badge
                      appearance={job.status === 'Open' ? 'filled' : 'outline'}
                      color={job.status === 'Open' ? 'success' : 'informative'}
                    >
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', gap: tokens.spacingHorizontalXS }}>
                      <Button
                        appearance="subtle"
                        icon={<Edit24Regular />}
                        onClick={() => handleEdit(job)}
                        title="Edit"
                      />
                      <Button
                        appearance="subtle"
                        icon={<Delete24Regular />}
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${job.title}?`)) {
                            deleteMutation.mutate(job.id)
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
            <Text size={500} weight="semibold">
              {editingJob ? 'Edit Job' : 'Create New Job'}
            </Text>
          </DialogTitle>
          <DialogBody>
            <DialogContent>
              <div className={styles.formGrid}>
                <Field label="Job Title" required>
                  <Input
                    value={formData.title}
                    onChange={(_, data) => setFormData({ ...formData, title: data.value })}
                    required
                  />
                </Field>
                <Field label="Department" required>
                  <Input
                    value={formData.department}
                    onChange={(_, data) => setFormData({ ...formData, department: data.value })}
                    required
                  />
                </Field>
                <Field label="Location" required>
                  <Input
                    value={formData.location}
                    onChange={(_, data) => setFormData({ ...formData, location: data.value })}
                    required
                  />
                </Field>
                <Field label="Status">
                  <Select
                    value={formData.status}
                    onChange={(_, data) => setFormData({ ...formData, status: data.value || 'Open' })}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                    <option value="OnHold">On Hold</option>
                  </Select>
                </Field>
                <Field label="Employment Type">
                  <Select
                    value={formData.employmentType}
                    onChange={(_, data) => setFormData({ ...formData, employmentType: data.value || 'Full-time' })}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                  </Select>
                </Field>
                <Field label="Salary Range">
                  <div style={{ display: 'flex', gap: tokens.spacingHorizontalS }}>
                    <Input
                      placeholder="Min"
                      value={formData.salaryMin}
                      onChange={(_, data) => setFormData({ ...formData, salaryMin: data.value })}
                      type="number"
                    />
                    <Input
                      placeholder="Max"
                      value={formData.salaryMax}
                      onChange={(_, data) => setFormData({ ...formData, salaryMax: data.value })}
                      type="number"
                    />
                  </div>
                </Field>
              </div>
              <Field label="Description">
                <Textarea
                  value={formData.description}
                  onChange={(_, data) => setFormData({ ...formData, description: data.value })}
                  rows={4}
                />
              </Field>
              <Field label="Requirements">
                <Textarea
                  value={formData.requirements}
                  onChange={(_, data) => setFormData({ ...formData, requirements: data.value })}
                  rows={4}
                />
              </Field>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={handleDialogClose}>
                Cancel
              </Button>
              <Button
                appearance="primary"
                onClick={handleSubmit}
                disabled={!formData.title || !formData.department || !formData.location || createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingJob ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Button,
  Card,
  Text,
  makeStyles,
  tokens,
  Input,
  Field,
  Badge,
  Spinner,
} from '@fluentui/react-components'
import {
  ArrowLeft24Regular,
  Edit24Regular,
  Delete24Regular,
} from '@fluentui/react-icons'
import { candidateService } from '../services/api'
import { toast } from '../components/Toast'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXL,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
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
  twoColumn: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: tokens.spacingHorizontalL,
    marginBottom: tokens.spacingVerticalL,
  },
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalL,
  },
})

export default function CandidateDetail() {
  const styles = useStyles()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isEditMode, setIsEditMode] = useState(false)
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', status: '' })

  const { data: candidate, isLoading } = useQuery({
    queryKey: ['candidate', id],
    queryFn: () => candidateService.getById(id!),
    enabled: !!id,
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => candidateService.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate', id] })
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      toast.success('Candidate updated successfully')
      setIsEditMode(false)
    },
    onError: () => toast.error('Failed to update candidate'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => candidateService.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      toast.success('Candidate deleted successfully')
      navigate('/candidates')
    },
    onError: () => toast.error('Failed to delete candidate'),
  })

  useEffect(() => {
    if (candidate) {
      setFormData({
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
        phone: candidate.phone || '',
        status: candidate.status,
      })
    }
  }, [candidate])

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacingVerticalXXL }}>
        <Spinner size="large" />
      </div>
    )
  }

  if (!candidate) {
    return (
      <div>
        <Text>Candidate not found</Text>
      </div>
    )
  }

  const handleSave = () => {
    updateMutation.mutate(formData)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          appearance="subtle"
          icon={<ArrowLeft24Regular />}
          onClick={() => navigate('/candidates')}
        >
          Back
        </Button>
        <Text size={600} weight="bold">
          {candidate.firstName} {candidate.lastName}
        </Text>
      </div>

      <Card className={styles.card}>
        <div className={styles.section}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacingVerticalL }}>
            <Text className={styles.sectionTitle}>Personal Information</Text>
            {!isEditMode && (
              <Button
                appearance="primary"
                icon={<Edit24Regular />}
                onClick={() => setIsEditMode(true)}
              >
                Edit
              </Button>
            )}
          </div>

          {isEditMode ? (
            <>
              <div className={styles.twoColumn}>
                <Field label="First Name" required>
                  <Input
                    value={formData.firstName}
                    onChange={(_, data) => setFormData({ ...formData, firstName: data.value })}
                  />
                </Field>
                <Field label="Last Name" required>
                  <Input
                    value={formData.lastName}
                    onChange={(_, data) => setFormData({ ...formData, lastName: data.value })}
                  />
                </Field>
              </div>
              <Field label="Email" required>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(_, data) => setFormData({ ...formData, email: data.value })}
                />
              </Field>
              <Field label="Phone">
                <Input
                  value={formData.phone}
                  onChange={(_, data) => setFormData({ ...formData, phone: data.value })}
                  placeholder="07xxx xxx xxx"
                />
              </Field>
              <Field label="Status">
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{
                    width: '100%',
                    padding: tokens.spacingVerticalM,
                    borderRadius: tokens.borderRadiusMedium,
                    border: `1px solid ${tokens.colorNeutralStroke1}`,
                  }}
                >
                  <option value="Active">Active</option>
                  <option value="Interview">Interview</option>
                  <option value="Hired">Hired</option>
                  <option value="Rejected">Rejected</option>
                  <option value="OnHold">On Hold</option>
                </select>
              </Field>
              <div className={styles.actions}>
                <Button
                  appearance="primary"
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  appearance="secondary"
                  onClick={() => {
                    setIsEditMode(false)
                    if (candidate) {
                      setFormData({
                        firstName: candidate.firstName,
                        lastName: candidate.lastName,
                        email: candidate.email,
                        phone: candidate.phone || '',
                        status: candidate.status,
                      })
                    }
                  }}
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <div className={styles.twoColumn}>
              <div>
                <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>First Name</Text>
                <Text size={400} weight="semibold">{candidate.firstName}</Text>
              </div>
              <div>
                <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>Last Name</Text>
                <Text size={400} weight="semibold">{candidate.lastName}</Text>
              </div>
              <div>
                <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>Email</Text>
                <Text size={400}>{candidate.email}</Text>
              </div>
              <div>
                <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>Phone</Text>
                <Text size={400}>{candidate.phone || '-'}</Text>
              </div>
              <div>
                <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>Status</Text>
                <Badge appearance="filled" color={candidate.status === 'Active' ? 'success' : 'informative'}>
                  {candidate.status}
                </Badge>
              </div>
            </div>
          )}
        </div>

        {candidate.skills && candidate.skills.length > 0 && (
          <div className={styles.section}>
            <Text className={styles.sectionTitle}>Skills</Text>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacingHorizontalS }}>
              {(Array.isArray(candidate.skills) ? candidate.skills : []).map((skill, idx) => (
                <Badge key={idx}>{skill}</Badge>
              ))}
            </div>
          </div>
        )}

        {candidate.experience && (
          <div className={styles.section}>
            <Text className={styles.sectionTitle}>Experience</Text>
            {Array.isArray(candidate.experience) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM }}>
                {candidate.experience.map((exp: any, idx: number) => (
                  <div key={idx} style={{ padding: tokens.spacingVerticalM, backgroundColor: tokens.colorNeutralBackground2, borderRadius: tokens.borderRadiusMedium }}>
                    <Text weight="semibold" size={400}>{exp.position || 'N/A'}</Text>
                    <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>
                      {exp.company || 'N/A'}
                      {exp.duration && ` • ${exp.duration}`}
                    </Text>
                    {exp.description && (
                      <Text size={300} style={{ marginTop: tokens.spacingVerticalXS, color: tokens.colorNeutralForeground3 }}>
                        {exp.description}
                      </Text>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Text size={300}>{candidate.experience}</Text>
            )}
          </div>
        )}

        <div className={styles.actions}>
          <Button
            appearance="secondary"
            icon={<Delete24Regular />}
            onClick={() => {
              if (confirm('Are you sure you want to delete this candidate?')) {
                deleteMutation.mutate()
              }
            }}
            disabled={deleteMutation.isPending}
          >
            Delete
          </Button>
        </div>
      </Card>
    </div>
  )
}



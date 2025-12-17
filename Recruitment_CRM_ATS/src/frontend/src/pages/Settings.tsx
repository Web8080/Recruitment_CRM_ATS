import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  Button,
  Card,
  CardHeader,
  makeStyles,
  tokens,
  Text,
  Input,
  Field,
  Divider,
} from '@fluentui/react-components'
import {
  Person24Regular,
} from '@fluentui/react-icons'
import { useAuth } from '../contexts/AuthContext'
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
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    maxWidth: '500px',
  },
})

export default function Settings() {
  const styles = useStyles()
  const { user } = useAuth()
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to change password')
      }
      return response.json()
    },
    onSuccess: () => {
      toast.success('Password changed successfully')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to change password')
    },
  })

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long')
      return
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    })
  }

  return (
    <div className={styles.container}>
      <Text className={styles.title}>Settings</Text>

      <Card className={styles.card}>
        <CardHeader
          header={
            <div className={styles.sectionTitle}>
              <Person24Regular />
              <Text weight="semibold">Profile Information</Text>
            </div>
          }
        />
        <div className={styles.section}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacingHorizontalL, marginBottom: tokens.spacingVerticalL }}>
            <div>
              <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>Name</Text>
              <Text size={400} weight="semibold">{user?.firstName} {user?.lastName}</Text>
            </div>
            <div>
              <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>Email</Text>
              <Text size={400} weight="semibold">{user?.email}</Text>
            </div>
            <div>
              <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>Role</Text>
              <Text size={400} weight="semibold">{user?.role}</Text>
            </div>
          </div>
        </div>
      </Card>

      <Card className={styles.card}>
        <CardHeader
          header={
            <div className={styles.sectionTitle}>
              <Text weight="semibold">Change Password</Text>
            </div>
          }
        />
        <form onSubmit={handleChangePassword} className={styles.form}>
          <Field label="Current Password" required>
            <Input
              type="password"
              value={passwordData.currentPassword}
              onChange={(_, data) => setPasswordData({ ...passwordData, currentPassword: data.value })}
              placeholder="Enter current password"
              required
            />
          </Field>
          <Field label="New Password" required>
            <Input
              type="password"
              value={passwordData.newPassword}
              onChange={(_, data) => setPasswordData({ ...passwordData, newPassword: data.value })}
              placeholder="Enter new password (min 8 characters)"
              required
              minLength={8}
            />
          </Field>
          <Field label="Confirm New Password" required>
            <Input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(_, data) => setPasswordData({ ...passwordData, confirmPassword: data.value })}
              placeholder="Confirm new password"
              required
              minLength={8}
            />
          </Field>
          <Button
            type="submit"
            appearance="primary"
            disabled={changePasswordMutation.isPending || !passwordData.currentPassword || !passwordData.newPassword}
          >
            {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
          </Button>
        </form>
      </Card>
    </div>
  )
}


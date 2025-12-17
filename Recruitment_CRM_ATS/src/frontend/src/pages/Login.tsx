import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Input,
  Field,
  makeStyles,
  tokens,
  Text,
  Card,
  Divider,
} from '@fluentui/react-components'
import { useAuth } from '../contexts/AuthContext'
import { toast } from '../components/Toast'
import logo from '../assets/logo.svg'
import Footer from '../components/Footer'

const useStyles = makeStyles({
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: tokens.spacingVerticalXXL,
  },
  logoContainer: {
    marginBottom: tokens.spacingVerticalXL,
    display: 'flex',
    justifyContent: 'center',
  },
  logo: {
    height: '60px',
    width: 'auto',
    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))',
  },
  card: {
    width: '100%',
    maxWidth: '450px',
    padding: tokens.spacingVerticalXXL,
    boxShadow: tokens.shadow16,
    borderRadius: tokens.borderRadiusXLarge,
  },
  title: {
    fontSize: tokens.fontSizeHero700,
    fontWeight: tokens.fontWeightBold,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: tokens.spacingVerticalL,
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  toggleButton: {
    marginTop: tokens.spacingVerticalM,
  },
  divider: {
    margin: `${tokens.spacingVerticalL} 0`,
  },
})

export default function Login() {
  const styles = useStyles()
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState('Recruiter')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isLogin) {
        await login(email, password)
        toast.success('Login successful!')
        navigate('/dashboard')
      } else {
        await register(email, password, firstName, lastName, role)
        toast.success('Registration successful!')
        navigate('/dashboard')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.logoContainer}>
        <img src={logo} alt="RecruitCRM Logo" className={styles.logo} />
      </div>
      <Card className={styles.card}>
        <Text className={styles.title}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </Text>

        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacingHorizontalM }}>
                <Field label="First Name" required>
                  <Input
                    value={firstName}
                    onChange={(_, data) => setFirstName(data.value)}
                    required
                  />
                </Field>
                <Field label="Last Name" required>
                  <Input
                    value={lastName}
                    onChange={(_, data) => setLastName(data.value)}
                    required
                  />
                </Field>
              </div>
              <Field label="Role">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: tokens.spacingVerticalM,
                    borderRadius: tokens.borderRadiusMedium,
                    border: `1px solid ${tokens.colorNeutralStroke1}`,
                  }}
                >
                  <option value="Recruiter">Recruiter</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </Field>
            </>
          )}

          <Field label="Email" required>
            <Input
              type="email"
              value={email}
              onChange={(_, data) => setEmail(data.value)}
              required
            />
          </Field>

          <Field label="Password" required>
            <Input
              type="password"
              value={password}
              onChange={(_, data) => setPassword(data.value)}
              required
              minLength={6}
            />
          </Field>

          <Button
            type="submit"
            appearance="primary"
            size="large"
            disabled={isLoading}
            style={{ width: '100%' }}
          >
            {isLoading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
          </Button>
        </form>

        <Divider className={styles.divider} />

        <Button
          appearance="subtle"
          onClick={() => setIsLogin(!isLogin)}
          className={styles.toggleButton}
          style={{ width: '100%' }}
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
        </Button>

        {isLogin && (
          <div style={{ marginTop: tokens.spacingVerticalM, textAlign: 'center' }}>
            <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>
              Demo: admin@recruitmentcrm.com / any password
            </Text>
          </div>
        )}
      </Card>
      <div style={{ marginTop: tokens.spacingVerticalXL }}>
        <Footer />
      </div>
    </div>
  )
}


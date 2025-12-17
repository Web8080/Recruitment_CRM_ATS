import { ReactNode } from 'react'
import {
  makeStyles,
  tokens,
  Button,
  Text,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
} from '@fluentui/react-components'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Home24Regular,
  People24Regular,
  Briefcase24Regular,
  Document24Regular,
  Sparkle24Regular,
  DataTrending24Regular,
  SignOut24Regular,
  Person24Regular,
  WeatherMoon24Regular,
  WeatherSunny24Regular,
  CalendarMonth24Regular,
  Settings24Regular,
  Link24Regular,
} from '@fluentui/react-icons'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { toast } from './Toast'
import Footer from './Footer'
import logo from '../assets/logo.svg'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    height: '100vh',
  },
  sidebar: {
    width: '280px',
    background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
    borderRight: `1px solid ${tokens.colorNeutralStroke1}`,
    padding: tokens.spacingVerticalXL,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.1)',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    },
  },
  content: {
    flex: 1,
    padding: tokens.spacingVerticalXXL,
    overflow: 'auto',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #ffffff 50%, #f8f9fa 100%)',
    minHeight: '100vh',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    marginBottom: tokens.spacingVerticalXL,
    paddingBottom: tokens.spacingVerticalL,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
  logo: {
    height: '50px',
    width: 'auto',
  },
  title: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorNeutralForeground1,
    background: `linear-gradient(135deg, ${tokens.colorBrandForeground1} 0%, ${tokens.colorPaletteBlueForeground2} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  navButton: {
    width: '100%',
    justifyContent: 'flex-start',
    marginBottom: tokens.spacingVerticalXS,
    borderRadius: tokens.borderRadiusLarge,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '4px',
      background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
      transform: 'scaleY(0)',
      transition: 'transform 0.3s ease',
    },
    '&:hover': {
      backgroundColor: 'rgba(102, 126, 234, 0.08)',
      transform: 'translateX(4px)',
      '&::before': {
        transform: 'scaleY(1)',
      },
    },
  },
  navButtonActive: {
    backgroundColor: tokens.colorBrandBackground2,
  },
  headerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    marginBottom: tokens.spacingVerticalL,
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  themeToggle: {
    minWidth: 'auto',
  },
})

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const styles = useStyles()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home24Regular },
    { name: 'Candidates', path: '/candidates', icon: People24Regular },
    { name: 'Jobs', path: '/jobs', icon: Briefcase24Regular },
    { name: 'Applications', path: '/applications', icon: Document24Regular },
    { name: 'Calendar', path: '/calendar', icon: CalendarMonth24Regular },
    { name: 'AI Services', path: '/ai-services', icon: Sparkle24Regular },
    { name: 'Job Boards', path: '/job-boards', icon: Link24Regular },
    { name: 'Analytics', path: '/analytics', icon: DataTrending24Regular },
    { name: 'Settings', path: '/settings', icon: Settings24Regular },
  ]

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.header}>
          <div className={styles.logoContainer} onClick={() => navigate('/dashboard')}>
            <img src={logo} alt="RecruitCRM Logo" className={styles.logo} />
          </div>
        </div>
        <div>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
            return (
              <Button
                key={item.path}
                appearance={isActive ? 'primary' : 'subtle'}
                icon={<Icon />}
                className={styles.navButton}
                onClick={() => navigate(item.path)}
              >
                {item.name}
              </Button>
            )
          })}
        </div>
        <div style={{ marginTop: 'auto', paddingTop: tokens.spacingVerticalL }}>
          <div className={styles.userMenu}>
            <Button
              appearance="subtle"
              icon={theme === 'dark' ? <WeatherSunny24Regular /> : <WeatherMoon24Regular />}
              onClick={toggleTheme}
              className={styles.themeToggle}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            />
            <Menu>
              <MenuTrigger>
                <Button
                  appearance="subtle"
                  icon={<Person24Regular />}
                  style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS }}
                >
                  {user?.firstName} {user?.lastName}
                </Button>
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  <MenuItem>
                    <Text size={300} weight="semibold">{user?.email}</Text>
                    <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
                      {user?.role}
                    </Text>
                  </MenuItem>
                  <MenuItem icon={<SignOut24Regular />} onClick={handleLogout}>
                    Logout
                  </MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>
          </div>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.headerBar}>
          <Text size={500} weight="semibold">
            {navItems.find(item => location.pathname === item.path || location.pathname.startsWith(item.path + '/'))?.name || 'Dashboard'}
          </Text>
        </div>
        <div style={{ flex: 1 }}>
          {children}
        </div>
        <Footer />
      </div>
    </div>
  )
}


import {
  Card,
  CardHeader,
  makeStyles,
  tokens,
  Text,
  Spinner,
} from '@fluentui/react-components'
import {
  People24Regular,
  Briefcase24Regular,
  Document24Regular,
  Sparkle24Filled,
} from '@fluentui/react-icons'
import { useQuery } from '@tanstack/react-query'
import { candidateService, Candidate } from '../services/api'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXL,
  },
  header: {
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
  subtitle: {
    color: tokens.colorNeutralForeground2,
    marginTop: tokens.spacingVerticalXS,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: tokens.spacingVerticalL,
  },
  statCard: {
    minHeight: '180px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)' as any,
    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.12)' as any,
    borderRadius: tokens.borderRadiusXLarge,
    border: '1px solid rgba(102, 126, 234, 0.1)' as any,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative' as any,
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute' as any,
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'var(--primary-gradient)',
      transform: 'scaleX(0)',
      transformOrigin: 'left',
      transition: 'transform 0.3s ease',
    },
    '&:hover': {
      transform: 'translateY(-8px) scale(1.02)',
      boxShadow: '0 16px 48px rgba(102, 126, 234, 0.2)' as any,
      borderColor: 'rgba(102, 126, 234, 0.3)' as any,
      '&::before': {
        transform: 'scaleX(1)',
      },
    },
  },
  statHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: tokens.spacingVerticalM,
  },
  statIcon: {
    fontSize: '36px' as any,
    padding: tokens.spacingVerticalM,
    borderRadius: tokens.borderRadiusLarge,
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)' as any,
    color: tokens.colorBrandForeground1,
    border: '1px solid rgba(102, 126, 234, 0.2)' as any,
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)' as any,
      transform: 'scale(1.1) rotate(5deg)',
    },
  },
  statValue: {
    fontSize: tokens.fontSizeHero700,
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorBrandForeground1,
    lineHeight: '1.2',
  },
  statLabel: {
    fontSize: tokens.fontSizeBase400,
    color: tokens.colorNeutralForeground2,
    marginTop: tokens.spacingVerticalXS,
    fontWeight: tokens.fontWeightMedium,
  },
  statChange: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorPaletteGreenForeground1,
    marginTop: tokens.spacingVerticalXS,
  },
  welcomeCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    padding: tokens.spacingVerticalXXL,
    borderRadius: tokens.borderRadiusXLarge,
    boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '-50%',
      right: '-50%',
      width: '200%',
      height: '200%',
      background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
      animation: 'pulse 4s ease-in-out infinite',
    },
  },
  welcomeContent: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalL,
  },
  welcomeText: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: tokens.fontSizeHero700,
    fontWeight: tokens.fontWeightBold,
    color: '#ffffff',
    marginBottom: tokens.spacingVerticalS,
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
  },
  welcomeDescription: {
    fontSize: tokens.fontSizeBase400,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: '1.6',
  },
})

export default function Dashboard() {
  const styles = useStyles()

  const { data: candidates = [], isLoading: candidatesLoading } = useQuery<Candidate[]>({
    queryKey: ['candidates'],
    queryFn: () => candidateService.getAll(),
  })

  const stats = [
    {
      label: 'Total Candidates',
      value: candidates.length.toString(),
      icon: People24Regular,
      color: tokens.colorBrandForeground1,
      change: '+12% this month',
      loading: candidatesLoading,
    },
    {
      label: 'Active Jobs',
      value: '0',
      icon: Briefcase24Regular,
      color: tokens.colorPaletteBlueForeground2,
      change: 'Coming soon',
      loading: false,
    },
    {
      label: 'Applications',
      value: '0',
      icon: Document24Regular,
      color: tokens.colorPaletteGreenForeground1,
      change: 'Coming soon',
      loading: false,
    },
    {
      label: 'AI Processed',
      value: candidates.filter((c) => c.createdAt).length.toString(),
      icon: Sparkle24Filled,
      color: tokens.colorPalettePurpleForeground2,
      change: 'Resumes parsed',
      loading: false,
    },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Text className={styles.title}>Dashboard</Text>
      </div>

      <Card className={styles.welcomeCard}>
        <div className={styles.welcomeContent}>
          <div className={styles.welcomeText}>
            <Text className={styles.welcomeTitle}>
              Welcome to Recruitment CRM
            </Text>
            <Text className={styles.welcomeDescription}>
              Streamline your hiring process with AI-powered candidate management. 
              Upload resumes, automatically extract candidate information, and match 
              the best talent to your open positions.
            </Text>
          </div>
          <Sparkle24Filled style={{ fontSize: '64px', opacity: 0.8 }} />
        </div>
      </Card>

      <div className={styles.statsGrid}>
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className={styles.statCard}>
              <CardHeader
                header={
                  <div>
                    <div className={styles.statHeader}>
                      <div>
                        {stat.loading ? (
                          <Spinner size="small" />
                        ) : (
                          <Text className={styles.statValue}>{stat.value}</Text>
                        )}
                        <Text className={styles.statLabel}>{stat.label}</Text>
                        <Text className={styles.statChange}>{stat.change}</Text>
                      </div>
                      <div className={styles.statIcon}>
                        <Icon />
                      </div>
                    </div>
                  </div>
                }
              />
            </Card>
          )
        })}
      </div>
    </div>
  )
}

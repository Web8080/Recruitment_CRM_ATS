import { useQuery } from '@tanstack/react-query'
import {
  Card,
  CardHeader,
  makeStyles,
  tokens,
  Text,
  Spinner,
  ProgressBar,
  Button,
} from '@fluentui/react-components'
import {
  People24Regular,
  Document24Regular,
  Sparkle24Filled,
  DataTrending24Regular,
  Clock24Regular,
  Briefcase24Regular,
} from '@fluentui/react-icons'
import { analyticsService } from '../services/api'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: tokens.spacingVerticalL,
  },
  statCard: {
    minHeight: '180px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.12)',
    borderRadius: tokens.borderRadiusXLarge,
    border: '1px solid rgba(102, 126, 234, 0.1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-8px) scale(1.02)',
      boxShadow: '0 16px 48px rgba(102, 126, 234, 0.2)',
    },
  },
  statHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: tokens.spacingVerticalM,
  },
  statIcon: {
    fontSize: '40px',
    padding: tokens.spacingVerticalM,
    borderRadius: tokens.borderRadiusLarge,
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
    color: tokens.colorBrandForeground1,
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
  chartCard: {
    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.12)',
    borderRadius: tokens.borderRadiusXLarge,
    padding: tokens.spacingVerticalXXL,
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    border: '1px solid rgba(102, 126, 234, 0.1)',
  },
  chartTitle: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: tokens.spacingVerticalL,
    color: tokens.colorBrandForeground1,
  },
  progressItem: {
    marginBottom: tokens.spacingVerticalL,
  },
  progressLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: tokens.spacingVerticalXS,
  },
  exportButton: {
    marginTop: tokens.spacingVerticalL,
  },
})

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b']

export default function Analytics() {
  const styles = useStyles()

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsService.getAnalytics(),
    retry: 1,
  })

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacingVerticalXXL }}>
        <Spinner size="large" />
      </div>
    )
  }

  if (!analytics) {
    return <Text>No analytics data available</Text>
  }

  const statusData = Object.entries(analytics.statusDistribution || {}).map(([name, value]) => ({
    name,
    value,
  }))

  const sourceData = Object.entries(analytics.sourceDistribution || {}).map(([name, value]) => ({
    name,
    value,
  }))

  const monthlyData = analytics.monthlyTrends 
    ? Object.entries(analytics.monthlyTrends)
        .map(([month, count]) => ({
          month: month.substring(5), // Get MM from YYYY-MM
          count: count as number,
        }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6) // Last 6 months
    : []

  const handleExport = () => {
    // PLACEHOLDER: Export functionality
    // In production, call: await apiClient.get('/export/candidates', { responseType: 'blob' })
    alert('PLACEHOLDER: Export functionality - configure in production')
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Text className={styles.title}>Analytics & Insights</Text>
        <Text size={300} style={{ color: tokens.colorNeutralForeground2, marginTop: tokens.spacingVerticalXS }}>
          Comprehensive recruitment metrics and performance data
        </Text>
      </div>

      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div className={styles.statHeader}>
            <div>
              <Text className={styles.statValue}>{analytics.totalCandidates}</Text>
              <Text className={styles.statLabel}>Total Candidates</Text>
            </div>
            <div className={styles.statIcon}>
              <People24Regular />
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statHeader}>
            <div>
              <Text className={styles.statValue}>{analytics.activeCandidates}</Text>
              <Text className={styles.statLabel}>Active Candidates</Text>
            </div>
            <div className={styles.statIcon}>
              <People24Regular />
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statHeader}>
            <div>
              <Text className={styles.statValue}>{analytics.hiredCandidates}</Text>
              <Text className={styles.statLabel}>Hired</Text>
            </div>
            <div className={styles.statIcon}>
              <Sparkle24Filled />
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statHeader}>
            <div>
              <Text className={styles.statValue}>{analytics.totalJobs}</Text>
              <Text className={styles.statLabel}>Total Jobs</Text>
            </div>
            <div className={styles.statIcon}>
              <Briefcase24Regular />
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statHeader}>
            <div>
              <Text className={styles.statValue}>{analytics.openJobs}</Text>
              <Text className={styles.statLabel}>Open Jobs</Text>
            </div>
            <div className={styles.statIcon}>
              <Briefcase24Regular />
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statHeader}>
            <div>
              <Text className={styles.statValue}>{analytics.totalApplications}</Text>
              <Text className={styles.statLabel}>Applications</Text>
            </div>
            <div className={styles.statIcon}>
              <Document24Regular />
            </div>
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacingVerticalXL }}>
        <Card className={styles.chartCard}>
          <Text className={styles.chartTitle}>Candidate Status Distribution</Text>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className={styles.chartCard}>
          <Text className={styles.chartTitle}>Source Distribution</Text>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sourceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className={styles.chartCard}>
        <Text className={styles.chartTitle}>Monthly Candidate Trends</Text>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#667eea" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className={styles.chartCard}>
        <Text className={styles.chartTitle}>Recruitment Pipeline</Text>
        <div className={styles.progressItem}>
          <div className={styles.progressLabel}>
            <Text weight="semibold">Applied</Text>
            <Text>{analytics.statusDistribution?.Applied || 0}</Text>
          </div>
          <ProgressBar
            value={((analytics.statusDistribution?.Applied || 0) / analytics.totalCandidates) * 100}
            color="brand"
          />
        </div>
        <div className={styles.progressItem}>
          <div className={styles.progressLabel}>
            <Text weight="semibold">Interview</Text>
            <Text>{analytics.statusDistribution?.Interview || 0}</Text>
          </div>
          <ProgressBar
            value={((analytics.statusDistribution?.Interview || 0) / analytics.totalCandidates) * 100}
            color="brand"
          />
        </div>
        <div className={styles.progressItem}>
          <div className={styles.progressLabel}>
            <Text weight="semibold">Hired</Text>
            <Text>{analytics.statusDistribution?.Hired || 0}</Text>
          </div>
          <ProgressBar
            value={((analytics.statusDistribution?.Hired || 0) / analytics.totalCandidates) * 100}
            color="success"
          />
        </div>
        <div className={styles.progressItem}>
          <div className={styles.progressLabel}>
            <Text weight="semibold">Rejected</Text>
            <Text>{analytics.statusDistribution?.Rejected || 0}</Text>
          </div>
          <ProgressBar
            value={((analytics.statusDistribution?.Rejected || 0) / analytics.totalCandidates) * 100}
            color="error"
          />
        </div>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          appearance="primary"
          onClick={handleExport}
          className={styles.exportButton}
        >
          Export Report
        </Button>
      </div>
    </div>
  )
}

import { makeStyles, tokens, Text } from '@fluentui/react-components'
import { Heart24Filled } from '@fluentui/react-icons'

const useStyles = makeStyles({
  footer: {
    marginTop: 'auto',
    padding: `${tokens.spacingVerticalXL} ${tokens.spacingHorizontalXXL}`,
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  text: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground2,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXXS,
  },
  heart: {
    color: '#f093fb',
    animation: 'pulse 2s ease-in-out infinite',
  },
  company: {
    fontWeight: tokens.fontWeightSemibold,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
})

export default function Footer() {
  const styles = useStyles()
  
  return (
    <footer className={styles.footer}>
      <Text className={styles.text}>
        Built with
        <Heart24Filled className={styles.heart} />
        by
        <span style={{ fontWeight: tokens.fontWeightSemibold, color: tokens.colorNeutralForeground1 }}>
          Victor Ibhafidon
        </span>
        for
        <span className={styles.company}>
          Xtainless Labs
        </span>
      </Text>
    </footer>
  )
}



import { useState } from 'react'
import {
  Button,
  Textarea,
  makeStyles,
  tokens,
  Text,
  Card,
  CardHeader,
  Field,
  Spinner,
} from '@fluentui/react-components'
import { aiService } from '../services/api'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  title: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightSemibold,
  },
  card: {
    padding: tokens.spacingVerticalXL,
  },
  textarea: {
    minHeight: '200px',
    marginBottom: tokens.spacingVerticalL,
  },
  result: {
    marginTop: tokens.spacingVerticalL,
    padding: tokens.spacingVerticalL,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
    whiteSpace: 'pre-wrap',
  },
})

export default function AIServices() {
  const styles = useStyles()
  const [resumeText, setResumeText] = useState('')
  const [candidateProfile, setCandidateProfile] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [parseResult, setParseResult] = useState('')
  const [matchResult, setMatchResult] = useState('')
  const [isParsing, setIsParsing] = useState(false)
  const [isMatching, setIsMatching] = useState(false)

  const handleParseResume = async () => {
    if (!resumeText.trim()) return

    setIsParsing(true)
    try {
      const result = await aiService.parseResume(resumeText)
      setParseResult(JSON.stringify(result, null, 2))
    } catch (error) {
      setParseResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsParsing(false)
    }
  }

  const handleMatchCandidate = async () => {
    if (!candidateProfile.trim() || !jobDescription.trim()) return

    setIsMatching(true)
    try {
      const result = await aiService.matchCandidate(candidateProfile, jobDescription)
      setMatchResult(JSON.stringify(result, null, 2))
    } catch (error) {
      setMatchResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsMatching(false)
    }
  }

  return (
    <div className={styles.container}>
      <Text className={styles.title}>AI Services</Text>

      <Card className={styles.card}>
        <CardHeader header={<Text weight="semibold">Resume Parser</Text>} />
        <Field label="Paste resume text below">
          <Textarea
            className={styles.textarea}
            value={resumeText}
            onChange={(_, data) => setResumeText(data.value)}
            placeholder="Paste candidate resume text here..."
          />
        </Field>
        <Button
          appearance="primary"
          onClick={handleParseResume}
          disabled={isParsing || !resumeText.trim()}
        >
          {isParsing ? <Spinner size="tiny" /> : 'Parse Resume'}
        </Button>
        {parseResult && (
          <div className={styles.result}>
            <Text weight="semibold">Parsed Result:</Text>
            <pre>{parseResult}</pre>
          </div>
        )}
      </Card>

      <Card className={styles.card}>
        <CardHeader header={<Text weight="semibold">Candidate Matching</Text>} />
        <Field label="Candidate Profile">
          <Textarea
            className={styles.textarea}
            value={candidateProfile}
            onChange={(_, data) => setCandidateProfile(data.value)}
            placeholder="Enter candidate profile, skills, and experience..."
          />
        </Field>
        <Field label="Job Description">
          <Textarea
            className={styles.textarea}
            value={jobDescription}
            onChange={(_, data) => setJobDescription(data.value)}
            placeholder="Enter job description and requirements..."
          />
        </Field>
        <Button
          appearance="primary"
          onClick={handleMatchCandidate}
          disabled={isMatching || !candidateProfile.trim() || !jobDescription.trim()}
        >
          {isMatching ? <Spinner size="tiny" /> : 'Match Candidate'}
        </Button>
        {matchResult && (
          <div className={styles.result}>
            <Text weight="semibold">Match Analysis:</Text>
            <pre>{matchResult}</pre>
          </div>
        )}
      </Card>
    </div>
  )
}



import { useCallback, useState } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import {
  makeStyles,
  tokens,
  Text,
  Spinner,
  mergeClasses,
} from '@fluentui/react-components'
import {
  Document24Regular,
  CheckmarkCircle24Filled,
  ErrorCircle24Filled,
} from '@fluentui/react-icons'

const useStyles = makeStyles({
  dropzone: {
    border: `2px dashed ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusLarge,
    padding: tokens.spacingVerticalXXL,
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: tokens.colorNeutralBackground1,
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalM,
  },
  dropzoneActive: {
    borderColor: tokens.colorBrandForeground1 as any,
    backgroundColor: tokens.colorBrandBackground2 as any,
    borderWidth: '3px' as any,
  },
  dropzoneReject: {
    borderColor: tokens.colorPaletteRedBorderActive as any,
    backgroundColor: tokens.colorPaletteRedBackground2 as any,
  },
  icon: {
    fontSize: '48px',
    color: tokens.colorNeutralForeground3,
  },
  iconActive: {
    color: tokens.colorBrandForeground1,
  },
  text: {
    color: tokens.colorNeutralForeground2,
  },
  textActive: {
    color: tokens.colorBrandForeground1,
    fontWeight: tokens.fontWeightSemibold,
  },
  fileInfo: {
    marginTop: tokens.spacingVerticalM,
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  statusContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalS,
  },
  errorText: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: tokens.fontSizeBase300,
  },
})

interface FileUploadProps {
  onFileUploaded?: (file: File, text: string) => void
  onFileUpload?: (file: File) => void
  onError?: (error: string) => void
  accept?: Record<string, string[]>
  maxSize?: number
  disabled?: boolean
}

const defaultAccept: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
  'text/plain': ['.txt'],
}

export default function FileUpload({
  onFileUploaded,
  onFileUpload,
  onError,
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB
  disabled = false,
}: FileUploadProps) {
  const fileAccept = accept || defaultAccept
  const styles = useStyles()
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.type.includes('text') || file.name.endsWith('.txt')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          resolve(e.target?.result as string)
        }
        reader.onerror = () => reject(new Error('Failed to read text file'))
        reader.readAsText(file)
      } else {
        reject(new Error('For PDF/DOCX files, please use the file upload feature which processes on the server.'))
      }
    })
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (rejectedFiles.length > 0) {
        const error = rejectedFiles[0].errors[0]?.message || 'File rejected'
        setErrorMessage(error)
        setStatus('error')
        onError?.(error)
        return
      }

      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      setUploadedFile(file)
      setIsProcessing(true)
      setStatus('idle')
      setErrorMessage('')

      try {
        let text = ''
        if (file.type.includes('text') || file.name.endsWith('.txt')) {
          text = await extractTextFromFile(file)
        } else {
          text = 'File uploaded - processing on server...'
        }
        setStatus('success')
        if (onFileUpload) {
          onFileUpload(file)
        } else if (onFileUploaded) {
          onFileUploaded(file, text)
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to process file'
        setErrorMessage(errorMsg)
        setStatus('error')
        onError?.(errorMsg)
      } finally {
        setIsProcessing(false)
      }
    },
    [onFileUploaded, onFileUpload, onError]
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: fileAccept as any,
    maxSize,
    multiple: false,
    disabled: disabled || isProcessing,
  })

  return (
    <div>
      <div
        {...getRootProps()}
        className={mergeClasses(
          styles.dropzone,
          isDragActive && styles.dropzoneActive,
          isDragReject && styles.dropzoneReject
        )}
      >
        <input {...getInputProps()} />
        {isProcessing ? (
          <div className={styles.statusContainer}>
            <Spinner size="large" />
            <Text className={styles.text}>Processing {uploadedFile?.name}...</Text>
          </div>
        ) : status === 'success' ? (
          <div className={styles.statusContainer}>
            <CheckmarkCircle24Filled className={mergeClasses(styles.icon, styles.iconActive)} />
            <Text className={styles.textActive}>File processed successfully!</Text>
            {uploadedFile && (
              <Text className={styles.text} size={300}>
                {uploadedFile.name}
              </Text>
            )}
          </div>
        ) : status === 'error' ? (
          <div className={styles.statusContainer}>
            <ErrorCircle24Filled style={{ color: tokens.colorPaletteRedForeground1 }} />
            <Text className={styles.errorText}>{errorMessage || 'Upload failed'}</Text>
          </div>
        ) : (
          <>
            <Document24Regular
              className={mergeClasses(styles.icon, isDragActive && styles.iconActive)}
            />
            <div>
              <Text className={mergeClasses(styles.text, isDragActive && styles.textActive)}>
                {isDragActive
                  ? 'Drop your resume here'
                  : 'Drag & drop your resume here, or click to browse'}
              </Text>
              <Text className={styles.text} size={300} style={{ marginTop: tokens.spacingVerticalXS }}>
                Supports PDF, DOCX, DOC, TXT (Max 10MB)
              </Text>
            </div>
          </>
        )}
      </div>
      {uploadedFile && status === 'success' && (
        <div className={styles.fileInfo}>
          <Document24Regular />
          <Text>{uploadedFile.name}</Text>
          <Text size={300} style={{ marginLeft: 'auto' }}>
            {(uploadedFile.size / 1024).toFixed(2)} KB
          </Text>
        </div>
      )}
    </div>
  )
}


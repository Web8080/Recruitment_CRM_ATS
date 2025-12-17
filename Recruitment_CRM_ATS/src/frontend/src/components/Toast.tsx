import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { makeStyles, tokens } from '@fluentui/react-components'

const useStyles = makeStyles({
  toastContainer: {
    '& .Toastify__toast': {
      borderRadius: tokens.borderRadiusLarge,
      boxShadow: tokens.shadow8,
    },
    '& .Toastify__toast--success': {
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    '& .Toastify__toast--error': {
      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    },
    '& .Toastify__toast--info': {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
  },
})

export function ToastProvider() {
  const styles = useStyles()
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      className={styles.toastContainer}
    />
  )
}

export { toast }



import '@/assets/css/common.css'
import '@/assets/css/swap_bg.css'
// import { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import '../../cetus-design/src/assets/css/notifi.scss'
import App from './App.tsx'

// const LazyComponent = React.lazy(() => import('./App.tsx'))

ReactDOM.createRoot(document.getElementById('root')!).render(
  <>
    {/* <Suspense fallback={<GeneralLoading />}>
      <LazyComponent />
    </Suspense> */}
    <App />
  </>
)

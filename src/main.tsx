import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Home from './pages/Home'
import ErrorBoundary from './components/ErrorBoundary'

const Detail = lazy(() => import('./pages/Detail'))
const Admin = lazy(() => import('./admin/Admin'))

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper text-ink">
      <div className="flex flex-col items-center gap-3">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-sage border-t-transparent" />
        <span className="text-xs text-mute tracking-wider uppercase font-medium">Loading...</span>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects/:slug" element={<Detail table="projects" />} />
            <Route path="/blog/:slug" element={<Detail table="posts" />} />
            <Route path="/admin/*" element={<Admin />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)

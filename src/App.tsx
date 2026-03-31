import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AppShell from './components/layout/AppShell'
import IntakeForm from './pages/IntakeForm'
import FundingQuestions from './pages/FundingQuestions'
import ProfileReview from './pages/ProfileReview'
import LoanProductSelection from './pages/LoanProductSelection'
import DocumentCollection from './pages/DocumentCollection'
import DelegateUpload from './pages/DelegateUpload'

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<IntakeForm />} />
          <Route path="/funding-questions" element={<FundingQuestions />} />
          <Route path="/profile-review" element={<ProfileReview />} />
          <Route path="/loan-products" element={<LoanProductSelection />} />
          <Route path="/documents" element={<DocumentCollection />} />
        </Route>
        <Route path="/delegate/:sessionId" element={<DelegateUpload />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

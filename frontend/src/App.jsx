import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import LoginPage from './pages/LoginPage.jsx'
import InquiryListPage from './pages/InquiryListPage.jsx'
import NewInquiryPage from './pages/NewInquiryPage.jsx'
import InquiryDetailPage from './pages/InquiryDetailPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <InquiryListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inquiries/new"
            element={
              <ProtectedRoute>
                <NewInquiryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inquiries/:id"
            element={
              <ProtectedRoute>
                <InquiryDetailPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import PostList from './pages/PostList';
import PostCreate from './pages/PostCreate';
import PostEdit from './pages/PostEdit';
import PostView from './pages/PostView';
import TagManagement from './pages/TagManagement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <ErrorBoundary>
              <Login />
            </ErrorBoundary>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/posts" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/posts"
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <PostList />
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/posts/new"
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <PostCreate />
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/posts/:slug/edit"
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <PostEdit />
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/posts/:slug"
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <PostView />
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/tags"
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <TagManagement />
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

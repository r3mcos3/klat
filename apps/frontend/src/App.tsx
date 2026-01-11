import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { KanbanView } from './pages/KanbanView';
import { CardStackView } from './pages/CardStackView';
import { NoteEditView } from './pages/NoteEditView';
import { TagsView } from './pages/TagsView';
import LoginView from './pages/LoginView';
import { AuthProvider } from './components/Auth/AuthProvider';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { useThemeStore } from './store/themeStore';

function App() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<LoginView />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <KanbanView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cards"
            element={
              <ProtectedRoute>
                <CardStackView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/note/new"
            element={
              <ProtectedRoute>
                <NoteEditView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/note/:id"
            element={
              <ProtectedRoute>
                <NoteEditView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tags"
            element={
              <ProtectedRoute>
                <TagsView />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

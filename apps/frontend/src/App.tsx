import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { CardStackView } from './pages/CardStackView';
import { NoteEditView } from './pages/NoteEditView';
import { SearchView } from './pages/SearchView';
import { TagsView } from './pages/TagsView';
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
      <Routes>
        <Route path="/" element={<CardStackView />} />
        <Route path="/note/new" element={<NoteEditView />} />
        <Route path="/note/:id" element={<NoteEditView />} />
        <Route path="/search" element={<SearchView />} />
        <Route path="/tags" element={<TagsView />} />
      </Routes>
    </Router>
  );
}

export default App;

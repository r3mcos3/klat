import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CardStackView } from './pages/CardStackView';
import { DayView } from './pages/DayView';
import { NoteEditView } from './pages/NoteEditView';
import { SearchView } from './pages/SearchView';
import { TagsView } from './pages/TagsView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CardStackView />} />
        <Route path="/note/new" element={<NoteEditView />} />
        <Route path="/note/:id" element={<NoteEditView />} />
        <Route path="/day/:date" element={<DayView />} />
        <Route path="/search" element={<SearchView />} />
        <Route path="/tags" element={<TagsView />} />
      </Routes>
    </Router>
  );
}

export default App;

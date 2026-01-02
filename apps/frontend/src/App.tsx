import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CalendarView } from './pages/CalendarView';
import { DayView } from './pages/DayView';
import { SearchView } from './pages/SearchView';
import { TagsView } from './pages/TagsView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/calendar" replace />} />
        <Route path="/calendar" element={<CalendarView />} />
        <Route path="/day/:date" element={<DayView />} />
        <Route path="/search" element={<SearchView />} />
        <Route path="/tags" element={<TagsView />} />
      </Routes>
    </Router>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BrowsePage from './pages/BrowsePage';
import UploadPage from './pages/UploadPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<BrowsePage />} />
          <Route path="/upload" element={<UploadPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

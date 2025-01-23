import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BrowsePage from './components/BrowsePage';
import UploadPage from './components/UploadPage';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="min-h-screen pb-20">
        <Routes>
          <Route path="/" element={<BrowsePage />} />
          <Route path="/upload" element={<UploadPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Documents from './pages/Documents';
import Tests from './pages/Tests';
import GenerateTest from './pages/GenerateTest';
import TakeTest from './pages/TakeTest';
import Results from './pages/Results';
import Contact from './pages/Contact';
import Feedback from './pages/Feedback';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/documents/:documentId/generate-test" element={<GenerateTest />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/take-test/:testId" element={<TakeTest />} />
          <Route path="/results/:attemptId" element={<Results />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/feedback" element={<Feedback />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

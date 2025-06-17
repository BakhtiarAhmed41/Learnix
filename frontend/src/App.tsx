import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Documents from './pages/Documents';
import Tests from './pages/Tests';
import GenerateTest from './pages/GenerateTest';
import TakeTest from './pages/TakeTest';
import Results from './pages/Results';

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
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

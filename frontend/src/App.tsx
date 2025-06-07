import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DocumentUpload from './pages/DocumentUpload';
import TestGeneration from './pages/TestGeneration';
import TestTaking from './pages/TestTaking';
import TestResults from './pages/TestResults';
import PrivateRoute from './components/PrivateRoute';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="dashboard" element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                } />
                <Route path="upload" element={
                    <PrivateRoute>
                        <DocumentUpload />
                    </PrivateRoute>
                } />
                <Route path="generate-test/:documentId" element={
                    <PrivateRoute>
                        <TestGeneration />
                    </PrivateRoute>
                } />
                <Route path="test/:testId" element={
                    <PrivateRoute>
                        <TestTaking />
                    </PrivateRoute>
                } />
                <Route path="results/:testId" element={
                    <PrivateRoute>
                        <TestResults />
                    </PrivateRoute>
                } />
            </Route>
        </Routes>
    );
}

export default App; 
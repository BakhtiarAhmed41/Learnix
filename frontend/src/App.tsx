import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Documents from './pages/Documents';
import Tests from './pages/Tests';
import Login from './pages/Login';
import TestCORS from './pages/TestCORS';

// Create router with future flags
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'documents',
        element: <Documents />,
      },
      {
        path: 'tests',
        element: <Tests />,
      },
      {
        path: 'test-cors',
        element: <TestCORS />,
      },
    ],
  },
  {
    path: 'login',
    element: <Login />,
  },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
});

function App() {
  return <RouterProvider router={router} />;
}

export default App;

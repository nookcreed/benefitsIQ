import { createBrowserRouter, RouterProvider } from 'react-router';
import { Layout } from './components/Layout';
import { BenefitsPage } from './pages/BenefitsPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { ApplyHelpPage } from './pages/ApplyHelpPage';
import { DataSourcesPage } from './pages/DataSourcesPage';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <BenefitsPage /> },
      { path: '/how-it-works', element: <HowItWorksPage /> },
      { path: '/apply-help', element: <ApplyHelpPage /> },
      { path: '/data', element: <DataSourcesPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}

import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DishListPage from './pages/DishListPage';
import StoreListPage from './pages/StoreListPage';
import NewsListPage from './pages/NewsListPage';
import NewsDetailPage from './pages/NewsDetailPage';
import FranchisePage from './pages/FranchisePage';
import JobsPage from './pages/JobsPage';
import AboutIntroPage from './pages/AboutIntroPage';
import AboutHistoryPage from './pages/AboutHistoryPage';
import AboutStoryPage from './pages/AboutStoryPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products/dishes', element: <DishListPage /> },
      { path: 'products/stores', element: <StoreListPage /> },
      { path: 'news/corporate', element: <NewsListPage type="corporate" /> },
      { path: 'news/industry', element: <NewsListPage type="industry" /> },
      { path: 'news/:slug', element: <NewsDetailPage /> },
      { path: 'franchise/cooperation', element: <FranchisePage /> },
      { path: 'franchise/jobs', element: <JobsPage /> },
      { path: 'about/intro', element: <AboutIntroPage /> },
      { path: 'about/history', element: <AboutHistoryPage /> },
      { path: 'about/story', element: <AboutStoryPage /> },
      { path: 'about/contact', element: <ContactPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
    ],
  },
]);

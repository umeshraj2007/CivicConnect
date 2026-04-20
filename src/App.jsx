import { useState, Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import { CardSkeleton } from './components/Skeletons';

const Dashboard           = lazy(() => import('./pages/Dashboard'));
const ConstituencyExplorer = lazy(() => import('./pages/ConstituencyExplorer'));
const ConstituencyDetail   = lazy(() => import('./pages/ConstituencyDetail'));
const PartiesAlliances     = lazy(() => import('./pages/PartiesAlliances'));
const Manifesto            = lazy(() => import('./pages/Manifesto'));
const PoliticalParties     = lazy(() => import('./pages/PoliticalParties'));
const PoliticalLeaders     = lazy(() => import('./pages/PoliticalLeaders'));
const ChiefMinisters       = lazy(() => import('./pages/ChiefMinisters'));
const ElectionResults      = lazy(() => import('./pages/ElectionResults'));
const Candidates           = lazy(() => import('./pages/Candidates'));
const CandidateDetail      = lazy(() => import('./pages/CandidateDetail'));
const News                 = lazy(() => import('./pages/News'));


function PageLoader() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
      <p className="text-6xl font-display font-black dark:text-gray-800 text-gray-200 mb-4 transition-colors">404</p>
      <p className="dark:text-gray-400 text-gray-500 font-medium mb-2 transition-colors">Page not found</p>
      <a href="/" className="btn-primary mt-4 inline-block">Go to Dashboard</a>
    </div>
  );
}

export default function App() {
  // Enforce Dark Mode globally
  const darkMode = true;

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen dark:bg-gray-950 bg-gray-50 dark:text-gray-100 text-gray-900 transition-colors duration-300">
        <BrowserRouter>
          <Navbar darkMode={darkMode} />
          <main>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/"                   element={<Dashboard />} />
                <Route path="/constituencies"      element={<ConstituencyExplorer />} />
                <Route path="/constituency/:id"    element={<ConstituencyDetail />} />
                <Route path="/parties"             element={<PartiesAlliances />} />
                <Route path="/parties-details"     element={<PoliticalParties />} />
                <Route path="/leaders"             element={<PoliticalLeaders />} />
                <Route path="/chief-ministers"     element={<ChiefMinisters />} />
                <Route path="/election-results"    element={<ElectionResults darkMode={darkMode} />} />
                <Route path="/manifesto"           element={<Manifesto />} />
                <Route path="/candidates"          element={<Candidates />} />
                <Route path="/candidate/:id"       element={<CandidateDetail />} />
                <Route path="/news"                element={<News />} />
                <Route path="*"                   element={<NotFound />} />

              </Routes>
            </Suspense>
          </main>

          {/* Footer */}
          <footer className="border-t dark:border-gray-800 border-gray-200 mt-16 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-gray-600 text-xs">
                Tamil Nadu Election Intelligence Dashboard · 2026 Legislative Assembly
              </p>
              <p className="text-gray-700 text-xs">
                Data sourced from official constituency records
              </p>
            </div>
          </footer>
        </BrowserRouter>
      </div>
    </div>
  );
}

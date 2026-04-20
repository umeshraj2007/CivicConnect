import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, Map, Users, FileText, Moon, Sun, Menu, X, Landmark, History, Newspaper
} from 'lucide-react';


const NAV_ITEMS = [
  { to: '/',              label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/constituencies', label: 'Explorer',      icon: Map },
  { to: '/candidates',      label: 'Candidates',    icon: Users },
  { to: '/leaders',       label: 'Leaders',        icon: Users },
  { to: '/parties-details', label: 'Parties Detail', icon: FileText },
  { to: '/chief-ministers', label: 'CM History',   icon: Landmark },
  { to: '/election-results', label: 'Election Results', icon: History },
  { to: '/manifesto',     icon: FileText,          label: 'Manifesto' },
  { to: '/news',          icon: Newspaper,         label: 'News' },
];


export default function Navbar({ darkMode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[9999] w-full transition-colors duration-300 dark:bg-gray-950/90 bg-white/90 backdrop-blur-md border-b dark:border-gray-800 border-gray-200">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* logo restoration */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-lg shrink-0 bg-white p-1.5 border border-white/10 group-hover:scale-105 transition-transform">
              <img src="/logo.png" alt="CivicConnect Logo" className="w-full h-full object-contain" />
            </div>
            <div className="hidden sm:block">
              <p className="font-display font-black dark:text-white text-gray-900 text-[13px] leading-tight transition-colors uppercase tracking-widest">CivicConnect</p>
              <p className="text-brand-500 text-[10px] font-black leading-tight uppercase tracking-tighter opacity-80">TN Political Intelligence</p>
            </div>
          </Link>

          {/* Desktop nav - single line with tighter gaps */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-nowrap">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-tight whitespace-nowrap transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-600/10 text-brand-500 border border-brand-500/20'
                      : 'dark:text-gray-400 text-gray-500 hover:dark:text-white hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </NavLink>
            ))}
          </nav>



          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg dark:text-gray-400 text-gray-500 dark:hover:text-white hover:text-gray-900 dark:hover:bg-white/5 hover:bg-gray-100 transition-all border dark:border-gray-800 border-gray-200"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-3 space-y-1 animate-fade-in">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-brand-600/20 text-brand-500'
                      : 'dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 dark:hover:bg-white/5 hover:bg-gray-100'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}

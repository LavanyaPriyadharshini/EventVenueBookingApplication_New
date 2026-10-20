import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/venues', label: 'Venues' },
  { to: '/sections', label: 'Sections' },
   { to: '/rows', label: 'Rows' },
  { to: '/seats', label: 'Seats' },
];

export const Navbar = () => {

const{pathname}=useLocation();
const {logout}=useAuthContext();

  return (
    <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
  <div className="flex gap-4 overflow-x-auto">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`whitespace-nowrap text-sm font-medium ${
              pathname.startsWith(link.to) ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <button onClick={logout} className="text-sm font-medium text-gray-500 hover:text-gray-900">
      Log out
      </button>
   </nav>

  )

  //next see to the App.tsx even
  //next alter the protectedRoute.tsx to align with the navbar
}

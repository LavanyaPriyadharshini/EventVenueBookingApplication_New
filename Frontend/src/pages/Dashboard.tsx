import { Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

export const Dashboard = () => {
   const { user, isAuthLoading, logout } = useAuthContext();

    return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
      {isAuthLoading ? (
        <p className="text-sm text-gray-500">Loading your profile…</p>
      ) : (
        <>
          <h1 className="text-xl font-semibold text-gray-900">
            Welcome{user ? `, ${user.firstName}` : ''}!
          </h1>
          {user && (
            <p className="text-sm text-gray-500">
              Logged in as {user.email} ({user.role})
            </p>
          )}


          <Link
            to="/venues"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Manage Venues
          </Link>



          <button
            onClick={logout}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Log out
          </button>
        </>
      )}
    </div>
  );
  //next code is given in App.tsx
};

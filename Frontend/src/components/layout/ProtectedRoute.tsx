// import type { ReactNode } from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuthContext } from '../../context/AuthContext';


// export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
//   const { token } = useAuthContext();
//   if (!token) return <Navigate to="/login" replace />;
//   return <>{children}</>;
// };


import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { Navbar } from './Navbar';



export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { token } = useAuthContext();
  if (!token) return <Navigate to="/login" replace />;
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};
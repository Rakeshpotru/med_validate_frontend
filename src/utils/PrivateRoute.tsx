import type { JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { TOKEN } from '../constants/strings';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = !!localStorage.getItem(TOKEN);
  console.log(isAuthenticated, 'isAuthenticated')
  // return isAuthenticated ? children : <Navigate to="/login" replace />;
  return <Navigate to="/login" replace />;
};
export default PrivateRoute;

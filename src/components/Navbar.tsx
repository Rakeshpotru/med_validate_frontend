import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('TOKEN');
    localStorage.removeItem('temp_password_value')
    navigate('/login');
  };

  return (
    <nav>
      <Link to="/">Home</Link> |{' '}
      <button onClick={logout}>Logout</button>
    </nav>
  );
};

export default Navbar;

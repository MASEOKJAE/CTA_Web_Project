// useAuth.js
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../redux/actions/userActions';

const useAuth = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const login = (userData) => {
    dispatch(setUser(userData));
  };

  const logout = () => {
    dispatch(setUser(null));
  };

  return { user, login, logout };
};

export default useAuth;
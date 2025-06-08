import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import logo from '../assets/logo.png';
import ProfileImage from './ProfileImage';
import axios from 'axios';
import { postSliceActions } from '../store/post-slice';
import { FaRegCalendar } from 'react-icons/fa';
import { CiSearch} from 'react-icons/ci';


const Navbar = () => {
    const userId = useSelector(state => state?.user?.currentUser?.id);
    const token = useSelector(state => state?.user?.currentUser?.token);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [genreFilter, setGenreFilter] = useState('');
    const [showGenreFilter, setShowGenreFilter] = useState(false);   
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const genres = [
        'todo',
        'música',
        'teatro',
        'exposición',
        'gastronomía',
        'deporte',
        'desarrollo sostenible',
        'artes plásticas',
        'visitas',
        'bienestar',
        'cultura',
        'fiesta local',
    ];

    const getUser = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(response?.data);
        } catch (error) {
            console.error('Error al cargar usuario:', error.response?.data || error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
            getUser();
    }, [userId, token]);

    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [navigate, token]);

    useEffect(() => {
        if (token) {
            const timer = setTimeout(() => {
                navigate('/logout');
            }, 1000 * 60 * 60); 
            return () => clearTimeout(timer);
        }
    }, [navigate, token]);

   const applyFilters = async () => {
    try {
      setLoading(true);
      const isAllGenres = !genreFilter || genreFilter === 'todo';
      const url = isAllGenres
        ? `${import.meta.env.VITE_API_URL}/posts`
        : `${import.meta.env.VITE_API_URL}/posts/filter?genre=${encodeURIComponent(genreFilter)}`;

      console.log('Requête envoyée à:', url);

      const { data: posts } = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      console.log('Posts reçus:', posts);
      dispatch(postSliceActions.getPosts(posts));
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Erreur filtrage:', error.response?.data || error.message);
      alert(`Erreur: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setGenreFilter(e.target.value);
  };

  useEffect(() => {
    if (token && genreFilter) applyFilters();
  }, [genreFilter, token]);


    return (
    <nav className="navbar">
      <div className="container navbar__container">
        <div className="navbar__left">
          <div className="navbar__filter">
            <CiSearch
              className="navbar__filter-icon"
              onClick={() => setShowGenreFilter(!showGenreFilter)}
              title="Filtrar por género"
            />
            {showGenreFilter && (
              <select
                value={genreFilter}
                onChange={handleFilterChange}
                className="navbar__filter-select"
              >
                <option value="todo">Todos</option>
                {genres.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            )}
          </div>
        </div>
        <Link to="/" className="navbar__logo">
          <img src={logo} alt="Logo Pilas" />
        </Link>

        <div className="navbar__right">
          {userId && !isLoading && (
            <Link to={`/users/${userId}`} className="navbar__profile">
              <ProfileImage image={user?.profilePhoto} />
            </Link>
          )}
          {token ? (
            <Link to="/logout">Cerrar sesión</Link>
          ) : (
            <Link to="/login">Iniciar sesión</Link>
          )}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
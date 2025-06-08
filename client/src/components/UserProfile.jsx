import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { LuUpload } from 'react-icons/lu';
import { FaCheck } from 'react-icons/fa';
import { userActions } from '../store/user-slice';
import { uiSliceActions } from '../store/ui-slice';
import ProfileImage from './ProfileImage';

const UserProfile = () => {
  const token = useSelector(state => state?.user?.currentUser?.token);
  const loggedInUserId = useSelector(state => state?.user?.currentUser?.id);
  const currentUser = useSelector(state => state?.user?.currentUser);
  const [user, setUser] = useState(null);
  const [followsUser, setFollowsUser] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [avatarTouched, setAvatarTouched] = useState(false);
  const { id: userId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getUser = async () => {
    if (!userId || !token) return;
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = response?.data || {};
      setUser(userData);
      setFollowsUser(userData?.followers?.includes(loggedInUserId) || false);
      setAvatar(userData?.profilePhoto ? `${userData.profilePhoto}?t=${Date.now()}` : null);
    } catch (error) {
      console.error('Error al cargar usuario:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    getUser();
  }, [userId, token, loggedInUserId]);

  const changeAvatarHandler = async (e) => {
    e.preventDefault();
    if (!avatar || !avatarTouched) return;
    try {
      const postData = new FormData();
      postData.append('avatar', avatar);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/users/avatar`, postData, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      });
      const newProfilePhoto = response?.data?.profilePhoto || response?.data?.secure_url;
      if (newProfilePhoto) {
        const photoUrl = `${newProfilePhoto}?t=${Date.now()}`;
        dispatch(userActions.changeCurrentUser({ ...currentUser, profilePhoto: photoUrl }));
        setUser(prev => ({ ...prev, profilePhoto: photoUrl }));
        setAvatar(photoUrl);
        setAvatarTouched(false);
        navigate(0)
      }
    } catch (error) {
      console.error('Error al cambiar avatar:', error.response?.data || error.message);
    }
  };

  const openEditProfileModal = () => {
    dispatch(uiSliceActions.openEditProfileModal());
  };

  const followUnfollowUser = async () => {
    if (!userId || !token || !loggedInUserId) return;
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/${userId}/follow-unfollow`,
        {},
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const updatedUser = response?.data?.user || response?.data;
      setUser(updatedUser);
      const isNowFollowing = updatedUser?.followers?.includes(loggedInUserId) || false;
      setFollowsUser(isNowFollowing);

      let updatedFollowing = [...(currentUser.following || [])];
      if (isNowFollowing && !updatedFollowing.includes(userId)) {
        updatedFollowing.push(userId);
      } else if (!isNowFollowing && updatedFollowing.includes(userId)) {
        updatedFollowing = updatedFollowing.filter(id => id !== userId);
      }
      dispatch(userActions.changeCurrentUser({ ...currentUser, following: updatedFollowing }));

      if (userId === loggedInUserId) {
        setUser(prev => ({ ...prev, following: updatedFollowing }));
      }
    } catch (error) {
      console.error('Error al seguir/dejar de seguir:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
 
      setFollowsUser(prev => !prev);
    }
  };


  if (!user) {
    return <div className="center">Cargando...</div>;
  }

  return (
    <section className="profile">
      <div className="profile__container">
        {user?._id === loggedInUserId ? (
          <form className='profile__image' onSubmit={changeAvatarHandler} encType='multipart/form-data'>
            <ProfileImage image={avatar} />
            {!avatarTouched ? (
              <label htmlFor="avatar" className='profile__image-edit'>
                <span>
                  <LuUpload />
                </span>
              </label>
            ) : (
              <button type='submit' className='profile__image-btn'><FaCheck /></button>
            )}
            <input
              type="file"
              name='avatar'
              id='avatar'
              onChange={e => { setAvatar(e.target.files[0]); setAvatarTouched(true); }}
              accept='image/png, image/jpeg'
            />
          </form>
        ) : (
          <div className='profile__image'>
            <ProfileImage image={avatar} />
          </div>
        )}
        <h4>{user?.fullName || 'Usuario'}</h4>
        <ul className="profile__follows">
          <li>
            <h4>{user?.following?.length || 0}</h4>
            <small>Siguiendo</small>
          </li>
          <li>
            <h4>{user?.followers?.length || 0}</h4>
            <small>Seguidores</small>
          </li>
          <li>
            <h4>0</h4>
            <small>Likes</small>
          </li>
        </ul>
        <div className="profile__actions-wrapper">
          {user?._id === loggedInUserId ? (
            <button className='btn' onClick={openEditProfileModal}>Editar perfil</button>
          ) : (
            <button onClick={followUnfollowUser} className='btn dark'>
              {followsUser ? 'Dejar de seguir' : 'Seguir'}
            </button>
          )}
          {user?._id !== loggedInUserId && (
            <Link to={`/messages/${user?._id}`} className='btn default'>Mensajes</Link>
          )}
        </div>
        <article className='profile__bio'>
          <p>{user?.bio || 'Sin biografía.'}</p>
        </article>
      </div>
    </section>
  );
};

export default UserProfile;
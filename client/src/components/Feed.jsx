import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate, useLocation } from 'react-router-dom';
import ProfileImage from './ProfileImage';
import TimeAgo from 'react-timeago';
import axios from 'axios';
import { FaRegCommentDots } from 'react-icons/fa';
import LikeDislikePost from './LikeDislikePost';
import TrimText from '../helpers/TrimText';
import BookmarksPost from './BookmarksPost';
import { uiSliceActions } from '../store/ui-slice';
import { HiDotsHorizontal } from 'react-icons/hi';
import { postSliceActions } from '../store/post-slice';

const Feed = ({ post, onDeletePost }) => {
  const [creator, setCreator] = useState({});
  const token = useSelector(state => state?.user?.currentUser?.token);
  const userId = useSelector(state => state?.user?.currentUser?.id);
  const [showFeedHeaderMenu, setShowFeedHeaderMenu] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();

  const getPostCreator = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${post?.creator}`, {
        withCredentials: true, 
        headers: { Authorization: `Bearer ${token}` }
      });
      setCreator(response?.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getPostCreator();
  }, [creator]);

  const closeFeedHeaderMenu = () => {
    setShowFeedHeaderMenu(false);
  };

  const showEditPostModal = () => {
    dispatch(uiSliceActions.openEditPostModal(post?._id));
    closeFeedHeaderMenu();
    Navigate(0)
  };

  const deletePost = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/posts/${post._id}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      });
      dispatch(postSliceActions.deletePost(post._id));
      onDeletePost()
      closeFeedHeaderMenu();
    } catch (error) {
      console.error('Erreur lors de la suppression du post :', error.response?.data || error.message);
    }
  };

  return (
    <article className='feed'>
      <header className="feed__header">
        <Link to={`/users/${post?.creator}`} className='feed__header-profile'>
          <ProfileImage image={creator?.profilePhoto} />
          <div className="feed__header-details">
            <h4>{creator?.fullName}</h4>
            <small>
              {post?.createdAt ? <TimeAgo date={post.createdAt} /> : ''}
            </small>
          </div>
        </Link>
        {userId == post?.creator && location.pathname.includes("users") && (
          <button onClick={() => setShowFeedHeaderMenu(!showFeedHeaderMenu)}>
            <HiDotsHorizontal />
          </button>
        )}
        {showFeedHeaderMenu && userId == post?.creator && location.pathname.includes("users") && (
          <menu className='feed__header-menu'>
            <button onClick={showEditPostModal}>Cambiar</button>
            <button onClick={deletePost}>Borrar</button>
          </menu>
        )}
      </header>
      <Link to={`/posts/${post?._id}`} className='feed__body'>
        <p><TrimText item={post?.body} maxLength={100} /></p>
        <div className="feed__images">
          <img src={post?.image} alt="" />
        </div>
      </Link>
      <div className="feed__details">
        <p>Lugar: {post?.location?.name}</p>
        <p>Fecha: {new Date(post?.date).toLocaleDateString('es-ES', { day: 'numeric',  month: 'long', year: 'numeric'})}</p>
      </div>
      <footer className="feed__footer">
        <div>
          <LikeDislikePost post={post} />
          <button className="feed__footer-comments">
            <Link to={`/posts/${post?._id}`}><FaRegCommentDots /></Link>
            <small>{post?.comments?.length}</small>
          </button>
        </div>
        <BookmarksPost post={post} />
      </footer>
    </article>
  );
};

export default Feed;
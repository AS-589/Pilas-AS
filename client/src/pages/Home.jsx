import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CreatePost from '../components/CreatePost';
import axios from 'axios';
import Posts from '../components/Feeds';
import { postSliceActions } from '../store/post-slice';

const Home = () => {
  const posts = useSelector(state => state.posts.posts);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const token = useSelector(state => state?.user?.currentUser?.token);
  const dispatch = useDispatch();

  const createPost = async (data) => {
    setError('');
    try {
      const { data: newPost } = await axios.post(`${import.meta.env.VITE_API_URL}/posts`, data, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch(postSliceActions.createPost(newPost));
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur lors de la création du post');
    }
  };

  const getPosts = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/posts`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Posts initiaux chargés:', data);
      dispatch(postSliceActions.getPosts(data));
    } catch (err) {
      console.error('Erreur chargement posts:', err.response?.data || err.message);
      setError('Erreur lors du chargement des posts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token && !posts.length) getPosts();
  }, [token, posts.length]);

  return (
    <section className="mainArea">
      <CreatePost onCreatePost={createPost} error={error} />
      {posts.length > 0 ? (
        <Posts posts={posts} />
      ) : (
        <p className="center">Ningun evento registrado</p>
      )}
    </section>
  );
};

export default Home;

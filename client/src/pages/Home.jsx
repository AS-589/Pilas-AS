import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CreatePost from '../components/CreatePost';
import axios from 'axios';
import Feeds from '../components/Feeds';
import Feed from '../components/Feed';
import Posts from '../components/Feeds';
import { postSliceActions } from '../store/post-slice';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const token = useSelector(state => state?.user?.currentUser?.token);
  const dispatch = useDispatch();

  const createPost = async (data) => {
    setError('');
    try {
    const { data: newPost } = await axios.post(`${import.meta.env.VITE_API_URL}/posts`, data, {
        withCredentials: true, 
        headers: {Authorization: `Bearer ${token}`}})
      
      setPosts([newPost, ...posts])
      dispatch(postSliceActions.createPost(newPost));
    } catch (err) {
     setError(err?.response?.data?.message)
    }
  };

  const getPosts = async (data) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/posts`, {
        withCredentials: true, 
        headers: {Authorization: `Bearer ${token}`}})
      setPosts(response?.data);
      dispatch(postSliceActions.getPosts(data));
      isLoading(false)
    } catch (err) {
      console.log(err)
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getPosts()
  }, [setPosts])

  return (
    <section className="mainArea">
      <CreatePost onCreatePost={createPost} error={error}/>Add commentMore actions
      {posts.length > 0 ? (
        <Posts posts={posts} />
      ) : ( 
        posts.map(post => <Feed key={post.id} post={post} onSetPosts={setPosts}/>)
      )}
      //<Feeds posts={posts} onSetPosts={setPosts}/>
    </section>
  );
};

export default Home;
import { createSlice } from '@reduxjs/toolkit'; 

const postSlice = createSlice({ 
    name: 'posts', 
    initialState: { posts: [], }, 
    reducers: { 
        getPosts: (state, action) => { 
            state.posts = action.payload; }, 
        createPost: (state, action) => { 
            state.posts.unshift(action.payload); }, 
        updatePost: (state, action) => { 
            const index = state.posts.findIndex(post => post._id == action.payload._id); 
            if (index != -1) { 
                state.posts[index] = action.payload; } 
            }, 
        deletePost: (state, action) => { 
            state.posts = state.posts.filter(post => post._id != action.payload); 
        }, }, }); 
        
export const postSliceActions = postSlice.actions; 

export default postSlice;
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uiSliceActions } from '../store/ui-slice';

const EditPostModal = ({ onUpdatePost }) => {
    const editPostId = useSelector(state => state?.ui?.editPostId);
    const token = useSelector(state => state?.user?.currentUser?.token);
    const [body, setBody] = useState("");
    const [genre, setGenre] = useState("");
    const [locationName, setLocationName] = useState("");
    const [date, setDate] = useState("");
    const dispatch = useDispatch();

    const genres = [
        "música",
        "teatro",
        "exposición",
        "gastronomía",
        "deporte",
        "desarrollo sostenible",
        "artes plásticas",
        "visitas",
        "bienestar",
        "cultura",
        "fiesta local"
    ];

    const getPost = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/posts/${editPostId}`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${token}` }
            });
            const post = response?.data;
            setBody(post.body);
            setGenre(post.genre);
            setLocationName(post.location.name);
            setDate(new Date(post.date).toISOString().split('T')[0]);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getPost();
    }, []);

    const updatePost = async (e) => {
  e.preventDefault();
  if (!body || !genre || !locationName || !date) {
    alert("Por favor, completa todos los campos obligatorios.");
    return;
  }
  
  const postData = new FormData();
  postData.set("body", body);
  postData.set("genre", genre);
  postData.set("locationName", locationName);
  postData.set("date", date);

  onUpdatePost(postData, editPostId);
  dispatch(uiSliceActions?.closeEditPostModal());
};

    const closeEditPostModal = (e) => {
        if (e.target.classList.contains('editPost')) {
            dispatch(uiSliceActions.closeEditPostModal());
        }
    };

    return (
        <div className="editPost" onClick={closeEditPostModal}>
            <div className="editPost__container">
                <form onSubmit={updatePost}>
                    <label>
                        <textarea
                         className='editPost__button'
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder='Comparte tu evento...'
                            autoFocus
                            required
                        />
                    </label>
                    <label>
                        <select  className='editPost__button' value={genre} onChange={(e) => setGenre(e.target.value)} required>
                            <option value="">Selecciona un género</option>
                            {genres.map((g) => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        <input
                         className='editPost__button'
                            type="text"
                            value={locationName}
                            onChange={(e) => setLocationName(e.target.value)}
                            placeholder='Nombre del lugar'
                            required
                        />
                    </label>
                    <label>
                        <input
                         className='editPost__button'
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </label>
                    <button type="submit" className="btn primary">Registrar cambios</button>
                </form>
            </div>
        </div>
    );
};

export default EditPostModal;
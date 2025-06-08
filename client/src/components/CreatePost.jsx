import React, { useState } from 'react';
import ProfileImage from './ProfileImage';
import { useSelector } from 'react-redux';
import { SlPicture } from 'react-icons/sl';



const CreatePost = ({ onCreatePost, error }) => {
    const [body, setBody] = useState("");
    const [image, setImage] = useState("");
    const profilePhoto = useSelector(state => state?.user?.currentUser?.profilePhoto);
    const [genre, setGenre] = useState("");
    const [locationName, setLocationName] = useState("");
    const [date, setDate] = useState("");

  

    const genres = [
        "musica",
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

    const createPost = (e) => {
        e.preventDefault();
        const postData = new FormData();
        postData.set('body', body);
        postData.set('image', image);
        postData.set('genre', genre);
        postData.set('locationName', locationName);
        postData.set('date', date);
        onCreatePost(postData);
        setBody("");
        setImage("");
        setGenre("");
        setLocationName("");
        setDate("");
             
    };


    return (
        <form className="createPost" encType='multipart/form-data' onSubmit={createPost}>
            {error && <p className='createPost__error-message'>{error}</p>}
            <div className="createPost__top">
                <ProfileImage image={profilePhoto} />
                <textarea value={body} onChange={e => setBody(e.target.value)} placeholder='¡ Comparte tu evento !' required />
            </div>
            <div className="createPost__bottom">
                <div className="createPost__fields">
                    <label>
                        <select className='createPost__fields-options' value={genre} onChange={(e) => setGenre(e.target.value)} required>
                            <option className='createPost__fields-options'>tipo de evento</option>
                            {genres.map((g) => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        <input
                        className='createPost__fields-options'
                            type="text"
                            value={locationName}
                            onChange={(e) => setLocationName(e.target.value)}
                            placeholder='Nombre del lugar'
                            required
                        />
                    </label>
                    <label>
                        <input
                        className='createPost__fields-options'
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </label>
                </div>
                <div className="createPost__actions">
                    <label htmlFor="image"><SlPicture /></label>
                    <input type="file" id='image' onChange={e => setImage(e.target.files[0])} required/>
                    <button type='submit'>Publicar evento</button>
                </div>
            </div>
        </form>
    );
};

export default CreatePost;
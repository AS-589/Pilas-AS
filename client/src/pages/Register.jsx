import axios from 'axios'
import React, { useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'


const Register = () => {
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();


  const changeInputHandler = (e) => {
    setUserData(prevState => ({
      ...prevState, 
      [e.target.name]: e.target.value 
    }));
  };

  const registerUser = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/users/register`, userData);
        if(response.statusText == 'OK') {
          navigate('/login');
        }
    } catch (err) {
        setError(err.response?.data?.message)
    }
  }

  return (
    <section className="register">
      <div className="container register__container">
        <h2>Regístrate</h2>
        <form onSubmit={registerUser}>
          {error && <p className="form__error-message">{error}</p>}
          <input type="text" name='fullName' placeholder='Nombre completo' onChange={changeInputHandler} autoFocus />
          <input type="text" name='email' placeholder='Correo electrónico' onChange={changeInputHandler} />
          <div className="password__controller">
            <input type={showPassword? "text" : "password"} name='password' placeholder='Contraseña' onChange={changeInputHandler} />
            <span onClick={() => setShowPassword(!showPassword)}>{showPassword? <FaEyeSlash /> : <FaEye />}</span>
          </div>
          <div className="password__controller">
            <input type={showPassword? "text" : "password"} name='confirmPassword' placeholder='Confirma tu contraseña' onChange={changeInputHandler} />
            <span onClick={() => setShowPassword(!showPassword)}>{showPassword? <FaEyeSlash /> : <FaEye />}</span>
          </div>
          <p>Tienes una cuenta? <Link to="/login">Iniciar sesión</Link></p>
          <button type="submit" className="btn">Regístrate</button>
        </form>

      </div>
    </section>
  )
}

export default Register

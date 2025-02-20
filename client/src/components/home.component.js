import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setIsAuthenticated, setUserInfo } from "../redux/authSlice";
import '../css/home.css';

export default function Home(props) {
    const [loggedIn, setLoggedIn] = useState(false);
    const [playlistUrl, setPlaylistUrl] = useState();

    //For google log in
    const { isAuthenticated } = useSelector(state => state.auth);

    const dispatch = useDispatch();
    const navigate = useNavigate();
   

    const handleAuth = async () => {
        await fetch('/auth/user').then(resp => { dispatch(setIsAuthenticated(resp.ok)); })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate('/playlist', { state: {playlist: playlistUrl} })
    }

    const handleChannelButton = async () => {
        navigate('/channelPlaylists', { state: {playlist: playlistUrl} });
    }

    const handleLoginButton = async () => {
        let timer = null;
        const newWindow = window.open("http://localhost:5000/auth/google", "_blank",
            "width=500,height=600");

            if (newWindow) {
                timer = setInterval(() => {
                  if (newWindow.closed) {
                    handleAuth()
                    if (timer) clearInterval(timer);
                  }
                }, 500);
            }
    }


    const handleSignup = () => {
        navigate('/signup');
    }

    const handleLogin = () => {
        navigate('/login');
    }

    useEffect(() => {
        fetch('/user/profile').then(resp => {
            if (resp.ok) {
                setLoggedIn(true);
            }
        });

        handleAuth();
    }, []);

    return (
        <div className="container">
            <h1>Enter a playlist!</h1>
            <form onSubmit={handleSubmit} id="urlForm">
                <label>Enter playlist: </label>
                <input 
                    type="text"
                    required
                    onChange={(e) => setPlaylistUrl(e.target.value)}
                />
            </form>
            <div>
                {loggedIn ? <p>User is Logged in</p> : <div> <button onClick={handleLogin}>LOG IN</button> 
                    <button onClick={handleSignup}>SIGN UP</button> </div>}
            </div>
            {!isAuthenticated ? <button onClick={handleLoginButton}>Login with Google</button> : 
                <button onClick={handleChannelButton}>View channel playlists</button>}
        </div>
    )
}

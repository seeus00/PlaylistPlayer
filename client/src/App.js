import logo from './logo.svg';
import './css/App.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { useRef } from "react";

import {
    BrowserRouter,
    Routes,
    Route,
    Link
} from "react-router-dom";

import Home from "../src/components/home.component";
import Playlist from './components/playlist.component';
import LoginSuccess from './google_auth/LoginSuccess'
import ChannelPlaylists from './components/channelPlaylists.component';

import 'bootstrap/dist/css/bootstrap.css';

import MusicPlayer from './components/musicPlayer.component';
import Login from './components/login.component';
import Signup from './components/signup.component';



export default function App() {
    const controller = useRef(new AbortController());

    return (
        <div>
            <MusicPlayer controllerRef={controller}/>
            <BrowserRouter>
                <Routes>
                    <Route exact path="/home" element={<Home/>} />
                    <Route exact path="/" element={<Home/>} />
                    <Route exact path="/playlist" element={<Playlist controllerRef={controller}/>} />
                    <Route exact path="/channelPlaylists" element={<ChannelPlaylists/>} />
                    <Route exact path="/login/success" element={<LoginSuccess/>} />

                    <Route exact path="/login" element={<Login/>}/>
                    <Route exact path="/signup" element={<Signup/>}/>
                </Routes>
            </BrowserRouter>
          
        </div>
    )
}


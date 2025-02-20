import React, {useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import '../css/playlist.css';
import 'bootstrap/dist/css/bootstrap.css';
import { Row, Col } from 'react-bootstrap'; 
import { setCurrAudioSrc, setCurrAudioTime, setCurrAudioDuration, setCurrVolumeLevel, 
    setCurrVideo, setCurrVideoId } from '../redux/audioSlice'


export default function MusicPlayer({controllerRef}) {
    const [isFetching, setIsFetching] = useState(false);
    const audioRef = useRef(new Audio());
    const dispatch = useDispatch();

    const { currAudioSrc, currVolumeLevel, currAudioTime, currVideoId, currVideo, currAudioDuration,
            videos, currPlaylistIndex } = useSelector((state) => state.audio);

    const convertTime = (time) => {
        if (isNaN(time)) return "00:00:00";

        var sec_num = parseInt(time, 10); // don't forget the second param
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);
    
        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        return hours + ':' + minutes + ':' + seconds;
    }

    useEffect(() => {
        if (currVideo === null || currVideo === undefined) return;

        audioRef.current.volume = currVolumeLevel;
        audioRef.current.preload = "all";

        audioRef.current.addEventListener('timeupdate', updateProgress);
        audioRef.current.src = currAudioSrc;
        audioRef.current.play().catch(e => {});
    }, [currAudioSrc]);


    const checkVideoFetch = () => {
        if (isFetching) {
            setIsFetching(false);
            controllerRef.current.abort();
            controllerRef.current = new AbortController();
        }
    }

    useEffect(() => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;

        const fetchVideo = async () => {
            checkVideoFetch();

            const { signal } = controllerRef.current;
            setIsFetching(true);
            await fetch("/video?id=" + currVideo.id, { signal })
                .then(resp => {
                    setIsFetching(false);
                    if (!resp.ok) {
                        throw new Error("ERROR, " + resp.status);
                    }

                    return resp;
                })
                .then(resp => resp.json())
                .then(data => {
                    dispatch(setCurrVideoId(currVideo.id));
                    dispatch(setCurrAudioSrc(data.url));


                })
                .catch(err => {
                    setIsFetching(false);
                })
        }

        if (currVideo) {
            fetchVideo();
        }
    }, [currVideo]);


    const handlePlay = () => {
        if (currVideo === null || currVideo === undefined) return;

        if (audioRef.current.paused) {
            audioRef.current.play();
            document.getElementById("playButton").innerHTML = "⏸️";
        }else {
            audioRef.current.pause();
            document.getElementById("playButton").innerHTML = "▶️";
        }
    }

    const playNextOrPrevSong = (increment) => {
        const currSongInd = videos.findIndex((video) => video.id === currVideo.id);
        if (currSongInd === -1) return;

        const nextPrevInd = currSongInd + increment;
        if (nextPrevInd >= 0 && nextPrevInd < videos.length && nextPrevInd !== currSongInd) {
            controllerRef.current.abort();
            controllerRef.current = new AbortController();

            dispatch(setCurrVideo(videos[nextPrevInd]));
            audioRef.current.pause();
        }
    }

    useEffect(() => {
        if (parseInt(audioRef.current.currentTime) >= parseInt(audioRef.current.duration)) {
            playNextOrPrevSong(1);
        }
    }, [currAudioTime]);

    const updateProgress = () => {
        const container = document.getElementById("elapsed-container");
        const elapsed = document.getElementById("elapsed");

        if (container === null || elapsed === null) return;
        
        dispatch(setCurrAudioTime(audioRef.current.currentTime));
        dispatch(setCurrAudioDuration(audioRef.current.duration));

        var rect = container.getBoundingClientRect();
        var percentage = audioRef.current.currentTime / audioRef.current.duration;
        elapsed.style.width = (percentage * rect.width) + "px";
    }

    const handleProgressClick = (e) => {
        if (currVideo === null || currVideo === undefined) return;

        const container = document.getElementById("elapsed-container");
        const rect = container.getBoundingClientRect();
        const elapsed = document.getElementById("elapsed");

        var x = e.clientX - rect.left; //x position within the element.

        const percentage = x / rect.width;
        const newTime = audioRef.current.duration * percentage;


        audioRef.current.currentTime = newTime;
        dispatch(setCurrAudioTime(newTime));

        elapsed.style.width = (percentage * rect.width) + "px";
    }

    const handleVolumeSlider = () => {
        const slider = document.getElementById("volumeSlider");
        if (slider === undefined) return;

        audioRef.current.volume = slider.value / 100.0;

        dispatch(setCurrVolumeLevel(audioRef.current.volume));
    }

    return (
        <div>
            <Row id="utilityControl">
                <Col>
                    <button type="button" id="prevTrackButton" onClick={ () => playNextOrPrevSong(-1) }>⏮️</button>
                    <button type="button" id="playButton" onClick={ () => handlePlay() }>{(audioRef.current.paused) ? "▶️" : "⏸️"}</button>
                    <button type="button" id="nextTrackButton" onClick={ () => playNextOrPrevSong(1) }>⏭️</button>
                </Col>
                
                <Col>
                    <p >{convertTime(currAudioTime)}</p>
                </Col>

                <Col xs={4}>
                    <div id="elapsed-container" onClick={handleProgressClick}>
                        <div id="elapsed"></div>
                    </div>
                </Col>

                <Col>
                    <p>{convertTime(currAudioDuration)}</p>
                </Col>
                
                <Col>
                    <div className="volumeContainer">
                        <input type="range" min="0" max="100" defaultValue={currVolumeLevel * 100}
                            onChange={handleVolumeSlider} 
                            id="volumeSlider"/>
                    </div>
                </Col>

                <Row>
                    <Col>
                        <p id="currVideoTitle">{currVideo !== null && currVideo.title !== undefined ? currVideo.title : ""}</p>
                    </Col>
                    <Col>
                        
                    </Col>
                </Row>
            </Row>
        </div>
    )
}
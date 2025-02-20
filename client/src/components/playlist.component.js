import React, {useEffect, useState } from "react";
import {useLocation} from 'react-router-dom';
import '../css/playlist.css';
import 'bootstrap/dist/css/bootstrap.css';
import {Container, Row, Col} from 'react-bootstrap'; 
import { useSelector, useDispatch } from 'react-redux';
import { setVideos, setCurrVideo } from '../redux/audioSlice'

export default function Playlist({controllerRef}) {
    const [inNextPlaylist, setInNextPlaylist] = useState(false);
    const [currPlaylistUrl, setCurrPlaylistUrl] = useState();
    const [currVideos, setCurrVideos] = useState([]);


    const dispatch = useDispatch();
    const { currVideo, videos } = useSelector((state) => state.audio);

    const [nextPageToken, setNextPageToken] = useState()
    const [error, setError] = useState({})
    const location = useLocation();

    useEffect(() => {    
        const playlistUrl = location.state.playlist;
        setCurrPlaylistUrl(playlistUrl);
    }, []);

    const fetchVideos = async (tokenParam) => {
        if (currPlaylistUrl === undefined) return;

        const url = new URL(currPlaylistUrl);
        const playlistId = url.searchParams.get("list");

        await fetch(`/playlist?id=${playlistId}${tokenParam}`)
            .then(resp => {
                if (!resp.ok) {
                    throw new Error({msg: "PLAYLIST ERROR"});
                }

                return resp
            })
            .then(resp => resp.json())
            .then(data => {
                if (!tokenParam) {
                    setInNextPlaylist(false);
                    setCurrVideos(data.videos);
                }else if (!data.videos.every(video => videos.includes(video))) {
                    setCurrVideos(currVideos.concat(data.videos));
                }

                setNextPageToken(data.nextPageToken);

                //When changing playlists, scroll all the way to the top
                window.scrollTo(0, 0);
            }
            )
            .catch(err => {
                setError(err)
            })
    };

    // Reset videos on playlist url change
    useEffect(() => {
        setNextPageToken(undefined);
        fetchVideos("")
    }, [currPlaylistUrl])


    // Update new videos changed
    useEffect(() => {
        if (inNextPlaylist) {
            dispatch(setVideos(currVideos));
        }
    }, [currVideos]);

    const handleVideoClick = (video) => {
        setInNextPlaylist(true);

        // Cancel the current video fetch if user goes to another video
        controllerRef.current.abort();
        controllerRef.current = new AbortController();
        
        dispatch(setVideos(currVideos));
        dispatch(setCurrVideo(video));
    }

    const formatVideos = () => {
        if (currVideos.length == 0) return (<img src="/assets/progress.gif" alt="No videos"></img>)

        return currVideos.map((video, ind) => 
            <div key={video.id}>
                <Row className="videoEntry" id={currVideo !== undefined && currVideo !== null && currVideo.id === video.id ? 
                "currPlayingVideo" : ""} onClick={() => handleVideoClick(video)}>
                    <Col md={1} className="align-middle">
                        <p className="entryNumber">{ind + 1}.</p>
                    </Col>
                    <Col md={4}>
                        <img className="thumbnailImg" src={currVideos[currVideos.indexOf(video)].thumbnails.default.url} loading="lazy"></img>
                    </Col>
                    <Col>
                        <div className="videoInPlaylist"><p> {video.title}</p></div>
                    </Col>
                </Row>
            </div>
        )
    }

    const loadMore = () => {
        fetchVideos(`&pageToken=${nextPageToken}`);
    }

    return (
        (<Container id="mainContainer" fluid={true}>
            <Row id="content">
                <Col id="videosContainer">
                    <div>
                        {formatVideos()}  
                    </div>
                </Col>
                
            </Row>
            <Row>
                {nextPageToken === undefined ? "" : <Col><button id="nextButton" onClick={() => loadMore()}>Load More</button></Col>}
            </Row>
        </Container>)
    )
}
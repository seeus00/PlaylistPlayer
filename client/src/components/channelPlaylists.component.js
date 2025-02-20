import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import '../css/playlist.css';
import 'bootstrap/dist/css/bootstrap.css';
import {Container, Row, Col} from 'react-bootstrap'; 

export default function ChannelPlaylists(props) {
    const [channelPlaylists, setChannelPlaylists] = useState([]);
    const [currPage, setCurrPage] = useState(0)
    const [nextPageToken, setNextPageToken] = useState()

    let navigate = useNavigate()

    const retrievePlaylist = async () => {
        const resp = await fetch('/getChannelId');
        const data = await resp.json();

        await fetch(`/getPlaylistsFromChannel?id=${data.id}&`)
            .then(resp => resp.json())
            .then(data => {
                setChannelPlaylists(data.playlists);
                setNextPageToken(data.nextPageToken);
            });
    }

    useEffect(() => {
        retrievePlaylist();
    }, []);

    const handlePlaylistClick = (playlist) => {
        const playlistUrl = `https://www.youtube.com/playlist?list=${playlist.playlistId}`;
        navigate('/playlist', { state: { playlist: playlistUrl } })
    }

    const formatPlaylists = () => {
        if (channelPlaylists.length == 0) return (<img src="/assets/progress.gif" alt="No playlists"></img>)
    
        return channelPlaylists.slice(currPage * 50, (currPage + 1) * 50).map(playlist => 
            <div key={playlist.playlistId}>
                <Row className="videoEntry" onClick={() => handlePlaylistClick(playlist)}>
                    <Col>
                        <img src={channelPlaylists[channelPlaylists.indexOf(playlist)].thumbnails.default.url}></img>
                    </Col>
                    <Col>
                        <div className="videoInPlaylist"><p> {playlist.title}</p></div>
                    </Col>
                </Row>
            </div>
        )
    }

    return (
        <Container id="mainContainer" fluid={true}>
            <Row id="content">
                <Col id="videosContainer">
                    {formatPlaylists()}
                </Col>
            </Row>
            <Row>
                {currPage == 0 ? "" : <Col><button onClick={() => setCurrPage(currPage - 1)}>Prev</button></Col>}
                {(currPage + 1) * 50 >= channelPlaylists.length && nextPageToken === undefined ? "" : <Col><button id="nextButton" onClick={() => setCurrPage(currPage + 1)}>Next</button></Col>}
            </Row>
        </Container>
    )
}
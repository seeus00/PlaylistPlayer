require('dotenv').config({ path: `../tokens.env` })

const express = require('express')
const session = require('express-session')
const axios = require('axios');
const passport = require('passport');
const bodyParser = require('body-parser');
const ytdl = require("@distube/ytdl-core");
const cors = require('cors')
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");
const jwt = require('jsonwebtoken');
const refresh = require('passport-oauth2-refresh');

mongoose.connect("mongodb://127.0.0.1:27017/passport-jwt", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('connecting to database successful'))
.catch(err => console.error('could not connect to mongo DB', err));;

mongoose.connection.on('error', error => console.log(error) );
mongoose.Promise = global.Promise;

require('./util/auth');

const routes = require('./routes/routes');
const secureRoute = require('./routes/secureRoute');

const app = express();
const port = 5000;

app.use(session({ 
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(cors({ origin: "http://localhost:3000", credentials: true }));

app.use(cookieParser());

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', routes);
app.use('/user', passport.authenticate('jwt', { session: false }), secureRoute);


const checkIfAccessTokenIsExpired = (req, res, next) => {
    jwt.verify(req.cookies.access_token, process.env.SECRET, (err, decodedAccessToken) => {
        if (err) {
          if (req.cookies.refresh_token === undefined) {
            next();
            return;
          }
          jwt.verify(req.cookies.refresh_token, process.env.SECRET, (err, decodedRefreshToken) => {
              refresh.requestNewAccessToken('google', decodedRefreshToken.refreshToken, (err, newAccessToken, newRefreshToken) => {
                  console.log("NEW ACCESS TOKEN " + newAccessToken);

                  const accessToken = jwt.sign({ accessToken: newAccessToken }, process.env.SECRET, { expiresIn: '15m' });
                  res.clearCookie('access_token'); //delete previous cookie
                  res.cookie('access_token', accessToken, { sameSite: 'strict', secure: true }); 
                  
                  const refreshToken = jwt.sign({ refreshToken: newRefreshToken }, process.env.SECRET);
                  res.clearCookie('refresh_token'); //delete previous cookie
                  res.cookie('refresh_token', refreshToken, { sameSite: 'strict', secure: true }); 

                  res.locals.accessToken = newAccessToken;    
                  next();
              });
          })
        }else {
          jwt.verify(req.cookies.access_token, process.env.SECRET, (err, decodedAccessToken) => {
              res.locals.accessToken = decodedAccessToken.accessToken;
              next();  
          });
        }
    });

}

const isLoggedIn = (req, res, next) => {
    req.cookies.access_token && req.cookies.refresh_token ? next() :  res.sendStatus(401);
}

app.get('/auth/google',  passport.authenticate('google', { scope: ['email', 'profile', 'https://www.googleapis.com/auth/youtube', 
'https://www.googleapis.com/auth/youtube.force-ssl', 'https://www.googleapis.com/auth/youtube.readonly', 
'https://www.googleapis.com/auth/youtubepartner'], accessType: 'offline' }))

app.get('/auth/google/callback',  passport.authenticate('google', {
    failureRedirect: '/auth/failure',
    successRedirect: '/auth/success'
}))


//Average cookie timeout for google token is 3599
app.get('/auth/success', (req, res) => {
    const refreshToken = jwt.sign({ refreshToken: req.user.tokens.refreshToken }, process.env.SECRET);
    res.cookie('refresh_token', refreshToken, { sameSite: 'strict', secure: true }); 

    const accessToken = jwt.sign({ accessToken: req.user.tokens.accessToken }, process.env.SECRET, { expiresIn: '15m' });
    res.cookie('access_token', accessToken, { sameSite: 'strict', secure: true }); 
 
    res.redirect('http://localhost:3000/login/success');
})

app.get('/auth/failure', (req, res) => {
    res.send("AUTHENTICATION FAILED!")
})

app.get('/auth/user', isLoggedIn, (req, res) => {
    res.json(req.user);
})

app.get('home', (req, res) => {
    res.send("You're on the home page.")
})

app.get('/playlist', checkIfAccessTokenIsExpired, (req, res) => {
    const params = {
        "playlistId": req.query.id,
        "key": process.env.YOUTUBE_API_KEY,
        "part": "snippet",
        "maxResults": 50
    }

    let headers = (res.locals.accessToken !== undefined) ? { "Authorization" : `Bearer ${res.locals.accessToken}` } : { };

    if (req.query.pageToken !== undefined) {
        params.pageToken = req.query.pageToken
    }

    axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
        params: params,
        headers: headers
    }).then((resp) => {
        let videos = resp.data.items.filter(item => item.snippet.resourceId.kind === "youtube#video")
        videos = videos.map(item => {
            return {
                "id": item.snippet.resourceId.videoId,
                "thumbnails": item.snippet.thumbnails,
                "title": item.snippet.title,
                "channelId": item.snippet.channelId,
                "publishedAt": item.snippet.publishedAt
            }
        })

        // Filter out privated or unavailable videos
        videos = videos.filter(video => video.thumbnails.default !== undefined)
        res.json({'videos': videos, 'nextPageToken' : resp.data.nextPageToken, 
            'prevPageToken' : resp.data.prevPageToken})

    }).catch((err) => {
        res.status(404).json({message: 'ERROR: ' + err});
    })
})

app.get('/getChannelId', checkIfAccessTokenIsExpired, (req, res) => {
    const bearer = 'Bearer ' + res.locals.accessToken;
    fetch("https://www.googleapis.com/youtube/v3/channels?part=id&mine=true", {
        method: 'GET',
        withCredentials: true,
        credentials: 'include',
        headers: {
            'Authorization': bearer,
            'X-FP-API-KEY': 'iphone', // can be iPhone or your any other attribute
            'Content-Type': 'application/json'
        }
    })
    .then(resp => resp.json())
    .then(data => res.json({id: data.items[0].id}))
    .catch(err => {
        
    });
})

app.get('/getPlaylistsFromChannel', checkIfAccessTokenIsExpired, (req, res) => {
    let headers = { "Authorization" : `Bearer ${res.locals.accessToken}` };
    const params = {
        "channelId": req.query.id,
        "key": process.env.YOUTUBE_API_KEY,
        "part": "snippet",
        "maxResults": 50
    }

    if (req.query.pageToken !== undefined) {
        params.pageToken = req.query.pageToken
    }

    axios.get('https://www.googleapis.com/youtube/v3/playlists', {
        params: params,
        headers: headers
    }).then(resp => {
        let playlists = resp.data.items.map(item => {
            return {
                title: item.snippet.title,
                thumbnails: item.snippet.thumbnails,
                playlistId: item.id,
                publishedAt: item.snippet.publishedAt,
            }
        });
        res.json({'playlists': playlists, 'nextPageToken' : resp.data.nextPageToken, 
        'prevPageToken' : resp.data.prevPageToken})
    }).catch(err => {
      res.json({ "msg": "Error, failed to retrieve user playlists." });
    });
})

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

app.get('/video', async (req, res) => {
    await sleep(20)

    const videoId = req.query.id
    if (videoId === 'undefined') {
        res.status(400).send({
            message: "VIDEO ID IS INVALID"
        })
        return
    }

    try {
        const info = await ytdl.getInfo('http://www.youtube.com/watch?v=' + videoId)
        const audioSources = info.formats.filter(video => video.mimeType.includes("audio"))
    
        const bestQualityAudioSource = audioSources[0];
        res.json(bestQualityAudioSource)
    }catch (e) {
        res.status(400).send({ 
            message: "ERROR, video is invalid or unavailible!"
        })
    }
})

app.listen(port, () => {
    console.log("APP is listening for requests")
})
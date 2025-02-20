// For google api
const fs = require('fs');
const open = require('open');
const http = require('http');
const destroyer = require('server-destroy');

const {google} = require('googleapis');
var OAuth2 = google.auth.OAuth2;


const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
const TOKEN_PATH = TOKEN_DIR + 'youtube_credentials.json';


function getOAuthClient(callback) {
    // Load client secrets from a local file.
    fs.readFile(TOKEN_DIR + 'credentials.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        // Authorize a client with the loaded credentials, then call the YouTube API.
        return authorize(JSON.parse(content), callback);
    });
}

exports.getOAuthClient = getOAuthClient


function authorize(credentials, callback) {
    var clientSecret = credentials.web.client_secret;
    var clientId = credentials.web.client_id;
    var redirectUrl = credentials.web.redirect_uris[0];
    var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
  
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        } else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client)
        }
    });
}

function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: "https://www.googleapis.com/auth/userinfo.profile"
    });

    const server = http.createServer(async (req, res) => {
        const qs = new URL(req.url, 'http://localhost:5001').searchParams;
        const code = qs.get('code');
        res.end('Authentication successful! Please return to the console.');
        
        server.destroy();


        // Now that we have the code, use that to acquire tokens.
        const r = await oauth2Client.getToken(code);
        
        // Make sure to set the credentials on the OAuth2 client.
        oauth2Client.setCredentials(r.tokens);
        storeToken(r.tokens)
        callback(oauth2Client)
  
    }).listen(5001, () => {
        open(authUrl, {wait: false}).then(cp => cp.unref());
    })

    destroyer(server)
}
  
// Store token to disk be used in later program executions.
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
        throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) throw err;
        console.log('Token stored to ' + TOKEN_PATH);
    });
}
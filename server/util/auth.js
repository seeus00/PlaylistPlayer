const passport = require('passport');
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const localStrategy = require('passport-local');
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const UserModel = require('../model/user');
const refresh = require('passport-oauth2-refresh');

const googleStrategy = new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "http://localhost:5000/auth/google/callback",
        // passReqToCallback: true
    },

    function(accessToken, refreshToken, params, profile, done) {
        profile.tokens = {
            expireTime: params.expires_in,
            accessToken: accessToken,
            refreshToken: refreshToken
        }
        
        return done(null, profile);
    }
);

passport.use(googleStrategy);
refresh.use(googleStrategy);

passport.use('signup',
    new localStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    async (email, password, done) => {
        try {
            UserModel.countDocuments({ email: email }, async (err, count) => {
                if (count == 0) {
                    const user = await UserModel.create({ email, password });
                    return done(null, user);
                }else {
                    return done("User already exists");
                }
            });
        } catch (error) {
            done(error);
        }
    })
);

passport.use('login',
    new localStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    async (email, password, done) => {
        try {
            const user = await UserModel.findOne({ email });

            if (!user) {
                return done(null, false, { message: 'User not found' });
            }

            const validate = await user.isValidPassword(password);

            if (!validate) {
                return done(null, false, { message: 'Wrong Password' });
            }

            return done(null, user, { message: 'Logged in Successfully' });
        } catch (error) {
            return done(error);
        }
    })
);

const cookieExtractor = function(req) {
    var token = null;
    if (req && req.cookies) token = req.cookies.jwt;
    return token;
  };

passport.use(new JWTstrategy({ 
    secretOrKey: process.env.SECRET,
    jwtFromRequest: cookieExtractor
}, async (token, done) => {
    try {
        return done(null, token.user);
    }catch (error) {
        done(error);
    }
}))

passport.serializeUser(function(user, done) {
    done(null, user);
});
 
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

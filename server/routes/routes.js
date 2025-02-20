const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/signup', 
    passport.authenticate('signup', { session: false }),
    async (req, res, next) => {
        res.json({
            message: 'Signup successful',
            user: req.user
        });
    }
);

router.post('/login', async (req, res, next) => {
    passport.authenticate('login', async (err, user, info) => {
        try {
            if (err)  return next(new Error('A login error has occurred.'));
            if (!user) return next(new Error('Password or email is incorrect.'));

            req.login(user, { session: false }, async (error) => {
                if (error) return next(error);

                const body = { _id: user._id, email: user.email };
                const token = jwt.sign({ user: body }, process.env.SECRET, { expiresIn: 600000 });

              
                res.cookie('jwt', token, { sameSite: 'none', secure: true }); 

                return res.json({ token });
            })
        }catch (error) {
            return next(error);
        }
    })(req, res, next);
});
  


module.exports = router;
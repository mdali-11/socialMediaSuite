import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Step 1: Redirect to Google for login
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Step 2: Google callback
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // Create JWT token
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // You can redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/social-login?token=${token}`);
  }
);

export default router;

import express, { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import user from '../models/user';
import { createToken } from '../utils/tokenmanager';
import { COOKIE_NAME } from '../utils/constants';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Missing Google credential' });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Invalid Google token' });
    }

    let existingUser = await user.findOne({ email: payload.email });

    if (!existingUser) {
      existingUser = new user({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        avatar: payload.picture,
      });
      await existingUser.save();
    } else {
      if (!existingUser.googleId) existingUser.googleId = payload.sub;
      if (payload.picture && !existingUser.avatar) existingUser.avatar = payload.picture;
      await existingUser.save();
    }

    // same cookie pattern as UserLogin
    res.clearCookie(COOKIE_NAME, {
      domain: 'localhost',
      httpOnly: true,
      signed: true,
      path: '/',
    });

    const token = createToken(existingUser._id.toString(), existingUser.email, '7d');

    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    res.cookie('token', token, {
      path: '/',
      domain: 'localhost',
      expires,
      httpOnly: true,
      signed: true,
    });

    return res.status(200).json({
      message: 'Successfully logged in',
      name: existingUser.name,
      email: existingUser.email,
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(401).json({ error: 'Google authentication failed' });
  }
});

export default router;
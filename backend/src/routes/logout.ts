import express from 'express';
import config from '../config/environment';

const router = express.Router();

router.post('/', (req, res) => {
  res.clearCookie(config.COOKIE.NAME, {
    httpOnly: config.COOKIE.HTTP_ONLY,
    secure: config.COOKIE.SECURE,
    domain: config.COOKIE.DOMAIN
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

export default router;
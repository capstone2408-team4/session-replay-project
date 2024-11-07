import express from 'express';
import jwt from 'jsonwebtoken';
import { PsqlService } from '../services/psqlService';
import config from '../config/environment';
import { authenticateToken } from '../middleware/dashboardAuth';
import { AuthRequest } from '../middleware/dashboardAuth';

const router = express.Router();
const psql = new PsqlService();

interface LoginRequest {
  projectName: string;
  password: string;
}

router.post('/login', async (req: express.Request<{}, {}, LoginRequest>, res: express.Response) => {
  try {
    const { projectName, password } = req.body;

    if (!projectName || !password) {
      return res.status(400).json({
        error: 'Project name and password are required'
      });
    }

    const { valid, projectID } = await psql.validateProjectLogin(projectName, password);

    if (!valid) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { projectID,
        projectName
      },
      config.JWT.SECRET!,
      { expiresIn: config.JWT.EXPIRES_IN }
    );

    // Set httpOnly cookie
    res.cookie(config.COOKIE.NAME, token, {
      httpOnly: config.COOKIE.HTTP_ONLY,
      secure: config.COOKIE.SECURE,
      maxAge: config.COOKIE.MAX_AGE,
      domain: config.COOKIE.DOMAIN,
      sameSite: config.COOKIE.SAME_SITE,
    })

    res.status(200).json({projectID, projectName});

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie(config.COOKIE.NAME, {
    httpOnly: config.COOKIE.HTTP_ONLY,
    secure: config.COOKIE.SECURE,
    domain: config.COOKIE.DOMAIN
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

router.get('/me', authenticateToken, (req: AuthRequest, res) => {
  try {
    res.status(200).json({
      user: {
        projectId: req.project?.id,
        projectName: req.project?.name
      }
    });
  } catch (error) {
    console.error('Error in /me route', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
import express from 'express';
import jwt from 'jsonwebtoken';
import { PsqlService } from '../services/psqlService';
import config from '../config/environment';

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

    const token = jwt.sign(
      { projectID,
        projectName
      },
      config.JWT.SECRET!,
      { expiresIn: config.JWT.EXPIRES_IN }
    );

    res.status(200).json({token, projectID, projectName});

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
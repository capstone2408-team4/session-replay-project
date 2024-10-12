import { Request, Response } from 'express';
import { S3Service } from '../services/s3Service';

export class S3Controller {
  private s3Service: S3Service;

  constructor() {
    this.s3Service = new S3Service();
  }

  getFile = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    try {
      const data = await this.s3Service.getFile(id);
      res.send(String(data));
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve file' });
    }
  };

  addFile = async (req: Request, res: Response): Promise<void> => {
    const { key, data } = req.body;
    try {
      const location = await this.s3Service.addFile(key, data);
      res.json({ location });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add file' });
    }
  };
}
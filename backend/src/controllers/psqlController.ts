import { Request, Response } from 'express';
import { PsqlService } from '../services/psqlService';

export class PsqlController {
  private psqlService: PsqlService;

  constructor() {
    this.psqlService = new PsqlService();
  }

  getSession = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    try {
      const data = await this.psqlService.getSession(id);
      res.json(data);
    } catch (error) {
      console.error(`Error in getSession controller: ${error}`);
      res.status(500).json({ error: 'Failed to retrieve session' });
    }
  };

  addSession = async (req: Request, res: Response): Promise<void> => {
    const { id, data } = req.body;
    try {
      const result = await this.psqlService.addSession(id, data);
      res.status(201).json(result);
    } catch (error) {
      console.error(`Error in addSession controller: ${error}`);
      res.status(500).json({ error: 'Failed to add session' });
    }
  };
}
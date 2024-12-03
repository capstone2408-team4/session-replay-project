import express from 'express';
import config from '../config/environment.js';
import { PsqlService } from '../services/psqlService.js';
const router = express.Router();

function getUserIP(req: express.Request): string {
  // Check x-forwarded-for header first in case behind a proxy or load balancer
  const forwardedFor = req.headers['x-forwarded-for'];

  if (forwardedFor) {
    const clientIP = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor.split(',')[0].trim();

    if (isValidIP(clientIP)) {
      return clientIP;
    }
  }

  // Try req.ip next
  if (req.ip && isValidIP(req.ip)) {
    return req.ip;
  }
  
  // Finally try socket remote address
  const socketIP = req.socket.remoteAddress;
  
  if (socketIP && isValidIP(socketIP)) {
    return socketIP;
  }

  throw new Error('Unable to determine user IP from request');
}

function isValidIP(ip: string): boolean {
  if (!ip) return false;

  // IPv4-mapped IPv6 addresses
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}([0-9a-fA-F]{0,4}|(\d{1,3}\.){3}\d{1,3})$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

const psql: PsqlService = new PsqlService();

router.get('/', async (req, res) => {
  const projectID = req.headers['x-providence-project-id'];

  if (!projectID || typeof projectID !== 'string') {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    const projectMetadata = await psql.getProject(projectID);

    if (!projectMetadata) {
      return res.status(400).json({ error: 'Invalid project' });
    }

    const userIP = getUserIP(req);
    console.log(`User IP detected from Agent request: ${userIP}`);

    if (!config.FINDIP_API_KEY) {
      throw new Error('Geo service API key not configured');
    }

    const response = await fetch(`https://api.findip.net/${userIP}/?token=${config.FINDIP_API_KEY}`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Geo service error: ${response.status} ${response.statusText}`);
    }

    const geoData = await response.json();

    res.json({
      ip: userIP,
      city: geoData.city.names || 'Unknown',
      state: geoData.subdivisions[0].names || 'Unknown',
      country: geoData.country.names || 'Unknown',
      latitude: geoData.location.latitude || 'Unknown',
      longitude: geoData.location.longitude || 'Unknown',
      timezone: geoData.location.time_zone || 'Unknown',
    });

  } catch (error) {
    console.error('Error in geolocation lookup:', error);

    // User IP can't be determined from the request
    if (error instanceof Error && error.message.includes('Unable to determine user IP')) {
      res.status(400).json({
        error: 'Failed to fetch geolocation data',
        details: error.message
      });
    // Backend configuration error
    } else if (error instanceof Error && error.message.includes('API key not configured')) {
      res.status(500).json({
        error: 'Internval server error',
        details: 'Geolocation service misconfigured'
      });
    // 3rd party geo service error
    } else if (error instanceof Error && error.message.includes('Geo service error')) {
      res.status(502).json({
        error: 'External service error',
        details: error.message
      });
    // Catch-all for unexpected errors
    } else {
      if (error instanceof Error) {
        res.status(500).json({
          error: 'Failed to fetch geolocation data',
          details: error.message
        });
      } else {
        res.status(500).json({
          error: 'Failed to fetch geolocation data',
          details: String(error)
        });
      }
    }
  }
});

export default router;
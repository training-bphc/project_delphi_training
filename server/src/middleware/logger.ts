import { Request, Response, NextFunction } from 'express';

/**
 * REQUEST LOGGER MIDDLEWARE
 * 
 * Logs incoming HTTP requests with method, path, and relevant data.
 * Useful for debugging and tracking request flow through the application.
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.path;
  const query = Object.keys(req.query).length > 0 ? JSON.stringify(req.query) : 'none';
  const params = Object.keys(req.params).length > 0 ? JSON.stringify(req.params) : 'none';
  
  console.log('\n--- INCOMING REQUEST ---');
  console.log(`[${timestamp}] ${method} ${path}`);
  console.log(`Query Params: ${query}`);
  console.log(`Route Params: ${params}`);
  
  // Only log body for non-GET requests and exclude sensitive fields
  if (method !== 'GET' && req.body) {
    const sanitizedBody = { ...req.body };
    // Remove sensitive fields from logging
    if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
    if (sanitizedBody.id_token) sanitizedBody.id_token = '[REDACTED]';
    console.log(`Body: ${JSON.stringify(sanitizedBody, null, 2)}`);
  }
  
  // Log authentication info if present
  if (req.headers.authorization) {
    console.log('Authorization: Bearer token present');
  }
  
  console.log('------------------------\n');
  
  // Capture the original send function
  const originalSend = res.send;
  
  // Override res.send to log responses
  res.send = function(data: any): Response {
    console.log('\n--- OUTGOING RESPONSE ---');
    console.log(`[${new Date().toISOString()}] ${method} ${path} - Status: ${res.statusCode}`);
    
    // Try to parse and log response data (limited to first 500 chars to avoid clutter)
    try {
      const responsePreview = typeof data === 'string' 
        ? data.substring(0, 500) 
        : JSON.stringify(data).substring(0, 500);
      console.log(`Response Preview: ${responsePreview}${data.length > 500 ? '...' : ''}`);
    } catch (e) {
      console.log('Response: [Unable to stringify]');
    }
    
    console.log('-------------------------\n');
    
    // Call the original send function
    return originalSend.call(this, data);
  };
  
  next();
};

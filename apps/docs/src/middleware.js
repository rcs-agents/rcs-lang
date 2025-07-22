export function onRequest(context, next) {
  const { request } = context;
  const url = new URL(request.url);
  
  // Serve JSON schema files with proper content-type headers
  if (url.pathname.endsWith('.schema.json') || url.pathname.includes('/schemas/')) {
    const response = next();
    response.then(res => {
      if (res.headers.get('content-type') === 'application/octet-stream' || 
          res.headers.get('content-type') === null) {
        res.headers.set('content-type', 'application/schema+json');
      }
      // Enable CORS for schema files
      res.headers.set('access-control-allow-origin', '*');
      res.headers.set('access-control-allow-methods', 'GET');
      return res;
    });
    return response;
  }
  
  return next();
}
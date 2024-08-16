/// <reference types="@fastly/js-compute" />

import { Logger } from 'fastly:logger';
import { env } from 'fastly:env';

addEventListener('fetch', (event) => event.respondWith(handleRequest(event)));

async function handleRequest(event) {
  // Initialize the log endpoint
  const logger = new Logger('my_test_log_endpoint');
  
  let req = event.request;
  let url = new URL(req.url);

  // Print out service version for troubleshooting
  const serviceVersion = env('FASTLY_SERVICE_VERSION');
  console.log('Service Version:', serviceVersion);

  switch (url.pathname) {
    // Test stdout statements
    case '/stdout':
      console.log('Starting stdout test');
      logger.log('stdout for log endpoint');
      return new Response('stdout test');
    // Test stderr statements
    case '/stderr':
      console.log('Starting stderr test');
      logger.log('stderr test');
      throw new Error('stderr test');

    default:
      return new Response('OK');
  }
}

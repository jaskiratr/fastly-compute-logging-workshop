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
    case '/new-relic':
      console.log('Start test for New Relic log endpoint');
      myObject = {
        timestamp: 1661976797605,
        cache_status: 'ERROR',
        client_ip: '127.0.0.1',
        client_device_type: 'Chromebook',
        client_os_name: 'Ubuntu',
        client_os_version: '17.10 (Artful Aardvark)',
        client_browser_name: 'Firefox',
        client_browser_version: '113.0',
        client_as_name: 'zayo bandwidth',
        client_as_number: '1234',
        client_connection_speed: 'broadband',
        client_port: 63850,
        client_rate_bps: 0,
        client_recv_bytes: 74,
        client_requests_count: 1,
        client_resp_body_size_write: 56789,
        client_resp_header_size_write: 1234,
        client_resp_ttfb: 1.342,
        client_rtt_us: 6818,
        content_type: 'text/html; charset=utf-8',
        domain: 'example.com',
        fastly_datacenter: 'HNL',
        fastly_host: 'cache-hnl00001',
        fastly_is_edge: true,
        fastly_region: 'US-Pacific',
        fastly_server: 'cache-hnl00001-HNL',
        host: 'example.com',
        origin_host: 'example.com',
        origin_name: 'n/a',
        request: 'GET',
        request_method: 'GET',
        request_accept_charset: 'utf-8',
        request_accept_language: 'en-US',
        request_referer: '',
        request_user_agent: 'curl/7.68.0',
        resp_status: '503',
        response: 'Backend unavailable, connection timeout',
        service_id: '000q0j0WE0f00z0KEVj5I0',
        service_version: '29',
        status: '503',
        time_start: '2023-05-18T23:21:52Z',
        time_end: '2023-05-18T23:21:53Z',
        time_elapsed: 237,
        tls_cipher: 'TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256',
        tls_version: 'TLS 1.2',
        url: '/',
        user_agent: 'curl/7.68.0',
        user_city: 'san francisco',
        user_country_code: 'US',
        user_continent_code: 'NA',
        user_region: 'CA'
      };
      logger.log(myObject);
      return new Response('New Relic Log test');
    
      // Test run time limit
    case '/error/run-time-limit':
      // Rewrite URL path
      const url = new URL(req.url);
      url.pathname = '/get';
      let backendRequest = new Request(url, req);
      let delay = url.searchParams.get('delay');
      logger.log(`Start run time limit test : ${delay} seconds delay`);
      const response = await fetch(backendRequest, { backend: 'origin_0' });
      const pit = tarpit(delay * 1000);
      return pit(response);
    // Test memory limit
    case '/error/memory-limit':
      logger.log('Start memory limit test');

      //? How to ensure that the instance will be terminated due to reaching memory limit and not run time limit
      consumeMemory();

      return new Response('Memory limit test');

    default:
      return new Response('OK');
  }
}

function tarpit(millisecondDelay, bytesPerChunk = 1000) {
  const writableStrategy = new ByteLengthQueuingStrategy({
    highWaterMark: bytesPerChunk
  });

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  async function processChunks(readStream) {
    const reader = readStream.getReader();
    while (true) {
      const { done, value: chunk } = await reader.read();
      if (done) {
        break;
      }
      await pause(millisecondDelay);
      writer.write(chunk);
    }
    writer.close();
    reader.releaseLock();
  }

  return function (response) {
    if (response.body) {
      processChunks(
        response.body.pipeThrough(
          new TransformStream(undefined, writableStrategy)
        )
      );
      return new Response(readable, response);
    }
    return response;
  };
}

async function pause(delay = 100) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

// Function to consume memory
function consumeMemory() {
  let arr = 'Hello';
  while (true) {
    arr.concat('o');
  }
}

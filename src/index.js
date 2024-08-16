/// <reference types="@fastly/js-compute" />

import { Logger } from 'fastly:logger';

addEventListener('fetch', (event) => event.respondWith(handleRequest(event)));

async function handleRequest(event) {
  const logger = new Logger('my_test_log_endpoint');
  let req = event.request;
  let url = new URL(req.url);

  switch (url.pathname) {
    // Test STDOUT statements
    case '/stdout':
      logger.log('Standard log output');
      return new Response('STDOUT Test');
    // Test STDERR statements
    case '/stderr':
      throw new Error('STDERR Test');
    // Test run time limit
    case '/error/run-time-limit':
      // Rewrite URL path
      const url = new URL(req.url);
      url.pathname = '/get';
      let backendRequest = new Request(url, req);
      let delay = url.searchParams.get('delay')
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
async function pause(delay = 100) {
  return new Promise((resolve) => setTimeout(resolve, delay));
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

// Function to consume memory
function consumeMemory() {
  let arr = 'Hello';
  while (true) {
    arr.concat('o');
  }
}

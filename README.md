# fastly-compute-logging-workshop

Validating the Fastly log endpoint guides for Compute

This repository contains elementary code for sending STDOUT and STDERR logs to a log endpoint. This is a most basic way to test the end user experience of sending logs from a Compute service to a remote endpoint.

## Prequisite

1. Fastly account
2. JS toolchain : Compiling JavaScript applications for the Compute platform requires a recent version of Node.js (>= 16.6). Before building the app, you also need to be able to install dependencies using the npm package manager or an alternative.
3. A free account for [the log endpoint](https://docs.fastly.com/en/guides/logging-endpoints) that you plan to test.

## Instructions

1. Clone this repository `gh repo clone jaskiratr/fastly-compute-logging-workshop`
2. Install dependencies `npm install`
3. Compile the service `fastly compute serve`
   1. Go to [http://127.0.0.1:7676/stdout](http://127.0.0.1:7676/stdout) and see the logs in your local console
   2. Go to [http://127.0.0.1:7676/stderr](http://127.0.0.1:7676/stderr) and see the logs in your local console
4. Deploy the service to Compute `fastly compute deploy`
   1. Once deployed go to the same URL paths `/stdout` and `/stderr` for your service.
   2. Observe the logs in the Fastly Log Tail UI. Observe the charts in the Fastly observability dashboard. It's okay if you don't know where those are. Try to find it!
5. Follow the [guide for your log endpoint](https://docs.fastly.com/en/guides/logging-endpoints) to create a new log endpoint for your Compute service. Name it `my_test_log_endpoint`
   1. Feel free to modify the code if the guide suggests you to do so. Meaning, you may need to adapt the log output to a format that the endpoint expects it to be.
6. Revisit those same URL paths and verify if the logs make it to your log endpoint.
7. The guide gets a pass, if you followed the exact steps in it and the logs successfully made it to the endpoint in a timely fashion.

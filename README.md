# Contract Testing Setup

This package sets up a basic contract testing environment using Pact, Jest, and other dependencies for consumer-driven contract testing between a frontend (consumer) and a backend (provider) service.

## Features

- **Consumer Contract Testing**: Test your frontend consumer against a mock provider to ensure that the requests and expectations are accurate.
- **Provider Verification**: Validate that the actual provider service adheres to the contract expectations defined by the consumer.
- **Dynamic User Input**: Uses `prompt.js` to allow users to specify request methods (GET, POST, etc.) and paths dynamically.

## Prerequisites

Ensure that you have [Node.js](https://nodejs.org/en/) installed on your system. The recommended version is at least v14.x.

## Installation


Run the following command to install all dependencies and set up the environment:

-> node setup.cjs

This command will create the necessary files (such as Consumer.test.js, Provider.test.js, server.js, prompt.js, and package.json) and install the required dependencies (Pact, Jest, Axios, Express, and Inquirer).

Once the setup is complete, you can run the following scripts:

node prompt.js - For user customization and testing the consumer pact
npm run test-consumer - Runs the consumer contract tests.
npm run start-provider - Starts the mock provider server
npm run test-provider - Runs the provider verification tests.




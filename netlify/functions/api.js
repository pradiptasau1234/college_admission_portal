// Netlify Serverless Function handler for Express API
const serverless = require('serverless-http');
const app = require('../../server/src/server');

const handler = serverless(app);

module.exports.handler = async (event, context) => {
  // Prevent AWS Lambda / Netlify from hanging on open Mongoose connection pools
  context.callbackWaitsForEmptyEventLoop = false;
  return await handler(event, context);
};

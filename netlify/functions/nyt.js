
const axios = require('axios');

exports.handler = async function (event, context) {
  const API_KEY = progress.env.NYT_API_KEY;
  const { section = 'home', query } = event.queryStringParameters;

  const baseUrl = 'https://api.nytimes.com/svc';

  let url;

  if (query) {
    url = `${baseUrl}/search/v2/articlesearch.json?q=${query}&api-key=${API_KEY}`;
  } else {
    url = `${baseUrl}/topstories/v2/${section}.json?api-key=${API_KEY}`;
  };

  try {
    const response = await axios.get(url);
    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ error: error.message }),
    };
  };
};
const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');


dotenv.config();
const app = express();

const PORT = process.env.PORT ;
const MINIO_METRICS_URL = process.env.MINIO_METRICS_URL ;
const BEARER_TOKEN = process.env.BEARER_TOKEN;
const FETCH_INTERVAL = parseInt(process.env.FETCH_INTERVAL); 
if (!BEARER_TOKEN) {
    console.error('Error: BEARER_TOKEN is not set in the environment variables.');
    process.exit(1);
}

let cachedMetrics = '';
let lastFetchTime = null;


const fetchMetrics = async () => {
    try {
        console.log('Fetching metrics from MinIO...');
        const response = await axios.get(MINIO_METRICS_URL, {
            headers: {
                Authorization: `Bearer ${BEARER_TOKEN}`,
            },
        });
        cachedMetrics = response.data;
        lastFetchTime = new Date();
        console.log('Metrics fetched successfully');
    } catch (error) {
        console.error('Error fetching metrics:', error.message);
    }
};

setInterval(fetchMetrics, FETCH_INTERVAL);
fetchMetrics();
app.get('/metrics', (req, res) => {
    if (cachedMetrics) {
        res.set('Content-Type', 'text/plain');
        res.send(cachedMetrics);
    } else {
        res.status(503).send('Metrics are not available yet. Please try again later.');
    }
});
app.get('/health', (req, res) => {
    const status = cachedMetrics ? 'healthy' : 'unhealthy';
    const healthData = {
        status,
        lastFetchTime,
        fetchInterval: FETCH_INTERVAL,
    };
    res.status(cachedMetrics ? 200 : 503).json(healthData);
});
app.listen(PORT, () => {
    console.log(`MinIO Metrics Exporter running on port ${PORT}`);
    console.log(`Fetching metrics every ${FETCH_INTERVAL / 1000} seconds`);
});

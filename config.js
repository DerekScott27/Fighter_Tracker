const isProd = location.hostname === 'https://fighter-tracker-mq7b1uqjl-dereks-projects-64f38f08.vercel.app/' || location.hostname.endsWith('vercel.app');

const API_BASE = isProd ? 'https://fighter-tracker.onrender.com' : 'http://localhost:3002';
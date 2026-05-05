console.log('Starting simple server');
const express = require('express');
const app = express();
const PORT = 8080; // Changed port

console.log('Before health route');
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running!' });
});

console.log('Before listen');
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Simple test server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});
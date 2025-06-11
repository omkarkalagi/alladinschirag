require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static('public'));

// Mock user database
const users = {
  'omkar': { password: 'kalagi123', name: 'Omkar Kalagi' },
  'admin': { password: 'admin123', name: 'Admin User' }
};

// API endpoints
app.post('/api/login', express.json(), (req, res) => {
  const { username, password } = req.body;
  
  if (users[username] && users[username].password === password) {
    res.json({ 
      success: true, 
      user: { 
        name: users[username].name,
        initials: users[username].name.split(' ').map(n => n[0]).join('')
      } 
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Real-time data endpoints
app.get('/api/market-data', async (req, res) => {
  try {
    // In production, use real API with your API key
    // const response = await axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=RELIANCE.BSE&interval=5min&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`);
    
    // For demo, return mock data
    res.json(getMockMarketData());
  } catch (error) {
    console.error('Error fetching market data:', error);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

// WebSocket for real-time updates
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Send market data updates every 5 seconds
  const interval = setInterval(() => {
    socket.emit('market-update', getMockMarketData());
  }, 5000);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
    clearInterval(interval);
  });
});

function getMockMarketData() {
  // Generate realistic mock data
  return {
    indices: {
      nifty: {
        value: (18432.45 + (Math.random() * 100 - 50)).toFixed(2),
        change: (Math.random() * 0.5 - 0.25).toFixed(2)
      },
      sensex: {
        value: (62187.34 + (Math.random() * 200 - 100)).toFixed(2),
        change: (Math.random() * 0.5 - 0.25).toFixed(2)
      }
    },
    stocks: [
      // Generate 10 volatile stocks
      ...Array(10).fill().map((_, i) => ({
        symbol: ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'SBIN', 'HINDUNILVR', 'KOTAKBANK', 'AXISBANK', 'LT'][i],
        name: ['Reliance Industries', 'Tata Consultancy', 'HDFC Bank', 'Infosys', 'ICICI Bank', 'State Bank of India', 'Hindustan Unilever', 'Kotak Mahindra Bank', 'Axis Bank', 'Larsen & Toubro'][i],
        price: (1000 + Math.random() * 3000).toFixed(2),
        change: (Math.random() * 5 - 2.5).toFixed(2)
      }))
    ]
  };
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:3000/live');

ws.on('open', () => {
  console.log('Connected to local WS server');
  setTimeout(() => ws.close(), 1000);
});

ws.on('message', (data) => {
  console.log('Received:', data.toString());
});

ws.on('error', (err) => {
  console.error('WS Error:', err);
});

ws.on('close', (code, reason) => {
  console.log('Closed:', code, reason.toString());
});

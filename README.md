# Zero Trust WebSocket Demo

This repository demonstrates two approaches to handling WebSocket connections in web applications:

1. Traditional Proxy Method
   - Python (Flask + Flask-Sock)
   - Node.js (Express + ws)
   - React (Vite + WebSocket)
   - Shows how to combine HTTP and WebSocket servers on a single port
   - Demonstrates proper connection management and heartbeat monitoring

2. Zero Trust Method
   - Using [zrok](https://github.com/openziti/zrok) for secure tunneling
   - Using [OpenZiti](https://github.com/openziti/ziti) SDK for zero trust networking
   - Eliminates the need for proxy configuration
   - Provides enhanced security and simplified deployment

## Project Structure

```text
.
├── templates/              # Shared HTML templates
│   └── index.html         # Vanilla JS client
├── python-server/         # Python implementation
│   ├── ws.py             # Flask + Flask-Sock server
│   └── requirements.txt   # Python dependencies
├── node-server/          # Node.js implementation
│   ├── server.js         # Express + ws server
│   └── package.json      # Node.js dependencies
└── react-client/         # React implementation
    ├── src/              # React source code
    ├── package.json      # React dependencies
    └── vite.config.js    # Vite configuration
```

## Quick Start

### Python Version

```bash
cd python-server
pip install -r requirements.txt
python ws.py
```

### Node.js Version

```bash
cd node-server
npm install
node server.js
```

### React Version

```bash
cd react-client
npm install

# Using serve script (recommended)
./serve.sh                                    # Default: http://localhost:9876
./serve.sh http://example.com                 # Custom URL
./serve.sh http://dslno640nct4.share.zrok.io  # zrok share

# Or using environment variable
npm run dev                                              # Default local development
FRONTEND_URL=http://example.com npm run dev              # Custom URL
FRONTEND_URL=http://dslno640nct4.share.zrok.io npm run dev  # zrok share
```

The WebSocket URL is automatically derived from the frontend URL, maintaining protocol consistency (ws/wss).

Visit http://localhost:9876 to see the local preview (Python/Node.js) or http://localhost:5173 for the React version.

## Share with zrok

```bash
zrok share public 9876
./serve.sh http://[your-zrok-share-url]  # In react-client directory
```

Visit the randomized share token URL, e.g., `http://dslno640nct4.share.zrok.io`.

## Features

- Real-time stopwatch with WebSocket updates
- Server heartbeat monitoring with emoji indicators
- Connection interruption logging
- Multi-client support
- Clean separation of HTTP and WebSocket handling
- Multiple client implementations:
  - Vanilla JS (shared template)
  - Node.js (Express + ws)
  - Python (Flask + Flask-Sock)
  - React (Vite + WebSocket)
- Automatic WebSocket URL derivation from frontend URL

## Architecture

### Traditional Proxy

- Single port serves both HTTP and WebSocket traffic
- Automatic WebSocket upgrade handling
- Thread-safe client connection management
- Proper cleanup on disconnection
- Development proxy configuration with Vite for React client
- Protocol-aware URL handling (http→ws, https→wss)

### Zero Trust (Coming Soon)

- Direct WebSocket connections using zrok
- Secure tunneling with OpenZiti
- No exposed ports or proxy configuration needed
- Enhanced security through zero trust architecture

## Contributing

Contributions welcome! Please read our contributing guidelines and code of conduct.

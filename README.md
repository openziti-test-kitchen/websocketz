# Zero Trust WebSocket Demo

This repository demonstrates two approaches to handling WebSocket connections in web applications:

1. Traditional Proxy Method
   - Python (Flask + Flask-Sock)
   - Node.js (Express + ws)
   - Shows how to combine HTTP and WebSocket servers on a single port
   - Demonstrates proper connection management and heartbeat monitoring

2. Zero Trust Method
   - Using [zrok](https://github.com/openziti/zrok) for secure tunneling
   - Using [OpenZiti](https://github.com/openziti/ziti) SDK for zero trust networking
   - Eliminates the need for proxy configuration
   - Provides enhanced security and simplified deployment

## Quick Start

### Python Version

```bash
pip install flask flask-sock
python ws.py
```

### Node.js Version

```bash
npm install
node server.js
```

Visit http://localhost:9876 to see the local preview.

## Share with zrok

```bash
zrok share public 9876
```

Visit http://dslno640nct4.share.zrok.io to see the public preview.

## Features

- Real-time stopwatch with WebSocket updates
- Server heartbeat monitoring with emoji indicators
- Connection interruption logging
- Multi-client support
- Clean separation of HTTP and WebSocket handling

## Architecture

### Traditional Proxy

- Single port serves both HTTP and WebSocket traffic
- Automatic WebSocket upgrade handling
- Thread-safe client connection management
- Proper cleanup on disconnection

### Zero Trust (Coming Soon)

- Direct WebSocket connections using zrok
- Secure tunneling with OpenZiti
- No exposed ports or proxy configuration needed
- Enhanced security through zero trust architecture

## Contributing

Contributions welcome! Please read our contributing guidelines and code of conduct.

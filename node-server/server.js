const express = require('express');
const { WebSocketServer } = require('ws');
const path = require('path');
const zrok = require('@openziti/zrok');

// Initialize zrok
const main = async () => {
    const root = zrok.Load();
    
    await zrok.init(root).catch((err) => {
        console.error(err);
        return process.exit(1);
    });

    // Create a share request
    const request = new zrok.ShareRequest(
        zrok.PROXY_BACKEND_MODE,  // backend mode
        zrok.PUBLIC_SHARE_MODE,   // share mode
        "http-server",            // target
                                  // frontends
                                  // basicAuth must be empty array
                                  // oauthProvider must be empty string
                                  // oauthEmailDomains must be empty array
                                  // oauthAuthorizationCheckInterval must be empty string
    );
    // request.OauthProvider = "";   // uppercase for model FIXME in constructor
    // request.authScheme = zrok.AUTH_SCHEME_NONE;               // add to constructor?
    request.reserved = true;      // add to constructor?
    request.uniqueName = process.env.ZROK_UNIQUE_NAME || "";  // custom reserved name

    // Add debug logging
    console.log('Share Request:', JSON.stringify(request, null, 2));
    console.log('Root Environment:', JSON.stringify(root.env, null, 2));

    // Reserve a share with a unique name
    try {
        const shr = await zrok.CreateShare(root, request);
        console.log('Share created:', JSON.stringify(shr, null, 2));
        console.log(`Share token for future use: ${shr.Token}`);
        console.log(`Access publicly using with a web browser at: ${shr.FrontendEndpoints[0]}`);
    } catch (err) {
        console.error('Error creating share:', err);
        if (err.response) {
            console.error('Response status:', err.response.status);
            console.error('Response data:', JSON.stringify(err.response.data, null, 2));
        }
        // Don't continue if share creation failed
        throw new Error('Failed to create share. Cannot continue.');
    }
    
    const app = zrok.express(request.unique_name);

    // Serve static files from templates directory
    app.use(express.static(path.join(__dirname, '../templates')));

    // Serve index.html from templates directory
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../templates/index.html'));
    });

    // Create HTTP server first
    const server = app.listen(undefined, () => {
        console.log('WebSocket server is now listening for incoming requests');
    });

    // Then create WebSocket server using the HTTP server
    const wss = new WebSocketServer({ server: server });

    const hearts = ['❤️', '💖', '💝', '💗', '💓', '💕', '💞', '💘', '💟'];
    const HEARTBEAT_INTERVAL = 10000; // 10 seconds

    wss.on('connection', (ws) => {
        console.log('Client connected');
        let lastHeartbeat = 0;

        const interval = setInterval(() => {
            const currentTime = Date.now();
            if (currentTime - lastHeartbeat >= HEARTBEAT_INTERVAL) {
                const heart = hearts[Math.floor(Math.random() * hearts.length)];
                ws.send(`${heart} ${currentTime}`);
                lastHeartbeat = currentTime;
            }
        }, 1000);
        
        ws.on('close', () => {
            console.log('Client disconnected');
            clearInterval(interval);
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
            clearInterval(interval);
        });
    });
};

main().catch(console.error);

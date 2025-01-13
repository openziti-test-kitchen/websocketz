from flask import Flask, render_template
from flask_sock import Sock
import time
import datetime
import random
import os

app = Flask(__name__,
            template_folder='../templates',  # Look for templates in root directory
            static_folder='../templates'     # Serve static files from templates too
            )

sock = Sock(app)

# List of heart emojis
hearts = ['❤️', '💖', '💝', '💗', '💓', '💕', '💞', '💘', '💟']


@app.route('/')
def index():
    return render_template('index.html')


@sock.route('/ws')
def websocket(ws):
    heartbeat_interval = 10  # seconds
    last_heartbeat = 0

    try:
        while True:
            current_time = time.time()
            if current_time - last_heartbeat >= heartbeat_interval:
                heart = random.choice(hearts)
                timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                ws.send(f"{heart} {timestamp}")
                last_heartbeat = current_time
            time.sleep(1)
    except:
        pass


if __name__ == '__main__':
    app.run(port=9876)

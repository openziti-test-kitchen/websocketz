from flask import Flask, render_template
from flask_sock import Sock
import time
import datetime
import random

app = Flask(__name__)
sock = Sock(app)

# List of heart emojis
HEARTS = ['❤️', '💖', '💝', '💗', '💓', '💕', '💞', '💘', '💟']

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
                heart = random.choice(HEARTS)
                timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                ws.send(f"{heart} {timestamp}")
                last_heartbeat = current_time
            time.sleep(1)
    except:
        pass

if __name__ == '__main__':
    app.run(host='localhost', port=9876)

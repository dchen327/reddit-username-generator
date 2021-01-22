import time
from flask import Flask
from flask_cors import CORS, cross_origin
from time import sleep

app = Flask(__name__)
cors = CORS(app)


@app.route('/time')
@cross_origin()
def get_current_time():
    sleep(3)
    return {'time': time.time()}

import io
import os

import flask
from flask import send_from_directory

import requests

STT_URL = 'https://switzerlandnorth.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=de-CH'
CHAT_URL = 'https://api.openai.com/v1/chat/completions'
TTS_URL = 'https://switzerlandnorth.tts.speech.microsoft.com/cognitiveservices/v1'


# Speech Key
SKEY = os.getenv('SPEECH_KEY')
# ChatGPT OpenAI Key
CKEY = os.getenv('GPT_KEY')

print('SPEECH_KEY: ')
print(SKEY)
print('GPT_KEY')
print(CKEY)

app = flask.Flask(__name__)


@app.route('/')
def hello():
    return flask.render_template('./index.html')

@app.route('/tts', methods=['POST'])
def tts():
    text = flask.request.get_data(as_text=True)
    xml = f'''<speak version='1.0' xml:lang='en-US'>
<voice xml:lang='de-CH' xml:gender='Male' name='de-CH-LeniNeural'>
{text}
</voice>
</speak>'''
    # headers
    headers = {
      'Ocp-Apim-Subscription-Key': SKEY,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm'
    }
    # fetch the voices
    resp = requests.post(TTS_URL, headers=headers, data=xml)
    return resp.content

@app.route('/stt', methods=['POST'])
def stt():
    
    files = flask.request.files
    print(files)
    file = files.get('file')
    headers = {
        'Ocp-Apim-Subscription-Key': SKEY, 
        'Accept': 'application/json',
        'Content-Type': 'audio/ogg'
    }
    buf = io.BytesIO(file.read())
    resp = requests.post(STT_URL, headers=headers, data=buf)
    data = resp.json()
    print(data)
    text = data['DisplayText']
    return text


@app.route('/chat', methods=['POST'])
def chat():
    raw_data = flask.request.get_data(as_text=True)
    req = {
        "model": "gpt-3.5-turbo",
        "messages": [{"role": "user", "content": raw_data}]
    }
    headers = {
        'Content-Type': "application/json",
        'Authorization': f'Bearer {CKEY}'
    }
    resp = requests.post(
        CHAT_URL,
        headers=headers,
        json=req
        )
    data = resp.json()
    print(data)
    res = data['choices'][0]
    print(res)
    msg = res['message']
    print(msg)
    return msg['content']


@app.route('/js/<path:path>')
def send_report(path):
    return send_from_directory('js', path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)

import requests
import argparse

STT_URL = 'https://switzerlandnorth.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=de-CH'
CHAT_URL = 'https://api.openai.com/v1/chat/completions'
TTS_URL = 'https://switzerlandnorth.tts.speech.microsoft.com/cognitiveservices/v1'


# OpenAI Key
SKEY = '' # TODO add speech key
# ChatGPT OpenAI Key
CKEY = '' # TODO add openapi key


def main(filename):
    text = speech2text(filename)
    print(f'Question: {text}')
    response = askChatGpt(text)
    print(f'Answer: {response}')
    text2speech(text)


def askChatGpt(text) -> str:
    
    req = {
        "model": "gpt-3.5-turbo",
        "messages": [{"role": "user", "content": text}]
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


def speech2text(filename: str):

    content_type = 'audio/wav'
    if filename.endswith('.ogg'):
        content_type = 'audio/ogg'
    headers = {
        'Ocp-Apim-Subscription-Key': SKEY, 
        'Accept': 'application/json',
        'Content-Type': content_type
    }
    with open(filename, 'rb') as f:
        data = f.read()
    resp = requests.post(STT_URL, headers=headers, data=data)
    data = resp.json()
    print(data)
    text = data['DisplayText']
    return text


def text2speech(text):
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

    with open('out.wav', 'wb') as f:
        f.write(resp.content)

if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument('filename')

    args = parser.parse_args()

    main(args.filename)
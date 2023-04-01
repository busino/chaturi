/** HTML Elements */
const start = document.getElementById('start');
const ask = document.getElementById('ask');
const tell = document.getElementById('tell');
const question = document.getElementById('question');
const answer = document.getElementById('answer');
const audio = document.getElementById('audio');

/** Constants/Globals */
let stream;
let recorder;
let chunks;
let recording = false;

initMicro();

/** Microphone recording */
function initMicro() {

    navigator.mediaDevices.getUserMedia({audio: true})
        .then(_stream => {
            stream = _stream;
            recorder = new MediaRecorder(stream);
            recorder.ondataavailable = e => {
                chunks.push(e.data);
                if(recorder.state == 'inactive') {
                    question.value = '';
                    answer.value = '';
                    sendToSpeech();
                }
            };
        console.log('got media successfully');
    });
}


function reset() {
    chunks=[];
    question.value = '';
    answer.value = '';
}

/** Button Actions */
start.onclick = event => {
    console.log('start');
    if (recording) {
        recorder.stop();
        recording = false;
        start.textContent = 'Start Recording';
    } else {
        reset();
        recorder.start();
        recording = true;
        start.textContent = 'Stop';
    }
};

ask.onclick = event => {
    answer.value = '';
    fetchChatGPT(question.value);
}

tell.onclick = event => {
    text2Speech(answer.value);
}

function sendToSpeech() {
    console.log('Send to speech.');
    let blob = new Blob(chunks, {type: 'audio/ogg' });
    fetch('https://switzerlandnorth.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=de-CH', {
      method: 'POST',
      headers: {
          'Ocp-Apim-Subscription-Key': SKEY, 
          'Accept': 'application/json',
          'Content-Type': 'audio/ogg'
      },
      body: blob
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      console.log(data.DisplayText);
      return data.DisplayText;
    })
    .then(text => {
      question.value = text;
      fetchChatGPT(text);
    })
  }


function fetchChatGPT(text) {
    console.log('fetchChatGPT', text);
    if (!text) {
        text='Erzähl mir die Geschichte vom bösen Wolf in 2 Sätzen.';
    }
    console.log('Ask for text', text);
    const url = 'https://api.openai.com/v1/chat/completions';
    // Request Parameters
    const req = 
    {
        "model": "gpt-3.5-turbo",
        "messages": [{"role": "user", "content": text}]
    }
    // Headers
    const headers = {
        'Content-Type': "application/json",
        'Authorization': `Bearer ${CKEY}`
    };

    fetch(
        url,
        { 
            method: 'POST', 
            headers: headers,
            body: JSON.stringify(req)
        }
    )
    .then(
        res => res.json()
    )
    .then(data => {
        console.log(data)
        console.log(data.choices[0])
        console.log(data.choices[0].message.content);
        const content = data.choices[0].message.content;
        answer.value = content;
        text2Speech(content);
    });
}

function text2Speech(text) {
    console.log('text2Speech');
    console.log('Ask for text', text);
    if (!text) {
        text = 'Kein Text vorhanden.';
    }
    var url = 'https://switzerlandnorth.tts.speech.microsoft.com/cognitiveservices/v1';
    // query
    const xml = `<speak version='1.0' xml:lang='en-US'>
<voice xml:lang='de-CH' xml:gender='Male' name='de-CH-LeniNeural'>
${text}
</voice>
</speak>`;
    // headers
    const headers = {
      'Ocp-Apim-Subscription-Key': SKEY,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'riff-8khz-16bit-mono-pcm'
    };
    // fetch the voices
    fetch(
        url,
        {
            method: 'POST', 
            headers: headers,
            body: xml
        }
    )
    .then(response => response.arrayBuffer()
    )
    .then(buffer => {
        //console.log(buffer);
        const blob = new Blob([buffer], { type: "audio/wav" });
        audio.src = window.URL.createObjectURL(blob);
        audio.play();
    });
}
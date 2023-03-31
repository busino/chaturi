'use strict'


const start = document.getElementById('start');
const stop = document.getElementById('stop');
const output = document.getElementById('output');
let stream;
let recorder;
let chunks;


navigator.mediaDevices.getUserMedia({audio: true}).then(_stream => {
  stream = _stream;
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = e => {
    chunks.push(e.data);
    if(recorder.state == 'inactive') {
      output.value = '';
      sendToSpeech();
    }
  };
  
  console.log('got media successfully');

});

start.onclick = event => {
  console.log('start');
  chunks=[];
  output.value = '';
  recorder.start();
};

stop.onclick = event => {
  console.log('stop');
  recorder.stop();
};

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
    output.value = text;
  })
}

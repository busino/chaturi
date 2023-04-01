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
    var data = new FormData();
    data.append('file', blob, 'file.ogg');
    fetch('./stt', {
      method: 'POST',
      body: data
    })
    .then(response => response.text())
    .then(text => {
      question.value = text;
      fetchChatGPT(text);
    })
  }


function fetchChatGPT(text) {
    console.log('fetchChatGPT', text);
    console.log('Ask for text', text);
    const url = './chat';
    fetch(
        url,
        { 
            method: 'POST', 
            body: text
        }
    )
    .then(data => data.text())
    .then(data => {
        console.log('--------------------------------')
        console.log(data)
        answer.value = data;
        text2Speech(data);
    });
}

function text2Speech(text) {
    console.log('text2Speech');
    console.log('Ask for text', text);
    if (!text) {
        text = 'Kein Text vorhanden.';
    }
    var url = './tts';
    // headers
    const headers = {
      'Content-Type': 'text/plain',
    };
    // fetch the voices
    fetch(
        url,
        {
            method: 'POST', 
            headers: headers,
            body: text
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
'use strict'


let btn = document.getElementById('btn');

let output = document.getElementById('output');
let input = document.getElementById('input');

let audio = document.getElementById('audio');

btn.onclick = e => {
  var text = 'Wie alt bist du?';
  text = input.value;
  console.log('Ask for text', text);
  var url = 'https://switzerlandnorth.tts.speech.microsoft.com/cognitiveservices/v1';
  const xml = `<speak version='1.0' xml:lang='en-US'><voice xml:lang='de-CH' xml:gender='Male'
  name='de-CH-LeniNeural'>
      ${text}
</voice></speak>`;

  const headers = {
    'Ocp-Apim-Subscription-Key': SKEY,
    'Content-Type': 'application/ssml+xml',
    'X-Microsoft-OutputFormat': 'riff-8khz-16bit-mono-pcm'
  };

  fetch(
    url, 
    { method: 'POST', 
      headers: headers,
      body: xml}
  )
  .then(response => 
    response.arrayBuffer()
  )
  .then(buffer => {
       console.log(buffer);
       const blob = new Blob([buffer], { type: "audio/wav" });
       audio.src = window.URL.createObjectURL(blob);
       audio.play();
  });



};



'use strict'


let btn = document.getElementById('btn');

let output = document.getElementById('output');
let input = document.getElementById('input');

btn.onclick = e => {
  console.log('click');


  const text = input.value;
  console.log('Ask for text', text);
  const url = 'https://api.openai.com/v1/chat/completions';
  const req = 
  {
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": text}]
  }
  const headers = {
    'Content-Type': "application/json",
    'Authorization': `Bearer ${CKEY}`
  };

  fetch(
    url, 
    { method: 'POST', 
      headers: headers,
      body: JSON.stringify(req)}
  ).then(
    res => res.json()
  )
  .then(data => {
    console.log(data)
    console.log(data.choices[0])
    console.log(data.choices[0].message.content);
    var content = data.choices[0].message.content;
    output.value = content;
  });



};
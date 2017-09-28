$(function () {
  
  ws = undefined;
  flag = 0;

  var fileInput = $('#file_input_file');
  var fileInputText = $('#m');
  
 /*  fileInput.change( function(event) {
    var tmppath = event.target.files[0];

    ws.send(event.target.files[0])
    
    fileInputText.val(fileInput.val());
    $('#m').addClass('file');
  }); */

  $('form').submit(function(){
    var submitNode = $('#m');
    if (submitNode.attr('class') !== 'file') {
      var text = $('#m').val();
      if (!text)
        return false;
      ws.send(JSON.stringify({
        type: "messages",
        messages: [{type: "text", data: text}]
      }));
      $('#m').val('');
      showTextMessage(text);
      return false;
    }
    else {
      showTextMessage(imgPreload);
      submitNode.removeClass('file');
    }
  });

  var appendMessage = (message, scroll) => {
    if (!message.type)
      return;
    if (message.type == "text") {
      $('#messages').append($('<li>').text(message.data));
    }
    if (message.type == "image") {
      //$('#messages').append($('<li>').text(message.data));
      message.appendTo($('#messages').append($('<li>')))
    }
    if (scroll)
      window.scrollTo(0, document.body.scrollHeight);
  }

  var showTextMessage = (message, scroll) => {
    appendMessage({type: "text", data: message}, true);
  }

  var showImageMessage = (message, scroll) => {
    console.log(message, 'imgpath')
    appendMessage({type: "image", data: message}, true);
  }

  var onMessage = (event) => {
    let data = undefined;
    try {
      data = JSON.parse(event);
      if (!data || !data.type)
        return;
      if (data.type == "messages") {
        if (!data.messages || !data.messages.length)
          return;
        for(var i = data.messages.length - 1 ; i >= 0 ; i--) {
          appendMessage(data.messages[i]);
        }
        window.scrollTo(0, document.body.scrollHeight);
      }
    }
    catch(e) {
      console.log(e);
    }
  };

  var establishConnection = () => {
    var setHandlers = () => {
      ws.onerror = () => {
        showTextMessage('WebSocket error');
        setTimeout(() => { establishConnection(); }, 10000);
      };
      ws.onopen = () => showTextMessage('WebSocket connection established');
      ws.onclose = () => showTextMessage('WebSocket connection closed');
      ws.onmessage = (event) => onMessage(event.data);
    }
    if (flag == 0) {
      ws = new WebSocket(`wss://${location.host}`);
      flag = 1;
      setHandlers();
    }
    else if (flag == 1) {
      ws = new WebSocket(`ws://${location.host}`);
      flag = 0;
      setHandlers();
    }
  }
  establishConnection();
});

// Select your input type file and store it in a variable
const input = document.getElementById('file_input_file');

// This will upload the file after having read it
const upload = (e) => {
  fetch('/upload', { // Your POST endpoint
    method: 'POST',
    headers: {
      "Content-Type": "You will perhaps need to define a content-type here"
    },
    body: e.currentTarget.result // This is the content of your file
  })
};

// Event handler executed when a file is selected
const onSelectFile = (files) => {
  // Files is a list because you can select several files
  // We just upload the first selected file
  const file = input.files[0];
  const reader = new FileReader();
  var data = new FormData()
  data.append('file', input.files[0])

  // We read the file and call the upload function with the result
  /* reader.onload = upload;
  reader.readAsArrayBuffer(file); */

  fetch('/upload', { // Your POST endpoint
    method: 'POST',
    headers: {
      "Content-Type": "You will perhaps need to define a content-type here"
    },
    body: data // This is the content of your file
  })
};

// Add a listener on your input
// It will be triggered when a file will be selected
input.addEventListener('change', onSelectFile , false);


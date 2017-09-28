$(function () {
  
  ws = undefined;
  flag = 0;

  var fileInput = $('#file_input_file');
  var fileInputText = $('#m');

  

  fileInput.change( function(event) {
    
    var form = new FormData();
    form.append("file", event.target.files[0]);
    
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": "/upload",
      "method": "POST",
      "headers": {
        "cache-control": "no-cache"
      },
      "processData": false,
      "contentType": false,
      "mimeType": "multipart/form-data",
      "data": form
    }
    
    $.ajax(settings).done(function (response) {
      //console.log(response);
      showImageMessage(response);
    });
  });

  $('form').submit(function(){
    var submitNode = $('#m');
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
  });

  var appendMessage = (message, scroll) => {
    if (!message.type)
      return;
    if (message.type == "text") {
      $('#messages').append($('<li>').text(message.data));
    }
    if (message.type == "image") {      
      var img = $('<img />',
        { class: 'image',
          src: "/uploads/" + message.data
        })     
      $('#messages').append($('<li>')
        .attr('class', '')        
        .append(img));
    }
    if (scroll)
      window.scrollTo(0, document.body.scrollHeight);
  }

  var showTextMessage = (message, scroll) => {
    appendMessage({type: "text", data: message}, true);
  }

  var showImageMessage = (message, scroll) => {
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

$(document).on('click','.image', function(e){
  e.stopImmediatePropagation()
  $(e.target).toggleClass('image-active');
});



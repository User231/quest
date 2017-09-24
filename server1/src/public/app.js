$(function () {
  
  ws = new WebSocket(`ws://${location.host}`);

  $('form').submit(function(){
    var text = $('#m').val();
    if (!text)
      return false;
    ws.send(JSON.stringify({
      userId: 333423,
      type: "text",
      data: text
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
    if (scroll)
      window.scrollTo(0, document.body.scrollHeight);
  }

  var showTextMessage = (message, scroll) => {
    appendMessage({type: "text", data: message}, true);
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

  ws.onerror = () => showTextMessage('WebSocket error');
  ws.onopen = () => showTextMessage('WebSocket connection established');
  ws.onclose = () => showTextMessage('WebSocket connection closed');
  ws.onmessage = (event) => onMessage(event.data);
});

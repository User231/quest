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
    $('#messages').append($('<li>').text(text));
    return false;
  });

  var appendMessage

  var showMessage = (event) => {
    let data = undefined;
    try {
      data = JSON.parse(event);
      if (!data || !data.type)
        return;
      if (data.type == "messages") {
        if (!data.messages || !data.messages.length)
          return;
        for(var i = data.messages.length - 1 ; i >= 0 ; i--) {
          if (!data.messages[i].type)
            return;
          if (data.messages[i].type == "text") {
            $('#messages').append($('<li>').text(data.messages[i].data));
          }
        }
        window.scrollTo(0, document.body.scrollHeight);
      }
    }
    catch(e) {
      console.log(e);
    }
  };

  ws.onerror = () => showMessage('WebSocket error');
  ws.onopen = () => showMessage('WebSocket connection established');
  ws.onclose = () => showMessage('WebSocket connection closed');
  ws.onmessage = (event) => showMessage(event.data);
});

function initMap (){
  var infowindow = new google.maps.InfoWindow();
  var markers = [];
  var counter = 0;
  var poly;
  /* fetch("/getmarkers", {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    method: "POST",
    body: ''
  })
  .then((response) => response.json())
  .then((response) => { */
      function addMarker(location, content) {  
        counter++;    
        var marker = new google.maps.Marker({
            position: location,
            map: map,
            id: counter,
            description: content
        });    
        markers.push(marker);
        var deleteButton = '<div><button id="deleteButton" data-id="' + counter + '">Delete</button></div>';
        google.maps.event.addListener(marker, 'rightclick', function () {
            infowindow.setContent(content + deleteButton);
            infowindow.open(map, marker);
        });
      }
      function deleteMarker(markerId, ws) {
        for (var i=0; i<markers.length; i++) { 
          if (!ws) {
               
            if (markers[i].id === markerId) {
              ws.send(JSON.stringify({
                type: "markers",
                messages: [{type: "removemarker", data: {
                  position: markers[i].position
                }}]
              }));
              console.log(markers[i].position, "del")
              markers[i].setMap(null);
            }
          }        
          else {
            if (markers[i].getPosition().lat() == markerId.lat && markers[i].getPosition().lng() == markerId.lng) {
              markers[i].setMap(null);
            }
          }
        }
      }
      function sendMarker (pos, content) {
        ws.send(JSON.stringify({
          type: "markers",
          messages: [{type: "addmarker", data: {
            position: pos,
            description: content
          }}]
        }));
      }
      var element = document.getElementById("map"); 
      var map = new google.maps.Map(element, {
          center: new google.maps.LatLng(50.101576, 36.289871),
          zoom: 16,
          mapTypeId: "OSM",
          mapTypeControl: false,
          streetViewControl: false,
          mapTypeControlOptions: {
              style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          }
      });
      map.mapTypes.set("OSM", 
        new google.maps.ImageMapType({
          getTileUrl: function(coord, zoom) {
            // "Wrap" x (logitude) at 180th meridian properly
            // NB: Don't touch coord.x because coord param is by reference, and changing its x property breakes something in Google's lib 
            var tilesPerGlobe = 1 << zoom;
            var x = coord.x % tilesPerGlobe;
            if (x < 0) {
                x = tilesPerGlobe+x;
            }
            // Wrap y (latitude) in a like manner if you want to enable vertical infinite scroll

            return 'https://tile.thunderforest.com/cycle/' + zoom + "/" + coord.x + "/" + coord.y + '.png' +
              '?apikey=ff9418c7fe4742a2a9cd83eeafac3fa1';
          },
          tileSize: new google.maps.Size(256, 256),
          name: "OpenStreetMap",
          maxZoom: 30
        })
      ); 

      poly = new google.maps.Polyline({
        strokeColor: '#000000',
        strokeOpacity: 1.0,
        strokeWeight: 3
      });
      poly.setMap(map);

      function addPolyPoint(event) {
        var path = poly.getPath();
        path.push(event.latLng);        
      }
      
      google.maps.event.addListener(map, 'click', function (e) {
        let showDialogNode = document.querySelector('.modalbg')
          if (!showDialogNode.classList.contains('show')) {
            showDialogNode.classList.add('show');
            document.querySelector('.button').click();
            let latLngEvent = e.latLng;

            document.querySelector(".myForm").addEventListener("submit", function (e) {
              e.preventDefault();
              sendMarker(latLngEvent, e.target.description.value);
              addMarker(latLngEvent, e.target.description.value);
              document.querySelector('#description').value = "";
              document.querySelector('.close').click();
              showDialogNode.classList.remove('show');
              //remove listeners
              var old_element = document.querySelector(".myForm");
              var new_element = old_element.cloneNode(true);
              old_element.parentNode.replaceChild(new_element, old_element);
            }); 
          }
      });
    
      google.maps.event.addListener(infowindow, 'domready', function () {
          var button = document.getElementById('deleteButton');
          var id = parseInt(button.getAttribute('data-id'));  
          button.onclick = function() {
              deleteMarker(id);
          };
      });
  //})

  var onMessage = (event) => {
    if (event == "ping")
      return ws.send("ping");
    let data = undefined;
      //
    try {
      data = JSON.parse(event);
      if (!data || !data.type)
        return;
      if (data.type == "markers") {
        if (!data.messages || !data.messages.length)
          return;
        for(var i = data.messages.length - 1 ; i >= 0 ; i--) {
          if (data.messages[i].type === "addmarker") {
            addMarker(data.messages[i].data.position, data.messages[i].data.description);
          }
          else if (data.messages[i].type === "removemarker") {
            deleteMarker(data.messages[i].data.position, true);
          }

        }
      }
      if (data.type == "polyline") {
        if (!data.messages || !data.messages.length)
          return;
        for(var i = data.messages.length - 1 ; i >= 0 ; i--) {
          addPolyPoint(data.messages[i].data);
        }
      }
      else return;
    }
    catch(e) {
      console.log(e);
    }
  };

  ws = undefined;
  flag = 0;
  delay = 1000;
  historyFlag = 0;
  
  
  var establishConnection = () => {
    var setHandlers = () => {
      ws.onerror = () => {
        console.log('WebSocket error');
        //setTimeout(() => { establishConnection(); }, delay);
      };
      ws.onopen = () => {
        console.log('WebSocket connection established');
        if (historyFlag == 0) {
          historyFlag = 1;
          ws.send("history");
        }
      }
      ws.onclose = () => { 
        console.log('WebSocket connection closed');
        setTimeout(() => { establishConnection(); }, 3000);
      }
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
}


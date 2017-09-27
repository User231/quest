function initMap (){
  fetch("/getmarkers", {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    method: "POST",
    body: ''
  })
  .then((response) => response.json())
  .then((response) => {
    var element = document.getElementById("map"); 
    var map = new google.maps.Map(element, {
        center: new google.maps.LatLng(57, 36),
        zoom: 22,
        mapTypeId: "OSM",
        mapTypeControl: false,
        streetViewControl: false,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        }
    });

    function placeMarkerResponse (latLng, map, content) {
      var marker = new google.maps.Marker({
        position: latLng,/* 
        draggable: true, */
        map: map
      });
      map.panTo(latLng);
      //var content = '0909';
      var infowindow = new google.maps.InfoWindow();
      google.maps.event.addListener(marker,'click', (function(marker,content,infowindow){
        return function() {
          infowindow.setContent(content);
          infowindow.open(map,marker);
        };
      })(marker,content,infowindow));
    }
    let responseArr = response.markersArr;
    for (var markerItem = 0; markerItem < responseArr.length; markerItem++) {
      let markerResponse = responseArr[markerItem];
      placeMarkerResponse(markerResponse.position, map, markerResponse.description);
     
    }

    //Define OSM map type pointing at the OpenStreetMap tile server
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
    //showDialogNode.classList.contains('show')
    

    
  map.addListener('click', function(e) {
    let showDialogNode = document.querySelector('.modalbg');
    let latLngEvent = e.latLng;    
    if (!showDialogNode.classList.contains('show')) {
      showDialogNode.classList.add('show');
      document.querySelector('.button').click();

      document.querySelector(".myForm").addEventListener("submit", function(e) {
        e.preventDefault();        
        placeMarkerAndPanTo(latLngEvent, map, e.target.description.value);
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
  function placeMarkerAndPanTo (latLng, map, content) {
    var marker = new google.maps.Marker({
      position: latLng,/* 
      draggable: true, */
      map: map
    });
    map.panTo(latLng);
    //var content = '0909';
    var infowindow = new google.maps.InfoWindow();
    google.maps.event.addListener(marker,'click', (function(marker,content,infowindow){ 
      fetch("/addmarker", {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        method: "POST",
        body: JSON.stringify({
          position: marker.position,
          description: content
        })
      })
      return function() {
        infowindow.setContent(content);
        infowindow.open(map,marker);
      };
    })(marker,content,infowindow));  
  }
})
}

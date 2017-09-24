var london = ol.proj.fromLonLat([36.289871, 50.101576]);
var view = new ol.View({
  center: [0, 0],
  zoom: 2
});

var map = new ol.Map({
  layers: [
    new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: 'https://{a-c}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png' +
        '?apikey=ff9418c7fe4742a2a9cd83eeafac3fa1'
      })
    })
  ],
  target: 'map',
  controls: ol.control.defaults({
    attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
      collapsible: false
    })
  }),
  view: view
});

view.animate({
  center: london,
  duration: 2000,
  zoom: 12
});

map.on("click", ev => {
  console.log(ev);
});

document.getElementById('zoom-out').onclick = function() {
  var view = map.getView();
  var zoom = view.getZoom();
  view.setZoom(zoom - 1);
};

document.getElementById('zoom-in').onclick = function() {
  var view = map.getView();
  var zoom = view.getZoom();
  view.setZoom(zoom + 1);
};


// Function to create the earthquake map
function createMap(earthquakeSites) {

    // Create the tile layer that will be the background of our map
    var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "light-v10",
      accessToken: API_KEY
    });

    // Create a baseMaps object to hold the lightmap layer
    var baseMaps = {
      "Light Map": lightMap
    };
  
    // Create an overlayMaps object to hold the earthquakeSite layer
    var overlayMaps = {
      "Earthquake Sites": earthquakeSites
    };
  
    // Create the map object with options
    var map = L.map("map", {
      center: [31.51, -95.42],
      zoom: 4,
      layers: [lightMap,earthquakeSites]
    });
  
    // Create a layer control, pass in the baseMaps and overlayMaps and 
    // add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(map);

    // Create the legend and add to the map
    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {
    
      var div = L.DomUtil.create('div', ' legend');
      labels = [];
      categories = [9,29,49,69,89,99];
      categoriesLabels = ["-10-10","10-30","30-50","50-70","70-90","90+"];
    
      for (var i = 0; i < categories.length; i++) {
          console.log(defineColor(categories[i]))
          div.innerHTML += 
          labels.push(
              '<i class="legend" style="background-color:' + defineColor(categories[i]) + ';"></i> ' +
          (categoriesLabels[i] ? categoriesLabels[i] : '+'));
      
          }
          console.log(labels)
          div.innerHTML = labels.join('<br>');
      return div;
    };
    legend.addTo(map);
    
    // Add an event listener that adds/removes the legends if the earthquakes layer is added/removed.
    map.on('overlayremove', function (eventLayer) {
      if (eventLayer.name === 'Earthquake Sites') {
        this.removeControl(legend);
      }
    });

    map.on('overlayadd', function (eventLayer) {
      // Turn on the legend...
      if (eventLayer.name === 'Earthquake Sites') {
        legend.addTo(this);
      }
    });      
  }


  // Create the earthquake circles with the size of the circle 
  // dictated by the magnitude and color dictated by the depth
  function createMarkers(response) {
    // Pull the features data 
    let features = response.features;

    // Initialize an array to hold the earthquake markers
    var earthquakeMarkers = [];

    // Loop through the stations array
    for (var index = 0; index < features.length; index++) {

      // Extract all of the data we will need about the earthquake
      let longitude = features[index].geometry.coordinates[1];
      let latitude = features[index].geometry.coordinates[0];
      let depth = features[index].geometry.coordinates[2];
      let place = features[index].properties.place;
      let mag = features[index].properties.mag;
      let time = features[index].properties.time;

      // Define the color dictated by the depth
      let depthCircleColor = defineColor(depth)

      // For each earthquake, create a marker and bind a popup with the 
      // place, time, magnitude and depth
      var earthquakeMarker = L.circleMarker([longitude, latitude],{ 
        radius: mag * 4,
        color: depthCircleColor,
        fillColor: depthCircleColor,
        fillOpacity: 0.75})
        .bindPopup("<h3>" + place + "<h3><h3>Time: " + new Date(time) + "<h3><h3>Magnitude: " + mag + "<h3><h3>Depth: " + depth + "</h3>");
  
      // Add the marker to the earthquakeMarkers array
      earthquakeMarkers.push(earthquakeMarker);
    }
    console.log(earthquakeMarkers);
    // Create a layer group made from the earthquakeMarkers array, pass it into the createMap function
    createMap(L.layerGroup(earthquakeMarkers));
  }
  
  // Function to define the color
  function defineColor(earthquakeDepth){
    let circleColor;
    if (earthquakeDepth < 10){
      circleColor = "#A3F600";
    } else if (earthquakeDepth < 30) {
      circleColor = "#DCF400";
    } else if (earthquakeDepth < 50) {
      circleColor = "#F7DB11";
    } else if (earthquakeDepth < 70) {
      circleColor = "#FDB72A";
    } else if (earthquakeDepth < 90) {
      circleColor = "#FCA35D";
    } else {
      circleColor = "#FF5F65";
    }
    return circleColor;
  }
  
  // Perform an API call to the Earthquake data and  create a map.
  d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", createMarkers);
  
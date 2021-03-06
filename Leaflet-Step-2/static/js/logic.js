
// Function to create the earthquake map
function createMap(earthquakeSites,plates) {

    // Create the light map tile layer
    var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "light-v10",
      accessToken: API_KEY
    });

    // Create the dark map tile layer
    var darkMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "dark-v10",
      accessToken: API_KEY
    });

    // Create the streets map tile layer
    var streetMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/streets-v11",
      accessToken: API_KEY
     });

     // Create the outdoors map tile layer
     var outdoorsMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/outdoors-v11",
      accessToken: API_KEY
     });

     // Create the satellite map tile layer
     var satelliteStreetsMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/satellite-streets-v11",
      accessToken: API_KEY
     });

    // Create a baseMaps object to hold the base maps
    var baseMaps = {
      "Light Map": lightMap,
      "Dark Map":darkMap,
      "Street Map":streetMap,
      "Outdoors Map":outdoorsMap,
      "Satellite Street Map":satelliteStreetsMap
    };
  
    // Create an overlayMaps object to hold the earthquakeSite and tectonic 
    // plates layers
    var overlayMaps = {
      "Earthquake Sites": earthquakeSites,
      "Tectonic Plates": plates
    };
  
    // Create the map object with options
    var map = L.map("map", {
      center: [31.51, -95.42],
      zoom: 4,
      layers: [lightMap,earthquakeSites,plates]
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
          div.innerHTML += 
          labels.push(
              '<i class="legend" style="background-color:' + defineColor(categories[i]) + ';"></i> ' +
          (categoriesLabels[i] ? categoriesLabels[i] : '+'));
      
          }
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
    let earthquakeMarkers = [];

    // Loop through the features
    for (var index = 0; index < features.length; index++) {

      // Extract all of the data we will need about the earthquake
      let longitude = features[index].geometry.coordinates[0];
      let latitude = features[index].geometry.coordinates[1];
      let depth = features[index].geometry.coordinates[2];
      let place = features[index].properties.place;
      let mag = features[index].properties.mag;
      let time = features[index].properties.time;

      // Define the color dictated by the depth
      let depthCircleColor = defineColor(depth)

      // For each earthquake, create a marker and bind a popup with the 
      // place, time, magnitude and depth
      var earthquakeMarker = L.circleMarker([latitude,longitude],{ 
        radius: mag * 4,
        color: depthCircleColor,
        fillColor: depthCircleColor,
        fillOpacity: 0.75})
        .bindPopup("<h3>" + place + "<h3><h3>Time: " + new Date(time) + "<h3><h3>Magnitude: " + mag + "<h3><h3>Depth: " + depth + "</h3>");
  
      // Add the marker to the earthquakeMarkers array
      earthquakeMarkers.push(earthquakeMarker);
    }
      // Return the earthquakeMarkers
      return earthquakeMarkers;
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
  d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function(earthquakeResponse) {

    // Create the earthquake layer
    let earthquakeMarkers = createMarkers(earthquakeResponse);
    let earthquakeLayer = L.layerGroup(earthquakeMarkers)

    // Create the tectonic plates layher
    let platesLayer = new L.layerGroup();
 
    // Get the tectonic plate information
    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json", function(response) {
      
      // Update the plates layer with the tectonic plates data.
      function plateStyle(feature) {
        return {
          weight: 3,
          color: "red"
        };
      }
    
      L.geoJSON(response, {
        style: plateStyle
      }).addTo(platesLayer);
    })

    // Create the map with the earthquake and plates layers  
    createMap(earthquakeLayer,platesLayer);
  });
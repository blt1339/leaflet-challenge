function createMap(earthquakeSites,plates) {

    // Create the tile layer that will be the background of our map
    var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "light-v10",
      accessToken: API_KEY
    });

    var darkMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "dark-v10",
      accessToken: API_KEY
    });

    var streetMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/streets-v11",
      accessToken: API_KEY
     });

     var outdoorsMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/outdoors-v11",
      accessToken: API_KEY
     });
     var satelliteStreetsMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/satellite-streets-v11",
      accessToken: API_KEY
     });

    // Create a baseMaps object to hold the lightmap layer
    var baseMaps = {
      "Light Map": lightMap,
      "Dark Map":darkMap,
      "Street Map":streetMap,
      "Outdoors Map":outdoorsMap,
      "Satellite Street Map":satelliteStreetsMap
    };
  
    // Create an overlayMaps object to hold the earthquakeSite layer
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
  
    // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(map);

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
  
  function createMarkers(response) {
    // Pull the "stations" property off of response.data
    let features = response.features;

    // Initialize an array to hold bike markers
    var earthquakeMarkers = [];

    // Loop through the features
    for (var index = 0; index < features.length; index++) {
      let longitude = features[index].geometry.coordinates[1];
      let latitude = features[index].geometry.coordinates[0];
      let depth = features[index].geometry.coordinates[2];
      let place = features[index].properties.place;
      let mag = features[index].properties.mag;
      let time = features[index].properties.time;

      let depthCircleColor = defineColor(depth)
      // For each station, create a marker and bind a popup with the station's name
      var earthquakeMarker = L.circleMarker([longitude, latitude],{ 
        radius: mag * 4,
        color: depthCircleColor,
        fillColor: depthCircleColor,
        fillOpacity: 0.75})
        .bindPopup("<h3>" + place + "<h3><h3>Time: " + new Date(time) + "<h3><h3>Magnitude: " + mag + "<h3><h3>Depth: " + depth + "</h3>");
  
      // Add the marker to the bikeMarkers array
      earthquakeMarkers.push(earthquakeMarker);
    }
    // // Create a layer group made from the earthquakeMarkers array, pass it into the createMap function
    // createMap(L.layerGroup(earthquakeMarkers));
      return earthquakeMarkers;
  }
  
  function defineColor(mag){
    let circleColor;
    if (mag < 10){
      circleColor = "#A3F600";
    } else if (mag < 30) {
      circleColor = "#DCF400";
    } else if (mag < 50) {
      circleColor = "#F7DB11";
    } else if (mag < 70) {
      circleColor = "#FDB72A";
    } else if (mag < 90) {
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
    // d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json", function(platesResponse) {
      // Create a layer group made from the earthquakeMarkers array, pass it into the createMap function
      // var platesCoordinates = [];


      // // Loop through the features
      // for (let index = 0; index < platesResponse.features.length; index++) {
      //   for (let coordinatesIndex = 0; coordinatesIndex < platesResponse.features[index].geometry.coordinates.length; coordinatesIndex++ ) {
      //     let singleCoordinate = platesResponse.features[index].geometry.coordinates[coordinatesIndex];
      //     platesCoordinates.push(singleCoordinate);
    
      //   }      
      // }
      // console.log(platesCoordinates);
      // let plates = new L.Polyline([platesCoordinates], {
      //   color: "yellow",
      //   fillColor: "yellow",
      //   fillOpacity: 0.75
      // });
      // console.log(plates);

      let platesLayer = new L.layerGroup();


      // Get the tectonic plate information
      d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json", function(response) {
        
        // Set the tectonic plates stype
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

      
      createMap(earthquakeLayer,platesLayer);
    // });
  });
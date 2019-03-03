/* Map of GeoJSON data from MegaCities.geojson */

////function to instantiate the Leaflet map
//function createMap(){
//    //create the map
//    var map = L.map('map', {
//        center: [20, 0],
//        zoom: 2
//    });
//
//    //add OSM base tilelayer
//    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
//    }).addTo(map);
//
//    //call getData function
//    getData(map);
//};

//function to retrieve the data and place it on the map

//function getData(map){
//    //load the data
//    $.ajax("data/MegaCities.geojson", {
//        dataType: "json",
//        success: function(response){
//
//            //create a Leaflet GeoJSON layer and add it to the map
//            L.geoJson(response).addTo(map);
//        }
//    });
//};


//function getData(map){
////Example 2.3 line 22...load the data
//    $.ajax("data/MegaCities.geojson", {
//        dataType: "json",
//        success: function(response){
//            //create marker options
//            var geojsonMarkerOptions = {
//                radius: 8,
//                fillColor: "#ff7800",
//                color: "#000",
//                weight: 1,
//                opacity: 1,
//                fillOpacity: 0.8
//            };
//
//            //create a Leaflet GeoJSON layer and add it to the map
//            L.geoJson(response, {
//                pointToLayer: function (feature, latlng){
//                    return L.circleMarker(latlng, geojsonMarkerOptions);
//                }
//            }).addTo(map);
//        }
//    });
//};

//added at Example 2.3 line 20...function to attach popups to each mapped feature
//function onEachFeature(feature, layer) {
//    //no property named popupContent; instead, create html string with all properties
//    var popupContent = "";
//    if (feature.properties) {
//        //loop to add feature property names and values to html string
//        for (var property in feature.properties){
//            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
//        }
//        layer.bindPopup(popupContent);
//    };
//};
//
////function to retrieve the data and place it on the map
//function getData(map){
//    //load the data
//    $.ajax("data/MegaCities.geojson", {
//        dataType: "json",
//        success: function(response){
//
//            //create a Leaflet GeoJSON layer and add it to the map
//            L.geoJson(response, {
//                onEachFeature: onEachFeature
//            }).addTo(map);
//        }
//    });
//};


//function getData(map){
//    //load the data
//    $.ajax("data/MegaCities.geojson", {
//        dataType: "json",
//        success: function(response){
//            //examine the data in the console to figure out how to construct the loop
//            console.log(response)
//
//            //create an L.markerClusterGroup layer
//            var markers = L.markerClusterGroup();
//
//            //loop through features to create markers and add to MarkerClusterGroup
//            for (var i = 0; i < response.features.length; i++) {
//                var a = response.features[i];
//                //add properties html string to each marker
//                var properties = "";
//                for (var property in a.properties){
//                    properties += "<p>" + property + ": " + a.properties[property] + "</p>";
//                };
//                var marker = L.marker(new L.LatLng(a.geometry.coordinates[1], a.geometry.coordinates[0]), { properties: properties });
//                //add a popup for each marker
//                marker.bindPopup(properties);
//                //add marker to MarkerClusterGroup
//                markers.addLayer(marker);
//            }
//
//            //add MarkerClusterGroup to map
//            map.addLayer(markers);
//        }
//    });
//};

//$(document).ready(createMap);

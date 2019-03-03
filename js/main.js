
$(document).ready(createMap);


//Toggling elements
var layerControl = null;
var backgroundMap = null;
var map = null;

var layerGroup = L.layerGroup();

//Creates maps
function createMap(){
    backgroundMap = L.esri.basemapLayer("DarkGray");

    map = L.map('map', {
        center: [20, 0],
        zoom: 2,
        layers: [backgroundMap]
    });
    layerGroup.addTo(map);
    
    getData(map);
};

//Create heatmap with toggling options
$.getJSON("data/Heatmap.geojson",function(data){
    var locations = data.features.map(function(eq) {
      // the heatmap plugin wants an array of each location
      var location = eq.geometry.coordinates.reverse();
      location.push(0.5);
      return location; 
    });
    var heat = L.heatLayer(locations, { 
        minOpacity: 0.3,
        radius: 20,
        gradient: {
            0.1: 'purple',
            0.2: 'cyan',
            0.3: '#2b83ba',
            0.4: 'green',
            0.6: 'yellow',
            0.8: 'orange',
            0.9: '#d7191c',
            1: 'red'
        } 
    });
    
    layerControl = L.control.layers(
        null,
        {"Earthquake Danger Zones": heat, "Major Earthquakes": layerGroup}
      ).addTo(map);

});


//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    return (attValue/50)*10;


};


//Add circle markers for point features to the map
function createPropSymbols(data, map){
    layerGroup.clearLayers();
    //create marker options
    var attribute = "Mag";
    var attribute1 = "Location"
    var attribute2 = "Date (UTC)"
    var attribute3 = "Time (UTC)"
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {     
            //Step 5: For each feature, determine its value for the selected attribute
            var attValue = Number(feature.properties["Mag"]);
            if (attValue > 8.9){
                var area = (attValue/40)*300;

            }else if (attValue>8.4 && attValue<9.0){
                var area = (attValue/60)*300; 
            }else if (attValue < 8.5){
                var area = (attValue/80)*300; 
            }
            
//            var area = (attValue/80)*300;
            var geojsonMarkerOptions = L.icon({
                iconUrl: 'img/earthquakesymbol100.png',
                iconSize: [area,area], // size of the icon       
            });
            
            

            
             //build popup content string starting with city...Example 2.1 line 24
            var popupContent = "<p><b>Location:</b> " + feature.properties[attribute1] + "</p>" + 
                               "<p><b>Magnitude:</b> " + feature.properties[attribute] + "</p>"+
                               "<p><b>Date:</b> " + feature.properties[attribute2] + "</p>" +
                               "<p><b>Time (UTC):</b> " + feature.properties[attribute3] + "</p>";
                    
            
            //Step 6: Give each feature's circle marker a radius based on its attribute value
            geojsonMarkerOptions.area = calcPropRadius(attValue);

            //create icon markers
            return L.marker(latlng, {icon: geojsonMarkerOptions}).bindPopup(popupContent);


        }
    }).addTo(layerGroup);
};

//Query point data based on decade, and import data
function getData(map , year = ''){
    //load the data
    if(year != ''){
        var min_year = parseInt(year);
        var max_year = min_year + 10;    
    }else{
        var min_year = 0;
        var max_year = 0;
    } 
    $.ajax("data/MegaEarthquakes.geojson", {
        dataType: "json",
        success: function(response){
            var new_array = [];
            var new_response = {};
            new_response['type'] = 'FeatureCollection';
            $.each(response, function(key, value) {
                if(key == 'features') {
                    $.each(value, function(key1, value1) {
                        var data_yr  = value1['properties']['Date (UTC)'].slice(-4);
                        if(data_yr >= min_year && data_yr <= max_year   ){

                            new_array.push(value1);     
                        }
                    });                 
                }               
            });
            new_response['features'] = new_array;
            var res = {};
            if(year == ''){ 
                res = response; 
                createPropSymbols(res, map);
                createSequenceControls(map);
                createLegend(map);

            
                    
            }else{
                
                res = new_response;
                createPropSymbols(res, map);    
            }  
        }
    });
};

//Create new sequence controls
function createSequenceControls(map){   
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },
        onAdd: function (map) {
            // create the control container div with a particular class name  
            var container = L.DomUtil.create('div', 'sequence-control-container');
            var rangeSlider = $('<input id = "range-slider" class="range-slider" type="range">').appendTo(container);
            var labels = $('<ul id="range-labels">'+
                                    '<li class="active selected">1900-1910</li>'+
                                    '<li>1910-1920</li>'+
                                    '<li>1920-1930</li>'+
                                    '<li>1930-1940</li>'+
                                    '<li>1940-1950</li>'+
                                    '<li>1950-1960</li>'+
                                    '<li>1960-1970</li>'+
                                    '<li>1970-1980</li>'+
                                    '<li>1980-1990</li>'+
                                    '<li>1990-2000</li>'+
                                    '<li>2000-2010</li>'+
                                    '<li>2010-2019</li>'+
                                '</ul>').appendTo(container);
            rangeSlider.attr({
                max: 2010,
                min: 1900,
                value: 0,
                step: 10
            });     

            
            function sequenceControlButtoncallback(){
                //get the old index value
                var index = $('.range-slider').val();
                
                //Increment or decrement depending on button clicked
                if ($(this).attr('id') == 'forward'){
                    
                    index = parseInt(index) + 10;

                    //If past the last attribute, wrap around to first attribute
                    index = index > 2020 ? 1900 : index;
                    getData(map, index);
                } else if ($(this).attr('id') == 'reverse'){
                    index = parseInt(index)-10;
                    //If past the first attribute, wrap around to last attribute
                    index = index < 1900 ? 2020 : index;
                    getData(map, index);
                };
                //Update slider
                $('.range-slider').val(index);
        
        
            };
            
            //Input listener for slider
            rangeSlider.on('input', function(){
                //Get the new index value
                var index = $(this).val();
                getData(map, index);
            });
            
            //Kill any mouse event listeners on the map
            $(container).on('mousedown dblclick', function(e){
                L.DomEvent.disableClickPropagation(container);
            });

            $(container).on('mousedown dblclick', function(e){
                map.dragging.disable;
            });
            $(container).on('mouseup', function(e){
                map.dragging.enable;        
            });

            return container;
        }
    });

    map.addControl(new SequenceControl());
    
}

//create the legend
function createLegend(map){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            //add temporal legend div to container
            $(container).append('<div id="temporal-legend">')

            //SVG elements
            var svg = '<svg id="attribute-legend" width="150px" height="230px">';
            
            svg +=  '<rect class="title-rect" id="symbol" fill="#000000" fill-opacity="0.8" x="0" y="0" height="40" width ="200"/>' +
                    '<text class="legend-title" x="35" y="25" fill="white" font-weight="bold" font-size="16">Magnitude</text>'+
                
                    '<text class="legend-title" x="80" y="80" fill="white" font-weight="bold" font-size="12">9.0 - 9.5</text>'+
                    '<circle class="legend-circle" id="symbol" fill="#b5b5b5" fill-opacity="0.8" stroke="#C61414" stroke-width="1%" cx="40" cy="75" r="30"/>' +
                    '<circle class="legend-circle" id="symbol" fill="#b5b5b5" fill-opacity="0.8" stroke="#C61414" stroke-width="1%" cx="40" cy="75" r="25"/>'+
                    '<circle class="legend-circle" id="symbol" fill="#b5b5b5" fill-opacity="0.8" stroke="#C61414" stroke-width="1%" cx="40" cy="75" r="20"/>' +
                    '<circle class="legend-circle" id="symbol" fill="#b5b5b5" fill-opacity="0.8" stroke="#C61414" stroke-width="1%" cx="40" cy="75" r="15"/>'+
                    '<circle class="legend-circle" id="symbol" fill="#b5b5b5" fill-opacity="0.8" stroke="#C61414" stroke-width="1%" cx="40" cy="75" r="10"/>'+
                    '<circle class="legend-circle" id="symbol" fill="#b5b5b5" fill-opacity="0.8" stroke="#C61414" stroke-width="1%" cx="40" cy="75" r="5"/>'+
                
                    '<text class="legend-title" x="80" y="140" fill="white" font-weight="bold" font-size="12">8.5 - 8.9</text>'+
                    '<circle class="legend-circle" id="symbol" fill="#b5b5b5" fill-opacity="0.8" stroke="#C61414" stroke-width="1%" cx="40" cy="140" r="27"/>' +
                    '<circle class="legend-circle" id="symbol" fill="#b5b5b5" fill-opacity="0.8" stroke="#C61414" stroke-width="1%" cx="40" cy="140" r="22"/>'+
                    '<circle class="legend-circle" id="symbol" fill="#b5b5b5" fill-opacity="0.8" stroke="#C61414" stroke-width="1%" cx="40" cy="140" r="17"/>' +
                    '<circle class="legend-circle" id="symbol" fill="#b5b5b5" fill-opacity="0.8" stroke="#C61414" stroke-width="1%" cx="40" cy="140" r="12"/>'+
                    '<circle class="legend-circle" id="symbol" fill="#b5b5b5" fill-opacity="0.8" stroke="#C61414" stroke-width="1%" cx="40" cy="140" r="7"/>'+
                    '<circle class="legend-circle" id="symbol" fill="#b5b5b5" fill-opacity="0.8" stroke="#C61414" stroke-width="1%" cx="40" cy="140" r="3"/>'+
                
                    '<text class="legend-title" x="80" y="200" fill="white" font-weight="bold" font-size="12">8.0 - 8.4</text>'+
                   '<circle class="legend-circle" id="symbol" fill="#b5b5b5" fill-opacity="0.8" stroke="#C61414" stroke-width="1%" cx="40" cy="200" r="22"/>' +
                    '<circle class="legend-circle" id="symbol" fill="#b5b5b5" fill-opacity="0.8" stroke="#C61414" stroke-width="1%" cx="40" cy="200" r="17"/>'+
                    '<circle class="legend-circle" id="symbol" fill="#b5b5b5" fill-opacity="0.8" stroke="#C61414" stroke-width="1%" cx="40" cy="200" r="12"/>' +
                    '<circle class="legend-circle" id="symbol" fill="#b5b5b5" fill-opacity="0.8" stroke="#C61414" stroke-width="1%" cx="40" cy="200" r="7"/>'+
                    '<circle class="legend-circle" id="symbol" fill="#b5b5b5" fill-opacity="0.8" stroke="#C61414" stroke-width="1%" cx="40" cy="200" r="2"/>';
            
        
            svg += "</svg>";

            //add attribute legend svg to container
            $(container).append(svg);

            return container;
        }
    });

    map.addControl(new LegendControl());
};






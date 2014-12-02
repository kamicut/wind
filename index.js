var d3 = require('d3');
var buildGrid = require('./lib/vectors.js')

d3.json('data/json/wind-surface-20140919.json', function(file) {
    var windData = {
        field: "vector",
        type: "wind",
        header: file[0].header,
        data: function(i) {
            //uData, vData
            return [file[0].data[i], file[1].data[i]]
        }
    }

    //Grid where we can interpolate
    var grid = buildGrid(windData);
    window.grid = grid;
    
    //Write interpolated vector field to document body
    kingsfireCoords = [-121.5, 37.8, -118.7, 40];

    document.body.insertAdjacentHTML('beforeend', 'lon,lat,u,v,mag<br/ >')
    for (var i=kingsfireCoords[0]; i<=kingsfireCoords[2];i+=0.1) { 
        for (var j=kingsfireCoords[1]; j<=kingsfireCoords[3]; j+= 0.1) {
            var vector = grid.interpolate(i,j);
            document.body.insertAdjacentHTML('beforeend',i +','+j+','+vector[0]+','+vector[1]+','+vector[2]+'<br />') 
        }
    }
})  
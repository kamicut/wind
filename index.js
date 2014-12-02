var d3 = require('d3');
var buildGrid = require('./vectors.js')

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
    // grid.forEachPoint(function(a,b,c) {
    //     document.body.insertAdjacentHTML('beforeend', a + ',' + b + ',' + c[0] + ',' + c[1] + ',' + Math.sqrt(c[0] * c[0] + c[1] * c[1]) + '<br />')
    // })
})  
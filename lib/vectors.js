//buildGrid from earth/cambecc
var micro = require('./micro.js')
module.exports = function buildGrid(data) {
    var header = data.header;
    var L0 = header.lo1, P0 = header.la1;  // the grid's origin (e.g., 0.0E, 90.0N)
    var DL = header.dx, DP = header.dy;    // distance between grid points (e.g., 2.5 deg lon, 2.5 deg lat)
    var ni = header.nx, nj = header.ny;    // number of grid points W-E and N-S (e.g., 144 x 73)
    var date = new Date(header.refTime);
    date.setHours(date.getHours() + header.forecastTime);

    // Scan mode 0 assumed. Longitude increases from L0, and latitude decreases from P0.
    // http://www.nco.ncep.noaa.gov/pmb/docs/grib2/grib2_table3-4.shtml
    var grid = [], p = 0;
    var isContinuous = Math.floor(ni * DL) >= 360;
    for (var j = 0; j < nj; j++) {
        var row = [];
        for (var i = 0; i < ni; i++, p++) {
            row[i] = data.data(p);
        }
        if (isContinuous) {
            // For wrapped grids, duplicate first column as last column to simplify interpolation logic
            row.push(row[0]);
        }
        grid[j] = row;
    }

    function interpolate(L, P) {
        var i = micro.floorMod(L - L0, 360) / DL;  // calculate longitude index in wrapped range [0, 360)
        var j = (P0 - P) / DP;                 // calculate latitude index in direction +90 to -90

        //         1      2           After converting L and P to fractional grid indexes i and j, we find the
        //        fi  i   ci          four points "G" that enclose point (i, j). These points are at the four
        //         | =1.4 |           corners specified by the floor and ceiling of i and j. For example, given
        //      ---G--|---G--- fj 8   i = 1.4 and j = 8.3, the four surrounding grid points are (1, 8), (2, 8),
        //    j ___|_ .   |           (1, 9) and (2, 9).
        //  =8.3   |      |
        //      ---G------G--- cj 9   Note that for wrapped grids, the first column is duplicated as the last
        //         |      |           column, so the index ci can be used without taking a modulo.

        var fi = Math.floor(i), ci = fi + 1;
        var fj = Math.floor(j), cj = fj + 1;

        var row;
        if ((row = grid[fj])) {
            var g00 = row[fi];
            var g10 = row[ci];
            if (micro.isValue(g00) && micro.isValue(g10) && (row = grid[cj])) {
                var g01 = row[fi];
                var g11 = row[ci];
                if (micro.isValue(g01) && micro.isValue(g11)) {
                    // All four points found, so interpolate the value.
                    return micro.bilinearInterpolateVector(i - fi, j - fj, g00, g10, g01, g11);
                }
            }
        }
        // console.log("cannot interpolate: " + L + "," + P + ": " + fi + " " + ci + " " + fj + " " + cj);
        return null;
    }

    return {
        date: date,
        interpolate: interpolate,
        forEachPoint: function(cb) {
            for (var j = 0; j < nj; j++) {
                var row = grid[j] || [];
                for (var i = 0; i < ni; i++) {
                    cb(micro.floorMod(180 + L0 + i * DL, 360) - 180, P0 - j * DP, row[i]);
                }
            }
        }
    };
}
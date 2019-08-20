define(["require", "exports", "esri/geometry", "esri/geometry/geometryEngine", "esri/geometry/Point", "../../support/interpolate"], function (require, exports, geometry_1, geometryEngine, Point, interpolate) {
    "use strict";
    var PolylineSections = /** @class */ (function () {
        function PolylineSections(polyline) {
            var _this = this;
            this.xs = [];
            this.dxs = [];
            this.points = [];
            this.createPolyline = function (x) {
                var xs = _this.xs;
                var length = xs.length;
                var start = length ? xs[0] : 0;
                var end = length ? xs[length - 1] : 0;
                var xAbs = start + (end - start) * x;
                var spatialReference = _this.spatialReference;
                var path = [];
                if (2 <= length) {
                    var i = 0;
                    path.push(_this.points[0]);
                    while (i < xs.length - 1 && xAbs > xs[i + 1]) {
                        i++;
                        path.push(_this.points[i]);
                    }
                    // Interpolate last point
                    var dx = _this.dxs[i];
                    var p1 = _this.points[i];
                    var p2 = _this.points[i + 1];
                    path.push(interpolate(p1, p2, xAbs - xs[i], dx) || []);
                }
                return new geometry_1.Polyline({
                    paths: [path],
                    spatialReference: spatialReference,
                });
            };
            this.newPoint = function (coords) {
                var x = coords[0];
                var y = coords[1];
                var z = coords[2];
                return new Point({
                    spatialReference: _this.spatialReference,
                    x: x,
                    y: y,
                    z: z
                });
            };
            var coordinates = polyline.paths.length ? polyline.paths[0] : [];
            this.spatialReference = polyline.spatialReference;
            // Compute distances between given coordinates
            var prevPoint = null;
            coordinates.forEach(function (coords, index) {
                _this.points.push([].concat(coords));
                var point = _this.newPoint(coords);
                if (index === 0) {
                    _this.xs.push(0);
                }
                else {
                    var distance = geometryEngine.distance(prevPoint, point, undefined);
                    _this.dxs.push(distance);
                    _this.xs.push(distance + _this.xs[index - 1]);
                }
                prevPoint = point;
            });
        }
        return PolylineSections;
    }());
    return PolylineSections;
});

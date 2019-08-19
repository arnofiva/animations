define(["require", "exports", "esri/Camera", "esri/geometry/Point"], function (require, exports, Camera, Point) {
    "use strict";
    var delta = function (a, b, modulo) {
        var d = b - a;
        if (modulo) {
            if (d > modulo / 2) {
                d = -d + modulo;
            }
            else if (d < -modulo / 2) {
                d = d + modulo;
            }
        }
        return d;
    };
    var numberLerp = function (a, b, t, total, modulo) {
        if (!total) {
            total = 1.0;
        }
        else if (total === 0) {
            throw new Error("Can not interpolate between two values where the distance is 0");
        }
        // Vector
        var d = delta(a, b, modulo);
        // Length
        var s = t / total;
        return a + d * s;
    };
    var objectLerp = function (a, b, t, total, modulo) {
        if (a.declaredClass && a.declaredClass === b.declaredClass) {
            if (a.declaredClass === "esri.Camera") {
                var cameraA = a;
                var cameraB = b;
                return new Camera({
                    heading: lerp(cameraA.heading, cameraB.heading, t, total, 360),
                    position: lerp(cameraA.position, cameraB.position, t, total),
                    tilt: lerp(cameraA.tilt, cameraB.tilt, t, total),
                });
            }
            else if (a.declaredClass === "esri.geometry.Point") {
                var pointA = a;
                var pointB = b;
                var spatialReference = pointA.spatialReference;
                return new Point({
                    spatialReference: spatialReference,
                    x: lerp(pointA.x, pointB.x, t, total, modulo),
                    y: lerp(pointA.y, pointB.y, t, total, modulo),
                    z: lerp(pointA.z, pointB.z, t, total, modulo),
                });
            }
        }
        throw new Error("Values a and b do not have compatible types for interpolation");
    };
    var arrayLerp = function (a, b, t, total, modulo) {
        if (a.length === b.length) {
            return a.map(function (value, index) { return lerp(value, b[index], t, total, modulo); });
        }
        throw new Error("Value arrays must have same length for interpolation");
    };
    var lerp = function (a, b, t, total, modulo) {
        var typeofA = typeof a;
        if (typeof b === typeofA) {
            if (typeofA === "number") {
                return numberLerp(a, b, t, total, modulo);
            }
            else if (typeofA === "object") {
                if (Array.isArray(a) && Array.isArray(b)) {
                    return arrayLerp(a, b, t, total, modulo);
                }
                else {
                    return objectLerp(a, b, t, total);
                }
            }
            else if (a === undefined) {
                return undefined;
            }
        }
        throw new Error("Values a and b do not have compatible types for interpolation");
    };
    return lerp;
});

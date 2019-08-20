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
                    heading: numberLerp(cameraA.heading, cameraB.heading, t, total, 360),
                    position: objectLerp(cameraA.position, cameraB.position, t, total),
                    tilt: numberLerp(cameraA.tilt, cameraB.tilt, t, total),
                });
            }
            else if (a.declaredClass === "esri.geometry.Point") {
                var pointA = a;
                var pointB = b;
                var spatialReference = pointA.spatialReference;
                return new Point({
                    spatialReference: spatialReference,
                    x: numberLerp(pointA.x, pointB.x, t, total, modulo),
                    y: numberLerp(pointA.y, pointB.y, t, total, modulo),
                    z: numberLerp(pointA.z, pointB.z, t, total, modulo),
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
    var isDate = function (date) {
        return date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date);
    };
    var dateLerp = function (a, b, t, total) {
        var aTime = a.getTime();
        var bTime = b.getTime();
        return new Date(numberLerp(aTime, bTime, t, total));
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
                else if (isDate(a) && isDate(b)) {
                    return dateLerp(a, b, t, total);
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

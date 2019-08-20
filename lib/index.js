define(["require", "exports", "./layers/LineLayerAnimation", "./support/interpolate"], function (require, exports, LineLayerAnimation, interpolate) {
    "use strict";
    return {
        LineLayerAnimation: LineLayerAnimation,
        interpolate: interpolate,
    };
});

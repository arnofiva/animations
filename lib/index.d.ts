/// <reference types="arcgis-js-api" />
import LineLayerAnimation = require("./layers/LineLayerAnimation");
declare const _default: {
    LineLayerAnimation: typeof LineLayerAnimation;
    interpolate: <T extends number | number[] | Date | __esri.Point | __esri.Camera>(a: T, b: T, t: number, total?: number | undefined, modulo?: number | undefined) => T | undefined;
};
export = _default;

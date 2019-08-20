/// <reference types="arcgis-js-api" />
import { Polyline } from "esri/geometry";
declare class PolylineSections {
    private spatialReference;
    private xs;
    private dxs;
    private points;
    constructor(polyline: Polyline);
    createPolyline: (x: number) => __esri.Polyline;
    private newPoint;
}
export = PolylineSections;

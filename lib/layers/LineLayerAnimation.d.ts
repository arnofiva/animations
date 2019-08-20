/// <reference types="arcgis-js-api" />
import Accessor = require("esri/core/Accessor");
import * as Graphic from "esri/Graphic";
import * as FeatureLayer from "esri/layers/FeatureLayer";
import * as GeoJSONLayer from "esri/layers/GeoJSONLayer";
declare type SourceLayerType = FeatureLayer | GeoJSONLayer;
declare const LineLayerAnimation_base: typeof Accessor;
declare class LineLayerAnimation extends LineLayerAnimation_base {
    sourceLayer: SourceLayerType;
    private resolveAnimationLayer;
    private rejectAnimationLayer;
    private animationLayerPromise;
    private animationGraphics;
    private sections;
    private seekGraphicDebounce;
    getLineGraphic(animatedGraphic: Graphic): IPromise<Graphic>;
    whenAnimatedLayer(): IPromise<FeatureLayer>;
    seek(progress: number, objectId: number): IPromise;
    private seekGraphicSequencial;
    private queryLineGraphic;
    private getAnimationGraphic;
    private initializeAnimationLayer;
}
export = LineLayerAnimation;

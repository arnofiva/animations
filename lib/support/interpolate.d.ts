/// <reference types="arcgis-js-api" />
import * as Camera from "esri/Camera";
import * as Point from "esri/geometry/Point";
declare type LerpObject = Point | Camera;
declare type LerpValue = number | number[] | Date | LerpObject;
declare const lerp: <T extends LerpValue>(a: T, b: T, t: number, total?: number | undefined, modulo?: number | undefined) => T | undefined;
export = lerp;

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "esri/core/Accessor", "esri/core/accessorSupport/decorators", "esri/core/promiseUtils", "esri/layers/FeatureLayer", "esri/renderers/support/jsonUtils", "./support/PolylineSections"], function (require, exports, Accessor, decorators_1, promiseUtils, FeatureLayer, jsonUtils, PolylineSections) {
    "use strict";
    var LINE_OBJECT_ID_FIELD = "_line_objectid";
    var createAnimationLayer = function (layer) {
        var renderer = layer.renderer;
        if (renderer) {
            renderer = jsonUtils.fromJSON(renderer.toJSON());
        }
        var elevationInfo = layer.elevationInfo;
        // Try to invoke internal clone()
        if (elevationInfo && typeof elevationInfo.clone === "function") {
            elevationInfo = elevationInfo.clone();
        }
        return new FeatureLayer({
            definitionExpression: layer.definitionExpression,
            elevationInfo: elevationInfo,
            fields: [
                {
                    name: "OBJECTID",
                    type: "oid"
                },
                {
                    name: LINE_OBJECT_ID_FIELD,
                    type: "long"
                }
            ],
            geometryType: "polyline",
            labelingInfo: layer.labelingInfo ? layer.labelingInfo.map(function (info) { return info.clone(); }) : undefined,
            labelsVisible: layer.labelsVisible,
            legendEnabled: layer.legendEnabled,
            listMode: layer.listMode,
            maxScale: layer.maxScale,
            minScale: layer.maxScale,
            objectIdField: "OBJECTID",
            opacity: layer.opacity,
            outFields: ["*"],
            popupEnabled: layer.popupEnabled,
            popupTemplate: layer.popupTemplate ? layer.popupTemplate.clone() : undefined,
            renderer: renderer,
            source: [],
            spatialReference: layer.spatialReference,
            title: layer.title,
        });
    };
    var LineLayerAnimation = /** @class */ (function (_super) {
        __extends(LineLayerAnimation, _super);
        function LineLayerAnimation() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.resolveAnimationLayer = null;
            _this.rejectAnimationLayer = null;
            _this.animationLayerPromise = promiseUtils.create(function (resolve, reject) {
                _this.resolveAnimationLayer = resolve;
                _this.rejectAnimationLayer = reject;
            });
            _this.animationGraphics = new Map();
            _this.sections = new Map();
            _this.seekGraphicDebounce = promiseUtils.debounce(function (progress, objectId) { return _this.seekGraphicSequencial(progress, objectId); });
            _this.queryLineGraphic = function (objectId) {
                var layer = _this.sourceLayer;
                if (!layer) {
                    return promiseUtils.reject("No source layer assigned");
                }
                return layer
                    .queryFeatures({
                    objectIds: [objectId],
                    outFields: ["*"],
                    returnGeometry: true,
                })
                    .then(function (featureSet) {
                    if (featureSet.features.length) {
                        return featureSet.features[0];
                    }
                    throw new Error("No such graphic with objectId `{objectId}`");
                });
            };
            _this.getAnimationGraphic = function (objectId) {
                if (_this.animationGraphics.has(objectId)) {
                    return promiseUtils.resolve(_this.animationGraphics.get(objectId));
                }
                else {
                    return _this.queryLineGraphic(objectId)
                        .then(function (lineGraphic) { return lineGraphic.clone(); })
                        .then(function (animationGraphic) {
                        var lineObjectId = animationGraphic.attributes[_this.sourceLayer.objectIdField];
                        animationGraphic.attributes[LINE_OBJECT_ID_FIELD] = lineObjectId;
                        _this.animationGraphics.set(objectId, animationGraphic);
                        return animationGraphic;
                    });
                }
            };
            _this.initializeAnimationLayer = function () {
                return _this.sourceLayer
                    .load()
                    .then(function (layer) {
                    if (layer.geometryType !== "polyline") {
                        var error = new Error("`lineLayer` must have `geometryType` \"polyline\"");
                        _this.rejectAnimationLayer(error);
                        throw error;
                    }
                    var animationLayer = createAnimationLayer(layer);
                    _this.resolveAnimationLayer(animationLayer);
                });
            };
            return _this;
        }
        Object.defineProperty(LineLayerAnimation.prototype, "sourceLayer", {
            get: function () {
                return this._get("sourceLayer");
            },
            set: function (layer) {
                var oldLayer = this._get("sourceLayer");
                if (oldLayer) {
                    if (oldLayer === layer) {
                        return;
                    }
                    throw new Error("The `sourceLayer` property cannot be changed once a layer has been assigned");
                }
                if (layer) {
                    this._set("sourceLayer", layer);
                    this.initializeAnimationLayer();
                }
            },
            enumerable: true,
            configurable: true
        });
        LineLayerAnimation.prototype.getLineGraphic = function (animatedGraphic) {
            var objectId = animatedGraphic.attributes[LINE_OBJECT_ID_FIELD];
            return this.queryLineGraphic(objectId);
        };
        LineLayerAnimation.prototype.whenAnimatedLayer = function () {
            return this.animationLayerPromise;
        };
        LineLayerAnimation.prototype.seek = function (progress, objectId) {
            return this.seekGraphicDebounce(progress, objectId);
        };
        LineLayerAnimation.prototype.seekGraphicSequencial = function (progress, objectId) {
            var _this = this;
            return this.getAnimationGraphic(objectId)
                .then(function (graphic) {
                var edits = {
                    addFeatures: [],
                    updateFeatures: []
                };
                var sections = _this.sections.get(objectId);
                if (sections) {
                    edits.updateFeatures = [graphic];
                }
                else {
                    sections = new PolylineSections(graphic.geometry);
                    _this.sections.set(objectId, sections);
                    edits.addFeatures = [graphic];
                }
                var geometry = sections.createPolyline(progress);
                graphic.geometry = geometry;
                return _this.whenAnimatedLayer().then(function (layer) {
                    layer.applyEdits(edits);
                });
            });
        };
        __decorate([
            decorators_1.property()
        ], LineLayerAnimation.prototype, "sourceLayer", null);
        LineLayerAnimation = __decorate([
            decorators_1.subclass("animations.layers.LineLayerAnimation")
        ], LineLayerAnimation);
        return LineLayerAnimation;
    }(decorators_1.declared(Accessor)));
    return LineLayerAnimation;
});

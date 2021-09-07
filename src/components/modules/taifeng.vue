<template>
  <div>
    <div id="map" class="map" tabindex="0"></div>
    <tfInfoBox ref="tfInfoBox" :typhoonData="typhoonData" />
  </div>
</template>

<script>
import "ol/ol.css";
import Map from "ol/Map";
import OSM from "ol/source/OSM";
import TileLayer from "ol/layer/Tile";
import View from "ol/View";
import Point from "ol/geom/Point";
import { getTphoonData } from "../../api/request";
import Feature from "ol/Feature";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { fromLonLat } from "ol/proj.js";
// import { Fill, Circle, Style } from "ol/style";
import { LineString, MultiLineString } from "ol/geom";
import Polygon from "ol/geom/Polygon";
import Overlay from "ol/Overlay";
import { easeOut } from "ol/easing";
import featureObj from "./tphoonFeature";
import tfInfoBox from "./typhoonPop.vue";
import * as turf from "@turf/turf";
import GeoJSON from "ol/format/GeoJSON";
import earthquakeIcon from "../../assets/images/earthquake.png";
import { Icon, Stroke, Fill, Circle, Style } from "ol/style";
export default {
  components: {
    tfInfoBox,
  },
  data() {
    return {
      map: null,
      lastShowSolar: null,
      lastZoomPoint: null,
      tfOverlay: null, //台风的overlayer
      typhoonData: {},
      earthquakeIcon,
    };
  },
  mounted() {
    this.initMap();
    // this.setC();
    // this.drawTphoonPath();
    // this.drawTyphoonPathInterval();
    // this.designHoverOnMap();
    // this.drawEarthquake([113.297722, 23.180214]);
  },
  methods: {
    // setC() {
    //   this.map.setCenter(fromLonLat[113.297722, 22.180214]);
    // },
    /**
     * 判断不同的地震圈返回不同的feature
     */
    judgeEarthquakeQuan(val, pointTurf) {
      let buffered = turf.buffer(pointTurf, val, { units: "kilometers" });
      let colorObj = {
        // 10: "rgba(255, 83, 1,)",
        10: "#e1e1e2",
        20: "#e0906d",
        30: "#fdca57",
        40: "#385b1d",
        50: "#df9ff2",
      };
      let styleM = new Style({
        // 线样式
        stroke: new Stroke({
          color: "#ff5300",
          width: 1,
        }),
        // 填充样式
        fill: new Fill({
          color: colorObj[val],
        }),
      });

      let earthMian = new GeoJSON().readFeature(buffered, {
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857",
      });
      earthMian.setStyle(styleM);
      console.log("返回feature-------地震圈", earthMian);
      return earthMian;
    },
    /**
     * 画地震点图层
     */
    drawEarthquake(seismicCoordinates) {
      // let eLayer = this.getLayerByName("earthquake");
      // if (eLayer && eLayer.length > 0) {
      //   this.removeLayerByName("earthquake");
      // }
      let image = new Icon({
        anchor: [0.5, 46],
        anchorXUnits: "fraction",
        anchorYUnits: "pixels",
        src: this.earthquakeIcon,
        scale: 0.8,
      });
      let stylesP = [
        new Style({
          image: image,
        }),
      ];
      //创建缓冲数据
      var pointTurf = turf.point(seismicCoordinates);
      var point = new Point(fromLonLat(seismicCoordinates));
      //创建数据geojson对象和数据源对象
      let source = new VectorSource();
      //读取geojson数据
      let earthPoint = new Feature(point);
      earthPoint.set("earthquakePoint", true);
      earthPoint.setStyle(stylesP);
      source.addFeature(earthPoint);
      let levelArr = [50, 40, 30, 20, 10];
      let mianFeatureArr = [];
      levelArr.forEach((item) => {
        let earthquake = this.judgeEarthquakeQuan(item, pointTurf);
        mianFeatureArr.push(earthquake);
        console.log("earthquake", earthquake);
      });
      console.log("mianFeatureArr.length", mianFeatureArr.length);
      source.addFeatures(mianFeatureArr);
      //添加图层
      this.earthquakeLayer = new VectorLayer({
        source: source,
        name: "earthquake",
      });
      this.map.addLayer(this.earthquakeLayer);
      this.setCenterPoint(seismicCoordinates, 10);
    },
    // drawEarthquake() {
    //   let image = new Icon({
    //     anchor: [0.5, 46],
    //     anchorXUnits: "fraction",
    //     anchorYUnits: "pixels",
    //     src: this.earthquakeIcon,
    //     scale: 0.2,
    //   });
    //   let stylesP = [
    //     new Style({
    //       image: image,
    //     }),
    //   ];

    //   let styleM = new Style({
    //     // 将点设置成圆形样式
    //     // image: new Circle({
    //     //     // 点的颜色
    //     //     fill: new ol.style.Fill({
    //     //         color: '#F00'
    //     //     }),
    //     //     // 圆形半径
    //     //     radius: 5
    //     // }),
    //     // 线样式
    //     stroke: new Stroke({
    //       color: "#ff5300",
    //       // lineCap: "round", // 设置线的两端为圆头
    //       width: 5,
    //     }),
    //     // 填充样式
    //     fill: new Fill({
    //       color: "rgba(255, 83, 0,0.2)",
    //     }),
    //   });
    //   //创建缓冲数据
    //   var pointTurf = turf.point([114.2058, 33.2469]);
    //   var point = new Point(fromLonLat([114.2058, 33.2469]));
    //   var buffered = turf.buffer(pointTurf, 50, { units: "kilometers" });
    //   console.log("buffered", buffered);
    //   //创建数据geojson对象和数据源对象
    //   // var format = new GeoJSON();
    //   var source = new VectorSource();
    //   //读取geojson数据
    //   var a = new Feature(point);
    //   a.setStyle(stylesP);
    //   console.log("点---------a", a);
    //   var b = new GeoJSON().readFeature(buffered, {
    //     dataProjection: "EPSG:4326",
    //     featureProjection: "EPSG:3857",
    //   });
    //   b.setStyle(styleM);
    //   console.log("styleM", styleM);
    //   console.log("面--------b", b);
    //   //将数据添加数据源的
    //   source.addFeature(a);
    //   source.addFeature(b);
    //   //添加图层
    //   var test = new VectorLayer({ source: source });
    //   this.map.addLayer(test);
    //   this.setCenterPoint([114.2058, 33.2469]);
    //   // this.map.setZ
    //   // let extent = source.getFeatures()[0].getGeometry().getExtent();
    //   // this.map.getView().setZoom(8);
    // },
    setCenterPoint(point) {
      this.map.getView().animate({
        zoom: 10, // 缩放级别
        center: fromLonLat(point),
        duration: 500,
        easing: easeOut,
      });
    },

    //初始化地图
    initMap() {
      this.map = new Map({
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        target: "map",
        view: new View({
          center: [0, 0],
          zoom: 2,
        }),
        // overlays: [this.overlay],
      });
      // this.designHoverOnMap();
      // this.designClickOnMap();
      // this.addTfOverLayer();
    },
    // 根据台风等级判断颜色
    judgeColorByWindLevel(winLevel) {
      let mapObj = {
        热带低压: "#02ff02",
        热带风暴: "#0264ff",
        强热带风暴: "#fffb05",
        台风: "#ffac05",
        强台风: "#f171f9",
        超强台风: "#fe0202",
      };
      return mapObj[winLevel];
    },
    //画出台风路径
    async drawTphoonPath() {
      let data = await getTphoonData();
      let points = data.points;
      let features = [];
      let positions = []; //用于画线
      let source = new VectorSource();
      points.forEach((ele, index) => {
        let position = [ele.lng, ele.lat];
        var geom = new Point(fromLonLat(position));
        let featurePoint = new Feature(geom);
        // 根据不同的强度着色
        featurePoint.setStyle(
          new Style({
            image: new Circle({
              fill: new Fill({
                color: this.judgeColorByWindLevel(ele.strong),
              }),
              radius: 4,
            }),
          })
        );

        if (index != points.length - 1) {
          let nextPosition = [points[index + 1].lng, points[index + 1].lat];
          positions.push([fromLonLat(position), fromLonLat(nextPosition)]);
        }

        features.push(featurePoint);
      });
      let tphLine = new MultiLineString(positions);
      let featureLine = new Feature(tphLine);
      features.push(featureLine);
      //   console.log("features", features);
      //矢量图层
      let layer = new VectorLayer();
      //矢量数据源

      source.addFeatures(features);
      layer.setSource(source);
      this.map.addLayer(layer);
    },

    //画出台风interval版本
    async drawTyphoonPathInterval() {
      let data = await getTphoonData();
      const { points } = data;

      let index = 0;
      this.map.getView().animate({
        zoom: 5.5, // 缩放级别
        center: fromLonLat([points[0].lng, points[0].lat]),
        duration: 500,
        easing: easeOut,
      });
      let layer = new VectorLayer();
      let source = new VectorSource();
      layer.setSource(source);
      let intervalLogo = setInterval(() => {
        if (index == points.length) {
          clearInterval(intervalLogo);
          return;
        }
        let position = [points[index].lng, points[index].lat];

        //点的数据源
        let featurePoint = new Feature({
          geometry: new Point(fromLonLat(position)),
        });
        featurePoint.setStyle(
          new Style({
            image: new Circle({
              fill: new Fill({
                color: this.judgeColorByWindLevel(points[index].strong),
              }),
              radius: 4,
            }),
          })
        );
        featurePoint.set("typhoonPoint", true);
        featurePoint.set("pointsData", points[index]);
        if (
          points[index].radius7.length != 0 ||
          points[index].radius7 != null
        ) {
          let featureSolar = this.drawSolar(points[index]);
          if (this.lastShowSolar != null) {
            source.removeFeature(this.lastShowSolar);
          }
          this.lastShowSolar = featureSolar;
          source.addFeature(featureSolar);
        }
        source.addFeature(featurePoint);

        if (index > 0) {
          let lastPosition = [points[index - 1].lng, points[index - 1].lat];
          let featureLine = new Feature({
            geometry: new LineString([
              fromLonLat(position),
              fromLonLat(lastPosition),
            ]),
          });
          source.addFeature(featureLine);
        }
        index++;
      }, 100);
      this.map.addLayer(layer);
    },

    //绘制风圈，应该明确只让它返回一个feature
    drawSolar(points) {
      let raduisArr = points.radius7.split("|").map((item) => {
        return parseFloat(item);
      });
      let Configs = {
        CIRCLE_CENTER_X: parseFloat(points.lng),
        CIRCLE_CENTER_Y: parseFloat(points.lat),
        CIRCLE_R: {
          SE: raduisArr[0] / 360,
          NE: raduisArr[1] / 360,
          NW: raduisArr[2] / 360,
          SW: raduisArr[3] / 360,
        },
      };

      let doint = [];
      var _interval = 6;
      for (var i = 0; i < 360 / _interval; i++) {
        var _r = 0;
        var _ang = i * _interval;
        if (_ang > 0 && _ang <= 90) {
          _r = Configs.CIRCLE_R.NE;
        } else if (_ang > 90 && _ang <= 180) {
          _r = Configs.CIRCLE_R.NW;
        } else if (_ang > 180 && _ang <= 270) {
          _r = Configs.CIRCLE_R.SW;
        } else {
          _r = Configs.CIRCLE_R.SE;
        }

        var x = Configs.CIRCLE_CENTER_X + _r * Math.cos((_ang * 3.14) / 180);
        var y = Configs.CIRCLE_CENTER_Y + _r * Math.sin((_ang * 3.14) / 180);

        doint.push(fromLonLat([x, y]));
      }
      let polyFeature = new Feature({
        geometry: new Polygon([doint]),
        typhoonSolar: true,
      });
      return polyFeature;
    },

    //注册一个hover事件
    designHoverOnMap() {
      this.map.on("pointermove", (ev) => {
        let pixel = ev.pixel;
        let feature = this.map.forEachFeatureAtPixel(pixel, (feature) => {
          return feature;
        });
        if (feature) {
          this.map.getTargetElement().style.cursor = this.map.hasFeatureAtPixel(
            this.map.getEventPixel(ev.originalEvent)
          )
            ? "pointer"
            : "";
          let execName = featureObj.typeJudge(feature) + "Hover";
          featureObj[execName].apply(this, [feature]);
        } else {
          this.clearPointZoomStyle();
          this.map.getTargetElement().style.cursor = "";
          this.tfOverlay.setPosition(undefined);
        }
      });
    },
    // clearPoint Zoom Style
    clearPointZoomStyle() {
      if (this.lastZoomPoint != null) {
        this.lastZoomPoint.getStyle().getImage().setRadius(4);
        this.lastZoomPoint.changed();
      }
    },
    //注册一个点击事件
    designClickOnMap() {
      this.map.on("click", (ev) => {
        let pixel = ev.pixel;
        let feature = this.map.forEachFeatureAtPixel(pixel, (featrue) => {
          return featrue;
        });
        if (feature) {
          let execName = featureObj.typeJudge(feature) + "Click";
          featureObj[execName].apply(this, [feature]);
        }
      });
    },

    /**
     * 添加叠加层
     */
    addTfOverLayer() {
      this.tfOverlay = new Overlay({
        element: this.$refs.tfInfoBox.$el,
        autoPan: true,
        autoPanAnimation: {
          duration: 250,
        },
      });
      this.tfOverlay.setPosition(undefined);
      this.map.addOverlay(this.tfOverlay);
    },
    /**
     * 设置台风点的弹框位置
     */
    setTfInfoPosition(points) {
      this.typhoonData = points;
      const { lng, lat } = points;
      let position = fromLonLat([lng, lat]);
      this.tfOverlay.setPosition(position);
    },
  },
};
</script>
 <style>
.map {
  width: 100%;
  height: 100vh;
}
a.skiplink {
  position: absolute;
  clip: rect(1px, 1px, 1px, 1px);
  padding: 0;
  border: 0;
  height: 1px;
  width: 1px;
  overflow: hidden;
}
a.skiplink:focus {
  clip: auto;
  height: auto;
  width: auto;
  background-color: #fff;
  padding: 0.3em;
}
#map:focus {
  outline: #4a74a8 solid 0.15em;
}
</style>
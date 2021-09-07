<template>
  <!-- 根据geoJson渲染行政边界线 -->
  <div>
    <div id="map"></div>
  </div>
</template>

<script>
import Map from "ol/Map";
import View from "ol/View";
import GeoJSON from "ol/format/GeoJSON";
import vectorLayer from "ol/layer/Vector";
import { Vector } from "ol/source";
import { fromLonLat } from "ol/proj.js";
import axios from "axios";
import "ol/ol.css";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Fill, Stroke, Style } from "ol/style";
import { Cluster, OSM, Vector as VectorSource } from "ol/source";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { boundingExtent } from "ol/extent";
import OlStyleFill from "ol/style/Fill";
import OlStyleStroke from "ol/style/Stroke";
import OlStyleCircle from "ol/style/Circle";
import OlStyleText from "ol/style/Text";
import OlStyleStyle from "ol/style/Style";
import TileWMS from "ol/source/TileWMS";
import Icon from "ol/style/Icon";
import sdzIcon from "../../assets/images/ico01.png";
export default {
  name: "app",
  data() {
    return {
      sdzIcon,
      styleCache: {},
      map: null,
      resData: null,
      source: null,
      bdata: {
        geometries: [],
        type: "GeometryCollection",
      },
      clusters: null,
    };
  },
  mounted() {
    // this.searchCity();
    this.initMap();
    this.getData();
    this.getData2();
    this.getData3();
    this.addPoint();
    this.getSdz();
  },
  methods: {
    getSdz() {
      axios
        .get("http://172.16.11.22:8765/api/admin/powerStation/selectList", {
          // params: {
          //   areaCode: 440111,
          // },
          headers: {
            Authorization:
              "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJnZHNza3kiLCJ1c2VySWQiOiJmNzkyZmNjMGI3ODE0YzQ2YjQwZWVmNTY4MDA3NTJiNiIsIm5hbWUiOiIiLCJsb2dpblNjb3BlIjoiMCIsImV4cCI6MTYyOTk3NTE1MH0.XkrzEzYrECG8SKKxNtdXaBTQun_e46FOvK202lkIVnSyrjPqs_8WLYJxVl1dgQHm-oJrNPlNzKT4DOmVf2mD8O6mL3H7Aestb9LwrUHHSlRNEsNb0bFYAIijZtXvgYkYlrLoHSNazz3rIIFqZvMuAnfGTMZxWruyi_bMX2MjPKU",
          },
        })
        .then((response) => {
          console.log("水电站数据response------->", response.data.data);
          this.addRandomFeature(response.data.data);
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    addRandomFeature(data) {
      var source = new Vector({
        wrapX: false,
      });
      // source.on("addfeature", (e) => {
      //   this.flash(e.feature);
      // });
      // var fill = new Fill({
      //   color: "rgba(255,255,255,0.4)",
      // });
      // var stroke = new Stroke({
      //   color: "#ff71e2",
      //   width: 4,
      // });
      // var styles = [
      //   new Style({
      //     image: new OlStyleCircle({
      //       fill: fill,
      //       stroke: stroke,
      //       radius: 5,
      //     }),
      //     fill: fill,
      //     stroke: stroke,
      //   }),
      // ];
      let image = new Icon({
        anchor: [0.5, 46],
        anchorXUnits: "fraction",
        anchorYUnits: "pixels",
        src: this.sdzIcon,
        scale: 1,
      });
      let styles = [
        new Style({
          image: image,
        }),
      ];
      var vector = new vectorLayer({
        source: source,
        style: styles,
        // zIndex:66
      });
      this.map.addLayer(vector);
      data.forEach((item) => {
        var geom = new Point(fromLonLat([item.longitude, item.latitude]));
        var feature = new Feature(geom);
        source.addFeature(feature);
        // 监听地图层级变化
        this.map.getView().on("change:resolution", () => {
          var style = feature.getStyle();
          // 重新设置图标的缩放率，基于层级10来做缩放
          style.getImage().setScale(this.getZoom() / 60);
          feature.setStyle(style);
        });
      });

      console.log("source----->", source);
    },
    // flash(feature) {
    //   var duration = 1000;
    //   var start = new Date().getTime();
    //   //进行地图水波渲染
    //   this.map.on("postcompose", animate);

    //   function animate(event) {
    //     console.log("event", event);
    //     //获取几何图形
    //     var vectorContext = event.vectorContext;
    //     console.log("vectorContext", vectorContext);
    //     //获取当前渲染帧状态
    //     var frameState = event.frameState;
    //     //添加一个OpenLayers.Geometry几何对象
    //     var flashGeom = feature.getGeometry().clone();
    //     //渲染帧状已占时间
    //     var elapsed = frameState.time - start;
    //     //已占比率
    //     var elapsedRatio = elapsed / duration;
    //     // radius半径为5结束为30
    //     var radius = easeOut(elapsedRatio) * 25 + 5;
    //     //不透渐变消失
    //     var opacity = easeOut(1 - elapsedRatio);
    //     //OlStyleCircle样式
    //     var style = new Style({
    //       image: new OlStyleCircle({
    //         radius: radius,
    //         stroke: new Stroke({
    //           color: "rgba(255, 0, 0, " + opacity + ")",
    //           width: 1 + opacity,
    //         }),
    //       }),
    //     });
    //     //给几何图形添加样式
    //     vectorContext.setStyle(style);
    //     //将几何体渲染到画布中
    //     vectorContext.drawGeometry(flashGeom);
    //     if (elapsed > duration) {
    //       start = frameState.time;
    //     }
    //     //请求地图渲染（在下一个动画帧处）
    //     this.map.render();
    //   }
    // },
    //数据源添加图层

    getData() {
      axios
        .get("http://172.16.11.22:8765/api/admin/sysArea/getAreaMap", {
          params: {
            areaCode: 440111,
          },
          headers: {
            Authorization:
              "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJnZHNza3kiLCJ1c2VySWQiOiJmNzkyZmNjMGI3ODE0YzQ2YjQwZWVmNTY4MDA3NTJiNiIsIm5hbWUiOiIiLCJsb2dpblNjb3BlIjoiMCIsImV4cCI6MTYzMDkyNjY1OH0.SccidAmgHwklEF2qinAXPhxraReuaiAx16uN4WMg3S2kza4p9SqmsiUcj1l9Emo8y8TvRvRrm9vLFiL2UID7SqLo-ZUwZYbNV9eq4pmqkdGl4S9Cn_WHZnvNK46kh0LpK5mooKZBobsKv0uXDer6T3moVs0n7mAVJ0yMewg26bI",
          },
        })
        .then((response) => {
          console.log("response", response.data.data.areaMap);
          this.bdata = response.data.data.areaMap;
          console.log("this.bdata", this.bdata);
          this.searchCity(this.bdata);
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    getData2() {
      axios
        .get("http://172.16.11.22:8765/api/admin/sysArea/getAreaMap", {
          params: {
            areaCode: 440000,
          },
          headers: {
            Authorization:
              "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJnZHNza3kiLCJ1c2VySWQiOiJmNzkyZmNjMGI3ODE0YzQ2YjQwZWVmNTY4MDA3NTJiNiIsIm5hbWUiOiIiLCJsb2dpblNjb3BlIjoiMCIsImV4cCI6MTYyOTk2MDU4N30.UhJZCSY_Y9ODTFrhETvyELndhnySCifQfNWQC0yIMskwsGtQN3ZsRrE-FDWHN1r7foSQH8ICnI8QEq0CYdZ-1i1CaTlfmJiObe52mF21YTL8VSOby_8IS-jicMXABTABgdLq-OD-NgRlcJV0zlojJ6qD9V0oB3Nd7PzOCNMWldQ",
          },
        })
        .then((response) => {
          console.log("response", response.data.data.areaMap);
          // this.bdata = response.data.data.areaMap;
          console.log("this.bdata", this.bdata);
          this.searchCity(response.data.data.areaMap);
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    getData3() {
      axios
        .get("http://172.16.11.22:8765/api/admin/sysArea/getAreaMap", {
          params: {
            areaCode: 440100,
          },
          headers: {
            Authorization:
              "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJnZHNza3kiLCJ1c2VySWQiOiJmNzkyZmNjMGI3ODE0YzQ2YjQwZWVmNTY4MDA3NTJiNiIsIm5hbWUiOiIiLCJsb2dpblNjb3BlIjoiMCIsImV4cCI6MTYyOTk2MDU4N30.UhJZCSY_Y9ODTFrhETvyELndhnySCifQfNWQC0yIMskwsGtQN3ZsRrE-FDWHN1r7foSQH8ICnI8QEq0CYdZ-1i1CaTlfmJiObe52mF21YTL8VSOby_8IS-jicMXABTABgdLq-OD-NgRlcJV0zlojJ6qD9V0oB3Nd7PzOCNMWldQ",
          },
        })
        .then((response) => {
          console.log("response", response.data.data.areaMap);
          // this.bdata = response.data.data.areaMap;
          console.log("this.bdata", this.bdata);
          this.searchCity(response.data.data.areaMap);
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    searchCity(val) {
      // let res = {
      //   geometries: [],
      //   type: "GeometryCollection",
      // };
      this.resData = val;

      var fill = new Fill({
        color: "rgba(255,255,255,0)",
      });
      var stroke = new Stroke({
        color: "#ff71e2",
        width: 4,
      });
      var styles = [
        new Style({
          //  image: new OlStyleCircle({
          //    fill: fill,
          //    stroke: stroke,
          //    radius: 5
          //  }),
          fill: fill,
          stroke: stroke,
        }),
      ];
      var feature = new GeoJSON().readFeatures(this.resData, {
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857",
      });
      console.log("feature", feature);
      this.source = new Vector({
        features: feature,
        wrapX: false,
        code: "EPSG:4326",
      });
      let vector = new vectorLayer({
        source: this.source,
        visible: true,
        style: styles,
      });

      // let polygons = this.source.getFeatures()[0].getGeometry();
      let extent = this.source.getFeatures()[0].getGeometry().getExtent();
      console.log("extent", extent);
      // console.log("polygons", polygons);
      // let size = this.map.getSize();
      this.map.getView().fit(extent);
      this.map.addLayer(vector);
      console.log("获取图层", this.map.getLayers());
      this.map.getLayers()["array_"].forEach((item) => {
        console.log("item.visible", item.visible);
      });
    },
    addPoint() {
      let _this = this;
      let features = [];
      features[0] = new Feature(new Point([110.7422, 20.918]));
      features[1] = new Feature(new Point([110.7422, 21.018]));
      console.log("features", features);
      const source = new VectorSource({
        features: features,
      });
      const clusterSource = new Cluster({
        distance: parseInt(0),
        minDistance: parseInt(0),
        source: source,
      });
      this.clusters = new VectorLayer({
        source: clusterSource,
        style: _this.setClusterStyle.call(_this),
      });
      this.map.addLayer(this.clusters);
    },
    initMap() {
      this.map = new Map({
        target: "map",
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          // this.vector,
        ],
        view: new View({
          center: fromLonLat([110.7422, 20.918]),
          zoom: 5,
        }),
      });
      this.addPoint();
      this.mapClick();
      var lyr = new TileLayer({
        source: new TileWMS({
          // params: { f: "f=jsapi" },
          projection: "EPSG:4326",
          url: "http://localhost:6080/arcgis/rest/services/xiaoshuidian/MapServer",
        }),
      });
      this.map.addLayer(lyr);
      // 加载地图服务
      // https://localhost:6443/arcgis/rest/services//xiaoshuidian/MapServer?f=jsapi
      // this.map.on("postrender", (val) => {
      //   // console.log("56666");
      //   // console.log("渲染完成-------", val);
      // });
      // this.map.on("error", (val) => {
      //   console.log("222");
      //   console.log("错误信息-------", val);
      // });
    },
    mapClick() {
      this.map.on("click", (e) => {
        this.clusters.getFeatures(e.pixel).then((clickedFeatures) => {
          if (clickedFeatures.length) {
            // Get clustered Coordinates
            const features = clickedFeatures[0].get("features");
            if (features.length > 1) {
              const extent = boundingExtent(
                features.map((r) => r.getGeometry().getCoordinates())
              );
              this.map
                .getView()
                .fit(extent, { duration: 1000, padding: [50, 50, 50, 50] });
            }
          }
        });
      });
    },

    setClusterStyle() {
      return (feature) => {
        console.log("aaaaaaaaaa");
        // console.log("ccccccc", feature.get("features"));
        let size = feature.get("features").length;
        let color = "";
        if (size === 1) {
          color = "green";
        } else if (size === 2) {
          color = "yellow";
        } else {
          color = "red";
        }
        let style = this.styleCache[size];
        if (!style) {
          this.styleCache = new OlStyleStyle({
            image: new OlStyleCircle({
              radius: 15,
              stroke: new OlStyleStroke({
                color: "#fff",
              }),
              fill: new OlStyleFill({
                color: color,
              }),
            }),
            text: new OlStyleText({
              text: size.toString(),
              fill: new OlStyleFill({
                color: "#000",
              }),
              stroke: new OlStyleStroke({
                color: "#fff",
                width: 5,
              }),
            }),
          });
        }
        // this.styleCache = style;
        return this.styleCache;
      };
    },
  },
};
</script>

<style scoped>
#map {
  width: 100vw;
  height: 100vh;
}
</style>

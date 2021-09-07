<template>
  <!-- 聚合 -->
  <div id="map-container" style="width: 100%; height: 100vh">
    <div id="popup" title="Welcome to OpenLayers"></div>
    <div style="position: absolute; right: 50px; top: 50px; z-index: 999">
      <button @click="goto">go to some point</button>
    </div>
  </div>
</template>
<script>
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import Overlay from "ol/Overlay";
import { defaults as defaultControls } from "ol/control";
import ZoomSlider from "ol/control/ZoomSlider";
import OlFeature from "ol/Feature";
import OlGeomPoint from "ol/geom/Point";
import OlSourceVector from "ol/source/Vector";
import OlLayerVector from "ol/layer/Vector";
import OlStyleStyle from "ol/style/Style";
import OlStyleFill from "ol/style/Fill";
import OlStyleStroke from "ol/style/Stroke";
import OlStyleCircle from "ol/style/Circle";
import OlStyleText from "ol/style/Text";
import { Cluster } from "ol/source";
import XYZ from "ol/source/XYZ";
import sdzData from "../../assets/json/sdz.json";
import { boundingExtent } from "ol/extent";
import { easeOut } from "ol/easing"; // 动画效果
import { getVectorContext } from "ol/render";
import GeoJSON from "ol/format/GeoJSON";
import vectorLayer from "ol/layer/Vector";
import { Vector } from "ol/source";
import { Fill, Stroke, Style } from "ol/style";
import axios from "axios";
export default {
  name: "",
  data() {
    return {
      popup: null,
      clusterData: [],
      map: null,
      styleCache: {},
      clusterSource: null,
      layer: null,
      resData: null,
      source: null,
    };
  },
  mounted() {
    this.initMap();
    // this.getData2();
    this.popup = new Overlay({
      element: document.getElementById("popup"),
      positioning: "bottom-center", //相对于其位置属性的实际位置
      stopEvent: false, //事件冒泡
    });
  },
  methods: {
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
          // console.log("this.bdata", this.bdata);
          this.searchCity(response.data.data.areaMap);
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    /**
     * 地区行政边界数据
     */
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
          //  image: new Circle({
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
    /**
     * 跳转到某个点
     */
    goto() {
      this.setCenterPoint([113.790472, 23.68424233]);
    },
    setCenterPoint(point) {
      this.map.getView().animate({
        zoom: 12, // 缩放级别
        center: point,
        duration: 500,
        easing: easeOut,
      });
      // let centerPointData = [
      //   {
      //     x: point[0],
      //     y: point[1],
      //     name: 'positioning'
      //   }
      // ]
      // this.addMarksLayer(centerPointData, '定位')
    },
    /**
     * @name: 鼠标悬浮改变聚合图标样式
     */
    pointerMove() {
      let _this = this;
      _this.map.on("pointermove", (evt) => {
        _this.map.getTargetElement().style.cursor = _this.map.hasFeatureAtPixel(
          evt.pixel
        )
          ? "pointer"
          : "";
      });
    },
    /**
     * @name: 设置聚合图标样式
     */
    setClusterStyle() {
      return (feature) => {
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

    /**
     * @name: 添加聚合图层
     * @param {data} Array 聚合数据
     * @return {type}
     */
    addClusterLayer() {
      let data = this.clusterData;
      let _this = this;
      let source = new OlSourceVector();
      this.clusterSource = new Cluster({
        distance: (20, 10),
        source: source,
      });
      this.layer = new OlLayerVector({
        source: this.clusterSource,
        style: _this.setClusterStyle.call(_this),
        name: "sdz",
        zIndex: 9,
        id: 666,
      });
      _this.map.addLayer(this.layer);
      // console.log("map.getLayers()", _this.map.getLayers());
      for (let i = 0; i < data.length; i++) {
        let coordinates = data[i].coordinates;
        let feature = new OlFeature({
          geometry: new OlGeomPoint(coordinates),
        });
        // if (i == 2) {
        //   console.log("data[i]", data[i]);
        // }
        for (let key in data[i]) {
          // console.log("key", key);
          // console.log("data[i][key]", data[i][key]);
          feature.set(key, data[i][key]);
        }
        // console.log("data[i]", data[i]);
        // feature.set("name", data[i].name);
        // feature.set("code", data[i].code);
        // feature.set("type", "cluster");
        source.addFeature(feature);
        this.layer.getSource().addFeatures(feature);
      }
      // 监听地图分辨率改变事件
      // _this.map.getView().on("moveend", function () {
      //   if (_this.map.getView().getZoom() == _this.map.getView().getMaxZoom()) {
      //     clusterSource.setDistance(parseInt(0));
      //   } else {
      //     clusterSource.setDistance(parseInt(40));
      //   }
      // });
      _this.pointerMove();
    },

    /**
     * @name: 根据图层名移除图层
     * @param {layername} 图层名称
     */
    removeLayerByName(layerName) {
      this.getLayerByName(layerName);
      let layer = this.getLayerByName(layerName);
      layer.forEach((item) => {
        this.map.removeLayer(item);
      });
    },

    /**
     * @name: 根据图层名获取图层
     * @param {layerName} 图层名称
     */
    getLayerByName(layerName) {
      let allLayers = this.getAllLayers();
      let layer = allLayers.filter((item) => {
        return item.get("name") === layerName;
      });
      return layer;
    },

    /**
     * @name: 获取所有图层
     */
    getAllLayers() {
      let layers = this.map.getLayers().getArray();
      return layers;
    },

    /**
     * @name: 地图单击事件
     */
    singleClickFun() {
      this.map.on("singleclick", (event) => {
        console.log("event", event);
        const vectorContext = getVectorContext(event);
        console.log("vectorContext", vectorContext);
        this.layer.getFeatures(event.pixel).then((clickedFeatures) => {
          if (clickedFeatures.length) {
            // Get clustered Coordinates
            const features = clickedFeatures[0].get("features");
            console.log("features---->", features[0]);
            if (features.length > 1) {
              const extent = boundingExtent(
                features.map((r) => r.getGeometry().getCoordinates())
              );
              this.map.getView().fit(extent, {
                duration: 1000,
                padding: [50, 50, 50, 50],
                maxZoom: 13,
              });
            }

            if (features.length == 1) {
              this.map.addOverlay(this.popup);
              let element = this.popup.getElement(); // 获取弹窗的DOM元素
              var coordinate = event.coordinate; //当前位置信息
              console.log(coordinate);
              this.popup.setPosition(coordinate); //设置当前位置

              if (features[0]["values_"]["code"]) {
                element.innerHTML = ` <div id="popup">
      <h4 class="h4">梅州水库电站</h4>
      <ul class="ul">
        <li>
          <h2>地区</h2>
          <span class="job-location">广州市</span>
        </li>

        <li>
          <h2>行政区划代码</h2>
          <span class="job-location">4401##</span>
        </li>

        <li>
          <h2>水电站编码</h2>
          <span class="job-location">4413240105</span>
        </li>

        <li>
          <h2>厂房经度</h2>
          <span class="job-location">113.97</span>
        </li>

        <li>
          <h2>厂房纬度</h2>
          <span class="job-location">23.59</span>
        </li>

        <li>
          <h2>水系名称</h2>
          <span class="job-location">HD</span>
        </li>

        <li>
          <h2>水系编码</h2>
          <span class="job-location">HD</span>
        </li>

        <li>
          <h2>流域名称</h2>
          <span class="job-location">HD</span>
        </li>

        <li>
          <h2>流域编码</h2>
          <span class="job-location">HD</span>
        </li>

        <li>
          <h2>湖泊名称</h2>
          <span class="job-location">Austin, Texas</span>
        </li>

        <li>
          <h2>所在河流（湖泊）名称</h2>
          <span class="job-location">HD</span>
        </li>

        <li>
          <h2>所在河流（湖泊）编码</h2>
          <span class="job-location">HD</span>
        </li>

        <li>
          <h2>是否利用水库发电</h2>
          <span class="job-location">HD</span>
        </li>
        <li>水库名称</li>
        <li>
          <h2>水库编码</h2>
          <span>珠江三角洲水系</span>
        </li>
        <li>
          <h2>水电站类型</h2>
          <span>珠江流域片</span>
        </li>
        <li>
          <h2>生产安置人口（万人）</h2>
          <span>HD</span>
        </li>
        <li>
          <h2>搬迁安置人口（万人）</h2>
          <span>增江</span>
        </li>
        <li>
          <h2>工程建设情况</h2>
          <span>小（1）型</span>
        </li>
        <li>
          <h2>建成时间</h2>
          <span></span>
        </li>
        <li>
          <h2>开工时间</h2>
          <span>已完成工程验收</span>
        </li>
        <li>
          <h2>工程等别</h2>
          <span>已完成工程验收</span>
        </li>
        <li>
          <h2>主要建筑物级别</h2>
          <span>已完成工程验收</span>
        </li>
        <li>
          <h2>装机容量（kW）</h2>
          <span>已完成工程验收</span>
        </li>
        <li>
          <h2>保证出力（kW）</h2>
          <span>已完成工程验收</span>
        </li>
        <li>
          <h2>额定水头（m）</h2>
          <span>已完成工程验收</span>
        </li>
        <li>
          <h2>机组台数（台）</h2>
          <span>已完成工程验收</span>
        </li>
        <li>
          <h2>多年平均发电量（万kW·h）</h2>
          <span>已完成工程验收</span>
        </li>
        <li>
          <h2>2011年发电量（万kW·h）</h2>
          <span>已完成工程验收</span>
        </li>
        <li>
          <h2>水电站管理单位名称</h2>
          <span>已完成工程验收</span>
        </li>
      </ul>
      <!-- <div class="p-box">
        <div class="p-item">
          <div class="p-item-left">
            <div class="p-label">地区：</div>
            <div class="p-con">温泉镇</div>
          </div>
          <div class="p-item-right">
            <div class="p-label">水电站编码：</div>
            <div class="p-con">4401840985</div>
          </div>
        </div>
        <div class="p-item">
          <div class="p-item-left">
            <div class="p-label">水系名称：</div>
            <div class="p-con"></div>
          </div>
          <div class="p-item-right">
            <div class="p-label">流域名称：</div>
            <div class="p-con"></div>
          </div>
        </div>
        <div class="p-item">
          <div class="p-item-left">
            <div class="p-label">流域编码：</div>
            <div class="p-con"></div>
          </div>
          <div class="p-item-right">
            <div class="p-label">湖泊名称：</div>
            <div class="p-con"></div>
          </div>
        </div>
        <div class="p-item">
          <div class="p-item-left">
            <div class="p-label">所在河流名称：</div>
            <div class="p-con"></div>
          </div>
          <div class="p-item-right">
            <div class="p-label">所在河流编码：</div>
            <div class="p-con"></div>
          </div>
        </div>
        <div class="p-item">
          <div class="p-item-left">
            <div class="p-label">水电站类型：</div>
            <div class="p-con"></div>
          </div>
          <div class="p-item-right">
            <div class="p-label">生产安置人口/万：</div>
            <div class="p-con"></div>
          </div>
        </div>
        <div class="p-item">
          <div class="p-item-left">
            <div class="p-label">搬迁安置人口/万：</div>
            <div class="p-con"></div>
          </div>
          <div class="p-item-right">
            <div class="p-label">建成时间：</div>
            <div class="p-con"></div>
          </div>
        </div>
        <div class="p-item">
          <div class="p-item-left">
            <div class="p-label">工程等别：</div>
            <div class="p-con"></div>
          </div>
          <div class="p-item-right">
            <div class="p-label">装机容量（kW）：</div>
            <div class="p-con"></div>
          </div>
        </div>
      </div> -->
    </div>`; //弹窗内容
                // $("#popup").addClass("popup");
                // addFeatrueInfo(featuerInfo); //在popup中加载当前要素的具体信息
                if (this.popup.getPosition() == undefined) {
                  this.popup.setPosition(coordinate);
                }
              }
            } else {
              //有多个要素
              this.popup.setPosition(undefined);
            }
          }
        });
        // console.log(event);
        // var to = fromLonLat([Number(113.809), Number(23.683)]);
        // var view = this.map.getView();
        // 设置地图等级
        // view.setZoom(12);
        // view.setCenter([113.809, 23.683]);
        // view.animate({
        //   center: to,
        //   duration: 0,
        // });
      });
    },
    repeatNo(jsonSJ) {
      var obj = {};
      jsonSJ = jsonSJ.reduce(function (item, next) {
        obj[next.code] ? "" : (obj[next.code] = true && item.push(next));
        return item;
      }, []);
      return jsonSJ;
    },
    /**
     * @name: 初始化地图
     */
    initMap() {
      let arr = this.repeatNo(sdzData);
      this.clusterData = arr.map((item) => {
        const { longitude, latitude } = item;
        item.coordinates = [longitude - 0, latitude - 0];
        return item;
      });
      let view = new View({
        projection: "EPSG:4326",
        center: [113.535746, 23.348365],
        zoom: 6.5,
        // maxZoom: 13,
        minZoom: 3,
      });
      let layer = new TileLayer({
        source: new XYZ({
          attributions: "Copyright:© 2013 ESRI, i-cubed, GeoEye",
          url:
            "https://services.arcgisonline.com/arcgis/rest/services/" +
            "ESRI_Imagery_World_2D/MapServer/tile/{z}/{y}/{x}",
          projection: "EPSG:4326",
          tileSize: 512, // the tile size supported by the ArcGIS tile service
          maxResolution: 180 / 512, // Esri's tile grid fits 180 degrees on one 512 px tile
          wrapX: true,
        }),
      });
      this.map = new Map({
        layers: [],
        target: "map-container",
        view: view,
        controls: defaultControls().extend([new ZoomSlider()]),
      });
      this.map.addLayer(layer);
      this.addClusterLayer();
      this.singleClickFun();
      // this.searchCity();
    },
  },
};
</script>

<style>
#popup {
  box-sizing: border-box;
  width: 300px;
  height: 400px;
  /* padding: 24px; */
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #232f61;
  color: aliceblue;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  clip-path: polygon(
    15px 0,
    calc(100% - 15px) 0,
    100% 15px,
    100% calc(100% - 15px),
    calc(100% - 15px) 100%,
    15px 100%,
    0 calc(100% - 15px),
    0 15px
  );
}
.p-box {
  width: 100%;
  height: 100%;
}
.p-item {
  display: flex;
}
.p-item-left {
  flex: 1;
  min-width: 0;
  display: flex;
}
.p-item-right {
  flex: 1;
  min-width: 0;
  display: flex;
}
.p-label {
  flex: 2;
  min-width: 0;
  text-align: right;
}
.p-con {
  flex: 1;
  min-width: 0;
  text-align: left;
}
ul {
  list-style: none;
  margin: 0;
  padding: 15px;
}
.h4 {
  padding: 12px 24px 0 24px;
}
.ul {
  padding: 12px;
}
ul li {
  border-bottom: 1px solid #ccc;
}
ul li {
  padding: 12px 0;
  display: -webkit-box;
  display: -moz-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  -webkit-box-pack: justify;
  -moz-box-pack: justify;
  -webkit-justify-content: space-between;
  -ms-flex-pack: justify;
  justify-content: space-between;
  color: aliceblue;
  text-decoration: none;
}
ul a:before {
  content: "";
  display: table;
  clear: both;
  height: 0;
}
ul h2 {
  -webkit-flex: 1 1 60%;
  -ms-flex: 1 1 60%;
  flex: 1 1 60%;
  margin-right: 25px;
  margin: 0;
  font-size: 15px;
  font-size: 0.9375pxrem;
  line-height: 20px;
  border: 0;
  padding: 0;
  font-weight: 500;
}
ul span {
  text-align: right;
  -webkit-flex: 1 1 40%;
  -ms-flex: 1 1 40%;
  flex: 1 1 40%;
  width: 100%;
  display: block;
  font-size: 15px;
  /* font-size: 0.9375pxrem; */
  line-height: 20px;
}
</style>

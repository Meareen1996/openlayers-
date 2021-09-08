<template>
  <!-- 渲染arcgis服务器的gis服务 -->
  <div>
    <div id="map" class="map"></div>
  </div>
</template>

<script>
import "ol/ol.css";
import Map from "ol/Map";
import { Image as ImageLayer, Tile as TileLayer } from "ol/layer";
import View from "ol/View";
import { OSM, TileArcGISRest } from "ol/source";
import ImageArcGISRest from "ol/source/ImageArcGISRest";
import TileGrid from "ol/tilegrid/TileGrid";
import { get } from "ol/proj";
import XYZ from "ol/source/XYZ";

// const url =
//   "https://sampleserver1.arcgisonline.com/ArcGIS/rest/services/" +
//   "Specialty/ESRI_StateCityHighway_USA/MapServer";

// const url = "http://localhost:6080/arcgis/rest/services/xiaoshuidian/MapServer";
const url =
  "https://localhost:6443/arcgis/rest/services/xiaoshuidian_202109021715/MapServer";
const layers = [
  new TileLayer({
    source: new OSM(),
  }),

  new ImageLayer({
    source: new ImageArcGISRest({
      ratio: 1,
      params: {},
      url: url,
    }),
  }),
  new TileLayer({
    extent: [-13884991, 2870341, -7455066, 6338219],
    source: new TileArcGISRest({
      url: url,
    }),
  }),
  new TileLayer({
    source: new XYZ({
      url: url + "/tile/{z}/{y}/{x}",
    }),
  }),
];

console.log(layers);
export default {
  data() {
    return {
      map: null,
    };
  },
  mounted() {
    this.initMap();
  },
  methods: {
    initMap() {
      let projection = get("EPSG:4326");
      let tileUrl =
        "https://localhost:6443/arcgis/rest/services/xiaoshuidianooooo/MapServer/tile/{z}/{y}/{x}";
      // 原点
      let origin = [-400.0, 399.9999999999998];
      // 分辨率
      let resolutions = [
        0.01903568804664224, 0.00951784402332112, 0.00475892201166056,
        0.00237946100583028, 0.00118973050291514, 5.9486525145757e-4,
        2.97432625728785e-4, 1.5228550437313792e-4,
      ];

      // let fullExtent = [
      //   109.61789669563149, 20.11893865177325, 117.41810154021985,
      //   25.533741857054633,
      // ];
      let tileGrid = new TileGrid({
        tileSize: 256,
        origin: origin,
        // extent: fullExtent,
        resolutions: resolutions,
      });
      // 瓦片数据源
      let tileArcGISXYZ = new XYZ({
        tileGrid: tileGrid,
        projection: projection,
        url: tileUrl,
      });
      this.map = new Map({
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          // 瓦片图层
          new TileLayer({
            source: tileArcGISXYZ,
          }),
        ],
        target: "map",
        view: new View({
          center: [113.512288, 22.865743],
          resolutions: resolutions,
          // 注意：此处指定缩放级别不能通过zoom来指定，指定了也无效，必须通过resolution来指定
          // 官方API说明：
          // Resolutions to determine the resolution constraint.
          // If set the maxResolution, minResolution, minZoom, maxZoom, and zoomFactor options are ignored.
          resolution: 0.00475892201166056,
          projection: projection,
          // extent: fullExtent,
        }),
      });

      console.log("获取图层---->", this.map.getLayers());
    },
  },
};
</script>
 <style>
.map {
  width: 100%;
  height: 100vh;
}
</style>
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
// import XYZ from "ol/source/XYZ";
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
  //   new TileLayer({
  //     source: new XYZ({
  //       url: url + "/tile/{z}/{y}/{x}",
  //     }),
  //   }),
];

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
      this.map = new Map({
        layers: layers,
        target: "map",
        view: new View({
          center: [-10997148, 4569099],
          zoom: 4,
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
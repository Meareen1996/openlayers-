<!-- 加载 GeoServer 发布的 wms 服务-->

<template>
  <div id="map-container" style="width: 100%; height: 100vh"></div>
</template>
<script>
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import OSM from "ol/source/OSM";
import { defaults as defaultControls } from "ol/control";
import ZoomSlider from "ol/control/ZoomSlider";

export default {
  name: "GeoServer",
  data() {
    return {
      map: null,
    };
  },
  mounted() {
    this.initMap();
  },
  methods: {
    /**
     * @name: 地图单击事件
     */
    singleClickFun() {
      this.map.on("singleclick", (event) => {
        console.log(event);
        // GetFeatureInfo
        let view = this.map.getView();
        let wmsSource = new TileWMS({
          url: "https://localhost:6443/arcgis/services/xiaoshuidianooooo/MapServer/WMSServer",
          // params: { 'LAYERS': 'topp:states', 'TILED': true },
          // serverType: "geoserver",
          // transition: 0,
        });
        let viewResolution = view.getResolution();
        let url = wmsSource.getFeatureInfoUrl(
          event.coordinate,
          viewResolution,
          "EPSG:4326",
          { INFO_FORMAT: "application/json" }
        );
        if (url) {
          fetch(url)
            .then((response) => {
              return response.json();
            })
            .then((data) => {
              console.log(data);
            });
        }
      });
    },

    /**
     * @name: 初始化地图
     */
    initMap() {
      let view = new View({
        projection: "EPSG:4326",
        center: [-101.44058, 39.816105],
        zoom: 5,
      });
      let layer = new TileLayer({
        source: new OSM(),
        visible: true,
        zIndex: 1,
        name: "OSM",
      });
      this.map = new Map({
        layers: [],
        target: "map-container",
        view: view,
        controls: defaultControls().extend([new ZoomSlider()]),
      });
      this.map.addLayer(layer);

      // 加载 GeoServer 发布的 wms 服务
      let wmsLayer = new TileLayer({
        source: new TileWMS({
          url: "https://localhost:6443/arcgis/rest/services/xiaoshuidian/MapServer/wms", // geoserver 服务地址
          params: { LAYERS: "topp:states", TILED: true },
          serverType: "geoserver",
          transition: 0,
        }),
        visible: true,
        zIndex: 9,
        className: "wms",
      });
      this.map.addLayer(wmsLayer);

      this.singleClickFun();
    },
  },
};
</script>
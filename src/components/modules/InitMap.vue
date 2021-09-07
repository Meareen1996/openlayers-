<template>
  <!-- 1.初始化一个地图
     2.添加点击事件 -->
  <div id="map-container"></div>
</template>
<script>
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { ZoomToExtent, defaults as defaultControls } from "ol/control";

export default {
  name: "initMap",
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
        console.log(event.coordinate[0], event.coordinate[1]);
      });
    },

    /**
     * @name: 初始化地图
     */
    initMap() {
      let view = new View({
        projection: "EPSG:4326",
        center: [116.395645038, 39.9299857781],
        zoom: 12,
      });
      let layer = new TileLayer({
        source: new OSM(),
        visible: true,
        zIndex: 9,
        name: "OSM",
      });
      this.map = new Map({
        layers: [layer],
        target: "map-container",
        view: view,
        controls: defaultControls().extend([
          new ZoomToExtent({
            extent: [
              116.22979869019117, 39.78578351593684, 116.56048958074179,
              40.077314154870024,
            ],
          }),
        ]),
      });
      this.singleClickFun();
    },
  },
};
</script>

<style scoped lang="scss">
#map-container {
  width: 100%;
  height: 100vh;
}
</style>

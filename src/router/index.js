import Vue from "vue";
import VueRouter from "vue-router";
import InitMap from "@/components/modules/InitMap"; //初始化页面
import GeoServer from "@/components/modules/GeoServer"; //用于测试gis服务
import CustomSymbols from "@/components/modules/CustomSymbols"; //给图层添加symbols
import Overlay from "@/components/modules/Overlay"; //弹窗图层
import Measure from "@/components/modules/Measure";
import Plotting from "@/components/modules/Plotting";
import Heatmap from "@/components/modules/Heatmap";
import Cluster from "@/components/modules/Cluster";
import Boundary from "@/components/modules/boundary";
import Typhoon from "@/components/modules/taifeng";
import PicLayer from "@/components/modules/picLayer";
import arcgisServer from "@/components/modules/arcgisServer";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "init",
    title: "首页",
    component: InitMap,
  },

  {
    path: "/boundary",
    name: "Boundary",
    title: "geojson边界",
    component: Boundary,
  },
  {
    path: "/typhoon",
    name: "Typhoon",
    title: "台风",
    component: Typhoon,
  },
  {
    path: "/picLayer",
    name: "PicLayer",
    title: "图片图层",
    component: PicLayer,
  },
  {
    path: "/GeoServer",
    name: "GeoServer",
    title: "gis服务器",
    component: GeoServer,
  },
  {
    path: "/CustomSymbols",
    name: "CustomVectorLabeling",
    title: "自定义矢量标注",
    component: CustomSymbols,
  },
  {
    path: "/Overlay",
    name: "overlayLayer",
    title: "覆盖物图层",
    component: Overlay,
  },
  {
    path: "/Plotting",
    name: "plot",
    title: "标绘",
    component: Plotting,
  },
  {
    path: "/Measure",
    name: "spaceMeasurement",
    title: "空间测量",
    component: Measure,
  },
  {
    path: "/Heatmap",
    name: "heatMap",
    title: "热力图",
    component: Heatmap,
  },
  {
    path: "/Cluster",
    name: "polymerization",
    title: "聚合",
    component: Cluster,
  },
  {
    path: "/arcgisServer",
    name: "arcgisServer",
    title: "arcgis服务",
    component: arcgisServer,
  },
];

const router = new VueRouter({
  routes,
});

export default router;

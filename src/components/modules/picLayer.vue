<template>
  <div>
    <div id="map" class="map"></div>
    <!-- <img :src="dixing" alt=""> -->
  </div>
</template>

<script>
import "ol/ol.css";
import ImageLayer from "ol/layer/Image";
import Map from "ol/Map";
import Projection from "ol/proj/Projection";
import Static from "ol/source/ImageStatic";
import View from "ol/View";
import { getCenter } from "ol/extent";
// import dixing from"../../assets/images/dixing.png"
import dixing from"../../assets/images/dx1.jpg"
import ttt from"../../assets/images/222.png"
export default {
  data() {
    return {
      map: null,
      dixing,
      ttt
    };
  },
  mounted() {
    // Map views always need a projection.  Here we just want to map image
    // coordinates directly to map coordinates, so we create a projection that uses
    // the image extent in pixels.
    const extent = [12207831.480902322, 2299499.545339695, 13058164.055949975, 2939745.3249377445];
    const projection = new Projection({
      code: "xkcd-image",
      units: "pixels",
      extent: extent,
    });
    this.map = new Map({
      layers: [
        new ImageLayer({
          source: new Static({
            attributions: '© <a href="https://xkcd.com/license.html">xkcd</a>',
            url: this.dixing,
            // url: "https://imgs.xkcd.com/comics/online_communities.png",
            projection: projection,
            imageExtent: extent,
          }),
        }),
      ],
      target: "map",
      view: new View({
        projection: projection,
        center: getCenter(extent),
        zoom: 2,
        maxZoom: 8,
      }),
    });
   
  },
};
</script>

 <style>
.map {
  width: 100%;
  height: 100vh;
}
</style>
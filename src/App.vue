<template>
  <div id="app">
    <Sublayout class="map-main"> </Sublayout>
  </div>
</template>
<script>
import Sublayout from "./components/sublayout.vue";
export default {
  name: "App",
  components: { Sublayout },
};
</script>

<style lang="scss">
#app {
  width: 100%;
  height: 100%;
  .map-main {
    width: 100%;
    height: 100%;
  }
}
</style>

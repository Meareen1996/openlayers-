<template>
  <div class="home-box">
    <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
      @select="handleSelect"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
      :router="true"
    >
      <el-menu-item
        v-for="(item, index) in routes"
        :key="index"
        :index="item.path"
        >{{ item.title }}</el-menu-item
      >
    </el-menu>
    <div class="content">
      <router-view />
    </div>
  </div>
</template>



<script>
export default {
  data() {
    return {
      activeIndex: this.$router.options.routes[0].name,
      routes: [],
    };
  },
  mounted() {
    this.routes = this.$router.options.routes;
  },
  methods: {
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    },
  },
};
</script>

<style>
.home-box {
  width: 100%;
  height: 100%;
}
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}
</style>
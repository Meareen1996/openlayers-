<template>
  <!-- 台风点信息弹框 -->
  <div class="typhoon-info">
    <div class="header">
      <span class="h4">{{ typhoonData.strong }}</span>
      <span class="h-right">{{ typhoonData.time.split(" ")[0] }} 预报</span>
    </div>
    <ul class="con">
      <li class="tf-item">
        <div class="left">当前位置</div>
        <div class="right">{{ typhoonData.lng }}°/{{ typhoonData.lat }}°</div>
      </li>
      <li class="tf-item">
        <div class="left">中心气压</div>
        <div class="right">{{ typhoonData.pressure }}百帕</div>
      </li>
      <li class="tf-item">
        <div class="left">最大风速</div>
        <div class="right">{{ typhoonData.movespeed }}米/秒</div>
      </li>
      <li class="tf-item">
        <div class="left">风力</div>
        <div class="right">{{ typhoonData.speed }}级</div>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  props: {
    typhoonData: {
      type: Object,
      default: () => {},
    },
  },
  
};
</script>
<style>
.typhoon-info {
  width: 254px;
  background: #ffffff;
}
.header {
  line-height: 36px;
  height: 36px;
  background: #0099cc;
  color: #ffffff;
  box-shadow: black 0px 0px 3px;
}
.h4 {
  font-size: 16px;
  color: #ffffff;
}
.h-right {
  color: #ffffff;
}
.con {
  font-size: 12px;
  padding: 0 24px;
}
ul li {
  list-style: none;
}
.tf-item {
  border-bottom: 1px solid #e7e7e7;
  display: flex;
  justify-content: flex-start;
}
.left {
  color: #aeaeae;
  margin-right: 12px;
}

.right {
  color: #808080;
}
</style>
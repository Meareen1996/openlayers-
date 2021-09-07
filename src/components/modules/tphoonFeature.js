const featureObj = {
  // feature类型判定
  typeJudge: function(feature) {
    if (feature.get("typhoonPoint")) {
      return "typhoonPoint";
    } else if (feature.get("typhoonSolar")) {
      return "typhoonSolar";
    } else {
      return "isFeatureButDontNeedTodo";
    }
  },
  /**
   * 风圈相关
   */
  typhoonSolarClick: function(feature) {
    console.log("typhoonSolarClick", feature);
  },
  typhoonSolarHover: function(feature) {
    console.log("typhoonSolarClick", feature);
  },
  /**
   * 台风点相关
   */
  typhoonPointClick: function(feature) {
    console.log("click tphoonPoint", feature);
  },
  typhoonPointHover: function(feature) {
    this.map.getTargetElement().style.cursor = "point";
    this.clearPointZoomStyle();
    feature
      .getStyle()
      .getImage()
      .setRadius(8);
    feature.changed();
    this.lastZoomPoint = feature;
    //设置台风点位置
    // console.log("台风点---------》feature",feature)
    let pointsData = feature.get("pointsData");
    this.setTfInfoPosition(pointsData);
  },
  /**
   *
   * @returns 啥也不做
   */
  isFeatureButDontNeedTodoClick: function() {
    return;
  },
  isFeatureButDontNeedTodoHover: function() {
    return;
  },
};
export default featureObj;

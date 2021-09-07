import{get,post} from "./api"
//获取台风数据
export const getTphoonData = (param) => {
    return get("datacache/taifeng.json", param);
  };
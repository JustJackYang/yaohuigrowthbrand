export const CITY_COORDINATES = {
  "北京": 116.40,
  "上海": 121.47,
  "广州": 113.26,
  "深圳": 114.08,
  "天津": 117.20,
  "重庆": 106.55,
  "杭州": 120.15,
  "南京": 118.79,
  "成都": 104.06,
  "武汉": 114.30,
  "西安": 108.93,
  "沈阳": 123.43,
  "哈尔滨": 126.63,
  "长春": 125.32,
  "济南": 117.12,
  "青岛": 120.38,
  "大连": 121.61,
  "郑州": 113.62,
  "长沙": 112.93,
  "福州": 119.29,
  "厦门": 118.08,
  "南宁": 108.36,
  "昆明": 102.83,
  "贵阳": 106.63,
  "海口": 110.19,
  "乌鲁木齐": 87.61,
  "拉萨": 91.14,
  "兰州": 103.83,
  "西宁": 101.77,
  "银川": 106.23,
  "呼和浩特": 111.74,
  "石家庄": 114.51,
  "太原": 112.54,
  "合肥": 117.22,
  "南昌": 115.85,
  "香港": 114.16,
  "澳门": 113.54,
  "台北": 121.50
};

export function getLongitude(city) {
  // Try exact match
  if (CITY_COORDINATES[city]) return CITY_COORDINATES[city];
  
  // Try partial match (e.g. "深圳市" -> "深圳")
  for (const key in CITY_COORDINATES) {
    if (city.includes(key)) return CITY_COORDINATES[key];
  }
  
  return 120; // Default to Beijing Time longitude
}
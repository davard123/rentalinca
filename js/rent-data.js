/* 生成文件 — 请勿手改。
 * 来源:     data/rent-ranges.json
 * 重新生成: npm run sync:facts
 */
(function (root, factory) {
  var data = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = data;
  } else {
    root.RENT_DATA = data;
    root.RENTAL_DATA = data.cities;
    root.TYPICAL_SQFT = data.typicalSqft;
    root.PROPERTY_TYPE_LABELS = data.propertyTypeLabels;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  return {
    "lastUpdated": "2026-08",
    "displayLabel": "参考区间 · 数据更新于 2026-08",
    "disclaimer": "以上为参考区间，不是成交保证。实际租金随房况、位置、装修、上线时间与当时竞争房源变化。",
    "typicalSqft": {
      "1bd": 750,
      "2bd": 1050,
      "3bd": 1450,
      "sfr": 2200
    },
    "propertyTypeLabels": {
      "1bd": "1BD / 1BA",
      "2bd": "2BD / 2BA",
      "3bd": "3BD / 2BA",
      "sfr": "Single Family Home"
    },
    "propertyTypeLabelsZh": {
      "1bd": "1室1卫 (1BD/1BA)",
      "2bd": "2室2卫 (2BD/2BA)",
      "3bd": "3室2卫 (3BD/2BA)",
      "sfr": "独立屋 (SFR 4BD+)"
    },
    "cities": {
      "irvine": {
        "name": "Irvine 尔湾",
        "area": "Orange County",
        "1bd": [
          2300,
          2800
        ],
        "2bd": [
          3000,
          3800
        ],
        "3bd": [
          3800,
          5000
        ],
        "sfr": [
          5500,
          8500
        ],
        "hot": true
      },
      "anaheim": {
        "name": "Anaheim 安纳罕",
        "area": "Orange County",
        "1bd": [
          1800,
          2300
        ],
        "2bd": [
          2400,
          3000
        ],
        "3bd": [
          3000,
          3800
        ],
        "sfr": [
          3800,
          5500
        ]
      },
      "garden-grove": {
        "name": "Garden Grove 花园格罗夫",
        "area": "Orange County",
        "1bd": [
          1700,
          2100
        ],
        "2bd": [
          2200,
          2800
        ],
        "3bd": [
          2800,
          3600
        ],
        "sfr": [
          3600,
          5000
        ]
      },
      "cerritos": {
        "name": "Cerritos 塞利托斯",
        "area": "SE Los Angeles",
        "1bd": [
          1900,
          2300
        ],
        "2bd": [
          2500,
          3100
        ],
        "3bd": [
          3100,
          4000
        ],
        "sfr": [
          4200,
          5800
        ]
      },
      "arcadia": {
        "name": "Arcadia 阿凯迪亚",
        "area": "San Gabriel Valley",
        "1bd": [
          1800,
          2200
        ],
        "2bd": [
          2500,
          3200
        ],
        "3bd": [
          3200,
          4200
        ],
        "sfr": [
          4500,
          6500
        ],
        "hot": true
      },
      "rowland-heights": {
        "name": "Rowland Heights 罗兰岗",
        "area": "San Gabriel Valley",
        "1bd": [
          1600,
          2000
        ],
        "2bd": [
          2200,
          2800
        ],
        "3bd": [
          2800,
          3600
        ],
        "sfr": [
          3800,
          5000
        ]
      },
      "diamond-bar": {
        "name": "Diamond Bar 钻石吧",
        "area": "San Gabriel Valley",
        "1bd": [
          1700,
          2100
        ],
        "2bd": [
          2300,
          2900
        ],
        "3bd": [
          2900,
          3800
        ],
        "sfr": [
          4000,
          5500
        ]
      },
      "san-gabriel": {
        "name": "San Gabriel 圣盖博",
        "area": "San Gabriel Valley",
        "1bd": [
          1700,
          2100
        ],
        "2bd": [
          2300,
          2900
        ],
        "3bd": [
          2900,
          3700
        ],
        "sfr": [
          3800,
          5200
        ]
      },
      "monterey-park": {
        "name": "Monterey Park 蒙特利公园",
        "area": "San Gabriel Valley",
        "1bd": [
          1600,
          2000
        ],
        "2bd": [
          2100,
          2700
        ],
        "3bd": [
          2700,
          3500
        ],
        "sfr": [
          3600,
          5000
        ]
      },
      "alhambra": {
        "name": "Alhambra 阿罕布拉",
        "area": "San Gabriel Valley",
        "1bd": [
          1700,
          2100
        ],
        "2bd": [
          2200,
          2800
        ],
        "3bd": [
          2800,
          3600
        ],
        "sfr": [
          3700,
          5100
        ]
      },
      "temple-city": {
        "name": "Temple City 天普市",
        "area": "San Gabriel Valley",
        "1bd": [
          1750,
          2150
        ],
        "2bd": [
          2300,
          2900
        ],
        "3bd": [
          2900,
          3700
        ],
        "sfr": [
          3900,
          5300
        ]
      },
      "west-covina": {
        "name": "West Covina 西科维纳",
        "area": "San Gabriel Valley",
        "1bd": [
          1600,
          2000
        ],
        "2bd": [
          2100,
          2700
        ],
        "3bd": [
          2700,
          3500
        ],
        "sfr": [
          3500,
          4800
        ]
      },
      "walnut": {
        "name": "Walnut 核桃市",
        "area": "San Gabriel Valley",
        "1bd": [
          1750,
          2150
        ],
        "2bd": [
          2300,
          2900
        ],
        "3bd": [
          2900,
          3800
        ],
        "sfr": [
          4000,
          5500
        ]
      },
      "hacienda-heights": {
        "name": "Hacienda Heights 花仙纳岗",
        "area": "San Gabriel Valley",
        "1bd": [
          1600,
          2000
        ],
        "2bd": [
          2100,
          2700
        ],
        "3bd": [
          2700,
          3500
        ],
        "sfr": [
          3600,
          5000
        ]
      },
      "pasadena": {
        "name": "Pasadena 帕萨迪纳",
        "area": "San Gabriel Valley",
        "1bd": [
          1900,
          2400
        ],
        "2bd": [
          2600,
          3300
        ],
        "3bd": [
          3300,
          4300
        ],
        "sfr": [
          4500,
          6500
        ]
      },
      "los-angeles": {
        "name": "Los Angeles 洛杉矶",
        "area": "Los Angeles",
        "1bd": [
          2000,
          2800
        ],
        "2bd": [
          2800,
          3800
        ],
        "3bd": [
          3500,
          5000
        ],
        "sfr": [
          4500,
          8000
        ]
      },
      "san-marino": {
        "name": "San Marino 圣马力诺",
        "area": "San Gabriel Valley",
        "1bd": [
          2200,
          2800
        ],
        "2bd": [
          3000,
          3800
        ],
        "3bd": [
          3800,
          5000
        ],
        "sfr": [
          5500,
          8000
        ]
      },
      "torrance": {
        "name": "Torrance 托伦斯",
        "area": "South Bay",
        "1bd": [
          1900,
          2400
        ],
        "2bd": [
          2600,
          3200
        ],
        "3bd": [
          3200,
          4200
        ],
        "sfr": [
          4000,
          5800
        ]
      },
      "chino-hills": {
        "name": "Chino Hills 奇诺岗",
        "area": "Inland Empire",
        "1bd": [
          1800,
          2200
        ],
        "2bd": [
          2400,
          3000
        ],
        "3bd": [
          3000,
          3900
        ],
        "sfr": [
          4200,
          5800
        ]
      },
      "ontario": {
        "name": "Ontario 安大略市",
        "area": "Inland Empire",
        "1bd": [
          1600,
          2000
        ],
        "2bd": [
          2100,
          2700
        ],
        "3bd": [
          2700,
          3500
        ],
        "sfr": [
          3500,
          4800
        ]
      },
      "rancho-cucamonga": {
        "name": "Rancho Cucamonga 牧场库卡蒙加",
        "area": "Inland Empire",
        "1bd": [
          1700,
          2100
        ],
        "2bd": [
          2200,
          2800
        ],
        "3bd": [
          2800,
          3700
        ],
        "sfr": [
          3800,
          5200
        ]
      },
      "riverside": {
        "name": "Riverside 河滨市",
        "area": "Inland Empire",
        "1bd": [
          1400,
          1800
        ],
        "2bd": [
          1900,
          2400
        ],
        "3bd": [
          2400,
          3200
        ],
        "sfr": [
          3200,
          4500
        ]
      },
      "corona": {
        "name": "Corona 科罗纳",
        "area": "Inland Empire",
        "1bd": [
          1600,
          2000
        ],
        "2bd": [
          2100,
          2700
        ],
        "3bd": [
          2700,
          3500
        ],
        "sfr": [
          3600,
          5000
        ]
      },
      "moreno-valley": {
        "name": "Moreno Valley 莫雷诺谷",
        "area": "Inland Empire",
        "1bd": [
          1400,
          1700
        ],
        "2bd": [
          1800,
          2300
        ],
        "3bd": [
          2300,
          3000
        ],
        "sfr": [
          3000,
          4200
        ]
      }
    }
  };
});

<template>
  <v-card :class="classes">
    <v-card-title class="vc-label">
      <span :style="computeStyle('Label', schema)">{{ label }}</span>
      <v-tooltip right :disabled="!schema.tooltip">
        <template v-slot:activator="{ on }">
          <v-icon v-show="schema.tooltip" v-on="on" color="primary">mdi-message-alert</v-icon>
        </template>
        <span>{{ tooltipLabel }}</span>
      </v-tooltip>
    </v-card-title>
    <v-divider></v-divider>
    <template>
      <component :is="schema.chartType" :schema="schema" :data="data" :colors="colors" :judge-width="true"
        :settings="chartSettings" :extend="chartExtend" :options="schema.options" :grid="schema.grid"
        :yAxis="schema.yAxis" :xAxis="schema.xAxis" :legend="legend" :after-config="afterConfig"></component>
    </template>
  </v-card>
</template>

<script>
  import queryBase from "../utils/query-base";
  import queryFilter from "../utils/query-filter";

  export default {
    mixins: [queryBase, queryFilter],
    data: function () {
      var self = this;
      this.chartExtend = {
        series(v) {
          if (v && v.length) {
            v.forEach((i, index) => {
              if (self.schema.chartExtends) {
                Object.assign(i, self.schema.chartExtends[index]);
              }
            });
            return v;
          } else {
            return v;
          }
        },
      };
      return {
        legend: [{
          type: "scroll",
          orient: "horizontal",
        }, ],
        colors: ['#d04a02', '#571f01', '#933401', '#fd6412', '#feb791', '#d93954', '#6e2a35', '#a43e50', '#e27588',
          '#f1bac3', '#e0301e', '#741910', '#aa2417', '#e86153', '#f7c8c4'
        ],
        defaultSettings: {
          "ve-heatmap": {
            heatColor: ['#d04a02', '#ffb600', '#e0301e']
          },
          "ve-ring": {
            radius: ['40%', '70%'],
          },
          "ve-waterfall": {
            label: {
              show: true,
              color: "#000000de",
              position: 'top'
            },
          },
          "ve-radar": {
            name: {
              color: '#000'
            }
          },
          "ve-liquidfill": {
            seriesMap: {
              color: ["#d04a02"],
              backgroundStyle: {
                color: "#ffa929",
              },
              itemStyle: {
                shadowBlur: 0,
              },
              label: {
                color: "#000",
                insideColor: "#fff",
              },
              outline: {
                show: false,
              },
            },
          },
          "ve-wordcloud": {
            color: ['#d04a02', '#571f01', '#933401', '#fd6412', '#feb791', '#d93954', '#6e2a35', '#a43e50', '#e27588',
              '#f1bac3', '#e0301e', '#741910', '#aa2417', '#e86153', '#f7c8c4'
            ]
          },
          "ve-candle": {
            downColor: "#d04a02",
            upColor: "#d04a02",
            barMaxWidth: '100px'
          },
          "ve-gauge": {
            axisLine: {
              show: true,
              // 属性lineStyle控制线条样式
              lineStyle: {
                width: 35,
                color: [
                  [0.3, "#175d2d"],
                  [0.7, "#e0301e"],
                  [1, "#ffb600"]
                ]
              }
            },
            axisLabel: {
              color: '#000000de',
              distance: 15,
            },
          },
        },
        chartSettingsArr: [],
      };
    },
    computed: {
      chartSettings() {
        var chartSettings = JSON.parse(JSON.stringify(this.schema.chartSettings));
        if (
          chartSettings.dimension.length == 0 ||
          chartSettings.metrics.length == 0
        ) {
          //处理dimension和 metrics赋值空
          delete chartSettings.dimension;
          delete chartSettings.metrics;
        }
        let obj = {
          label: {
            color: "#000000de"
          }
        }
        return Object.assign(chartSettings, obj);
      },
      data() {
        if (
          this.queryResult &&
          this.queryResult.rows &&
          Array.isArray(this.queryResult.rows)
        ) {
          this.setChartSettingsArr();

          this.queryResult.rows.forEach((item) => {
            if (item) {
              // 针对key-value类型做特殊处理
              for (var key in item) {
                //特殊处理BSONNULL的情况。
                if (item[key] == "NG_BSONNULL") {
                  item[key] = "<empty>";
                }
                if (
                  this.chartSettingsArr &&
                  this.chartSettingsArr.length > 0 &&
                  this.chartSettingsArr.includes(key) === true
                ) {
                  if (Object.prototype.toString.call(item[key]) == "[object Array]") {
                    if (Object.prototype.toString.call(item[key][0]) == "[object Object]") {
                      let arr = item[key];
                      item[key] = this.getVals(arr);

                    }
                  }
                }
              }
            }
          });
        }
        return this.queryResult;
      },
    },
    methods: {
      setChartSettingsArr() {
        let dimension = this.schema.chartSettings.dimension || "";
        let metrics = this.schema.chartSettings.metrics || "";
        let chartSettingsArr = [];
        if (dimension) {
          chartSettingsArr = this.getTargetKey(dimension);
        }

        if (metrics) {
          chartSettingsArr = chartSettingsArr.concat(this.getTargetKey(metrics));
        }

        this.chartSettingsArr = [...new Set(chartSettingsArr)];
      },
      getTargetKey(target) {
        let result = [];
        if (typeof target === "string") {
          result.push(target);
        } else {
          result = result.concat(target);
        }
        return result;
      },
      /*
       * @description: 传入item[key],解析values
       * @param {array} item[key]
       * @return {array} values
       */
      getVals(arr) {
        let result = [];
        for (let key in arr) {
          let el = arr[key];
          if (el.value) {
            result.push(el.value);
          } else {
            result.push(el.UserName || el.firstline || "");
          }
        }
        return result;
      },
      afterConfig(options) {
        let series = options.series;
        let legend = options.legend;
        let settings = this.defaultSettings[this.schema.chartType];
        if (settings) {
          let series = options.series;
          series.forEach((el) => {
            if (el.type.toLowerCase() === "gauge") {
              el.axisLine = settings.axisLine;
              el.axisLabel = settings.axisLabel;
            }
            // if (el.type.toLowerCase() === "bar") {
            //   el.label = settings.label;
            // }
          });
          if (this.schema.chartType == 've-radar') {
            options.radar['name'] = settings.name;
          }
          if (this.schema.chartType == 've-candle') {
            series[0].barMaxWidth = settings.barMaxWidth;
          }
        }
        if( this.$vuetify.theme.dark){
          // series项样式修改为白色
          if(series instanceof Array && series.length > 0) {
            series.forEach((el) => {
              el.label = {
              color: '#ffffff'
              }
              el.axisLabel = {
                color: '#ffffff'
              }
            })
          }else if(series instanceof Object){
            series.label = {
              color: '#ffffff'
            };
          }
          // legend项样式修改为白色
          if(legend instanceof Array) {
            legend.forEach(item => {
              item.textStyle = {
                color: '#ffffff'
              }
              item.pageIconColor = '#ffffff';
              item.pageTextStyle ={color : '#ffffff'};
            })
          }
          // x坐标样式修改为白色
          if(options.xAxis && (options.xAxis instanceof Array) && options.xAxis.length){
            options.xAxis.forEach(item => {
              item.axisLabel = {
                color: '#ffffff'
              }
              item.nameTextStyle = { color :'#ffffff' }
            })
          }else if(options.xAxis && (options.xAxis instanceof Object)){
            options.xAxis.axisLabel = {
              color: '#ffffff'
            }
            options.xAxis.nameTextStyle = { color : '#ffffff' } 
          }
          // y坐标样式修改为白色
          if(options.yAxis && (options.yAxis instanceof Array) && options.yAxis.length){
            options.yAxis.forEach(item => {
              item.axisLabel = {
                color: '#ffffff'
              }
              item.nameTextStyle = { color :'#ffffff' } 
            })
          }else if(options.yAxis && (options.yAxis instanceof Object)){
            options.yAxis.axisLabel = {
              color: '#ffffff'
            }
            options.yAxis.nameTextStyle = { color : '#ffffff' } 
          }

          if(options.radar) {
            options.radar.name.textStyle = {
              color:'#fff'
            }
          }

        }
        console.log(options,'lllll')
        return options;
      },
      setLiquidfillSettings(settings) {
        // console.log(this.queryResult, '<<<<>>>>>>>')
        let columns = this.queryResult.columns || [];
        let rows = this.queryResult.rows || [];
        if (columns.length > 0 && rows.length > 0) {
          let data = columns[0];
          let seriesMap = {};
          rows.forEach((el) => {
            let key = el[data];
            seriesMap[key] = settings.seriesMap;
          });
          this.chartSettings.seriesMap = seriesMap;
        }
      },
      setCustomSettings(settings) {
        Object.assign(this.chartSettings, settings);
      },
      setDefaultSettings() {
        let chartType = this.schema.chartType;
        let settings = this.defaultSettings[chartType];
        if (settings) {
          switch (chartType) {
            case "ve-liquidfill":
              this.setLiquidfillSettings(settings);
              break;
            case "ve-gauge":
              this.chartSettings.seriesMap = settings.seriesMap;
            case "ve-heatmap":
            case "ve-ring":
            case "ve-wordcloud":
            case "ve-candle":
              this.setCustomSettings(settings);
              break;
          }
        }
      },
    },
    created() {
      // this.setDefaultSettings();
    },
    updated() {
      this.$nextTick(() => {
        this.setDefaultSettings();
      });
    },
  };

</script>

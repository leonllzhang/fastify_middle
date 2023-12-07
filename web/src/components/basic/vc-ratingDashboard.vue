<template>
  <v-container class="ratingDashboard" :class="{'dark-board': $vuetify.theme.dark}">
    <v-row style="padding-top: 40px"></v-row>
    <!--    <v-row>-->
    <!--      <v-col class="ScreenshotBtnCol">-->
    <!--        <v-btn @click="printPage" outlined class="ScreenshotBtn">-->
    <!--          <v-icon size="18">mdi-camera</v-icon>-->
    <!--          {{ $t('ratingComponent.dashboard.screenshot') }}-->
    <!--        </v-btn>-->
    <!--      </v-col>-->
    <!--    </v-row>-->
    <v-row class="ratingDashboardFirstDatas">
      <v-col cols="7">
        <v-row style="align-items: center">
          <v-col class="rateReport">
            <div id="rateCharts" style="width: 300px; height: 300px"></div>
            <v-row>
              <template v-for="(item, index) in percentOfScore">
                <div :key="index"><strong>{{ index + 1 }}:</strong> {{ item }}%</div>
              </template>
            </v-row>
          </v-col>
          <v-col class="daliyReports row">
            <template v-for="(item, index) in dalyReportData">
              <v-row :key="index" class="dailyReportItem">
                <div class="header" :style="{
                  background:
                    item.headerColor +
                    ' 0% 0% no-repeat padding-box !important',
                }">
                  {{ item.header }}
                </div>
                <v-col class="dailyReportItemCol">
                  <v-row>
                    <v-col class="title">{{ item.title }}</v-col>
                    <v-col class="title textRight" cols="2">
                      {{
                        item.score
                      }}
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col class="subTitle">{{ item.subTitle }}</v-col>
                    <v-col class="percent textRight" :style="{
                      color:
                        item.percentType == 0 ? '#bf0505 !important' : 'auto',
                    }" cols="2">
                      {{
                        (item.percentType == 0 ? "" : "+") + item.percent
                      }}%
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </template>
          </v-col>
        </v-row>
      </v-col>
      <v-divider vertical color="#CBCBCB"/>
      <v-col cols="4" class="allRating row">
        <v-row>
          <v-col class="title">{{ $t('ratingComponent.dashboard.allFeedbacks') }}</v-col>
        </v-row>
        <v-row>
          <v-col class="count"> {{ ratingCount }}</v-col>
        </v-row>
        <v-row class="weekAndUVReport">
          <v-col class="row" style="margin-left: 0px">
            <div class="icon">
              <img :src="images.up" width="22" height="22"/>
            </div>
            <div class="weekAndUVReportItem">
              <div class="subCount">{{ currentWeekTotalCount }}</div>
              <div class="subTitle">{{ $t('ratingComponent.dashboard.weekFeedbacks') }}</div>
            </div>
          </v-col>
          <!--<v-col class="row" style="margin-left: 0px; justify-content: end">
            <div class="icon">
              <img :src="images.users" width="22" height="22" />
            </div>
            <div class="weekAndUVReportItem">
              <div class="subCount">{{ uvCount }}</div>
              <div class="subTitle">Unique Visitors</div>
            </div>
          </v-col>-->
        </v-row>
      </v-col>
    </v-row>
    <v-row class="ratingDashboardSecondDatas">
      <v-col v-show="chartType == 0" cols="9" class="lineChartsStyle">
        <v-row>
          <v-col class="title">{{ $t('ratingComponent.dashboard.averageScore') }}</v-col>
          <v-col class="datescol">
            <v-menu v-model="menu" :close-on-content-click="false" :nudge-right="40" transition="scale-transition"
                    offset-y min-width="290px">
              <template v-slot:activator="{ on, attrs }">
                <v-row class="datesrow" @click="menu = true" v-bind="attrs" v-on="on">
                  <img :src="images.timeFill" height="14" width="14"/>
                  <div>
                    {{
                      dateRangeText.replaceAll(
                        "to",
                        "&nbsp;&nbsp;to&nbsp;&nbsp;"
                      )
                    }}
                  </div>
                </v-row>
              </template>
              <v-date-picker color="primary" v-model="dates" range @input="changeDatePicker(1)"
                             @change="changeDatePickerEvent(1)"></v-date-picker>
            </v-menu>
          </v-col>
        </v-row>
        <div id="lineCharts" style="width: 100%; height: 484px"></div>
      </v-col>
      <v-col v-show="chartType == 1" cols="9" class="barChartsStyle">
        <v-row>
          <v-col class="title">{{ $t('ratingComponent.dashboard.browserLanguageRatio') }}</v-col>
          <v-col class="datescol">
            <v-menu v-model="menu2" :close-on-content-click="false" :nudge-right="40" transition="scale-transition"
                    offset-y min-width="290px">
              <template v-slot:activator="{ on, attrs }">
                <v-row class="datesrow" @click="menu2 = true" v-bind="attrs" v-on="on">
                  <img :src="images.timeFill" height="14" width="14"/>
                  <div>
                    {{
                      dateRangeText.replaceAll(
                        "to",
                        "&nbsp;&nbsp;to&nbsp;&nbsp;"
                      )
                    }}
                  </div>
                </v-row>
              </template>
              <v-date-picker color="primary" v-model="dates" range @input="changeDatePicker()"
                             @change="changeDatePickerEvent()"></v-date-picker>
            </v-menu>
          </v-col>
        </v-row>
        <div id="barCharts" style="width: 100%; height: 484px"></div>
      </v-col>
      <v-col>
        <v-row>
          <v-col class="title">{{ $t('ratingComponent.dashboard.otherData') }}</v-col>
        </v-row>
        <v-row class="otherDataRow">
          <div class="otherDataItem">
            <v-row>
              <img :src="images.languages"/>
              <div class="title">{{ $t('ratingComponent.dashboard.browserLanguageRatio') }}</div>
            </v-row>
            <template v-for="(item, index) in languageDatas">
              <v-row :key="index">
                <v-col>{{ item.title }}</v-col>
                <v-col>{{ item.percent }}%</v-col>
                <v-col>{{ item.averageScore }}</v-col>
              </v-row>
            </template>
            <!-- <v-row>
              <a href="#">Details ></a>
            </v-row> -->
          </div>
        </v-row>
        <v-row class="otherDataRow">
          <div class="otherDataItem">
            <v-row>
              <img :src="images.computer"/>
              <div class="title">{{ $t('ratingComponent.dashboard.equipmentTypeRatio') }}</div>
            </v-row>
            <template v-for="(item, index) in deviceDatas">
              <v-row :key="index">
                <v-col>{{ item.title }}</v-col>
                <v-col>{{ item.percent }}%</v-col>
                <v-col>{{ item.averageScore }}</v-col>
              </v-row>
            </template>
            <!-- <v-row>
              <a href="#">Details ></a>
            </v-row> -->
          </div>
        </v-row>
        <v-row class="otherDataRow">
          <div class="otherDataItem">
            <v-row>
              <img :src="images.chrome"/>
              <div class="title">{{ $t('ratingComponent.dashboard.browserTypeRatio') }}</div>
            </v-row>
            <template v-for="(item, index) in browserDatas">
              <v-row :key="index">
                <v-col>{{ item.title }}</v-col>
                <v-col>{{ item.percent }}%</v-col>
                <v-col>{{ item.averageScore }}</v-col>
              </v-row>
            </template>

            <!-- <v-row>
              <a href="#">Details ></a>
            </v-row> -->
          </div>
        </v-row>
      </v-col>

    </v-row>
    <v-row style="padding-bottom: 40px"></v-row>
    <div v-if="chartLoading" class="Loading">
      <v-progress-circular size="60" indeterminate color="primary"></v-progress-circular>
    </div>
  </v-container>
</template>

<script>
import echarts from "echarts";
import html2canvas from "html2canvas";

export default {
  created() {
  },
  computed: {
    dateRangeText() {
      return this.dates.join("to");
    },
  },
  mounted() {
    this.dates = this.getMonthStartAndEnd(0);
    this.initData(this.dates);

  },
  data() {
    return {
      chartLoading: false,
      percentOfScore: [0, 0, 0, 0, 0],
      dalyReportData: [
        {
          header: "D",
          headerColor: "#FEF4E3",
          title: this.$t('ratingComponent.dashboard.todayScore'),
          score: 0,
          subTitle: this.$t('ratingComponent.dashboard.compareYesterday'),
          percent: 0,
          percentType: 1,
        },
        {
          header: "W",
          headerColor: "#E7E9FB",
          title: this.$t('ratingComponent.dashboard.weeklyScore'),
          score: 0,
          subTitle: this.$t('ratingComponent.dashboard.compareWeekly'),
          percent: 0,
          percentType: 1,
        },
        {
          header: "M",
          headerColor: "#E0F7FC",
          title: this.$t('ratingComponent.dashboard.monthlyScore'),
          score: 0,
          subTitle: this.$t('ratingComponent.dashboard.compareMonthly'),
          percent: 0,
          percentType: 1,
        },
      ],
      menu: false,
      menu2: false,
      dates: ["2022-05-01", "2022-05-31"],
      chartType: 0,
      initLineChart: false,
      initBarChart: false,
      docData: [],
      ratingCount: 0,
      averageScore: 0.0,
      currentWeekTotalCount: 0,
      lineChartDatas: [{xData: [], yData: []}],
      barChartDatas: [{xData: [], yData: []}],
      languageDatas: [
        {
          title: this.$t('ratingComponent.dashboard.chinese'),
          type: 'zh',
          percent: 0,
          averageScore: 0,
          totalCount: 0,
          totalScore: 0
        },
        {
          title: this.$t('ratingComponent.dashboard.english'),
          type: 'en',
          percent: 0,
          averageScore: 0,
          totalCount: 0,
          totalScore: 0
        },
        {
          title: this.$t('ratingComponent.dashboard.other'),
          type: '',
          percent: 0,
          averageScore: 0,
          totalCount: 0,
          totalScore: 0
        }
      ],
      deviceDatas: [
        {
          title: this.$t('ratingComponent.dashboard.pc'),
          type: 1280,
          percent: 0,
          averageScore: 0,
          totalCount: 0,
          totalScore: 0
        },
        {
          title: this.$t('ratingComponent.dashboard.mobile'),
          type: 960,
          percent: 0,
          averageScore: 0,
          totalCount: 0,
          totalScore: 0
        },
        {
          title: this.$t('ratingComponent.dashboard.other'),
          type: 0,
          percent: 0,
          averageScore: 0,
          totalCount: 0,
          totalScore: 0
        }
      ],
      browserDatas: [
        {
          title: this.$t('ratingComponent.dashboard.chrome'),
          type: 'chrome',
          percent: 0,
          averageScore: 0,
          totalCount: 0,
          totalScore: 0
        },
        {
          title: this.$t('ratingComponent.dashboard.edge'),
          type: 'edg',
          percent: 0,
          averageScore: 0,
          totalCount: 0,
          totalScore: 0
        },
        {
          title: this.$t('ratingComponent.dashboard.other'),
          type: '',
          percent: 0,
          averageScore: 0,
          totalCount: 0,
          totalScore: 0
        },
      ],
      images: {
        up: this.$store.getters.cdnHostAndVersionPath + "/static/images/components/rating/components/dashboard/rating_dashboard_up.svg",
        users: this.$store.getters.cdnHostAndVersionPath + "/static/images/components/rating/components/dashboard/rating_dashboard_users.svg",
        languages: this.$store.getters.cdnHostAndVersionPath + "/static/images/components/rating/components/dashboard/rating_dashboard_languages.svg",
        chrome: this.$store.getters.cdnHostAndVersionPath + "/static/images/components/rating/components/dashboard/rating_dashboard_chrome.svg",
        computer: this.$store.getters.cdnHostAndVersionPath + "/static/images/components/rating/components/dashboard/rating_dashboard_computer.svg",
        timeFill: this.$store.getters.cdnHostAndVersionPath + "/static/images/components/rating/components/dashboard/rating_dashboard_time_fill.svg",
      },
      uvCount: 0
    };
  },
  methods: {
    toggleChartType() {
      var that = this;
      that.chartType = that.chartType == 1 ? 0 : 1;
      that.chartLoading = !that.chartLoading;
      setTimeout(function () {
        if (that.chartType == 0) {
          if (!that.initLineChart) {
            that.initLineCharts();
          }
        } else {
          if (!that.initBarChart) {
            that.initBarCharts();
          }
        }
        that.chartLoading = !that.chartLoading;
      }, 1000);
    },
    changeDatePicker() {
      if (this.dates != null && this.dates.length == 2) {
        this.menu = false;
        this.menu2 = false;
        this.dates.sort();
      }
    },
    changeDatePickerEvent() {
      this.initData(this.dates);
    },
    dataURLToBlob(dataurl) {
      let arr = dataurl.split(",");
      let mime = arr[0].match(/:(.*?);/)[1];
      let bstr = atob(arr[1]);
      let n = bstr.length;
      let u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], {type: mime});
    },
    printPage() {
      let that = this;
      html2canvas(document.body).then(function (canvas) {
        let a = document.createElement("a");
        let blob = that.dataURLToBlob(canvas.toDataURL("image/png"));
        a.setAttribute("href", URL.createObjectURL(blob));
        a.setAttribute("download", "rating_dashboard.png");
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(blob);
        document.body.removeChild(a);
      });
    },

    initData(dates) {
      let that = this;
      that.chartLoading = true;
      const endTimes = ' 23:59:59.999';
      const TodayStartTime = that.getDateTimeStamp(null, '');
      const TodayEndTime = that.getDateTimeStamp(null, endTimes);
      const yesterdayTimeStamp = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
      const yesterdayTimeStr = (yesterdayTimeStamp.getFullYear() + '-' + (yesterdayTimeStamp.getMonth() + 1) + '-' + yesterdayTimeStamp.getDate()).toString();
      const YesterdayStartTime = that.getDateTimeStamp(yesterdayTimeStr, '');
      const YesterdayEndTime = that.getDateTimeStamp(yesterdayTimeStr, endTimes);
      const currentWeekDates = that.getWeekStartAndEnd(0);
      const CurrentWeekStartTime = that.getDateTimeStamp(currentWeekDates[0], '');
      const CurrentWeekEndTime = that.getDateTimeStamp(currentWeekDates[1], endTimes);
      const lastWeekDates = that.getWeekStartAndEnd(-1);
      const LastWeekStartTime = that.getDateTimeStamp(lastWeekDates[0], '');
      const LastWeekEndTime = that.getDateTimeStamp(lastWeekDates[1], endTimes);
      const currentMonthTime = this.getMonthStartAndEnd(0);
      const CurrentMonthStartTime = that.getDateTimeStamp(currentMonthTime[0], '');
      const CurrentMonthEndTime = that.getDateTimeStamp(currentMonthTime[1], endTimes);
      const lastMonthDates = that.getMonthStartAndEnd(-1);
      const LastMonthStartTime = that.getDateTimeStamp(lastMonthDates[0], '');
      const LastMonthEndTime = that.getDateTimeStamp(lastMonthDates[1], endTimes);
      const LineChartStartTime = that.getDateTimeStamp(dates[0], '');
      const LineChartEndTime = that.getDateTimeStamp(dates[1], endTimes);
      that.$axios.post("/api/sc/ur/dashboard", {
        MaxScore: 5,
        TodayStartTime,
        TodayEndTime,
        YesterdayStartTime,
        YesterdayEndTime,
        CurrentWeekStartTime,
        CurrentWeekEndTime,
        LastWeekStartTime,
        LastWeekEndTime,
        CurrentMonthStartTime,
        CurrentMonthEndTime,
        LastMonthStartTime,
        LastMonthEndTime,
        LineChartStartTime,
        LineChartEndTime
      }).then((res) => {
        // console.log(res);

        if (res != null && res.data != null && res.data.data != null && res.data.statusCode == 200) {

          that.averageScore = parseFloat(res.data.data.averageScore).toFixed(1);
          that.ratingCount = res.data.data['totalNumber'];
          that.currentWeekTotalCount = res.data.data['totalNumberOfWeekly'];

          for (let i = 0; i < that.percentOfScore.length; i++) {
            let percentTemp = that.computePercent(res.data.data['totalScorePercentList'][i + 1], that.ratingCount, 1);
            if (isNaN(percentTemp)) percentTemp = 0;
            that.percentOfScore[i] = percentTemp
          }
          for (let i = 0; i < res.data.data['scoreListForDayToMonth'].length; i++) {
            that.dalyReportData[i].score = res.data.data['scoreListForDayToMonth'][i].averageScore.toFixed(1);
            that.dalyReportData[i].percent = res.data.data['scoreListForDayToMonth'][i].percent;
            that.dalyReportData[i].percentType = res.data.data['scoreListForDayToMonth'][i].percentType;
          }
          that.initRateCharts();

          let endTime = new Date(dates[1] + endTimes).getTime() / 1000 - parseInt(new Date(dates[0]).getTime() / 1000);
          const timeDay = parseInt(endTime / 60 / 60 / 24);
          let currentDayCount = timeDay + 1;
          let currentArray = [];
          that.lineChartDatas.xData = [];
          for (let i = 0; i < currentDayCount; i++) {
            let indexDay = new Date(dates[0] + ' 00:00:00.000');
            indexDay = +indexDay + i * 1000 * 60 * 60 * 24;
            indexDay = new Date(indexDay)
            indexDay = (indexDay.getFullYear() + '-' + (indexDay.getMonth() + 1) + '-' + indexDay.getDate()).toString();
            const indexStartTimeStamp = that.getDateTimeStamp(indexDay, '');
            const indexEndTimeStamp = that.getDateTimeStamp(indexDay, endTimes);
            currentArray.push({
              start: indexStartTimeStamp,
              end: indexEndTimeStamp,
              averageScore: 0.0,
              totalCount: 0,
              totalScore: 0.0,
              day: indexDay
            });
            that.lineChartDatas.xData.push(indexDay);
          }
          // console.log(currentArray)
          that.lineChartDatas.yData = new Array(that.lineChartDatas.xData.length).fill(0);
          let languageTotalCount = 0, browserTotalCount = 0, deviceTotalCount = 0;
          that.clearLDB('languageDatas');
          that.clearLDB('deviceDatas');
          that.clearLDB('browserDatas');

          if (res.data.data['scoreListForLineChart']) {
            res.data.data['scoreListForLineChart'].forEach((e) => {
              const score = parseFloat(e['Score']);
              const creationTime = new Date(e['CreationTime']);
              const timeTemp = creationTime.getTime();
              if (timeTemp >= LineChartStartTime && timeTemp <= LineChartEndTime) {
                if (e.BrowserInfo != null) {
                  const browserJSON = JSON.parse(e.BrowserInfo);
                  if (browserJSON.language != null) {
                    languageTotalCount += 1;
                    that.computeLanguage(that, browserJSON, score)
                  }
                  if (browserJSON.userAgent != null) {
                    browserTotalCount += 1;
                    that.computeBrowser(that, browserJSON, score);
                  }
                }
                if (e.ScreenWidth != null) {
                  deviceTotalCount += 1;
                  that.computeDevice(that, e, score)

                }
                for (let j = 0; j < currentArray.length; j++) {
                  if (timeTemp >= currentArray[j].start && timeTemp <= currentArray[j].end) {
                    currentArray[j].totalCount += 1;
                    currentArray[j].totalScore += score;
                    currentArray[j].averageScore = parseFloat((currentArray[j].totalScore / currentArray[j].totalCount).toFixed(1));
                    that.putLineData(currentArray[j].averageScore, currentArray[j].day)
                  }
                }
              }
            })
          }
          that.computeLDB(languageTotalCount, browserTotalCount, deviceTotalCount);
          this.initLineCharts(1)
          // console.log(that.lineChartDatas)
        }
        that.chartLoading = false;
      }).catch((e) => {
        // console.log(e)
      });
    },


    initRateCharts() {
      let dom = document.getElementById("rateCharts");
      let myChart = echarts.init(dom, null, {
        renderer: "canvas",
        useDirtyRect: false,
      });
      let primaryColor = this.$vuetify.theme.dark ?  this.$vuetify.theme.themes.dark.primary : this.$vuetify.theme.themes.light.primary;
      let option = {
        series: [
          {
            type: "gauge",
            radius: "82%",
            center: ["50%", "54%"],
            min: 1,
            max: 5,
            splitNumber: 20,
            axisLine: {
              show: true,
              roundCap: true,
              lineStyle: {
                width: 20,
                color: [
                  [parseFloat(this.averageScore,) / 5, new echarts.graphic.LinearGradient(0, 0, 1, 0, [{offset: 0.1,color: "#EDEAF8" },
                  {
                    offset: 1,
                    color: primaryColor
                  }
                  ])],
                  [1, "#EDEAF8"]
                ],
              },
            },
            progress: {
              show: true,
              width: 20,
              clip: true,
              roundCap: true,
              overlap: false,
              itemStyle: {
                color: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 0,
                      color: "#583CD4", // 0% 处的颜色
                    },
                    {
                      offset: 1,
                      color: "#D9A5FB", // 100% 处的颜色
                    },
                  ],
                },
              },
            },
            pointer: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            splitLine: {
              show: false,
              length: 7,
              lineStyle: {
                color: "#EBEBEB",
                width: 2,
              },
              distance: -36,
            },
            axisLabel: {
              color: "#7D7D7D",
              fontSize: 18,
              distance: -30,
              formatter: function (value) {
                if (value === 1) {
                  return "1";
                } else if (value === 2) {
                  return "2";
                } else if (value === 3) {
                  return "3";
                } else if (value === 4) {
                  return "4";
                } else if (value === 5) {
                  return "5";
                }
                return "";
              },
            },
            title: {
              offsetCenter: [0, "30%"],
              fontSize: 16,
              color: "#7D7D7D",
            },
            detail: {
              fontSize: 36,
              offsetCenter: [0, "-10%"],
              valueAnimation: true,
              color: "#171725",
            },
            data: [
              {
                value: this.averageScore,
                name: this.$t("ratingComponent.dashboard.overallScore"),
              },
            ],
          },

        ],
      };

      if (option && typeof option === "object") {
        if(this.$vuetify.theme.dark) {
          option.series[0].title = {
              offsetCenter: [0, "30%"],
              fontSize: 16,
              color: "#ffffff",
            };
          option.series[0].axisLabel.color = '#ffffff';
          option.series[0].detail.color = '#ffffff';
         }
        myChart.setOption(option);
      }

      window.addEventListener("resize", myChart.resize);
    },
    initLineCharts(reSet) {
      let dom = document.getElementById("lineCharts");
      let myChart = echarts.init(dom, null, {
        renderer: "canvas",
        useDirtyRect: false,
      });
      let primaryColor = this.$vuetify.theme.dark ?  this.$vuetify.theme.themes.dark.primary : this.$vuetify.theme.themes.light.primary;
      let option = {
        title: {
          show: false,
        },
        tooltip: {
          backgroundColor: "#ffffff",
          trigger: "axis",
          textStyle: {
            color: "#464646",
            fontFamily: "Helvetica",
          },
        },

        grid: {
          left: "2.8%",
          right: "2.8%",
          bottom: "0%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: this.lineChartDatas.xData,
          axisLine: {
            lineStyle: {
              color: "#DBD5D9",
            },
          },
          axisLabel: {
            color: "#7D7D7D",
          },
        },
        yAxis: {
          type: "value",
          axisLabel: {
            color: "#7D7D7D",
          },
          splitLine: {show: false},
          axisLine: {
            show: true,
            lineStyle: {color: "#DBD5D9"},
          },
          axisTick: {
            show: true,
          },
        },

        series: [
          {
            itemStyle: {
              color: primaryColor,
            },

            type: "line",
            stack: "Total",
            smooth: true,
            lineStyle: {
              width: 2,
              color: primaryColor,
            },
            showSymbol: false,
            areaStyle: {
              opacity: 1,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: "#C3BAFF66",
                },
                {
                  offset: 1,
                  color: "#C3BAFF00",
                },
              ]),
            },
            symbol: "circle",
            symbolSize: 8,
            emphasis: {
              focus: "series",
            },
            data: this.lineChartDatas.yData,
          },
        ],
      };
      myChart.clear();
      if (option && typeof option === "object") {
        if(this.$vuetify.theme.dark) {
          option.xAxis.axisLabel = {color: '#ffffff'};
          option.yAxis.axisLabel = {color: '#ffffff'};
        } 
        myChart.setOption(option);
      }
      if (reSet == null) {
        myChart.on("click", function (params) {
          // console.log(params);
        });
      }
      this.initLineChart = true;
    },
    initBarCharts() {
      const dom = document.getElementById("barCharts");
      const myChart = echarts.init(dom, null, {
        renderer: "canvas",
        useDirtyRect: false,
      });
      let option;
      option = {
        textStyle: {
          color: "#7D7D7D",
          fontFamily: "Helvetica",
          fontWeight: "normal",
          fontSize: 14,
        },
        xAxis: {
          type: "category",
          data: this.barChartDatas.xData,
          axisLine: {
            lineStyle: {
              color: "#DBD5D9",
            },
          },
        },
        yAxis: {
          type: "value",
          axisLabel: {
            color: "#7D7D7D",
          },
          splitLine: {show: false},
          axisLine: {
            show: true,
            lineStyle: {color: "#DBD5D9"},
          },
          axisTick: {
            show: true,
          },
        },

        grid: {
          left: "0%",
          right: "1.2%",
          bottom: "0%",
          containLabel: true,
        },
        series: [
          {
            data: this.barChartDatas.yData,
            type: "bar",
            barWidth: 14,
            itemStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: "#9C4DCF", // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: "#583CD4", // 100% 处的颜色
                  },
                ],
              },
            },
          },
        ],
      };

      if (option && typeof option === "object") {
        myChart.setOption(option);
      }
      myChart.on("click", function (params) {
        // console.log(params);
      });
      this.initBarChart = true;
    },
    putLineData(averageScore, day) {
      this.lineChartDatas.xData.filter((e, index) => {
        if (e == day) {
          this.lineChartDatas.yData[index] = averageScore;
        }
      })
    },
    getDateTimeStamp(dateStr, endStr) {
      const timeDate = dateStr != null ? new Date(dateStr) : new Date();
      const year = timeDate.getFullYear();
      const month = timeDate.getMonth() + 1;
      const date = timeDate.getDate();
      return Date.parse(year + '-' + month + '-' + date + endStr);
    },
    computePercent(n1, n2, type) {
      return type == 1 ? (n1 / n2 * 10000 / 100).toFixed(1) : Math.round((n1 / n2 - 1) * 100);
    },
    getWeekStartAndEnd(AddWeekCount) {
      var startStop = new Array();
      var millisecond = 1000 * 60 * 60 * 24;
      var currentDate = new Date();
      currentDate = new Date(currentDate.getTime() + (millisecond * 7 * AddWeekCount));
      var week = currentDate.getDay();
      var month = currentDate.getDate();
      var minusDay = week != 0 ? week - 1 : 6;
      var currentWeekFirstDay = new Date(currentDate.getTime() - (millisecond * minusDay));
      var currentWeekLastDay = new Date(currentWeekFirstDay.getTime() + (millisecond * 6));
      startStop.push(this.getDateStr(currentWeekFirstDay));
      startStop.push(this.getDateStr(currentWeekLastDay));
      return startStop;
    },
    getMonthStartAndEnd(AddMonthCount) {
      var startStop = new Array();
      var currentDate = new Date();
      var month = currentDate.getMonth() + AddMonthCount;
      if (month < 0) {
        var n = parseInt((-month) / 12);
        month += n * 12;
        currentDate.setFullYear(currentDate.getFullYear() - n);
      }
      currentDate = new Date(currentDate.setMonth(month));
      var currentMonth = currentDate.getMonth();
      var currentYear = currentDate.getFullYear();
      var currentMonthFirstDay = new Date(currentYear, currentMonth, 1);
      var currentMonthLastDay = new Date(currentYear, currentMonth + 1, 0);
      startStop.push(this.getDateStr(currentMonthFirstDay));
      startStop.push(this.getDateStr(currentMonthLastDay));
      return startStop;
    },
    getDateStr(date) {
      var year = "";
      var month = "";
      var day = "";
      var now = date;
      year = "" + now.getFullYear();
      if ((now.getMonth() + 1) < 10) {
        month = "0" + (now.getMonth() + 1);
      } else {
        month = "" + (now.getMonth() + 1);
      }
      if ((now.getDate()) < 10) {
        day = "0" + (now.getDate());
      } else {
        day = "" + (now.getDate());
      }
      return year + "-" + month + "-" + day;
    },
    computeLDB(languageTotalCount, browserTotalCount, deviceTotalCount) {
      var that = this;
      for (var i = 0; i < that.languageDatas.length; i++) {
        that.languageDatas[i].percent = that.languageDatas[i].totalCount > 0 ? that.computePercent(that.languageDatas[i].totalCount, languageTotalCount, 1) : 0;
      }
      for (var i = 0; i < that.browserDatas.length; i++) {
        that.browserDatas[i].percent = that.browserDatas[i].totalCount > 0 ? that.computePercent(that.browserDatas[i].totalCount, browserTotalCount, 1) : 0;
      }
      for (var i = 0; i < that.deviceDatas.length; i++) {
        that.deviceDatas[i].percent = that.deviceDatas[i].totalCount > 0 ? that.computePercent(that.deviceDatas[i].totalCount, deviceTotalCount, 1) : 0;
      }
    },
    clearLDB(type) {
      for (var i = 0; i < this[type].length; i++) {
        this[type][i].totalCount = 0;
        this[type][i].totalScore = 0;
        this[type][i].averageScore = 0;
        this[type][i].percent = 0;
      }
    },
    computeLanguage(that, browserJSON, score) {
      const languageLowerCase = browserJSON.language.toString().toLowerCase();
      let hasLanguageType = false;
      for (let j = 0; j < that.languageDatas.length - 1; j++) {
        if (languageLowerCase.indexOf(that.languageDatas[j].type) >= 0) {
          hasLanguageType = true;
          that.languageDatas[j].totalCount += 1;
          that.languageDatas[j].totalScore += score;
          that.languageDatas[j].averageScore = that.languageDatas[j].totalScore > 0 ? (that.languageDatas[j].totalScore / that.languageDatas[j].totalCount).toFixed(1) : 0;
        }
      }
      if (!hasLanguageType) {
        that.languageDatas[2].totalCount += 1;
        that.languageDatas[2].totalScore += score;
        that.languageDatas[2].averageScore = that.languageDatas[2].totalScore > 0 ? (that.languageDatas[2].totalScore / that.languageDatas[2].totalCount).toFixed(1) : 0;
      }
    },
    computeBrowser(that, browserJSON, score) {
      const userAgent = browserJSON.userAgent.toString().toLowerCase()
      if (userAgent.indexOf(that.browserDatas[0].type) >= 0 && userAgent.indexOf(that.browserDatas[1].type) < 0) {
        that.browserDatas[0].totalCount += 1;
        that.browserDatas[0].totalScore += score;
        that.browserDatas[0].averageScore = that.browserDatas[0].totalScore > 0 ? (that.browserDatas[0].totalScore / that.browserDatas[0].totalCount).toFixed(1) : 0;
      } else if (userAgent.indexOf(that.browserDatas[0].type) >= 0 && userAgent.indexOf(that.browserDatas[1].type) >= 0) {
        that.browserDatas[1].totalCount += 1;
        that.browserDatas[1].totalScore += score;
        that.browserDatas[1].averageScore = that.browserDatas[1].totalScore > 0 ? (that.browserDatas[1].totalScore / that.browserDatas[1].totalCount).toFixed(1) : 0;
      } else {
        that.browserDatas[2].totalCount += 1;
        that.browserDatas[2].totalScore += score;
        that.browserDatas[2].averageScore = that.browserDatas[2].totalScore > 0 ? (that.browserDatas[2].totalScore / that.browserDatas[2].totalCount).toFixed(1) : 0;
      }
    },
    computeDevice(that, item, score) {
      const swidth = parseInt(item.ScreenWidth)
      if (swidth >= that.deviceDatas[0].type) {
        that.deviceDatas[0].totalCount += 1;
        that.deviceDatas[0].totalScore += score;
        that.deviceDatas[0].averageScore = that.deviceDatas[0].totalScore > 0 ? (that.deviceDatas[0].totalScore / that.deviceDatas[0].totalCount).toFixed(1) : 0;
      } else if (swidth <= that.deviceDatas[1].type) {
        that.deviceDatas[1].totalCount += 1;
        that.deviceDatas[1].totalScore += score;
        that.deviceDatas[1].averageScore = that.deviceDatas[1].totalScore > 0 ? (that.deviceDatas[1].totalScore / that.deviceDatas[1].totalCount).toFixed(1) : 0;

      } else {
        that.deviceDatas[2].totalCount += 1;
        that.deviceDatas[2].totalScore += score;
        that.deviceDatas[2].averageScore = that.deviceDatas[1].totalScore > 0 ? (that.deviceDatas[2].totalScore / that.deviceDatas[2].totalCount).toFixed(1) : 0;
      }

    }
  },
};
</script>
<style scoped lang="scss">
.ratingDashboard .Loading {
  top: 0;
  left: 0;
  position: fixed !important;
  width: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  height: 100% !important;
  background: #d9d9d954 !important;
}

.ratingDashboard .ratingDashboardSecondDatas .lineChartsStyle,
.ratingDashboard .ratingDashboardSecondDatas .barChartsStyle {
  padding-right: 80px;
}

.ratingDashboard .ratingDashboardSecondDatas {
  margin: 40px 0px 0px 0px !important;
}

.ratingDashboard .ratingDashboardSecondDatas .title {
  font-size: 24px !important;
  font-weight: bold !important;
  letter-spacing: 0px !important;
  // color: #000000;
}

.ratingDashboard .ratingDashboardSecondDatas .otherDataItem {
  background: #ffffff 0% 0% no-repeat padding-box;
  box-shadow: 0px 2px 24px #65b8de1a;
  border-radius: 8px;
  width: 100%;
  padding: 10px 20px !important;
}
.dark-board.ratingDashboard .ratingDashboardSecondDatas .otherDataItem {
  background: #2d2d2d 0% 0% no-repeat padding-box;
}

.ratingDashboard .ratingDashboardSecondDatas .otherDataItem .row,
.ratingDashboard .ratingDashboardSecondDatas .otherDataItem .col {
  margin: 0;
  padding: 0;
}

.ratingDashboard .ratingDashboardSecondDatas .otherDataRow {
  cursor: pointer;
}

.ratingDashboard .ratingDashboardSecondDatas .otherDataRow:nth-child(n + 3) {
  margin-top: 30px !important;
}

.otherDataItem .row a {
  text-decoration: none;
  color: #0080ff;
  font-size: 14px;
  letter-spacing: 0px;
}

.ratingDashboard .ratingDashboardSecondDatas .otherDataItem .row:nth-child(1) {
  align-items: center;
  justify-content: center;
  margin: 10px 0px 20px 0px;
}

.ratingDashboard .ratingDashboardSecondDatas .otherDataItem .row:nth-child(n + 2) {
  font-size: 14px;
  font-weight: normal;
  letter-spacing: 0px;
  // color: #000000;
  margin-top: 10px;
}

.ratingDashboard .ratingDashboardSecondDatas .otherDataItem .row:nth-child(n + 2) .col:nth-child(n + 2) {
  text-align: right;
}

.ratingDashboard .ratingDashboardSecondDatas .otherDataItem .row:last-child {
  margin-top: 10px;
  justify-content: flex-end;
}

.ratingDashboard .ratingDashboardSecondDatas .otherDataItem .title {
  font-weight: bold !important;
  font-size: 16px !important;
  letter-spacing: -0.39px !important;
  // color: #000000 !important;
  margin-left: 10px;
}

.ratingDashboard .ratingDashboardSecondDatas .otherDataItem img {
  width: 18px !important;
  height: 18px !important;
}

.ratingDashboard .ratingDashboardSecondDatas .datescol {
  display: flex;
  justify-content: flex-end;
  flex: 0;
}

.ratingDashboard .ratingDashboardSecondDatas .datesrow {
  background: #ffffff;
  margin: 0px 12px 0px 0px;
  border-radius: 4px !important;
  width: 245px !important;
  align-items: center;
  justify-content: center;
  height: 32px;
}

.ratingDashboard .ratingDashboardSecondDatas .datesrow div {
  margin-left: 10px;
  font-size: 14px;
  letter-spacing: 0px;
  color: #000000;
}

.ratingDashboard {
  background: #f8f9fd;
  height: 100%;
  width: 100% !important;
  max-width: 100% !important;
  padding: 20px 120px !important;
  font-family: "Helvetica Neue LT Pro", "Helvetica Neue", "Helvetica" !important;
  &.dark-board {
    background: #000;
  }
}

.ratingDashboard .ScreenshotBtnCol {
  text-align: right;
}

.ratingDashboard .ScreenshotBtnCol .ScreenshotBtn {
  background: #f8f9fd !important;
  height: 36px !important;
  width: 145px !important;
  font-size: 14px;
  line-height: 36px;
  font-weight: bold;
  color: var(--v-primary-base) !important;
  border: 1px solid var(--v-primary-base) !important;
  border-radius: 8px !important;
  letter-spacing: 0px;
}

.ratingDashboard .ratingDashboardFirstDatas {
  width: 100% !important;
  height: 372px !important;
  background: #ffffff 0% 0% no-repeat padding-box !important;
  box-shadow: 0px 2px 24px #65b8de1a !important;
  border-radius: 8px !important;
  margin: 20px 0px 0px 0px !important;
  align-items: center;
  flex-wrap: inherit;
}
.dark-board.ratingDashboard .ratingDashboardFirstDatas{
  background: #2d2d2d 0% 0% no-repeat padding-box !important;
}

.ratingDashboard .ratingDashboardFirstDatas .rateReport {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}

.ratingDashboard .ratingDashboardFirstDatas .rateReport .row {
  margin-top: 10px !important;
  width: 370px !important;
  justify-content: space-between;
  color: #7d7d7d !important;
}
.dark-board.ratingDashboard .ratingDashboardFirstDatas .rateReport .row {
  color: #dedede !important;
}

.ratingDashboard .ratingDashboardFirstDatas .daliyReports {
  height: 229px !important;
  padding-right: 100px !important;
  padding-top: 0px !important;
  padding-bottom: 0px !important;
  margin-left: 0px;
}

.ratingDashboard .ratingDashboardFirstDatas .dailyReportItem {
  width: 100%;
}

.ratingDashboard .ratingDashboardFirstDatas .daliyReports .row,
.ratingDashboard .ratingDashboardFirstDatas .dailyReportItem .row,
.ratingDashboard .ratingDashboardFirstDatas .allRating .row,
.ratingDashboard .ratingDashboardFirstDatas .allRating .col,
.ratingDashboard .ratingDashboardFirstDatas .dailyReportItem .col {
  margin-top: 0px !important;
  margin-bottom: 0px !important;
  padding-top: 0px !important;
  padding-bottom: 0px !important;
}

.ratingDashboard .ratingDashboardFirstDatas .dailyReportItem:nth-child(1) {
  align-items: flex-start;
}

.ratingDashboard .ratingDashboardFirstDatas .dailyReportItem:nth-child(2) {
  align-items: center;
}

.ratingDashboard .ratingDashboardFirstDatas .dailyReportItem:nth-child(3) {
  align-items: flex-end;
}

.ratingDashboard .ratingDashboardFirstDatas .dailyReportItem .dailyReportItemCol {
  height: 45px !important;
  display: flex;
  flex-direction: column;
}

.ratingDashboard .ratingDashboardFirstDatas .dailyReportItem .dailyReportItemCol .row:nth-child(2) {
  align-items: flex-end;
}

.ratingDashboard .ratingDashboardFirstDatas .dailyReportItem .header {
  font-style: normal !important;
  font-variant: medium !important;
  font-size: 20px !important;
  font-weight: 600;
  color: #000000 !important;
  border-radius: 8px !important;
  text-align: center;
  line-height: 45px !important;
  width: 45px !important;
  height: 45px !important;
}

.ratingDashboard .ratingDashboardFirstDatas .dailyReportItem .title {
  // color: #000000 !important;
  font-weight: 600;
}

.ratingDashboard .textRight {
  text-align: right !important;
}

.ratingDashboard .ratingDashboardFirstDatas .dailyReportItem .subTitle {
  color: #7d7d7d !important;
  font-weight: 600;
}

.dark-board.ratingDashboard .ratingDashboardFirstDatas .dailyReportItem .subTitle {
  color: #dedede !important;
}


.ratingDashboard .ratingDashboardFirstDatas .dailyReportItem .percent {
  // color: #05b8bf !important;
  color: var(--v-primary-base) !important;
  font-weight: 600;
}

.ratingDashboard .ratingDashboardFirstDatas hr {
  height: 229px !important;
  min-height: 220px !important;
  margin-top: 72px !important;
  border: 03px solid #cbcbcb;
  opacity: 0.3;
}

.ratingDashboard .ratingDashboardFirstDatas .allRating {
  padding: 0px 60px 0px 80px !important;
  margin-left: 0px;
  height: 229px !important;
  flex-direction: column;
}

.ratingDashboard .ratingDashboardFirstDatas .allRating .weekAndUVReport {
  align-items: flex-end;
  height: 45px !important;
}

.ratingDashboard .ratingDashboardFirstDatas .allRating .title {
  font-size: 20px !important;
}

.ratingDashboard .ratingDashboardFirstDatas .allRating .count {
  font-size: 56px;
  align-items: center;
  display: flex;
  font-weight: bold;
  font-family: Helvetica;
}

.ratingDashboard .ratingDashboardFirstDatas .allRating .icon {
  background: #ede8f3 0% 0% no-repeat padding-box;
  border-radius: 8px;
  width: 45px !important;
  height: 45px !important;
  text-align: center;
  line-height: 56px;
  margin-right: 17px;
}

.ratingDashboard .ratingDashboardFirstDatas .allRating .subCount {
  font-size: 16px;
  font-weight: bold;
}

.ratingDashboard .ratingDashboardFirstDatas .allRating .subTitle {
  font-size: 14px;
  font-weight: 500;
}

.ratingDashboard .ratingDashboardFirstDatas .allRating .weekAndUVReportItem {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>

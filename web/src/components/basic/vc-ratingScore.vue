<template>
  <div v-if="ratingIsLogin" class="ratingComponent" :class="{'dark-rating': $vuetify.theme.dark}">
    <v-card v-if="!show"
            class="toRating white rounded-circle"
            @click="toggleRating"
            tile>
      <img :src="toRatingImg" width="24" height="24"/>
    </v-card>
    <v-scroll-x-reverse-transition v-else>
      <v-card class="elevation-0 pa-0 ratingPopUp" width="344" tile>
        <div class="howFont">{{ howTitle }}</div>
        <div class="d-flex justify-space-around"
             :style="{
            'padding-left': '30px',
            'padding-right': '30px',
            'margin-bottom': score == 0 ? '20px' : '10px',
          }">
          <template v-for="(item, index) in scoreList">
            <v-hover :key="index" v-slot:default="{ hover }">
              <img v-if="score == 0 || score != item.score"
                   :src="!hover ? item.nImg : item.yImg"
                   @click="toRatingScore(item.score)"
                   class="smileFace"
                   :style="{ 'animation-delay': item.animationDely }"/>
              <img v-else-if="score == item.score"
                   :src="item.yImg"
                   @click="toRatingScore(item.score)"
                   class="smileFace"/>
            </v-hover>
            <img :src="item.yImg" :key="index + 'none'" style="display: none"/>
          </template>
        </div>
        <div class="ratingTextBoxDiv" v-show="score != 0">
          <v-textarea color="#000000"
                      filled
                      auto-grow
                      :label="placeHolder"
                      rows="3"
                      row-height="20"
                      solo
                      hide-details
                      flat
                      background-color="#F5F5F5"
                      v-model="contents"
                      id="ratingContents"></v-textarea>
        </div>
        <v-card-actions class="pb-4 justify-end ratingCardAction"
                        v-show="score != 0">
          <v-btn color="primary"
                 tile
                 elevation="0"
                 :loading="sending"
                 :disabled="sending"
                 @click="sendRating">{{ submitBtn }}
          </v-btn>
        </v-card-actions>
        <v-icon class="close" @click="toggleRating">mdi-close</v-icon>
      </v-card>
    </v-scroll-x-reverse-transition>
    <v-snackbar timeout="2000"
                v-model="snackbar"
                top
                color="success"
                center
                app
                tile>
      <v-icon>mdi-check-circle-outline</v-icon>&nbsp;{{ copySuccess }}
    </v-snackbar>
  </div>
</template>

<script>

export default {

  data() {
    return {
      snackbar: false,
      show: false,
      score: 0,
      sending: false,
      contents: "",
      imageHostPath: this.$store.getters.cdnHostAndVersionPath + "/static/images/components/rating/components/score/",
      toRatingImg: "rating_face_icon.svg",
      ratingIsLogin: false,
      scoreList: [
        {
          score: 1,
          nImg: "rating_n1.svg",
          yImg: "rating_y1.svg",
          animationDely: ".2s",
        },
        {
          score: 2,
          nImg: "rating_n2.svg",
          yImg: "rating_y2.svg",
          animationDely: ".3s",
        },
        {
          score: 3,
          nImg: "rating_n3.svg",
          yImg: "rating_y3.svg",
          animationDely: ".375s",
        },
        {
          score: 4,
          nImg: "rating_n4.svg",
          yImg: "rating_y4.svg",
          animationDely: ".45s",
        },
        {
          score: 5,
          nImg: "rating_n5.svg",
          yImg: "rating_y5.svg",
          animationDely: ".525s",
        },
      ],
    };
  },

  computed: {
    howTitle() {
      return this.$t("ratingComponent.ratingScoreHowTitle");
    },
    placeHolder() {
      return this.$t("ratingComponent.ratingScorePlaceHolder");
    },
    submitBtn() {
      return this.$t("ratingComponent.ratingScoreSubmitBtn");
    },
    copySuccess() {
      return this.$t("ratingComponent.ratingScoreCopySuccess");
    },
  },
  methods: {
    sendRating() {
      if (this.contents == "") {
        document.getElementById("ratingContents").focus();
      } else {
        this.isLogin =
          this.$store.state.userInfo != undefined &&
          this.$store.state.userInfo != null
            ? true
            : false;
        if (this.isLogin) {
          this.sending = !this.sending;
          const stateData = this.$store.state;
          // console.log('stateData', stateData)
          var code =
            stateData.appInfo.appCode +
            "@" +
            stateData.userInfo.tenantId;
          const navConnection = window.navigator.connection;
          let connection = {downlink: "", effectiveType: "", rtt: "", saveData: ""};
          if (navConnection != null) {
            connection.downlink = navConnection.downlink
            connection.effectiveType = navConnection.effectiveType
            connection.rtt = navConnection.rtt
            connection.saveData = navConnection.saveData
          }
          let bInfo = {
            appCodeName: "",
            appVersion: "",
            languages: "",
            language: "",
            platform: "",
            userAgent: "",
            vendor: "",
            connection: connection,
          };
          if (window.navigator.appCodeName != null) {
            bInfo.appCodeName = window.navigator.appCodeName
          }
          if (window.navigator.appVersion != null) {
            bInfo.appVersion = window.navigator.appVersion
          }
          if (window.navigator.languages != null) {
            bInfo.languages = JSON.stringify(top.window.navigator.languages)
          }
          if (window.navigator.language != null) {
            bInfo.language = window.navigator.language
          }
          if (window.navigator.platform != null) {
            bInfo.platform = window.navigator.platform
          }
          if (window.navigator.userAgent != null) {
            bInfo.userAgent = window.navigator.userAgent
          }
          if (window.navigator.vendor != null) {
            bInfo.vendor = window.navigator.vendor
          }
          this.$axios
            .post("/api/sc/ur/c", {
              tenantId: code,
              appCode: this.$store.state.appInfo.AppCode,
              browserInfo: JSON.stringify(bInfo),
              contents: this.contents,
              createtime: Date.now(),
              email: this.$store.state.userInfo.email,
              fromurl: document.URL,
              score: this.score,
              WindowHeight: window.innerHeight,
              WindowWidth: window.innerWidth,
              ScreenHeight: window.screen.height,
              ScreenWidth: window.screen.width,
              DeviceHeight: document.body.clientHeight,
              DeviceWidth: document.body.clientWidth,
              userName: this.$store.state.userInfo.userName,
            })
            .then((response) => {
              this.sending = !this.sending;
              // console.log(response);
              if (response != null && response.data != null && response.data.data.creatorId != null && response.data.statusCode != null && response.data.statusCode == 200) {
                this.snackbar = true;
                this.toggleRating();
              }
            }).catch((err) => {
            this.sending = !this.sending;
            // console.log(err)
          });

        }
      }
    },
    toggleRating() {
      this.show = !this.show;
      if (this.score > 0) {
        this.score = 0;
        this.contents = "";
      }
    },
    toRatingScore(score) {
      this.score = score;
    },
  },
  created() {
    this.ratingIsLogin =
      this.$store.state.userInfo != undefined &&
      this.$store.state.userInfo != null
        ? true
        : false;

  },
  mounted() {
    for (var i = 0; i < this.scoreList.length; i++) {
      this.scoreList[i]['nImg'] = this.imageHostPath + this.scoreList[i]['nImg'];
      this.scoreList[i]['yImg'] = this.imageHostPath + this.scoreList[i]['yImg'];
    }
    this.toRatingImg = this.imageHostPath + this.toRatingImg;
  },
};
</script>

<style>
.ratingComponent .toRating {
  position: fixed !important;
  right: 10px;
  bottom: 100px;
  z-index: 9999;
  cursor: pointer;
  width: 48px;
  height: 48px;
  background: #ffffff 0% 0% no-repeat padding-box !important;
  box-shadow: 0px 1px 12px #00000029 !important;
  border-radius: 2px;
  display: flex !important;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.ratingComponent .toRating .font {
  margin-top: 9.25px;
  writing-mode: vertical-lr;
  text-align: center;
  font: normal normal normal 14px/18px Microsoft YaHei UI !important;
  color: #000000;
  letter-spacing: 2px;
}

.ratingComponent .ratingPopUp {
  position: fixed !important;
  right: 20px;
  bottom: 100px;
  width: 344px !important;
  padding: 12px 12px 14px;
  min-height: 120px;
  /* background: #ffffff 0% 0% no-repeat padding-box !important; */
  z-index: 9999 !important;
  box-shadow: 0px 3px 6px #00000029 !important;
  border-radius: 2px !important;
}

.ratingComponent .ratingPopUp .howFont {
  font: normal normal normal 14px/18px Microsoft YaHei UI !important;
  letter-spacing: 0px;
  /* color: #212121; */
  margin-top: 20px;
  margin-bottom: 14px;
  padding-left: 50px;
  padding-right: 50px;
  text-align: center;
}

.ratingComponent .ratingPopUp .close {
  right: 10px;
  position: absolute;
  top: 10px;
  font-size: 18px;
}

.ratingComponent .ratingPopUp .v-label {
  color: #dddddd !important;
}

.ratingComponent .smileFace {
  cursor: pointer;
  height: 40px !important;
  width: 40px !important;
  opacity: 0;
  animation: smileFace_fadeIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.35) 0.2s forwards;
}

.ratingComponent .ratingTextBoxDiv {
  padding-left: 30px !important;
  padding-right: 30px !important;
  margin-top: 12px !important;
}
.dark-rating.ratingComponent .ratingTextBoxDiv #ratingContents{
  color: #000000;
}

.ratingComponent .ratingTextBoxDiv .v-input {
  border-radius: 0px !important;
}

.ratingComponent .ratingCardAction {
  padding-left: 30px !important;
  padding-right: 30px !important;
  margin-top: 8px !important;
}

.ratingComponent .ratingCardAction .v-btn {
  color: #ffffff !important;
  min-width: 66px !important;
  padding-left: 12px !important;
  padding-right: 12px !important;
}

@keyframes smileFace_fadeIn {
  0% {
    transform: translateY(-50px);
    opacity: 0;
  }

  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>

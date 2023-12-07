<template>
  <div>
    <v-menu tabindex="0" offset-y
            left
            max-height="439px"
            v-model="isShow"
            :position-x="positionX"
            z-index="102"
            nudge-bottom="46px"
            :close-on-content-click="false"
            min-width="328px">
      <v-flex xs12>
        <template v-if="totalMessagesCount == 0">
          <v-card class="mx-0 my-0" width="400px" min-height="154">
            <v-layout>
              <v-flex xs12 d-flex justify-center class="mt-8">
                <v-icon x-large>pwc-icon pwc-comment-outline</v-icon>
              </v-flex>
              <v-flex xs12 d-flex justify-center align-start>
                <v-card-subtitle>
                  {{ this.$t("notification.notificationContent") }}
                </v-card-subtitle>
              </v-flex>
            </v-layout>
          </v-card>
        </template>
        <template v-else>
          <v-card class="mx-0 my-0 vcNotification" width="388">
            <div id="scroll-target" class="overflow-y-auto scroll-target">
              <div v-scroll:#scroll-target="onScroll"
                   class="scroll-target-content">
                <v-layout>
                  <v-flex xs4 d-flex align-center class="NotificationTitle">
                    {{ this.$t("notification.notification") }}
                  </v-flex>
                  <v-flex xs8
                          d-flex
                          justify-end
                          align-center
                          class="NotificationMarkAllAsRead">
                    <a class="asreadbtn" href="javascript:;" @click="markAllAsRead()">
                      {{
                      this.$t("notification.notificationMarkAllAsRead")
                      }}
                    </a>
                    <v-btn text
                           tile
                           @click="isShow = false"
                           min-width="38"
                           width="38"
                           style="padding: 0">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </v-flex>
                </v-layout>
                <v-divider light></v-divider>
                <div>
                  <template v-for="(item, index) in notificationData">
                    <v-layout :key="index"
                              @click="notificationClick(item.dataLink, item.id)"
                              :class="item.notificationStatus"
                              class="notificationContent">
                      <v-flex xs2
                              d-flex
                              justify-center
                              align-start
                              class="notificationAvarta">
                        <v-avatar color="#ddd" size="48" v-if="item.notificationType != 'workflow'" >
                          <img :src="
                              to(
                                `/api/GetUserAvarta?userid=${item.creatorUserId}`
                              )
                            "
                               class="elevation-6" />
                        </v-avatar>
                        <v-avatar :color="item.iconColour" size="48" v-else>
                          <v-icon large color="#fff">
                            {{ getIcon(item.icon) }}
                          </v-icon>
                        </v-avatar>
                      </v-flex>
                      <v-flex xs10>
                        <v-card-title>
                          <div class="caption">
                            <div class="notification-message">
                              <template v-if="item.notificationType == 'share' || item.notificationType == 'comment' || item.notificationType == 'replycomment' || item.notificationType == 'delegate'">
                                <strong>{{ item.creatorName }}</strong> <span style="white-space: pre-line;">{{item.message}}</span>
                              </template>
                              <template v-else>
                                <div v-html="item.message"></div>
                              </template>
                            </div>
                            <div class="datetime-wrapper" style="opacity: 0.6;">
                              {{ item.creationTime | dateformat }}
                            </div>
                          </div>
                        </v-card-title>
                      </v-flex>
                    </v-layout>
                    <v-divider light :key="index"></v-divider>
                  </template>
                </div>
              </div>
            </div>
          </v-card>
        </template>
      </v-flex>
    </v-menu>
  </div>
</template>
<script>
  import base from "../utils/schema-base";
  import { getEnv, exportEnvUrl } from "../../utils/appBaseMethods";
  export default {
    mixins: [base],
    data() {
      return {
        positionX: Number,
        isShow: false,
        expandbadge: false,
        messages: "",
        totalMessagesCount: 0,
        notificationCount: 10,
        notificationData: [],
        skipCount: 0,
        maxResultCount: 10,
        dialogLoadMoreNotification: true,
        isLoad: false,
      };
    },
    methods: {
      getIcon(icon) {
        return (icon ? (icon.indexOf('pwc-') > -1 ? 'pwc-icon ' : 'mdi ') : '') + (icon ? icon : '');
      },
      expandbadgeModule() {
        let that = this;
        that.isShow = !that.isShow;
        that.expandbadge = !that.expandbadge;
        if (!that.isLoad) {
          that.messages = "";
          that.getNotificatoinListByReceiverId();
        }
        that.isLoad = true;
      },
      getNotificatoinListByReceiverId() {
        let that = this;
        that.$axios
          .post("/api/getNotificatoinListByReceiverId", {
            maxResultCount: that.maxResultCount,
            skipCount: that.skipCount,
          })
          .then(({ data }) => {
            that.notificationData = that.notificationData.concat(data);
            that.dialogLoadMoreNotification = true;
            that.$emit("child-event", "");
          });
      },
      getNotificationTotalCountAndUnreadCount() {
        let that = this;
        that.$axios
          .post("/api/getNotificatoinTotalCountAndUnReadCount", { env: getEnv() })
          .then(({ data }) => {
            that.totalMessagesCount = data.item1;

            if (data.item2 == "0") {
              that.messages = "";
            } else {
              that.messages = data.item2;
            }

            //传递数据给父组件
            that.$emit("child-event", this.messages);
          });
      },
      markAllAsRead() {
        let that = this;
        this.$axios
          .post("/api/MarkAllNotificationAsReadByReceiverId", { env: getEnv() })
          .then(({ data }) => {
            if (data) {
              Object.keys(that.notificationData).forEach(function (key) {
                that.notificationData[key].notificationStatus = "read";
              });
            }
          });
      },
      notificationClick(dataLink, id) {
        let that = this;
        Object.keys(that.notificationData).forEach(function (key) {
          if (that.notificationData[key].id == id && that.notificationData[key].notificationStatus == 'unread') {
            that.notificationData[key].notificationStatus = "read";
            //标记为已读
            that.$axios
              .post("/api/PostResult", {
                requestURL: "ntf/" + id,
              })
              .then(({ data }) => {
              });
          }
        });
        if(dataLink){
          window.open(exportEnvUrl(dataLink), "_blank");
        }
      },
      onScroll(e) {
        let that = this;

        var viewH = document.getElementById("scroll-target").offsetHeight,
          contentH = document.getElementById("scroll-target").scrollHeight,
          scrollTop = e.target.scrollTop;

        if (
          scrollTop / (contentH - viewH) >= 0.95 &&
          that.dialogLoadMoreNotification
        ) {
          that.dialogLoadMoreNotification = false;
          if (that.totalMessagesCount > that.notificationData.length) {
            that.skipCount = this.skipCount + that.maxResultCount;
            that.getNotificatoinListByReceiverId();
          }
        }
      },
    },
    mounted() {

      this.getNotificationTotalCountAndUnreadCount();
      this.positionX = document.body.clientWidth - 12;

      window.onresize = () => {
        return (() => {
          this.positionX = document.body.clientWidth - 12;
        })();
      };
    },
  };
</script>
<style>
  .NotificationTitle {
    padding-left: 5px;
    padding-top: 5px;
  }

  .NotificationMarkAllAsRead {
    padding-right: 5px;
    padding-top: 5px;
  }

    .NotificationMarkAllAsRead .asreadbtn {
      text-decoration: none;
      color: #404041 !important;
    }

    .NotificationMarkAllAsRead a:hover {
      text-decoration: underline;
    }

  .scroll-target {
    max-height: 400px;
  }

  .scroll-target-content {
    max-height: 600px;
  }

  .mdi-bell-notification {
    color: #dedede;
    padding-top: 15px;
  }

  .notificationAvarta {
    padding-top: 12px;
    padding-left: 15px;
  }

  .vcNotification .unread {
    background-color: #cacaca;
  }

  .vcNotification .notificationContent {
    cursor: pointer;
  }

  .vcNotification .notification-message p {
    margin: 0px;
  }
</style>

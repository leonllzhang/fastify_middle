<template>
  <div class="comments-wrap" v-if="pageMode == `preview`" :class="classes">
    <div class="exampleInputEmoji" :style="emojiStyleObj" @click.stop>
      <VEmojiPicker v-show="showDialog" labelSearch="Search" lang="pt-BR" @select="onSelectEmoji" />
    </div>
    <p style="margin-left:10px;">{{totalCount + "&nbsp;&nbsp;" + $t("comments.comment")}}</p>
    <v-row class="vc-layout justify-space-between">
      <v-flex xs10 sm10 md10 lg10 xl10 style="position:relative;">
        <v-textarea tabindex="0" :aria-label="placeholder" :placeholder="placeholder" outlined rows="3"
          :counter="counter" v-model="contentText" :disabled="schema.disabled" :rules="rules"></v-textarea>
        <span ref="emojiBtn">
          <v-btn tabindex="0" aria-label="emoji" x-large @click.stop="toogleDialogEmoji" icon
            :class="{ cursor: schema.disabled}">
            <v-icon>mdi-emoticon-happy-outline</v-icon>
          </v-btn>
        </span>
        <v-chip small class="chip-wrap" close v-show="isReplay" @click:close="noReply">{{isReplyName}}</v-chip>
      </v-flex>
      <v-flex xs2 sm2 md2 lg2 xl2>
        <v-btn tabindex="0" :aria-label="$t('comments.send')" color="primary" outlined tile
          :disabled="contentText == `` || contentText.length > counter"
          style="margin-left:20%;width:80%;" @click="send">{{$t("comments.send")}}</v-btn>
      </v-flex>
    </v-row>
    <v-list class="list-wrap" three-line>
      <v-list-item v-for="(item,index) in componentsData" :key="index">
        <v-list-item-avatar class="mt-3">
          <v-img v-if="item.creatorId == currentUser.userID" :src="userAvatar(currentUser ? currentUser.avatar : '')">
          </v-img>
          <v-img v-else :src="to(`/api/GetUserAvarta?userid=${item.creatorId}`)"></v-img>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>
            {{item.creatorName}}
            <span v-show="item.replyName">&nbsp;&nbsp;&nbsp;{{"@" + item.replyName}}</span>
          </v-list-item-title>
          <v-list-item-subtitle v-html="item.message"></v-list-item-subtitle>
          <v-list-item-subtitle style="margin-top:10px;">
            <span :class="['global-text',{'zan-text':!schema.disabled,'cursor':schema.disabled}]" @click="setSel(item)" 
            @mouseover="mouseOverFn" @mouseleave="mouseLeaveFn" :style="testStyle">
              <v-icon v-show="item.iLiked" size="14">pwc-icon pwc-thumbsup</v-icon>
              <v-icon v-show="!item.iLiked" size="14">pwc-icon pwc-thumbsup-outline</v-icon>
              &nbsp;
              <em class="normal">{{$t("comments.like")}}</em>
              <em class="normal" v-show="item.likeCount > 0">&nbsp;{{item.likeCount}}</em>
            </span>
            <span :class="['global-text',{'zan-text':!schema.disabled,'cursor':schema.disabled}]" 
            @mouseover="mouseOverFn" @mouseleave="mouseLeaveFn" :style="testStyle" @click="reply(item)"
              v-show="item.creatorId != currentUser.userID">
              <v-icon size="small">mdi-message-outline</v-icon>
              &nbsp;
              <em>{{$t("comments.reply")}}</em>
            </span>
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <v-list-item-action-text>{{item.time | dateformat($store.state.appDateFormat)}}</v-list-item-action-text>
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <v-flex class="justify-center" style="display:flex;">
      <v-btn tabindex="0" :aria-label="$t('comments.loadMore')" color="primary" :class="{'cursor':schema.disabled}" outlined tile @click="loadMore" v-show="isLoadMore">
        {{$t("comments.loadMore")}}</v-btn>
    </v-flex>
  </div>
</template>

<script>
  import {
    mapActions,
    mapMutations
  } from "vuex";
  import base from "../utils/form-base";
  import {
    VEmojiPicker
  } from "v-emoji-picker";
import { get } from "http";
  export default {
    mixins: [base],
    components: {
      VEmojiPicker
    },
    data() {
      return {
        emojiStyleObj: {
          left: "",
          top: "",
        },
        showDialog: false,
        isReplay: false,
        isReplyName: "",
        replyName: "",
        replyId: "",
        replyCommentId: "",
        contentText: "",
        componentsData: [],
        currentUser: "", //如果当前登录人的userName是唯一的，那就可以用作非当前人判断--回复显示
        isLoadMore: false, //当数据剩余数据小于5条时，不显示lode more 按钮
        index: 0,
        maxResultCount: 5,
        totalCount: 0,
        counter: 500,
        rules: [v => v.length <= this.counter || this.$t("comments.maxTip")],
        testStyle:{}
      };
    },
    computed: {
      placeholder() {
        return this.$t("comments.placeholder");
      },
    },
    methods: {
      ...mapActions("app", ["userInfo"]),
      mouseOverFn() {
        let dark = this.$store.state.app.appPerference.theme.currentTheme.dark;
        this.testStyle = {
          '--color': `${this.$vuetify.theme.themes[dark ? 'dark' : 'light'].primary}`
        }
      },
      mouseLeaveFn() {
        this.testStyle = {
          '--color':'unset'
        };
      },
      userAvatar(avatar) {
        if (avatar != null && avatar != "") {
          return "data:image/jpg;base64," + avatar;
        } else {
          return (
            this.$store.getters.cdnHostAndVersionPath + "/static/images/user.svg"
          );
        }
      },
      noReply() {
        this.isReplay = false;
        this.isReplyName = "";
        this.replyCommentId = "";
        this.replyName = "";
        this.replyId = "";
      },
      setSel(item) {
        if (this.schema.disabled) return

        if (item.iLiked) {
          this.$store.commit("DISABLE_LOADING", true);
          this.$axios
            .post("/api/PostResult", {
              requestURL: "cmt/" + item.id + "/like/d",
            })
            .then((res) => {
              this.$store.commit("DISABLE_LOADING", false);
              item.iLiked = false;
              item.likeCount -= 1;
            });
        } else {
          this.$store.commit("DISABLE_LOADING", true);
          this.$axios
            .post("/api/PostResult", {
              requestURL: "cmt/" + item.id + "/like",
            })
            .then((res) => {
              this.$store.commit("DISABLE_LOADING", false);
              item.iLiked = true;
              item.likeCount += 1;
            });
        }
      },
      send() {
        this.$store.commit("DISABLE_LOADING", true);
        //添加评论
        this.$axios
          .post("/api/PostJObjectResult", {
            requestURL: "cmt",
            id: "",
            creatorName: this.currentUser.userName,
            creatorId: this.currentUser.userID,
            replyCommentId: this.replyCommentId,
            replyName: this.replyName,
            replyId: this.replyId,
            message: this.contentText,
            docId: this.model._id,
          })
          .then(({
            data
          }) => {
            this.$store.commit("DISABLE_LOADING", false);
            this.componentsData.unshift({
              id: data.id,
              creatorName: data.creatorName,
              creatorId: data.creatorId,
              replyCommentId: data.replyCommentId,
              replyName: data.replyName,
              replyId: data.replyId,
              message: data.message,
              iLiked: data.iLiked,
              likeCount: data.likeCount,
              time: data.time,
            });

            this.totalCount += 1;
            this.contentText = "";
            this.isReplay = false;
            this.isReplyName = "";
            this.replyCommentId = "";
            this.replyName = "";
            this.replyId = "";
          });
      },
      reply(item) {
        if (this.schema.disabled) return
        let name = item.creatorName;
        this.replyCommentId = item.id;
        this.replyName = item.creatorName;
        this.replyId = item.creatorId;

        this.isReplyName = "@" + name;
        this.isReplay = true;
      },
      loadMore() {
        if (this.schema.disabled) return
        //请求更多数据
        this.index += this.maxResultCount;
        this.getData();
      },
      toogleDialogEmoji() {
        if (this.schema.disabled) return
        this.setEmojiPosition();
        this.showDialog = !this.showDialog;
      },
      onSelectEmoji(emoji) {
        this.replyName = "";
        this.contentText += emoji.data;
      },
      setEmojiPosition() {
        //设置表情包的位置
        let x =
          window.pageXOffset !== undefined ?
          window.pageXOffset :
          (
            document.documentElement ||
            document.body.parentNode ||
            document.body
          ).scrollLeft;

        let y =
          window.pageYOffset !== undefined ?
          window.pageYOffset :
          (
            document.documentElement ||
            document.body.parentNode ||
            document.body
          ).scrollTop;

        let el = this.$refs.emojiBtn.getBoundingClientRect();
        let left = el.left;
        let top = el.top;
        this.emojiStyleObj.left = left + x + 50 + "px";
        this.emojiStyleObj.top = top + y + "px";
      },
      getData() {
        this.$store.commit("DISABLE_LOADING", true);
        this.$axios
          .post("/api/GetJObjectResult", {
            requestURL: "cmt" + "/" + this.model._id,
            queryString: {
              skipCount: this.index,
              maxResultCount: this.maxResultCount,
              requestUrl: window.top.location.href
            },
          })
          .then((res) => {
            this.$store.commit("DISABLE_LOADING", false);
            let data = res.data.comments;
            this.totalCount = res.data.totalCount;
            this.componentsData = this.componentsData.concat(data);
            if (this.componentsData.length < this.totalCount) {
              this.isLoadMore = true;
            } else {
              this.isLoadMore = false;
            }
          });
      },
    },
    created() {
      if (this.pageMode == "preview") {
        this.currentUser = this.$store.state.userInfo;

        let _this = this;
        document.addEventListener("click", function (e) {
          _this.showDialog = false;
        });

        //获取所有评论数据接口
        this.getData();
      }
    },
  };

</script>

<style lang="scss">
  .exampleInputEmoji {
    position: absolute;
    z-index: 999;
  }

  .cursor {
    cursor: default
  }

  .comments-wrap {
    padding: 0 12px;
  }

  .comments-wrap .v-list-item__subtitle {
    -webkit-line-clamp: initial !important;
  }

  .comments-wrap .v-list-item {
    margin-bottom: 12px;
  }

  .comments-wrap .row {
    margin: 0;
  }

  .comments-wrap .list-wrap .zan-text {
    cursor: pointer;
  }

  .comments-wrap .list-wrap .global-text {
    font-size: 12px;
    margin-right: 20px;
    display: inline-block;
    align-items: baseline;
    min-width: 54px;
  }

  .comments-wrap .list-wrap .zan-text:hover {
    color: var(--color);
  }

  .comments-wrap .list-wrap .zan-text:hover .v-icon {
    color: var(--color);
  }

  .comments-wrap .chip-wrap {
    position: absolute;
    bottom: -4px;
    margin-bottom: 16px;
  }

  .comments-wrap .v-list-item {
    padding: 0;
  }

  .comments-wrap .v-list-item__avatar:first-child {
    margin-right: 12px;
  }

  .comments-wrap .v-list-item__subtitle {
    margin-top: 4px;
  }

  .comments-wrap span {
    user-select: none;
  }

  .comments-wrap .normal {
    font-style: normal;
  }

</style>

<template>
  <div>
    <div :class="classes">
      <v-btn tabindex="0" :aria-label="label" :color="color" icon @click="openShare()">
        <v-icon>mdi-share-variant</v-icon>
      </v-btn>
      <span> {{model.Ng_ShareCount}}</span>
    </div>
    <v-overlay :value="overlay" :dark="false" :z-index="20">
      <v-form ref="form" lazy-validation>
        <v-card :width="600" class="vc-share">
          <v-toolbar dark color="primary">
            <div class="pr-1">
              <v-icon>mdi-share-variant</v-icon>
            </div>
            <v-toolbar-title>{{ $t("share.title") }}</v-toolbar-title>
            <div class="flex-grow-1"></div>
            <v-toolbar-items>
              <v-btn dark text @click="closeShare()"><v-icon>mdi-close</v-icon></v-btn>
            </v-toolbar-items>
          </v-toolbar>
          <v-card-text class="pt-2">
            <v-container class="pt-0">
              <v-row>
                <v-col cols="24" class="pa-0">
                  <v-alert dense text type="success" v-model="copySuccess">
                    {{ $t("share.copySuccess") }}
                  </v-alert>
                  <v-alert dense text type="warning" v-model="copyWarning">
                    {{ $t("share.copyWarning") }}
                  </v-alert>
                  <v-alert dense text type="warning" v-model="requiredRecipients">
                    {{ $t("share.requiredRecipients") }}
                  </v-alert>
                  <div class="mb-2 mt-3">
                    <span>{{ $t('share.recipients') }}</span>
                  </div>
                  <wrapper ref="xShareRecipients" class="xShareRecipients" :schema="vcRecipientsSchema" :model="model"></wrapper>
                  <p>{{ $t("share.note") }}</p>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" class="pa-0 pt-2">
                  <div class="mb-2">
                    <span>{{ $t('share.message') }}</span>
                  </div>
                  <v-textarea rows="3" outlined tile v-model="message"></v-textarea>
                </v-col>
                <v-col cols="6" class="pa-0">
                  <p> {{ $t("share.documentLink") }}</p>
                </v-col>
                <v-col cols="6" class="pa-0" style="text-align: right;">
                  <v-btn outlined color="rgba(0,0,0,.6)" small :data-clipboard-text="currentLink" class="copyCurrentLinkToClipboard">{{ $t("share.copyLink") }}</v-btn>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="24" class="pa-0">
                  <p v-html="currentLink" class="share-document-link"></p>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <div class="flex-grow-1"></div>
            <v-btn outlined tile color="primary" :loading="loading" :disabled="shareDisabled" @click="saveShare()">{{ $t("schema-base.defaultBtns.share") }}</v-btn>
            <v-btn outlined tile color="primary" @click="closeShare()">{{ $t("schema-base.defaultBtns.close") }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-overlay>
  </div>
</template>

<script>
  import base from "../utils/form-base";
  // import { setTimeout } from "timers";
  import vcRecipients from './vc-peoplepicker';
  import Clipboard from 'clipboard';

  export default {
    mixins: [base],
    components: {
      vcRecipients
    },
    inject: {
      messageDialog: {
        default: {
          showMsg() { }
        }
      }
    },
    data() {
      return {
        loading: false,
        shareDisabled: false,
        overlay: false,
        currentLink: window.location.href,
        copyUrlValue: "",
        copySuccess: false,
        copyWarning: false,
        vcRecipientsSchema: {
          "component": "vc-peoplepicker",
          "name": "xShareRecipients",
          "model": "xShareRecipients",
          "disabled": false,
          "required": true,
          "classes": "null"
        },
        notificationTemplate: this.schema.notificationTemplate, //this.schema.notificationTemplate, //'Hi Eason, <%textbox%> send this message: <%x-message%>',
        emailTemplate: this.schema.emailTemplate, //this.schema.emailTemplate, //'Hi Eason, <%textbox%> send this message: <%x-message%>',
        message: '',
        recipients: '',
        requiredRecipients: false,
      }
    },
    methods: {
      openShare() {
        let that = this;
        if (that.pageMode == 'preview') {
          that.overlay = true;
          that.loading = false;
          that.message = '';
        }
      },
      closeShare() {
        let that = this;
        that.$refs.xShareRecipients.$refs.xShareRecipients.transferVal = [];
        setTimeout(function () { that.overlay = false; }, 100);
      },
      replaceTemplateContent(template) {
        let that = this;
        if (!template) {
          return;
        }
        let componentName, componentValue, actualContent = template;
        let regexContent = template.match(/<%.+?%>/gm);
        if (regexContent) {
          regexContent.map(m => {
            if (m == '<%x-message%>') {
              actualContent = actualContent.replace(/<%x-message%>/gim, this.message)
            } else {
              componentName = m.replace('<%', '').replace('%>', '');
              componentValue = that.model[componentName];
              if (componentValue == undefined) {
                componentValue = '';
              }
              var re = new RegExp('<%' + componentName + '%>', "gim");
              actualContent = actualContent.replace(re, componentValue)
            }
          });
        }
        return actualContent;
      },
      saveShare() {
        let that = this;
        that.loading = true;
        that.shareDisabled = true;
        if (that.$refs.xShareRecipients.$refs.xShareRecipients.transferVal.length == 0) {
          that.requiredRecipients = true;
          setTimeout(function () { that.requiredRecipients = false; }, 1500);
          return;
        }

        let emailList = []
        let receiveUserIds = []
        that.$refs.xShareRecipients.$refs.xShareRecipients.transferVal.map(m => {
          emailList.push(m.Email);
          receiveUserIds.push(m.UserID);
        });
        var parameter = {
          sendNotification: true,
          pageCode: that.$route.params.pageView,
          documentId: that.model._id,
          emailMsg: {
            subject: 'Hello',
            content: this.replaceTemplateContent(this.emailTemplate),
            mailTo: emailList.join(',')
          },
          notificationMsg: {
            message: this.replaceTemplateContent(this.notificationTemplate),
            icon: '',
            iconColour: '',
            dataLink: window.location.pathname,
            receiveUserId: receiveUserIds.join(',')
          }
        };
        that.$axios
          .post("/api/share", parameter)
          .then(({ data }) => {
            if (that.model.Ng_ShareCount) {
              that.model.Ng_ShareCount = that.model.Ng_ShareCount + 1;
            } else {
              that.model.Ng_ShareCount = 1;
            }
            that.$refs.xShareRecipients.$refs.xShareRecipients.transferVal = [];
            setTimeout(function () { that.overlay = false; that.loading = true; that.messageDialog.showMsg({ message: that.$t("share.shareSuccess") }); that.shareDisabled = false; }, 100);

          });
      },
      copyUrl() {
        var that = this;
        const input = document.querySelector('#currentUrl');

        input.focus();
        input.select();
        if (document.execCommand('copy')) {
          document.execCommand("Copy", "false", null);
          that.copySuccess = true;
          setTimeout(function () { that.copySuccess = false; }, 1000);
        }
        else {
          that.copyUrlValue = document.querySelector('#currentUrl').value;
          that.copyWarning = true;
          setTimeout(function () { that.copyWarning = false; }, 1000);
        }
      }
    },
    created() {
      const clipboard = new Clipboard('.copyCurrentLinkToClipboard');
    }
  };
</script>

<style>
  .vc-share .peoplepicker-box .message {
    display: none;
  }

  .vc-share .v-toolbar__content {
    padding-right: 0px;
  }

  .xShareRecipients .vc-label {
    display: none !important;
  }

  .share-document-link {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>

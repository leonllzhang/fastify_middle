<template>
  <v-layout class="view-card-lable"
            :style="schema.style"
            :justify="justifyOption"
            v-if="schema.model != ''">
    <v-flex :class="computedClasses + ' ' + justifyOption + (schema.showType == 'autoSize' ? ' autoSize' : ' labelflex')">
      <template v-if="schema.showType == 'image'">
        <v-img :src="thumbnailUrl" class="vc-view-card-image ma-0" :class="schema.classes" style=""></v-img>
      </template>
      <template v-else-if="schema.showType.toLowerCase() == 'avatar'">
        <template v-if="schema.model.toLowerCase() == 'ng_syscreatorname'">
          <v-avatar size="30" class="ma-1" :title="model['Ng_SysCreatorName']">
            <v-img :src="to(`/api/GetUserAvarta?userid=${model['Ng_SysCreatorId']}`)"></v-img>
          </v-avatar>
        </template>
        <template v-else-if="model[schema.model].length > 0">
          <template v-for="(item,index) in model[schema.model]">
            <v-avatar class="ma-1" size="30" v-if="index < avartaCount" :title="item.UserName">
              <v-img :src="to(`/api/GetUserAvarta?userid=${item.UserID}`)"></v-img>
            </v-avatar>
            <v-avatar v-if="index == avartaCount" size="30" class="ml-1" color="#e0e0e0">
              <span>+{{model[schema.model].length - avartaCount}}</span>
            </v-avatar>
          </template>
        </template>
        <template v-else>
          <v-avatar class="ma-1" size="30" :title="item.UserName">
            <v-img :src="thumbnailUrl" :class="schema.classes" style=""></v-img>
          </v-avatar>          
        </template>
      </template>
      <template v-else-if="schema.showType == 'chip' && getShowValue() != ''">
        <div style="margin: 5px 0;max-width: 100%">
          <v-chip :text-color="chipFontColor"
                  :color="chipColor" small>
            {{ getShowValue() }}
          </v-chip>
        </div>
      </template>
      <template v-else>
        <span :style="fontcolor" style="width:100%"
         :class="[schema.showType == 'autoSize' ? 'autoSizeLabel' : 'normallabel',{'bgGrey':!getShowValue()}]"
         >{{ getShowValue() }}</span>
      </template>
    </v-flex>
  </v-layout>
</template>

<script>
  import base from "../utils/form-base";
  import pathTrans from "../../utils/transUrl";
  import appInfo from "../../utils/appInfo";
  import { formatFieldValue } from "../../utils/appBaseMethods"

  export default {
    mixins: [base],
    data() {
      return {
        avartaCount: 2
      }
    },
    methods: {
      userAvatar(avatar) {
        if (avatar != null && avatar != "") {
          return "data:image/jpg;base64," + avatar;
        } else {
          return this.$store.getters.cdnHostAndVersionPath + "/static/images/user.svg";
        }
      },
      formatValue(val) {
        let originName = window.location.origin + pathTrans("/api/DownloadFile?");
        let cdnHostAndVersionPath =
          this.$store.getters.cdnHostAndVersionPath +
          "/static/Content/Images/Fileicon/";
        return val
          ? val
            .replace(/src="\/api\/DownloadFile\?/gi, 'src="' + originName)
            .replace(
              /src="\/static\/Content\/Images\/Fileicon\//gi,
              'src="' + cdnHostAndVersionPath
            )
            .replace(/href="\/api\/DownloadFile\?/gi, 'href="' + originName)
          : "";
      },
      getShowValue() {
        return formatFieldValue(this.model, this.schema, this);
      },
      getPeopleShowValue() {
        if (this.model[this.schema.model].length > 1) {
          let showValue = "";
          this.model[this.schema.model].map((item) => {
            showValue = showValue + item[this.schema.dataFormat] + ",";
          });
          showValue = showValue.substr(0, showValue.length - 1);
          return showValue;
        } else if (this.model[this.schema.model].length == 1) {
          return this.model[this.schema.model][0][this.schema.dataFormat];
        } else {
          return "";
        }
      },
    },
    computed: {
      thumbnailUrl() {
        var app = appInfo();
        const self = this;
        var _thumbnailUrl = "";
        if (self.schema.dataType == "File" && self.model[self.schema.model] && self.model[self.schema.model].length > 0) {
          for (var index in self.model[self.schema.model]) {
            if (self.model[self.schema.model][index].thumbnailUrl && self.model[self.schema.model][index].thumbnailUrl !== "") {
              _thumbnailUrl = self.model[self.schema.model][index].thumbnailUrl;
              break;
            }
          }
        }
        if (_thumbnailUrl !== "") {
          _thumbnailUrl = window.location.origin + "/" + app.tenantId + "/" + app.appCode + _thumbnailUrl;
        } else {
          _thumbnailUrl = this.$store.getters.cdnHostAndVersionPath + '/static/images/noimage_text.png'
        }
        return _thumbnailUrl;
      },
      originalFileUrl() {
        var app = appInfo();
        const that = this;
        if (that.schema.dataType == "File" && that.model[that.schema.model] != null && that.model[that.schema.model][0] != null && that.model[that.schema.model][0]['originalFileUrl'] != '') {
          return window.location.origin + "/" + app.tenantId + "/" + app.appCode + that.model[that.schema.model][0]['originalFileUrl']
        } else {
          return that.$store.getters.cdnHostAndVersionPath + '/static/images/noimage_text.png'
        }
      },
      dataType() {
        return this.schema.dataType ? this.schema.dataType.toLowerCase() : "";
      },
      computedClasses() {
        return this.schema.valueInClasses
          ? this.schema.classes +
          " x-" +
          this.model[this.schema.model].toString().replace(/,/g, "")
          : this.schema.classes;
      },

      getEditorValue() {
        return this.formatValue(this.model[this.schema.model]);
      },
      justifyOption() {
        var result = "";
        if (this.schema.justify && this.schema.justify !== "none") {
          result = "d-flex flex-wrap justify-" + this.schema.justify;
        }
        return result;
      },
      fontcolor() {
        return this.schema.color.hex ? {color: this.schema.color.hex} :this.$vuetify.theme.dark ? { color : '#ffffff' } : { color : '#2d2d2d' }  ;
      },
      chipFontColor() {
        return this.schema.color ? this.schema.color.hex : "#fff";
      },
      chipColor() {
        return this.schema.chipColor ? this.schema.chipColor.hex : "#299D8F";
      }
    },
    mounted() {
      if (document.getElementsByClassName('grid-item')) {
        let cardWidth = document.getElementsByClassName('grid-item')[0].offsetWidth;
        let cardType = 's';
        if (cardWidth > 250 && cardWidth < 290) {
          cardType = 's';
        } else if (cardWidth > 330 && cardWidth < 350) {
          cardType = 'm';
        } else if (cardWidth > 570 && cardWidth < 590) {
          cardType = 'l';
        } else if (cardWidth > 870 && cardWidth < 890) {
          cardType = 'xl';
        } else {
          cardType = 's';
        }
        switch (cardType) {
          case "s":
            this.avartaCount = 2;
            break;
          case "m":
            this.avartaCount = 3;
            break;
          case "l":
            this.avartaCount = 5;
            break;
          case "xl":
            this.avartaCount = 7;
            break;
          default:
            this.avartaCount = 2;
            break;
        }
      }
    },
  };
</script>

<style>
  .view-card-lable .labelflex {
    padding: 6px;
    font-size: .75rem;
  }

  .view-card-lable .autoSize-title {
    font-size: 1.25rem;
    font-weight: 700;
    font-family: Charter,Georgia,serif;
  }

  .view-card-lable .autoSize-description {
    padding: 6px;
    font-family: Charter,Georgia,serif;
    color: #636c72;
    font-size: .75rem;
    font-weight: 400;
  }

  .view-card-lable .normallabel {
    min-height: 34px;
    padding: 5px;
    font-size: 16px;
  }

  .view-card-lable .card-item-title .normallabel {
    min-height: 35px;
    text-decoration: none !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: normal !important;
    display: -webkit-box !important;
    -webkit-line-clamp: 2 !important;
    -webkit-box-orient: vertical !important;
    margin-bottom: 10px;
    font-size: 20px;
  }

  .view-card-lable .card-item-description .normallabel {
    height: 60px;
    text-decoration: none !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: normal !important;
    display: -webkit-box !important;
    -webkit-line-clamp: 3 !important;
    -webkit-box-orient: vertical !important;
  }

  .view-card-lable .vc-view-card-image {
    min-height: 162px;
    height: 162px;
    margin:5px;
  }

  .view-card-lable .card-normal-size {
    min-height: 162px !important;
    height: 162px;
  }

  .view-card-lable .card-item-title {
    font-size: 20px;
    font-weight: 700;
  }

  .view-card-lable .card-item-description {
    color: #636c72;
    font-weight: 400;
  }

  .view-card-lable .card-xl-size {
    min-height: 200px !important;
    height: 200px;
  }

  .vc-view-card-list-content .card-img-cover {
    transition: all .5s;
    background-position: 50% 50%;
    background-repeat: no-repeat;
    background-size: cover;
  }

  .view-card-lable .v-chip {
    min-width: 60px;
    /* max-width: 120px; */
  }
  .view-card-lable .v-chip__content {
    display: inline-block;
    line-height: 24px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .view-card-lable .bgGrey{
    background-color: #f3f3f3;
  }
  .theme--dark.v-application .view-card-lable .bgGrey{
    background-color: #2d2d2d;
  }
</style>

 <template>
  <div>
    <div class="search-bar-wrap" v-show="isSearchBar">
      <v-autocomplete
        :loading="loading"
        :value="select"
        :items="itemsAuto"
        :placeholder="placeholder"
        item-text="Title.Value"
        item-value="Title.Value"
        dense
        color="rgba(0,0,0,.42)"
        no-filter
        hide-no-data
        tile
        :search-input.sync="QueryKeywords"
        @change="search(2)"
        @keyup.enter="search(2)"
        class="autocomplete-wrap"
        :error-messages="errMsg"
      >
        <template v-slot:selection="{ item }">
          <span
            v-on="on"
            style="color: #000"
            v-html="clearBrackets(item.Title.Value)"
          ></span>
        </template>
        <template v-slot:item="{ item }">
          <v-list-item-content @click="setSelectVal(item)">
            <v-list-item-title
              v-html="clearBrackets(item.Title.Value)"
            ></v-list-item-title>
          </v-list-item-content>
        </template>
        <template v-slot:prepend>
          <v-slide-x-reverse-transition mode="out-in">
            <v-icon @click="search(2)">mdi mdi-magnify</v-icon>
          </v-slide-x-reverse-transition>
        </template>
        <template v-slot:append>
          <v-slide-x-reverse-transition mode="out-in">
            <v-icon>mdi mdi-blank</v-icon>
          </v-slide-x-reverse-transition>
        </template>
        <template v-slot:append-outer>
          <v-slide-x-reverse-transition mode="out-in">
            <v-icon @click="close">mdi mdi-close</v-icon>
          </v-slide-x-reverse-transition>
        </template>
      </v-autocomplete>
    </div>
    <div @click="close">
      <v-overlay z-index="97" :value="overlay"> </v-overlay>
    </div>
  </div>
</template>

<script>
import { Base64 } from "js-base64";
import base from "../utils/form-base";
import {
    exportEnvUrl
  } from "../../utils/env";
import getAppInfo from "../../utils/appInfo";
let appInfo = getAppInfo()
export default {
  mixins: [base],
  data() {
    return {
      requestURL:"search",
      overlay: false,
      isSearchBar: false,
      errMsg: "",
      maxLen: 100,
      loading: false,
      itemsAuto: [],
      select: "",
      QueryKeywords: "",
      appendIcon: "mdi mdi-magnify",
      queryKey: "",
    };
  },
  computed: {
    placeholder() {
      return this.schema.searchPlaceholder || this.$t("toolBar.placeholder");
    },
    errMsgTip() {
      return this.$t("toolBar.errMsgTip");
    },
    /**
     * @description: search接口请求参数
     * @return {obj}
     */
    parameter() {
      return {
        //请求search接口参数对象
        QueryKeyword: this.select || "",
        // Type:"document",
        SearchSettingId: this.schema.SearchSettingId,
        SearchCodeArray: [],
        PageNo: 1,
        FilterConditions: [],
        SortConditions: [],
      };
    },
  },
  watch: {
    /**
     * @description: querykeywords不为空时,去获取autocomplete数据
     * @return void
     */
    QueryKeywords(val) {
      if (val && val.length > this.maxLen) {
        this.errMsg = this.errMsgTip;
        val = val.substr(0, this.maxLen);
      } else {
        this.errMsg = "";
      }
      val && this.querySelections(val);
    },
  },
  methods: {
    /**
     * @description:去掉：字符串中的[]和["",""]
     * @param {string} 字符串
     * @return {string} 去掉之后的字符串
     */
    clearBrackets(str) {
      let result = "";
      if (str && str.length) {
        let flag = 0;
        for (let i = 0; i < str.length; i++) {
          let tmp = str.charAt(i);
          if (tmp == "[") {
            flag = 1;
            continue;
          }

          if (tmp == "]") {
            flag = 2;
            continue;
          }

          if ((flag == 1 && tmp == "'") || (flag == 1 && tmp == '"')) {
            continue;
          }
          result += tmp;
        }

        return result;
      }
    },
    close() {
      this.isSearchBar = false;
      this.overlay = false;
    },
    setSelectVal(item) {
      this.select = item.Title.Value;
      this.search(1);
    },
    /**
     * 获取url中携带参数
     * @param {}
     * @return {void}
     */
    getUrlParam: function (name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
      var r = window.location.search.substr(1).match(reg);
      if (r != null) return r[2];
      return "";
    },
    /**
     * @description:刷新页面
     * @param {string} 加密过的search-key
     * @return void
     */
    openHref(key) {
      this.schema.searchPageUrl = (this.schema.searchPageUrl || "page/search").toLowerCase();
      let openMethod , localPath = window.location.pathname
      
      openMethod = (localPath.indexOf(this.schema.searchPageUrl) == -1) ? '_self' : '_blank'

      let env = this.getUrlParam("env");
      let url = location.origin +
          ((window.urlMode == 'NOTENANTAPPCODE') ? '' : `/${appInfo.tenantId}/${appInfo.appCode}`) + `/${this.schema.searchPageUrl}?${key}`;

      url = exportEnvUrl(url)
      if (openMethod == "_self") {
        window.top.location.href = url;
      } else {
        window.open(url, openMethod);
      }
    },
    /**
     * @description: 刷新页面，走search接口
     * @return void
     */
    search(type) {
      //type:1--点击list（select）,2--回车（QueryKeywords）
      if (type == 1) {
        this.select = this.select || this.QueryKeywords;
      } else if (type == 2) {
        this.select = this.QueryKeywords;
      }

      this.select = this.clearBrackets(this.select.substr(0, this.maxLen));

      this.select = encodeURIComponent(Base64.encode(this.select));
      this.openHref("q=" + this.select);
    },
    /**
     * @description: header上方的search,根据querykeywords,获取autocomplete数据
     * @return void
     */
    querySelections(val) {
      this.appendIcon = "";
      this.loading = true;
      setTimeout(() => {
        this.parameter.QueryKeyword = val;
        this.parameter.SearchCodeArray = [];
        this.parameter.requestURL = this.requestURL

        this.$axios
        .post("/api/PostJObjectResult",this.parameter).then((res) => {
          let items = res.data.items;

          this.searchCodeAutoComplete = res.data.autoCompleteSearchName;

          items.forEach((el) => {
            el.searchCode = el.searchCode || el.name;

            if (el.searchCode == this.searchCodeAutoComplete) {
              let resultList = JSON.parse(el.searchResultItem).ResultList;

              this.itemsAuto = resultList;

              this.loading = false;
            }
          });
        });
      }, 500);
    },
  },
  mounted() {
    /*
    模拟input search已输入效果
    */
    // this.queryKey = Base64.decode(decodeURIComponent(this.getUrlParam("q")));
    // this.queryKey = this.queryKey.trim();
    // if (this.queryKey == "undefined" || this.queryKey == "null") {
    //   this.queryKey = "";
    // }
  },
};
</script>

<style>
.autocomplete-wrap {
  margin: 28px 10% 0 !important;
  max-width: 980px;
  display: flex;
}
.v-menu__content::-webkit-scrollbar {
  width: 8px;
  height: 8px !important;
  background-color: rgba(0, 0, 0, 0.1);
}
.v-menu__content::-webkit-scrollbar-thumb {
  border-radius: 10px;
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
}
.v-menu__content::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  border-radius: 0;
}
.search-bar-wrap {
  position: fixed;
  z-index: 99;
  left: 0;
  top: 0;
  right: 0;
  height: 74px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -10px;
}
.theme--dark.v-application .search-bar-wrap {
  background: #272727;
}
.v-toolbar {
  contain: none !important;
}
</style>

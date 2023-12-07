<template>
  <div>
    <v-footer :class="['vc-footer', 'd-none', 'd-sm-block', classes]"  color="pwcDarkGrey"
    class="white--text"
    :fixed="schema.fixed != undefined ? schema.fixed : true">
      <!-- <div v-html="$te(schema.name) ? $t(schema.name) : schema.value"></div> -->
      <div tabindex="0" :aria-label="html || defaultHtml" v-html="html || defaultHtml"
      :style="computeStyle('Label', schema)"></div>
    </v-footer>
  </div>
</template>

<script>
import base from "../utils/schema-base";
import { mapActions } from "vuex";
export default {
  data() {
    return {
      defaultHtml: "",
      html: "",
      CurrentYear:new Date().getFullYear(),
      CurrentMonth:new Date().getMonth()+1,
      CurrentDay:new Date().getDate(),
    };
  },
  mixins: [base],
  methods: {
    ...mapActions("app", ["getAppPreference"]),
    getApplicationCopy() {
      //按照需求，调整为以下接口
      this.$axios
        .post("/api/Preference/get", { key: "Copyright" })
        .then(({ data }) => {
          if (data) {
            let jsonData = JSON.parse(data);
            this.defaultHtml = this.replaceDateStr(jsonData.value || "");
          }
        });
    },
    getTranslateCopy(val) {      
      var app = this.$store.state.appInfo;
      var key = `${app.OrganizationCode}_${app.AppCode}_${val}`.toLowerCase();
      let lsValue = window.ls.get(key);
      let localeItem = JSON.parse(lsValue ? lsValue : "[]");
      if(localeItem.system && localeItem.system.copyright){
        this.html = this.replaceDateStr(localeItem.system.copyright);
      }      

      if(!this.html){
        this.getApplicationCopy();
      }
    },
    replaceDateStr(str){
      return str.replace(/\{\{CurrentYear\}\}/gi,this.CurrentYear)
    .replace(/\{\{CurrentMonth\}\}/gi,this.CurrentMonth)
    .replace(/\{\{CurrentDay\}\}/gi,this.CurrentDay)
    }
  },
  watch: {
    "$i18n.locale": function(val) {
      this.getTranslateCopy(val);
    }
  },
  created() {
    this.getTranslateCopy(this.$i18n.locale);
  }
};
</script>

<style>
.vc-footer,
.vc-footer.v-footer {
  padding: 10px;
  font-size: 12px;
  font-weight: 300;
  width: 100%;
  bottom: 0;
  z-index: 1001;
}
.vc-footer a{
  color:#fff !important;
}
</style>

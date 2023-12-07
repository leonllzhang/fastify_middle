<template>
  <div>
    <template>
      <div
        class="preview-wrapper pb-10"
        :class="
          $vuetify.breakpoint.name == 'xs' ? 'page-mobile-div' : 'page-div'
        "
      >
      <p>language: </p>
      <p> {{ language }}</p>
      <p>schema: </p>
      <p>{{ schemas }}</p>
        <!-- <wrapper
          v-for="(schema, index) in schemas"
          :key="index"
          :schema="schema"
          :model="model"
          :options="schema.options"
        /> -->
        <!-- <template v-for="(popup, i) in popups">
          <popup-wrapper :options="popup" @close-popup="closePopup" :key="i" />
        </template> -->
      </div>
    </template>
  </div>
</template>

<script>
import axios from "../plugin/axios";
import { getAppCodeforvProfile, getTenantAppCode, getAllFromUrl } from "../utils/baseMethods";
export default {
  name: "page",
  data() {
    return {
      schemas: [],
      model: {},
      popups: [],
      language: {}
    };
  },
  methods: {
    async getApplicationInfo() {
      let res = await axios.post("/api/getApplicationByCode", {
        roleSourceAppCode: getAppCodeforvProfile(),
      });
      console.log(res);
      debugger;
      return res;
    },
    async getLanguage() {
      let res = await axios.post("/api/getLanguage", {
        tenantCode: getAllFromUrl().tenantCode,
        appCode: getAllFromUrl().appCode,
        pageView: getAllFromUrl().pageCode,
        pageType: getAllFromUrl().pageType,
        pageMode: getAllFromUrl().pageMode,
        locale: 'en'
      });
      this.language = res.data.data;
      return res;
    },
    async getSchema() {
      let res = await axios.post("/api/getSchema",{
        tenantCode: getAllFromUrl().tenantCode,
        appCode: getAllFromUrl().appCode,
        pageView: getAllFromUrl().pageCode,
        pageType: getAllFromUrl().pageType,
        pageMode: getAllFromUrl().pageMode,
      });
      this.schemas = JSON.parse(res.data.data.schema);
      return res;
    },
    async getAppPreference() {
      let res = await axios.post("/api/getAppPreference",{
        tenantCode: getAllFromUrl().tenantCode,
        appCode: getAllFromUrl().appCode,
        key:"AvaiableLanguage"
      });
    },
  },
  async created() {
    var self = this;
    let res = await Promise.all([
      // self.getApplicationInfo(),
      self.getLanguage(),
      self.getSchema(),
    ]);
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>

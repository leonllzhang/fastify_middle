<template>
  <v-img :src="thumbnailUrl" :class="schema.classes" style="" @error="onImgError"></v-img>
</template>

<script>
  import base from "../utils/form-base";
  import appInfo from "../../utils/appInfo";
export default {
    mixins: [base],
    data() {
      return {
        thumbnailUrl:''
      };
    },
    methods: {
      onImgError(event) {
       this.thumbnailUrl = this.$store.getters.cdnHostAndVersionPath+  '/static/images/default.png'
      }
    },
    mounted() {
      var app = appInfo();
      const self = this;
      if (self.schema.dataType == "File" && self.model[self.schema.model] && self.model[self.schema.model].length > 0) {
        for (var index in self.model[self.schema.model]) {
          if (self.model[self.schema.model][index].thumbnailUrl && self.model[self.schema.model][index].thumbnailUrl !== "") {
            self.thumbnailUrl = self.model[self.schema.model][index].thumbnailUrl;
            break;
          }
        }
      }
      if (self.thumbnailUrl !== "") {
        self.thumbnailUrl = window.location.origin + "/" + app.tenantId + "/" + app.appCode + self.thumbnailUrl;
      } else {
        self.thumbnailUrl = this.$store.getters.cdnHostAndVersionPath + '/static/images/default.png'
      }
    }
};
</script>
<style>
  .card-normal-size {
    min-height: 162px;
    height: 162px;
  }
  .card-xl-size {
    min-height: 200px;
    height: 200px;
  }
</style>

<template>
  <v-layout :class="classes" :style="schema.style">
    <v-flex>
      <div tabindex="0" :aria-label="htmlContent" v-html="htmlContent"></div>
    </v-flex>
  </v-layout>
</template>

<script>
  import base from "../utils/schema-base";

  export default {
    mixins: [base],
    data() {
      return {
        htmlContent: ''
      };
    },
    watch: {
      "$i18n.locale": function () {
        this.getCurrentLanguageHtmlContent();
      },
      "schema.htmlData": {
        handler: function (val, oldVal) {
          this.getCurrentLanguageHtmlContent();
        },
        immediate: true,
        deep: true,
      },
    },
    methods: {
      getCurrentLanguageHtmlContent() {
        let that = this;
        let _find = require('lodash/find');
        let currentContent = _find(this.schema.htmlData, function (o) {
          return o.code == that.$i18n.locale;
        });
        if (currentContent) {
          this.htmlContent = currentContent.content;
        } else {
          this.htmlContent = '';
        }
      },
    },
    mounted() {
      let that = this;
      that.getCurrentLanguageHtmlContent();
    }
  };
</script>


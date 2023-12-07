<template>
    <div>
      <v-btn tabindex="0" :aria-label="label"
            v-if="schema.show"
             color="primary"
             :class="['mx-1 import-btn', classes]"
             tile
             depressed
             @click="ImportData"
             type="button"
             >
        <v-icon left>{{ 'mdi-import' }}</v-icon>
        <span>{{label}}</span>
      </v-btn>
      <importExcel
        :importShow="isImportShow"
        :schema="schema"
        @fileDialogClose="fileDialogClose"
      />
    </div>
  </template>
  
  <script>
    import importExcel from "../basic/vc-importExcel.vue"
    import base from "../utils/form-base";
    import { mapMutations } from "vuex";
    export default {
      mixins: [base],
      components: {
        importExcel
      },
      data() {
        return{
          isImportShow: false
        }
      },
      computed: {
        label() {
          return this.$te(this.localeKey + ".label") &&
            this.$t(this.localeKey + ".label")
            ? this.$t(this.localeKey + ".label")
            : this.$te('schema-base.defaultBtns.'+this.schema.label.toLowerCase()) ?
            this.$t('schema-base.defaultBtns.'+this.schema.label.toLowerCase()) :
            this.schema.label;
        },
      },
      methods: {
        ...mapMutations("app", [
          "setFloatingButtonItems"
        ]),
        getIcon() {
          return (this.schema.icon ? (this.schema.icon.indexOf('pwc-') > -1 ? 'pwc-icon ' : 'mdi ') : '') + (this.schema.icon ? this.schema.icon : 'mdi-import')
        },
        ImportData() {
          this.isImportShow = true
        },
        pushButtonToFloatingButton() {
          let button = {
            name: this.schema.name,
            icon: this.getIcon(),
            target: this.schema.target || "_blank",
            href: "",
            type: "import"
          }
          this.setFloatingButtonItems(button);
        },
        fileDialogClose(status) {
          this.isImportShow = status
        }
      },
      created() {
        console.log("this.schema22222")
        console.log(this.schema)
        if (this.$store.state.app.buttinInQueryPage && this.$vuetify.breakpoint.name == 'xs') {
          // this.pushButtonToFloatingButton();
          this.schema.show = false;
        }
  
        if(!this.schema.hasOwnProperty('label')){
          this.$set(this.schema,'label',"Import") 
        }
      }
    };
  </script>
  
  <style>
  </style>
  
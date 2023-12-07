<template>
  <div>
    <v-btn tabindex="0" :aria-label="label"
           v-if="schema.show"
           color="primary"
           :class="['mx-1 export-btn', classes]"
           tile
           depressed
           @click="exportData"
           type="button"
           :style="schema.style">
      <v-icon left>{{ getIcon() }}</v-icon>
      <span>{{label}}</span>
    </v-btn>
  </div>
</template>

<script>
  import base from "../utils/form-base";
  import { mapMutations } from "vuex";

  export default {
    mixins: [base],
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
        return (this.schema.icon ? (this.schema.icon.indexOf('pwc-') > -1 ? 'pwc-icon ' : 'mdi ') : '') + (this.schema.icon ? this.schema.icon : 'mdi-export')
      },
      exportData() {
        let that = this,
          tableCode = that.schema.tableCode || '';
        switch (that.$store.state.app.viewdataExport) {
          case "datatable":
            that.bus.$emit("export-datatable", tableCode);
            break;
          case "datatablegroup":
            that.bus.$emit("export-datatablegroup", tableCode);
            break;
          case "card":
            that.bus.$emit("export-card", tableCode);
            break;
          default:
            that.bus.$emit("toggle-datatable", tableCode);
            break;
        }
      },
      pushButtonToFloatingButton() {
        let button = {
          name: this.schema.name,
          icon: this.getIcon(),
          target: this.schema.target || "_blank",
          href: "",
          type: "export"
        }
        this.setFloatingButtonItems(button);
      },
    },
    created() {
      if (this.$store.state.app.buttinInQueryPage && this.$vuetify.breakpoint.name == 'xs') {
        this.pushButtonToFloatingButton();
        this.schema.show = false;
      }

      if(!this.schema.hasOwnProperty('label')){
        this.$set(this.schema,'label',"Export") 
      }
    }
  };
</script>

<style>
</style>

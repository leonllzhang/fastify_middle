<template>
  <div>
    <v-btn v-if="schema.show"
           tabindex="0" :aria-label="label"
           color="primary"
           :class="['mx-1 addDocument-btn', classes]"
           tile
           depressed
           @click="addDocument"
           type="button"
           :style="schema.style">
      <v-icon left>{{ getIcon() }}</v-icon>      
      <span>{{label}}</span>
    </v-btn>
  </div>
</template>
l
<script>
  import base from "../utils/form-base";
  import { exportEnvUrl } from "../../utils/env";
  import { mapMutations } from "vuex";

  export default {
    mixins: [base],
    inject: {
      messageDialog: {
        default: {
          showMsg() { }
        }
      }
    },
    computed: {
      label() {
        let labelStr = this.schema.label.replace(/\s+/g,"").toLowerCase()
        return this.$te(this.localeKey + ".label") &&
          this.$t(this.localeKey + ".label")
          ? this.$t(this.localeKey + ".label")
          : this.$te(`schema-base.defaultBtns.${labelStr}`) ?
          this.$t(`schema-base.defaultBtns.${labelStr}`) :
          this.schema.label;
      },
    },
    methods: {
      ...mapMutations("app", [
        "setFloatingButtonItems"
      ]),
      getIcon() {
        return (this.schema.icon ? (this.schema.icon.indexOf('pwc-') > -1 ? 'pwc-icon ' : 'mdi ') : '') + (this.schema.icon ? this.schema.icon : 'mdi-plus')
      },
      getHref() {
        let formHref = '';
        if (this.schema.formName) {
          formHref =
            "/form/" +
            this.schema.formName +
            "/add/";
        }
        return formHref;
      },
      addDocument() {
        let formHref = this.getHref();
        if (formHref != '') {
          window.open(exportEnvUrl(this.to(formHref)), this.schema.target || "_blank");
        } else {
          this.messageDialog.showMsg({ message: this.$te("schema-base.rules.missFormName") ? this.$t("schema-base.rules.missFormName") : "Missing configuration of corresponding jump form name" }
          );
        }
      },
      pushButtonToFloatingButton() {
        let button = {
          name: this.schema.name,
          icon: this.getIcon(),
          target: this.schema.target || "_blank",
          href: this.to(this.getHref()),
          type: "addDocument"
        }
        this.setFloatingButtonItems(button);
      }
    },
    created() {
      if (this.$store.state.app.buttinInQueryPage && this.$vuetify.breakpoint.name == 'xs') {
        this.pushButtonToFloatingButton();
        this.schema.show = false;
      }

      if(!this.schema.hasOwnProperty('label')){
        this.$set(this.schema,'label',"Add document") 
      }
    }
  };
</script>

<style>
</style>

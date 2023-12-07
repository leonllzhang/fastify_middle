<template>
  <v-menu offset-y tabindex="0">
    <template v-slot:activator="{ on: menu }">
      <v-tooltip left>
        <template v-slot:activator="{ on: tooltip, attrs }">
          <v-btn tabindex="0" :aria-label="$t('schema-base.translate')" v-bind="attrs" text icon v-on="{ ...tooltip, ...menu }">
            <v-icon size="38px" :color="$vuetify.theme.dark? '' : '#2d2d2d'">pwc-icon pwc-globe-outline</v-icon>
          </v-btn>
        </template>
        <span>{{ $t("schema-base.translate") }}</span>
      </v-tooltip>
    </template>
    <v-list dense style="min-width: 84px">
      <v-list-item v-for="language in avaiableLanguage" :key="language.code" @click="toggleLanguage(language)"
       :style="navActiveBg(language.code)">
        <v-list-item-content>
          <v-list-item-title tabindex="0" :aria-label="language.language">{{ language.language }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
  import base from "../utils/schema-base";
  import {
    mapActions
  } from "vuex";

  export default {
    mixins: [base],
    data() {
      return {
        avaiableLanguage: this.$store.state.app.appPerference.AvaiableLanguage || [], //渲染多语下拉列表
        defaultCode: this.$store.state.app.appPerference.DefaultLanguage.code || "en",
        appInfo: this.$store.state.appInfo,
        pageView: this.$route.params.pageView
      };
    },
    methods: {
      ...mapActions("app", ["getAppPreference"]),
      navActiveBg(code){
        if(this.$i18n.locale == code){
          return {
            background: this.$vuetify.theme.themes.light.primary,
            color: '#fff !important'
          }
        }else {
          return '';
        }
      },
      setLocaleToi18n(code, data) {
        this.$i18n.mergeLocaleMessage(
          code,
          data
        )

        this.$i18n.locale = code
        this.moment.locale(this.$i18n.locale)
      },
      toggleLanguage(language) {
        if (this.$i18n.locale == language.code) return

        this.$axios
          .post("/api/Language", {
            tenantId: this.appInfo.OrganizationCode,
            appcode: this.appInfo.ApplicationCode,
            locale: language.code,
          })
          .then(
            ({
              data
            }) => {
              let settings = data.settings || "{}"

              this.setLocaleToi18n(language.code, JSON.parse(settings))
              
              window.ls.set(
                `${this.appInfo.ApplicationCode}@language@runtime`,
                this.$i18n.locale
              )

              window.ls.set(
                `${this.appInfo.OrganizationCode}_${this.appInfo.AppCode}_${language.code}`.toLowerCase(),
                settings
              )

            },
            () => {}
          );
      },
    },
    mounted() {
     
      let defaultCode = window.ls.get(`${this.appInfo.ApplicationCode}@language@runtime`) || this.defaultCode

      let defaultLan = this.avaiableLanguage.filter(el=>{
         return el.code == defaultCode
      })

      if(defaultLan.length>0){
        this.$i18n.locale = defaultCode
      }else{
        this.$i18n.locale = this.avaiableLanguage[0].code
      }

    },
  };

</script>

<style scoped>
  .imagespin {
    -webkit-animation: spin 4s linear infinite;
    -moz-animation: spin 4s linear infinite;
    animation: spin 4s linear infinite;
  }

  @-moz-keyframes spin {
    100% {
      -moz-transform: rotate(360deg);
    }
  }

  @-webkit-keyframes spin {
    100% {
      -webkit-transform: rotate(360deg);
    }
  }

  @keyframes spin {
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }

</style>

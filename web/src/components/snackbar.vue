<template>
  <v-snackbar tabindex="0" tile multiLine top v-model="isShowSnackbar" timeout="-1" :color="warningColor" >
    <span v-html="message"></span>
    <template v-slot:action="{ attrs }">
      <v-btn tile v-bind="attrs" color="white" text @click="closeSnackbar"> {{$t("schema-base.defaultBtns.close")}}
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
  export default {
    props: {
      isShowSnackbar: {
        required: false,
        type: Boolean,
        default: false
      },
      snackbarMessage: {
        required: false,
        type: String
      },
      snackbarTimeout: {
        required: false,
        type: Number,
        default: 3000
      },
      snackbarColor: {
        required: false,
        type: String,
        // default: '#D04A02'
      }
    },
    name: 'snackbar',
    data() {
      return {};
    },
    watch: {
      isShowSnackbar() {
        if (this.isShowSnackbar === true) {
          if (this.snackbarTimeout != 0) {
            setTimeout(() => {
              this.closeSnackbar();
            }, this.snackbarTimeout)
          }
        }
      }
    },
    computed: {
      warningColor() {
        let dark = this.$store.state.app.appPerference.theme.currentTheme.dark;
        let color =  this.$vuetify.theme.themes[dark ? 'dark' : 'light'].warning;
        return this.snackbarColor ? this.snackbarColor : color;
      },
      message() {
        return this.snackbarMessage;
      },
    },
    created() {},
    methods: {
      closeSnackbar() {
        this.isShowSnackbar = false;
        this.$emit('closeSnackbar', false);
      }
    }
  };

</script>

<style scoped>
</style>

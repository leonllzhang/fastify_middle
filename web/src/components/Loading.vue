<template>
  <v-dialog tabindex="0" v-model="loading" fullscreen transition>
    <v-container fluid fill-height style="background-color: rgba(255, 255, 255, 0.5);">
      <v-layout justify-center align-center>
        <!-- 当自定义loaidng接口返回结果后,没有设置动画或者设置的动画为空显示系统loading -->
        <v-progress-circular v-if="(!isCustomLoading || !Snippet) && isCustomLoadingReturn" indeterminate="true" size="64" color="primary">
          {{$store.state.app.uploadOverlayProgress}}
        </v-progress-circular>
        <div v-else v-html="Snippet"></div>
      </v-layout>
    </v-container>
  </v-dialog>
</template>

<script>
  import { mapMutations, mapState } from "vuex";
  export default {
    data () {
      return {
        isCustomLoading: false,
        isCustomLoadingReturn: false,
        Snippet: ''
      }
    },
    computed: {
      loading() {
        return !this.$store.state.disableLoading && this.$store.state.loading;
      }
    },
    mounted() {
      this.getCustomLoading()
    },
    methods:{
      getCustomLoading() {
        //按照需求，调整为以下接口
        this.$axios
          .post("api/Preference/get", { key: "loadingsetting" })
          .then(({ data }) => {
            if (data) {
              let jsonData = JSON.parse(data);
              if (jsonData.value) {
                this.isCustomLoading = JSON.parse(jsonData.value).enabled
                this.Snippet = JSON.parse(jsonData.value).snippet
              }
              this.isCustomLoadingReturn = true
            }
          }).catch((err) => {
            this.isCustomLoadingReturn = true
          })
      },
    }
  }
</script>
<style>
  .v-progress-circular--indeterminate:not(.v-progress-circular--visible) .v-progress-circular__overlay, .v-progress-circular--indeterminate:not(.v-progress-circular--visible) > svg {
    animation-play-state: running !important;
    -webkit-animation-play-state: running !important;
  }
</style>

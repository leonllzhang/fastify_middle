<template>
  <v-btn
    tabindex="0" :aria-label="label"
    class="top-box"
    color="#fff"
    :class="[ btnFlag ? `topshow` : `tophide`, classes]"
    @click="backTop"
  >
    <v-icon color="#000">mdi mdi-arrow-up</v-icon>
  </v-btn>
</template>

<script>
import base from "../utils/schema-base";
export default {
  mixins: [base],
  data() {
    return {
      btnFlag: '',
      scrollTop: 0
    };
  },
  methods: {
    scrollToTop() {
      let _this = this;
      let scrollTop =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop;
      _this.scrollTop = scrollTop;

      if (scrollTop - 100 > 0) {
        _this.btnFlag = true;
      } else {
        _this.btnFlag = false;
      }
    
    },
    backTop() {
      let _this = this;
      let timer = setInterval(() => {
        let ispeed = Math.floor(-_this.scrollTop / 5);
        document.documentElement.scrollTop = document.body.scrollTop =
          _this.scrollTop + ispeed;
        if (_this.scrollTop == 0) {
          clearInterval(timer);
        }
      }, 16);
    }
  },
  watch:{
    btnFlag(newVal){
       this.$emit("update:btnFlag", newVal);
    }
  },
  mounted() {
    window.addEventListener("scroll", this.scrollToTop);
  },
  destroyed() {
    window.removeEventListener("scroll", this.scrollToTop);
  }
};
</script>

<style>
.top-box {
  display: none;
  position: fixed;
  right: 48px;
  bottom: -100px;
  border-radius: 100%;
  width: 40px !important;
  height: 40px !important;
  background: #f5f5f5;
  min-width: 40px !important;
  z-index: 10;
  box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2),
    0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12);
}

.topshow {
  display: block;
  animation: show 0.5s forwards ;
  -webkit-animation: show 0.5s forwards;
  -moz-animation: show 0.5s forwards ;
  -o-animation: show 0.5s forwards ;
  -ms-animation: show 0.5s forwards ;
}
.tophide {
  display: block;
  animation: hide 0.5s forwards ;
  -webkit-animation: hide 0.5s forwards ;
  -moz-animation: hide 0.5s forwards ;
  -o-animation: hide 0.5s forwards ;
  -ms-animation: hide 0.5s forwards ;
}

@keyframes show {
  from {
    bottom: -100px;
  }

  to {
    bottom: 50px;
  }
}

@keyframes hide {
  from {
    bottom: 50px;
  }

  to {
    bottom: -100px;
  }
}
</style>
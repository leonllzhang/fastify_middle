<template>
  <div class="grid-item" :class="schema.cardParameter.enableWaterFall ? ($vuetify.breakpoint.name == 'xs' ? 'ml-2 mb-2': '') : 'grid-item-normal'" @mouseover="addHoverStyle($event)" @mouseout="addOutStyle($event)">
    <v-card
      :loading="loading"
      :width="width"
      :height="height"
      @click="clickCard(model)"
      :class="{active:isActive}"
    >
      <p
        class="card-content-limit"
        :style="styles"
        v-if="schema.content && model[schema.content]"
      >{{model[schema.content]}}</p>
      <div v-if="schema.schemas && schema.schemas.length">
        <div v-for="(subSchema, index) in schema.schemas" :key="index">
          <card-wrapper
            v-if="subSchema.component!=='layout'"
            :schema="subSchema"
            :model="model"
            :options="options"
            :cardParameter="cardParameter"
          />
          <layout
            v-else-if="subSchema.component=='layout' && subSchema.schemas"
            :schema="subSchema"
          >
            <card-wrapper
              v-for="(subSubSchema, index) in subSchema.schemas"
              :key="index"
              :schema="subSubSchema"
              :model="model"
              :options="subSubSchema.options"
              :cardParameter="cardParameter"
            />
          </layout>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script>
import cardWrapper from "./vc-view-card-wrapper.vue";
import vcLayout from "../basic/vc-layout";
import {exportEnvUrl} from "../../utils/env"

export default {
  data() {
    return {
      width: 280,
      height: undefined,
      outlined: true,
      loading: false,
      cardParameter: {},
      isActive: false
    };
  },
  props: {
    schema: { type: Object, default: {} },
    model: { type: Object, default: {} },
    options: {},
    cardIndex: 0,
    formHref: ""
  },
  computed: {
    styles() {
      let styles = this.schema.styles || {};
      let lines = (parseInt(this.schema.lines) || 3) * 1.5;

      styles["max-height"] = `${lines}em`;

      return styles;
    }
  },
  mounted() {
    let that = this;
    //that.schema.schemas.forEach(function (item) {
    //  item.cardParameter = that.schema.cardParameter
    //});
    that.initWidth();
  },
  components: {
    "card-wrapper": cardWrapper,
    layout: vcLayout
  },
  methods: {
    addHoverStyle(e) {
      var _this = this;
      this.$nextTick(function() {
        this.isActive = true;
      });
    },
    addOutStyle(e) {
      var _this = this;
      this.$nextTick(function() {  
        this.isActive = false;
      });
    },
    clickCard(e) {
      window.open(exportEnvUrl(this.formHref + e._id), (this.schema.target ? this.schema.target : "_blank"));
    },
    initWidth() {
      let that = this;
      if (that.$vuetify.breakpoint.name == 'xs') {
        that.width = window.innerWidth - 15;
      } else {
        switch (that.schema.cardParameter.sizeType.toLowerCase()) {
        case "s":
            that.width = 280;
            break;
          case "m":
            that.width = 340;
            break;
          case "l":
            that.width = 580;
            break;
          case "xl":
            that.width = document.querySelector('.vc-view-card-list').offsetWidth - 25;
            break;
        }
      }
    }
  }
};
</script>

<style>
  .grid-item {
    float: left;
    border: thin solid rgba(0,0,0,.12);
  }
  .grid-item-normal {
    margin-left: 8px;
    margin-bottom: 8px;
  }
  .grid-item .active {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 16px 32px -4px rgba(0, 0, 0, 0.17);
    will-change: box-shadow;
    transform: translateY(-1px);
    -webkit-transition: transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }
</style>

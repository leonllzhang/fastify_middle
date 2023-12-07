<template>
  <div :class="['layout', 'vc-layout', schema.classes]" 
>
    <layout-wrapper :schema="item" :model="model" :options="subOptions" :justify="justifyOption"
      v-for="(item, i) in schema.schemas" :key="i" />
  </div>
</template>

<script>
import base from "../utils/schema-base";
import layoutBase from "../utils/layout-base";
import { pathTrans } from "../../utils/appBaseMethods";

var layoutItem = {
  template:
    '<div class="flex" :class="[schema.classes, $parent.justify]" :style="schema.style">' +
    " <template v-if=\"$parent.justify!==''\">" +
    '   <div class="d-flex">' +
    '     <wrapper v-for="(subschema, i) in schema.schemas" :key="i" :schema="subschema" :model="model" :options="options" />' +
    "   </div>" +
    " </template>" +
    " <template v-else>" +
    '   <wrapper v-for="(subschema, i) in schema.schemas" :key="i" :schema="subschema" :model="model" :options="options" />' +
    " </template>" +
    "</div>",
  mixins: [base],
};
var layoutWrapper = {
  components: {
    layoutItem,
  },
  props: {
    justify: {
      type: String,
    },
  },
  mixins: [layoutBase],
  computed: {
    component() {
      return "layout-item";
    },
  },
};

export default {
  mixins: [base],
  components: {
    layoutWrapper,
  },
  props: {
    options: {
      type: Object,
      // 创建page 时候已经 传递 direction.不再传递默认值，会引起问题
      // default() {
      //   return {
      //     color: "#DC6900",
      //     direction: "vertical"
      //   }
      // }
    },
  },
  computed: {
    ifPropertyPanel() {
      if(this.schema.revampSchema && this.schema.revampSchema[0].members && this.schema.revampSchema[0].members.length > 1){
        return true;

      }else {
        return false;
      }
    },
    navActiveStyle(){
      return function(flag){
        if(flag){
          return {
            background: this.$vuetify.theme.themes.light.primary,
            color: '#fff !important'
          }
        }else {
          return '';
        }
      }
    },
    subOptions() {        
      //往下传递一下options中的属性。
      if(this.options){
        return Object.assign({}, this.options, this.schema.options);
      }else {
        return this.schema.options || this.options;
      }        
    },
    justifyOption() {
      var result = "";
      if (this.schema.justify && this.schema.justify !== "none") {
        result = "d-flex flex-wrap justify-" + this.schema.justify;
      }
      return result;
    },
  },
  methods: {
    isJSON(str) {
      if (typeof str == 'string') {
        try {
          var obj = JSON.parse(str);
          if (typeof obj == 'object' && obj) {
            return true;
          } else {
            return false;
          }

        } catch (e) {
          return false;
        }
      }
    },
    getBackgroundImg() {
      if (this.schema.backgroundImage) {
        if (this.isJSON(this.schema.backgroundImage)) {
          //new format
          // console.log('eee', this.schema.backgroundImage)
          return {
            backgroundImage: "url('" + pathTrans(JSON.parse(this.schema.backgroundImage).url) + "')",
            "background-position": "center top",
            "background-size": "cover",
          };
        }
        else {
          if (this.schema.backgroundImage.startsWith("/static/images")) {
            return {
              backgroundImage: `url('${this.$store.getters.cdnHostAndVersionPath}${this.schema.backgroundImage}')`,
              "background-position": "center top",
              "background-size": "cover",
            };
          } else {
            return {
              backgroundImage: "url('" + this.schema.backgroundImage + "')",
              "background-position": "center top",
              "background-size": "cover",
            };
          }
        }
      } else {
        return null;
      }
    },
    setChildShow(show, schemas) {
      schemas.forEach((el) => {
        this.$set(el, "show", show);

        if (!el.schemas || el.schemas.length == 0) {
          return;
        }
        this.setChildShow(show, el.schemas);
      });
    },
  },
  created() {
    this.$watch(
      "schema.show",
      (val, oldVal) => {
        let newVal = this.schema;

        if (newVal.watch && Object.keys(newVal.watch).length > 0) {
          if (newVal && newVal.schemas && newVal.schemas.length > 0) {
            let show = Object.keys(newVal.show).length > 0 ? newVal.show : true;
            this.setChildShow(show, newVal.schemas);
          }
        }
      },
      {
        deep: true,
      }
    );
  },
};
</script>

<style lang="scss">
.vc-layout.layout {
  padding: 0 12px;
}

/*  @media (min-width: 600px) {
    .vc-layout.layout {
      padding: 0 12px;
    }
  }*/
</style>

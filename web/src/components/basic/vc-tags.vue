<template>
  <div :class="classes">
    <v-layout>
      <div v-show="!schema.disableLabel" class="vc-label"
        :class="{ 'horizontal': isHorizontal, 'required': schema.required }">
        <span :style="computeStyle('Label', schema)">{{ label }}</span>
        <v-tooltip right :disabled="!schema.tooltip">
          <template v-slot:activator="{ on }">
            <v-icon v-show="schema.tooltip" v-on="on" color="primary">mdi-message-alert</v-icon>
          </template>
          <span>{{ tooltipLabel }}</span>
        </v-tooltip>
      </div>
      <v-flex :class="{ 'horizontal-flex-wrap': isHorizontal }">
        <v-combobox tabindex="0" 
          :aria-label="label + $dm_arialabel(rules, value)" 
          :aria-required="schema.required"
          :class="{ 'v-combobox-wrap-preview': !isEdit,'vc-tags-custom-style': (schema.revampSchema && schema.revampSchema[0].members) && (isEdit || (!isEdit && schema.customPreviewStyle)) }"
          :style="[{ 'border-width': pageMode == 'preview' && !schema.customPreviewStyle ? '0px !important' : '' },
          (isEdit || (!isEdit && schema.customPreviewStyle)) ? returnComputeStyle : '']"
          class="v-combobox-wrap"   
          v-model="value" 
          :items="items"
          :disabled="disabledProp" 
          :counter="counter" 
          chips clearable deletable-chips outlined single-line
          :rules="rules" 
          :search-input.sync="search" 
          :multiple="multiple"
          :menu-props="menuProps"
          hide-selected 
          :append-icon="isAppendIcon">
          <template v-slot:selection="data">
            <v-chip color="primary" outlined tabindex="0" :aria-label="data.item" :key="JSON.stringify(data.item)"
              v-bind="data.attrs" :input-value="data.selected" :disabled="data.disabled" close :close-icon="isCloseIcon"
              @click:close="data.parent.selectItem(data.item)">
              {{ data.item }}
            </v-chip>
          </template>
        </v-combobox>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import base from "../utils/form-base";

export default {
  mixins: [base],
  data() {
    return {
      search: undefined,
      items: [],
      pageCode: null,
      multiple: true,
      menuProps: {
        closeOnContentClick: true
      }
    };
  },
  watch: {
    value(val) {
      if (val && val.length > this.counter) {
        this.$nextTick(() => this.value.pop())
      }
      this.search = undefined
    },
    search: {
      handler(val, oldVal) {
        if (!val) {
          this.items = []
          return false
        }

        val && this.debounce()
      },
      immediate: false,
    },
  },
  methods: {
    getData() {
      let _this = this
      this.$axios
        .post("/api/PostJObjectResult", {
          requestURL: "docs/Tag/" + this.pageCode + "/" + this.schema.model,
          Word: _this.search,
          ItemCount: 10
        })
        .then(({
          data
        }) => {
          let dataItems = data.data
          if (dataItems && dataItems.length > 0) {
            this.items = dataItems
          } else {
            this.items = []
          }
        });
    },
    debounce() {
      let timeout = null
      let _this = this
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        _this.getData()
      }, 200)
    }
  },
  created() {
    this.pageCode = window.document.location.pathname.split("/")[4]
  },
  computed: {
    returnComputeStyle() {
      if(this.computeStyle('Field',this.schema) && JSON.stringify(this.computeStyle('Field',this.schema)) !== '{}'){
        return this.computeStyle('Field',this.schema)
      }else {
        let dark = this.$store.state.app.appPerference.theme.currentTheme.dark;
        let color =  `${this.$vuetify.theme.themes[dark ? 'dark' : 'light'].primary}`;
        return{'--c-borderWidth': '1px','--c-borderStyle':'solid','--c-borderColor': '#000000','--c-color':color}
      }
    },
    isCloseIcon() {
      if (this.$route.name.toLowerCase() == "preview") {
        return ""
      } else {
        return "pwc-icon pwc-close-outline"
      }
    },
    isAppendIcon() {
      return ""
    },
    counter() {
      if (!this.isEdit) return undefined

      if (this.schema.counter == 1) {
        this.multiple = false
        return undefined
      } else {
        return this.schema.counter
      }
    },
    disabledProp() {
      return this.isEdit ? this.schema.disabled : true
    },
    value: {
      get() {
        let arr = this.model[this.schema.model]
        return arr && arr.length > 0 ? arr : undefined
      },
      set(val) {
        if (Object.prototype.toString.call(val) == "[object String]") {
          val = [val]
        }
        this.model[this.schema.model] = val
      }
    },
    rules() {
      let rules = []
      if (this.schema.show !== false && this.schema.required) {
        rules.push(() => {
          return !!this.value || this.$t("schema-base.rules.required");
        });
      }
      return rules
    },
  },
};

</script>

<style>
.v-combobox-wrap .v-input__control .v-input__slot {
  min-height: 48px;
}
.v-combobox-wrap.vc-tags-custom-style .v-input__control .v-input__slot{
  margin: var(--c-margin) !important;
  width: auto;
}
.v-combobox-wrap .v-input__control .v-input__slot fieldset {
  border: 1px solid rgba(0, 0, 0, 0.42);
  border-radius: 0;
}

.v-combobox-wrap.vc-tags-custom-style .v-input__control .v-input__slot fieldset{
  border-width: var(--c-borderWidth) !important;
  border-style: var(--c-borderStyle) !important;
  border-color: var(--c-borderColor) !important;
  border-radius: var(--c-borderRadius) !important;
  background: var(--c-background) !important;
  box-shadow: var(--c-shadow) !important;
}
.v-combobox-wrap .v-chip {
  background: #F2F2F2 !important;
  border: 1px solid #2d2d2d !important;
}

.v-combobox-wrap.vc-tags-custom-style .v-chip {
  font-size: var(--c-fontSize) !important;
  line-height: var(--c-lineHeight) !important;
  font-family: var(--c-fontFamily) !important;
  font-weight: var(--c-fontWeight) !important;
  letter-spacing: var(--c-letterSpacing) !important;
  color: var(--c-color) !important;
  border-color: var(--c-color) !important;
}

.v-combobox-wrap.theme--light.v-input--is-disabled {
  color: rgba(0,0,0,.87);
}

.v-combobox-wrap-preview .v-input__control .v-input__slot fieldset {
  background-color: #f2f2f2;
  border-width: 0 !important;
}
.theme--dark.v-application .v-combobox-wrap-preview .v-input__control .v-input__slot fieldset {
  background-color: #272727;
}

.horizontal-flex-wrap {
  width: calc(100% - 150px);
}

.v-combobox-wrap .theme--light.v-icon.v-icon.v-icon--disabled {
  display: none;
}

.v-combobox-wrap .v-input__append-inner {
  margin-top: 13px;
}


.v-combobox-wrap>.v-input__control>.v-input__slot {
  padding: 5px 45px 5px 4px !important;
}
</style>

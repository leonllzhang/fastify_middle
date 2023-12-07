<template>
  <div v-if="isEdit" :class="['layout', classes]">
    <v-layout>
      <div v-show="!schema.disableLabel" class="vc-label"
        :class="{ horizontal: isHorizontal, required: schema.required }">
        <span :style="computeStyle('Label',schema)">{{ label }}</span>
        <v-tooltip right :disabled="!schema.tooltip">
          <template v-slot:activator="{ on }">
            <v-icon v-show="schema.tooltip" v-on="on" color="primary">mdi-message-alert</v-icon>
          </template>
          <span>{{ tooltipLabel }}</span>
        </v-tooltip>
      </div>
      <v-flex class="vc-radio">
        <v-radio-group tabindex="0" v-model="radioValue" :row="row" :rules="rules" :class="schema.revampSchema && schema.revampSchema[0].members ? 'vc-radio-custom-style' : ''">
          <v-radio v-for="(opt, index) in selectList" :key="index" tabindex="0"
            :style="computeStyle('Field',schema)"
            :aria-label="getLabel(opt) + $dm_arialabel(rules, radioValue)" :aria-required="schema.required"
            :label="getLabel(opt)" :value="getValue(opt)" color="primary" :disabled="schema.disabled"></v-radio>
        </v-radio-group>
      </v-flex>
    </v-layout>
  </div>
  <vc-label v-else class="vc-label-wrapper" 
  :class="{'vc-radio-wrapper':schema.customPreviewStyle}"
  :schema="previewSchema" :model="model" :options="options" />
</template>

<script>
import base from "../utils/form-base";
import queryBase from "../utils/query-base";
import vcLabel from "./vc-label";
export default {
  mixins: [base, queryBase],
  components: {
    vcLabel
  },
  data() {
    return {
      radioValue: "",
      setFlag: true
    };
  },
  watch: {
    radioValue: {
      handler(val, oldVal) {
        var self = this;
        if (val != null && oldVal != null && val != oldVal) {
          var chooseValue = self.selectList.find(v => v.value === val);
          if (chooseValue && chooseValue.key && chooseValue.value) {
            self.value = [{
              key: chooseValue.key,
              value: chooseValue.value
            }];
          }
        } else if (val != null && val.length > 0 && oldVal == null) {
          var chooseValue = self.selectList.find(v => v.value === val);
          if (chooseValue && chooseValue.key && chooseValue.value) {
            self.value = [{
              key: chooseValue.key,
              value: chooseValue.value
            }];
          }
        }
        else if (val != null && val.length == 0) {
          self.value = [];
        }
      }
    },
    value: {
      handler(val, oldVal) {
        var self = this;
        if (val && val.length > 0) {
          self.radioValue = val[0].value;
          self.setFlag = false;
        }
        else if ((!val || val.length < 1) && self.radioValue) {
          self.radioValue = null;
        }
      },
      immediate: true
    }
  },
  computed: {
    itemText() {
      return "value";
    },
    itemValue() {
      return "key";
    },
    row() {
      if (this.schema.itemDirection) {
        return this.schema.itemDirection === "horizontal";
      } else if (this.options.itemDirection) {
        return this.options.itemDirection != "vertical";
      }
      return this.$store.state.app.windowWidth > 600;
    },
    selectList() {
      var self = this;
      var newSelectList = [];
      if (self.queryResult && self.queryResult.length > 0) {
        self.queryResult.forEach(function (item) {
          if (item[self.schema.itemText] && item[self.schema.itemValue]) {
            var newSelectItem = {};
            newSelectItem[self.itemText] = item[self.itemText] ? item[self.itemText] : item[self.schema.itemText];
            newSelectItem[self.itemValue] = item[self.itemValue] ? item[self.itemValue] : item[self.schema.itemValue];
            newSelectList.push(newSelectItem);
          }
        })
      }
      return newSelectList;
    }
  },
  methods: {
    getLabel(o) {
      if (typeof o === "string") {
        return o;
      }
      return o[this.itemText] || o[this.itemValue];
    },
    getValue(o) {
      if (typeof o === "string") {
        return o;
      }
      return o[this.itemText];
    }
  },
  created() {
    if (this.schema.returnObject) {
      this.previewSchema.returnObject = this.schema.returnObject;
      this.previewSchema.itemText = this.itemText;
    }
  }
};
</script>

<style>
.vc-label-wrapper.vc-radio-wrapper .vc-field > .vc-label{
  font-family: var(--c-fontFamily) !important;
  font-size: var(--c-fontSize) !important;
  line-height: var(--c-lineHeight) !important;
  font-weight: var(--c-fontWeight) !important;
  color: var(--c-color) !important;
  letter-spacing: var(--c-letterSpacing) !important;
  text-shadow: var(--c-shadow) !important;
}
.vc-radio .v-input--radio-group {
  margin-top: 0;
  padding-top: 8px;
}
.vc-radio-custom-style .v-radio>.v-label {
  font-family: var(--c-fontFamily) !important;
  font-size: var(--c-fontSize) !important;
  line-height: var(--c-lineHeight) !important;
  font-weight: var(--c-fontWeight) !important;
  color: var(--c-color) !important;
  letter-spacing: var(--c-letterSpacing) !important;
  text-shadow: var(--c-shadow) !important;
}
.vc-radio-custom-style .v-item--active>.v-label{
  color: var(--c-color) !important;
}
</style>

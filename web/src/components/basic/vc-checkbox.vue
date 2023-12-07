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
      <template v-if="row">
        <v-checkbox tabindex="0" :aria-label="getLabel(item) + $dm_arialabel(rules, value)"
          :aria-required="schema.required" :rules="rules" v-model="checkboxValue" v-for="(item, index) in selectList"
          :key="index" :label="getLabel(item)" :value="getValue(item)" class="mr-4 mt-1"
          :class="[schema.revampSchema && schema.revampSchema[0].members ? 'vc-checkbox-custom-style' : '',{'d-flex':row}]"
          :style="computeStyle('Field',schema)"
          :disabled="schema.disabled || !isEdit" multiple></v-checkbox>
      </template>
      <template v-else>
        <v-flex >
          <v-checkbox tabindex="0" :aria-label="getLabel(item) + $dm_arialabel(rules, value)"
            :aria-required="schema.required" :rules="rules" v-model="checkboxValue" v-for="(item, index) in selectList"
            :key="index" :label="getLabel(item)" :value="getValue(item)" class="mr-4 mt-1"
            :class="schema.revampSchema && schema.revampSchema[0].members ? 'vc-checkbox-custom-style' : ''"
            :style="computeStyle('Field',schema)"
            :disabled="schema.disabled || !isEdit" multiple :hide-details="index != selectList.length - 1"></v-checkbox>
        </v-flex>
      </template>
    </v-layout>
  </div>
  <vc-label v-else class="vc-label-wrapper"
  :class="{'vc-checkbox-wrapper':schema.customPreviewStyle}"
  :schema="previewSchema" :model="model" :options="options" />
</template>

<script>
import base from "../utils/form-base";
import queryBase from "../utils/query-base";
import vcLabel from "./vc-label";
export default {
  mixins: [base, queryBase],
  components: {
    vcLabel,
  },
  data() {
    return {
      checkboxValue: [],
      setFlag: true
    };
  },
  watch: {
    checkboxValue: {
      handler(val, oldVal) {
        var self = this;
        if (val != null && oldVal != null && val.length != oldVal.length) {
          var newValues = [];
          var setValueFlag = false;
          val.forEach(function (item, index) {
            var chooseValue = self.selectList.find(v => v.value === item);
            if (chooseValue && chooseValue.key && chooseValue.value) {
              newValues.push({
                key: chooseValue.key,
                value: chooseValue.value
              })
              setValueFlag = true;
            }
          })
          if (setValueFlag) {
            self.value = newValues;
          }
          else if (val != null && val.length == 0) {
            self.value = [];
          }
        } else if (val != null && val.length > 0 && oldVal == null) {
          var newValues = [];
          var setValueFlag = false;
          val.forEach(function (item, index) {
            var chooseValue = self.selectList.find(v => v.value === item);
            if (chooseValue && chooseValue.key && chooseValue.value) {
              newValues.push({
                key: chooseValue.key,
                value: chooseValue.value
              })
              setValueFlag = true;
            }
          })
          if (setValueFlag) {
            self.value = newValues;
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
          var modelValues = [];
          val.forEach(function (item, index) {
            if (item.value) {
              modelValues.push(item.value);
            }
          })
          self.checkboxValue = modelValues;
          self.setFlag = false;
        }
        else if ((!val || val.length < 1) && self.checkboxValue) {
          self.checkboxValue = null;
        }
      },
      immediate: true
    }
  },
  computed: {
    row() {
      if (this.schema.itemDirection) {
        return this.schema.itemDirection === "horizontal";
      } else if (this.options.itemDirection) {
        return this.options.itemDirection != "vertical";
      }
      return this.$store.state.app.windowWidth > 600;
    },
    rules() {
      var rules = [];
      let schema = this.schema;

      if (schema.show != false) {
        if (this.schema.required) {
          rules.push((val) => {
            return (
              (val && val.length > 0) || this.$t("schema-base.rules.required")
            );
          });
        }
      }

      return rules;
    },
    itemText() {
      return "value";
    },
    itemValue() {
      return "key";
    },
    selectList() {
      var self = this;
      var newSelectList = [];
      if (self.queryResult && self.queryResult.length > 0) {
        self.queryResult.forEach(function (item) {
          if (item[self.schema.itemText] && item[self.schema.itemValue]) {
            var newSelectItem = {};
            newSelectItem[self.itemText] = item[self.itemText] ? item[self.itemText] : item[self.schema.itemText];
            newSelectItem[self.itemValue] = item[self.itemValue] ? item[self.itemValue] : item[self.schema
              .itemValue];
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
    },
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
.vc-label-wrapper.vc-checkbox-wrapper .vc-field > .vc-label{
  font-family: var(--c-fontFamily) !important;
  font-size: var(--c-fontSize) !important;
  line-height: var(--c-lineHeight) !important;
  font-weight: var(--c-fontWeight) !important;
  color: var(--c-color) !important;
  letter-spacing: var(--c-letterSpacing) !important;
  text-shadow: var(--c-shadow) !important;
}

.v-input--checkbox .v-input__slot>.v-label,
.v-input--selection-controls .v-radio>.v-label {
  pointer-events: none;
  cursor: text !important;
}

.vc-checkbox-custom-style .v-input__slot>.v-label {
  font-family: var(--c-fontFamily) !important;
  font-size: var(--c-fontSize) !important;
  line-height: var(--c-lineHeight) !important;
  font-weight: var(--c-fontWeight) !important;
  color: var(--c-color) !important;
  letter-spacing: var(--c-letterSpacing) !important;
  text-shadow: var(--c-shadow) !important;
}

.vc-checkbox-custom-style.v-input--is-label-active .v-input__slot>.v-label{
  color: var(--c-color) !important;
}
</style>

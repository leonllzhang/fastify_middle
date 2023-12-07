<template>
  <div :class="['layout', 'datetime-picker-box', classes, { 'py-2 pt-0': pageMode == 'preview' }]">
    <div v-show="!schema.disableLabel"
      :class="['vc-label', { horizontal: isHorizontal, required: isEdit ? schema.required : '' }]">
      <span :style="computeStyle('Label', schema)">{{ label }}</span>
      <v-tooltip right :disabled="!schema.tooltip">
        <template v-slot:activator="{ on }">
          <v-icon v-show="schema.tooltip" v-on="on" color="primary">mdi-message-alert</v-icon>
        </template>
        <span>{{ tooltipLabel }}</span>
      </v-tooltip>
    </div>
    <template>
      <div class="flex-grow-1">
        <div
          :class="['flex', 'vc-datetime-picker-input', { showDisable: isDisabled }, { 'preview-text': !isEdit },
            { 'vc-datetimepicker-custom-style': (schema.revampSchema && schema.revampSchema[0].members) && (isEdit || (!isEdit && schema.customPreviewStyle)) }]"
          :style="[{ 'border-width': pageMode == 'preview' && !schema.customPreviewStyle ? '0px !important' : '' },
          (isEdit || (!isEdit && schema.customPreviewStyle)) ? returnComputeStyle : '']">
          <v-chip class="ma-1" tabindex="0" :aria-label="label" v-if="showDateTimeChip" close :close-icon="isCloseIcon"
            color="primary" outlined :disabled="!isEdit" @click:close="clearDateTime">
            <span>{{ datetimePickerValue }}</span>
          </v-chip>
          <v-spacer />
          <v-menu v-model="show" :close-on-content-click="false" offset-y min-width="330px" max-width="330px"
            :disabled="isDisabled" eager>
            <template v-slot:activator="{ on, attrs }">
              <v-btn tabindex="0" v-bind="attrs" v-on="on" min-width="34px" class="px-2" v-show="pageMode != 'preview'"
                text>
                <v-icon :color="$vuetify.theme.dark ? '' : 'pwcDarkGrey'" size="28">pwc-icon pwc-calendar</v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-date-picker tabindex="0" v-model="dateChoose" :locale="this.$i18n.locale" color="primary" range
                :allowed-dates="allowDates" width="100%"></v-date-picker>
            </v-card>
          </v-menu>
        </div>
        <v-text-field v-if="(schema.required && isEdit)" class="validationModule" height="0px" v-model="value"
          :rules="rules">
        </v-text-field>
      </div>
    </template>
  </div>
</template>

<script>
import base from "../utils/form-base";

export default {
  mixins: [base],
  data() {
    return {
      show: false,
      dateChoose: [],
      setFlag: true,
      datetimePickerValue: []
    };
  },
  watch: {
    datetimePickerValue: {
      handler(val) {
        //val '2023-08-01~2023-08-02'
        var newArray = val.split('~');
        var newModelVal = newArray.map(arr => this.moment(arr, this.datetimePickerFormat).unix() * 1000);
        if (this.setFlag || !this.model[this.schema.model] || this.model[this.schema.model][0] !== newModelVal[0] || this.model[this.schema.model][1] !== newModelVal[1]) {
          if (newArray.length > 1) {
            newArray[0] += " 00:00:00";
            newArray[1] += " 00:00:00";
            newArray = newArray.map(arr => this.moment(arr, this.datetimePickerFormat + "00:00:00").unix() * 1000);
            this.$set(this.model, this.schema.model, newArray);
          } else {
            this.$set(this.model, this.schema.model, []);
          }
        }
        this.setFlag = true;
        this.empty = false;
      }
    },
    value: {
      handler(val) {
       // console.log("val==============", val, val.length)
        var result = [];
        if ('Start' in val) {
          result = [val.Start, val.End];
          this.assignDateChoose(result)
        } else if (Array.isArray(val) && val.length) {
          result = val;
          this.assignDateChoose(result)
        } else {
          this.datetimePickerValue = []
        }
      },
      immediate: true
    },
    dateChoose: {
      handler(val) {
        if (val.length) {
          var result = [];
          var currentFormat = "YYYY-MM-DD";
          result = this.dateChoose.length ? this.dateChoose.map(date => this.moment(date, currentFormat).format(this.datetimePickerFormat)).join('~') : [];
          this.datetimePickerValue = result;
        }
      },
      immediate: true
    }
  },
  computed: {
    returnComputeStyle() {
      if (this.computeStyle('Field', this.schema) && JSON.stringify(this.computeStyle('Field', this.schema)) !== '{}') {
        return this.computeStyle('Field', this.schema)
      } else {
        let dark = this.$store.state.app.appPerference.theme.currentTheme.dark;
        let color = `${this.$vuetify.theme.themes[dark ? 'dark' : 'light'].primary}`;
        return { '--c-borderWidth': '1px', '--c-borderStyle': 'solid', '--c-borderColor': '#000000', '--c-color': color }
      }
    },
    isCloseIcon() {
      if (this.options.pageMode) {
        //embebed or pop
        if (this.options.pageMode.toLowerCase() == "preview") {
          return ""
        } else {
          return "pwc-icon pwc-close-outline"
        }
      } else {
        if (this.$route.name.toLowerCase() == "preview") {
          return ""
        } else {
          return "pwc-icon pwc-close-outline"
        }
      }

    },
    isDisabled() {
      return this.schema.disabled != undefined ?
        this.schema.disabled :
        !this.isEdit;
    },
    datetimePickerFormat() {
      var result = this.schema.defaultDateFormat || this.$store.state.app.appPerference.GlobalDateFormat;
      var newResult = this.returnSplitFormat(result);
      return newResult;
    },
    showDateTimeChip() {
      return this.datetimePickerValue.length;
    },
    rules() {
      if (this.schema.show && this.schema.required) {
        return [
          v => {
            return this.showDateTimeChip || this.$t("schema-base.rules.required");
          }
        ];
      }
    }
  },
  methods: {
    assignDateChoose(result) {
      this.model[this.schema.model] = result;
      this.setFlag = false;
      if (typeof (result[0]) === "number") {
        this.dateChoose[0] = this.moment(this.model[this.schema.model][0]).format("YYYY-MM-DD");
        this.dateChoose[1] = this.moment(this.model[this.schema.model][1]).format("YYYY-MM-DD");
      } else if (typeof (result[0]) === "string") {
        this.dateChoose[0] = this.moment(this.model[this.schema.model][0], this.datetimePickerFormat).format("YYYY-MM-DD");
        this.dateChoose[1] = this.moment(this.model[this.schema.model][1], this.datetimePickerFormat).format("YYYY-MM-DD");
      }
    },
    clearDateTime() {
      if (this.isDisabled) return
      this.$set(this.model, this.schema.model, []);
      this.dateChoose = [];
    },
    allowDates(val) {
      if (this.schema.allowDates) {
        return this.proxyEval({
          val
        }, this.schema.allowDates);
      } else {
        return true;
      }
    },
    returnSplitFormat(value) {
      var result = value;
      var resultArray = [];
      if (result && result !== "") {
        resultArray = result.split("HH");
      }
      var newResult = result;
      if (resultArray.length > 0) {
        newResult = resultArray[0].trim();
      }
      return newResult;
    }
  },
};

</script>

<style>
.vc-datetimepicker-custom-style>span.v-chip {
  font-size: var(--c-fontSize);
  line-height: var(--c-lineHeight);
  font-family: var(--c-fontFamily);
  font-weight: var(--c-fontWeight);
  letter-spacing: var(--c-letterSpacing);
  color: var(--c-color);
  border-color: var(--c-color);
}

.datetime-picker-box .vc-datetime-picker-input.vc-datetimepicker-custom-style {
  border-width: var(--c-borderWidth) !important;
  border-style: var(--c-borderStyle) !important;
  border-color: var(--c-borderColor) !important;
  border-radius: var(--c-borderRadius) !important;
  background: var(--c-background) !important;
  box-shadow: var(--c-shadow) !important;
}

.vc-datetime-picker-input {
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.42);
  height: 48px;
  margin: var(--c-margin) !important;
  display: flex;
  align-items: center;
  padding-left: 4px;
  padding-right: 6px;
}

.vc-datetime-picker .v-btn.v-size--default {
  font-size: inherit;
  padding: 0 8px;
  min-width: 40px;
}

.vc-datetime-picker .ind {
  background: rgba(0, 0, 0, 0.04);
  padding: 6px 8px;
  border-radius: 4px;
  cursor: default;
}

.vc-datetime-picker-content .v-card {
  margin: 0;
  min-width: 100%;
}

.vc-datetime-picker-message {
  font-size: 12px;
  line-height: 14px;
  position: relative;
  color: #ff5252 !important;
  min-width: 100%;
  min-height: 30px;
  opacity: 0;
  transition: opacity 0.2s linear;
}

.vc-datetime-picker-message.active {
  opacity: 1;
}

.datetime-picker-box {
  height: 118px;
}

.datetime-picker-box:has(.preview-text) {
  height: 88px;
}

.vc-datetime-picker .showDisable {
  opacity: 0.5;
}

.vc-datetime-picker-input .rule-container {
  visibility: hidden;
  position: relative;
  top: 9px;
  left: 7px;
  width: 0px;
}

.vc-datetime-picker-input .rule-container .v-messages.error--text {
  visibility: visible;
}
</style>

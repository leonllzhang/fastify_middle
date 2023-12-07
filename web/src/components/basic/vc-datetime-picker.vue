<template>
  <div :class="['layout', 'datetime-picker-box', classes, { 'py-2 pt-0': pageMode == 'preview' }]">
    <div v-show="!schema.disableLabel"
      :class="['vc-label', { horizontal: isHorizontal, required: isEdit ? schema.required : '' }]">
      <span :style="computeStyle('Label',schema)">{{ label }}</span>
      <v-tooltip right :disabled="!schema.tooltip">
        <template v-slot:activator="{ on }">
          <v-icon v-show="schema.tooltip" v-on="on" color="primary">mdi-message-alert</v-icon>
        </template>
        <span>{{ tooltipLabel }}</span>
      </v-tooltip>
    </div>
    <template>
      <div class="flex-grow-1">
        <div :class="['flex', 'vc-datetime-picker-input', { showDisable: isDisabled }, { 'preview-text': !isEdit },
        {'vc-datetimepicker-custom-style': (schema.revampSchema && schema.revampSchema[0].members) && (isEdit || (!isEdit && schema.customPreviewStyle))}]"
           :style="[{ 'border-width': pageMode == 'preview' && !schema.customPreviewStyle ? '0px !important' : '' },
          (isEdit || (!isEdit && schema.customPreviewStyle)) ? returnComputeStyle : '']">
          <v-chip class="ma-1" tabindex="0" :aria-label="label" v-if="showDateTimeChip" close :close-icon="isCloseIcon"
            color="primary" outlined :disabled="!isEdit" @click:close="clearDateTime">
            <span>{{ moment(datetimePickerValue, datetimePickerFormat).format(datetimePickerFormat) }}</span>
          </v-chip>
          <!-- <v-text-field tabindex="0" :aria-label="label + $dm_arialabel(rules, value)" :aria-required="schema.required"
            class="rule-container" :rules="rules" v-model="model[schema.model]"></v-text-field> -->
          <v-spacer />
          <v-menu v-model="show" :close-on-content-click="false" offset-y min-width="330px" max-width="330px"
            :disabled="isDisabled" eager>
            <template v-slot:activator="{ on, attrs }">
              <v-btn tabindex="0" v-bind="attrs" v-on="on" min-width="34px" class="px-2"
                v-show="pageMode != 'preview'" text>
                <v-icon :color="$vuetify.theme.dark ? '' :'pwcDarkGrey'" size="28">pwc-icon pwc-calendar</v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-tabs class="vc-datetime-picker-content" fixed-tabs>
                <v-tab v-if="showDate" tabindex="0" :aria-label="locale('vc.dateime-picker.date')">
                  {{ locale("vc.dateime-picker.date") }}</v-tab>
                <v-tab v-if="showTime" tabindex="0" :aria-label="locale('vc.dateime-picker.time')">
                  {{ locale("vc.dateime-picker.time") }}</v-tab>
                <v-tab-item v-if="showDate">
                  <v-date-picker tabindex="0" v-model="dateChoose" :locale="this.$i18n.locale" color="primary"
                    :allowed-dates="allowDates" width="100%"></v-date-picker>
                </v-tab-item>
                <v-tab-item v-if="showTime">
                  <v-time-picker tabindex="0" v-model="timeChoose" :allowed-minutes="schema.allowMinutes"
                    color="primary" :use-seconds="useSeconds" width="100%"></v-time-picker>
                </v-tab-item>
              </v-tabs>
            </v-card>
          </v-menu>
        </div>
        <v-text-field v-if="(schema.required && isEdit)" class="validationModule" height="0px" v-model="value" :rules="rules">
        </v-text-field>
      </div>
      <!-- <div :class="['vc-datetime-picker-message', { active: !valid }]" v-show="!schema.disableLabel">
        <div v-if="isHorizontal" :class="['vc-label', 'd-inline-flex', { horizontal: isHorizontal }]">
        </div>
        <div class="d-inline-flex pl-3">
          {{ errMsgs.toString() }}
        </div>
      </div> -->
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
      showDate: false,
      showTime: false,
      dateChoose: "",
      timeChoose: "",
      formatDatetimePickerValue: "",
      setFlag: true,
      useSeconds: false,
      empty: false
    };
  },
  watch: {
    datetimePickerValue: {
      handler(val, oldVal) {
        var newModelVal = this.moment(val, this.datetimePickerFormat).unix() * 1000;
        if (this.setFlag || typeof (this.model[this.schema.model]) !== "number" || this.model[this.schema.model] !==
          newModelVal) {
          var newVal = val.trim();
          if (newVal !== '') {
            if (this.schema.mode.toLowerCase() === "date") {
              newVal = newVal + " 00:00:00"
              this.$set(this.model, this.schema.model, this.moment(newVal, this.datetimePickerFormat + " 00:00:00")
                .unix() * 1000);
            } else if (this.schema.mode.toLowerCase() === "time") {
              newVal = this.moment(new Date()).format("YYYY-MM-DD") + " " + newVal;
              this.$set(this.model, this.schema.model, this.moment(newVal, "YYYY-MM-DD " + this.datetimePickerFormat)
                .unix() * 1000);
            } else {
              this.$set(this.model, this.schema.model, this.moment(newVal, this.datetimePickerFormat).unix() * 1000);
            }
          } else {
            this.$set(this.model, this.schema.model, null);
          }
        }
        this.setFlag = true;
        this.empty = false;
      }
    },
    value: {
      handler(val, oldVal) {
        if (val) {
          this.empty = false;
          if (typeof (val) === "number") {
            this.setFlag = false;
            this.dateChoose = this.moment(this.model[this.schema.model]).format("YYYY-MM-DD");
            var result = this.schema.defaultDateFormat || this.$store.state.app.appPerference.GlobalDateFormat;
            this.timeChoose = this.moment(this.model[this.schema.model]).format(this.returnSplitFormat("time",
              result));
          } else if (val !== '' && typeof (val) === "string") {
            this.setFlag = false;
            this.dateChoose = this.moment(this.model[this.schema.model], this.datetimePickerFormat).format(
              "YYYY-MM-DD");
            var result = this.schema.defaultDateFormat || this.$store.state.app.appPerference.GlobalDateFormat;
            this.timeChoose = this.moment(this.model[this.schema.model], this.datetimePickerFormat).format(this
              .returnSplitFormat("time", result));
          }
        } else {
          this.empty = true;
        }
      },
      immediate: true
    }
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
    datetimePickerValue() {
      var result = "";
      switch (this.schema.mode.toLowerCase()) {
        case "date":
          var currentFormat = "YYYY-MM-DD";
          result = this.dateChoose !== "" ? this.moment(this.dateChoose, currentFormat).format(this
            .datetimePickerFormat) : "";
          this.showDate = true;
          this.showTime = false;
          break;
        case "time":
          var currentFormat = this.returnSplitFormat("time", this.schema.defaultDateFormat || this.$store.state.app
            .appPerference.GlobalDateFormat);
          result = this.timeChoose !== "" ? this.moment(this.timeChoose, currentFormat).format(this
            .datetimePickerFormat) : "";
          this.showDate = false;
          this.showTime = true;
          break;
        case "datetime":
          var timeFormat = this.returnSplitFormat("time", this.schema.defaultDateFormat || this.$store.state.app
            .appPerference.GlobalDateFormat);
          var currentFormat = "YYYY-MM-DD " + timeFormat;
          result = this.dateChoose !== "" ? this.moment(this.timeChoose !== "" ? this.dateChoose + " " + this
            .timeChoose : this.dateChoose, currentFormat).format(this.datetimePickerFormat) : "";
          this.showDate = true;
          this.showTime = true;
          break;
        default:
          var timeFormat = this.returnSplitFormat("time", this.schema.defaultDateFormat || this.$store.state.app
            .appPerference.GlobalDateFormat);
          var currentFormat = "YYYY-MM-DD " + timeFormat;
          result = this.dateChoose !== "" ? this.moment(this.timeChoose !== "" ? this.dateChoose + " " + this
            .timeChoose : this.dateChoose, currentFormat).format(this.datetimePickerFormat) : "";
          this.showDate = true;
          this.showTime = true;
          break;
      }
      return result;
    },
    datetimePickerFormat() {
      var result = this.schema.defaultDateFormat || this.$store.state.app.appPerference.GlobalDateFormat;
      var newResult = this.returnSplitFormat(this.schema.mode.toLowerCase(), result);
      this.useSeconds = newResult.indexOf("HH:mm:ss") > -1 ? true : false;
      return newResult;
    },
    showDateTimeChip() {
      return !this.empty && ((this.showDate && this.dateChoose != '') || (this.showTime && this.timeChoose != ''));
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
    clearDateTime() {
      if (this.isDisabled) {
        return;
      }
      this.$set(this.model, this.schema.model, null);
      this.dateChoose = '';
      this.timeChoose = '';
      this.empty = true;
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
    returnSplitFormat(mode, value) {
      var result = value;
      var resultArray = [];
      if (result && result !== "") {
        resultArray = result.split("HH");
      }
      var newResult = result;
      if (resultArray.length > 0) {
        if (mode === "date") {
          newResult = resultArray[0].trim();
        } else if (mode === "time") {
          newResult = "HH" + resultArray[1].trim();
        }
      }
      return newResult;
    }
  },
  created() {
    
    // the default value is null, do not set current date time for it if user set other value, e.g., value is set as undefined (to clear datetime value) or timestamp number or date time string
    if (this.$store.state.app.currentpagetype === "page" || this.pageMode === "add" && this.value === null) {
      // isEmpty开关开启 && 旧数据 赋值当天
      if(this.schema.isEmpty || !this.schema.hasOwnProperty('isEmpty')) this.$set(this.model, this.schema.model, this.moment(this.moment(new Date())).unix() * 1000);
    }
  }
};

</script>

<style>
.vc-datetimepicker-custom-style > span.v-chip{
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
  border:  1px solid rgba(0, 0, 0, 0.42);
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

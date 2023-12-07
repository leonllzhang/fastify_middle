<template>
  <v-layout :class="classes" class="dm-view-layout vc-label-wrap" :style="schema.style">
    <div class="vc-label" v-show="!schema.disableLabel" :class="{ horizontal: isHorizontal }" :style="schema.labelStyle">
      <span tabindex="0" :aria-label="label" :style="schema.component === 'vc-label' ? computeStyle(null, schema) : computeStyle('Label', schema)">{{ label }}</span>
      <v-tooltip right :disabled="!schema.tooltip">
        <template v-slot:activator="{ on }">
          <v-icon v-show="schema.tooltip" v-on="on" color="primary">mdi-message-alert</v-icon>
        </template>
        <span>{{ tooltipLabel }}</span>
      </v-tooltip>
    </div>
    <!-- 去掉占位的class -->
    <!-- <v-flex class="word-wrap vc-label-content"> -->
    <v-flex class="vc-field">
      <span v-if="schema.dataType && schema.dataType.toLowerCase() == 'date'"
        :style="schema.dataStyle" 
        >{{ displayDatetime }}
      </span>
      <v-subheader v-else 
        tabindex="0" :aria-label="(String(labelvalue) || '')"  style="min-width: auto;"
        :style="[schema.dataStyle, schema.component != 'vc-label' &&  schema.customPreviewStyle?  computeStyle('Field', schema) : '']" 
        v-model="labelvalue" class="label-text vc-label preview-text vc-form-label-custom-style"
      >{{ (String(labelvalue) || "") }}</v-subheader>
    </v-flex>
  </v-layout>
</template>

<script>
import base from "../utils/form-base";
export default {
  mixins: [base],
  methods: {
  },
  mounted() {
    //console.log('lable schema', this.schema);
  },
  computed: {
    labelvalue: {
      get() {
        //处理系统字段内容
        switch ((this.schema.model || '').toLowerCase()) {
          case "ng_syscreationtime":
          case "ng_syslastmodificationtime":
            return this.model[this.schema.model] ? this.moment(this.model[this.schema.model]).format(this.$store.state.app.appPerference.GlobalDateFormat) : '';
            break;
          case "ng_sysisdeleted":
          case "ng_workflowisendstate":
            return this.model[this.schema.model] ? this.model[this.schema.model] : 'false';
            break;
          //case "ng_relevantusers":
          //case "ng_currentworkflowroles":
          //case "ng_currentworkflowusers":
          //  return this.model[this.schema.model] ? this.model[this.schema.model] : this.value;
          //  break;
          default:
            break;
        }

        if (this.schema.returnObject) {
          if (this.model[this.schema.model] && this.model[this.schema.model].length > 0) {
            let itemText = '';
            //console.log('typeof', typeof (this.model[this.schema.model]))
            if (typeof (this.model[this.schema.model]) == "string") {
              return "";
            }
            if (typeof (this.model[this.schema.model]) == "object") {
              this.model[this.schema.model].map(m => {
                itemText = itemText + m["value"] + ",";
              });
            }
            if (itemText != "") {
              itemText = itemText.substr(0, itemText.length - 1);
            }
            return itemText;
          }
          return "";
        } else {
          return this.$te(this.localeKey + ".value") &&
            this.$t(this.localeKey + ".value")
            ? this.$t(this.localeKey + ".value")
            : this.value;
        }
      },
      set(val) {
        this.value = val;
      }
    },
    displayDatetime() {
      if (this.labelvalue) {
        return this.moment(this.labelvalue).format(this.$store.state.app.appPerference.GlobalDateFormat);
      } else {
        return "";
      }

    }
  },
};
</script>

<style>
.vc-label-wrap .vc-label-content {
  min-height: 70px;
}

.dm-view-layout .label-text {
  font-size: 16px;
}

.v-subheader {
  height: auto;
}

</style>

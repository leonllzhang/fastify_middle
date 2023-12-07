<template>
  <div :class="classes" v-if="isEdit">
    <v-layout>
      <div v-show="!schema.disableLabel" class="vc-label"
        :class="{ 'horizontal': isHorizontal, required: schema.required }">
        <span :style="computeStyle('Label', schema)">{{ label }}</span>
        <v-tooltip right :disabled="!schema.tooltip">
          <template v-slot:activator="{ on }">
            <v-icon v-show="schema.tooltip" v-on="on" color="primary">mdi-message-alert</v-icon>
          </template>
          <span>{{ tooltipLabel }}</span>
        </v-tooltip>
      </div>
      <v-flex>
        <v-textarea tabindex="0" :aria-label="label + $dm_arialabel(rules, value)" :aria-required="schema.required"
           solo flat single-line persistent-hint class="vc-textbox"
          :class="schema.revampSchema && schema.revampSchema[0].members ? 'vc-textarea-custom-style' : ''"
          v-model="value" :name="name" :rules="rules" :counter="schema.counter" :rows="schema.rows || 5"
          :disabled="schema.disabled" :readonly="schema.readonly" :style="computeStyle('Field', schema)" />
         
        <!-- <div v-else tabindex="0" :aria-label="previewVal" class="vc-label preview-text inner-label" v-html="previewVal">
        </div> -->
      </v-flex>
    </v-layout>
  </div>
  <vc-label  v-else class="vc-label-wrapper"
  :class="{'vc-textarea-wrapper':schema.customPreviewStyle}"
  :schema="previewSchema" :model="model" :options="options" />
</template>

<script>
import base from "../utils/form-base";
import vcLabel from "./vc-label";
export default {
  mixins: [base],
  components: {
    vcLabel,
  },
  computed: {
    rules() {
      let schema = this.schema,
        _this = this,
        rules = [];
      if (schema.show !== false) {
        if (schema.required) {
          rules.push(v => {
            return !!v || _this.$t("schema-base.rules.required");
          });
        }
        if (schema.maxlength) {
          rules.push(v => {
            var validator =
              _this.maxlengthValidator ||
              function (v, schema) {
                var maxlength = parseInt(schema.maxlength);
                if (maxlength) {
                  return (
                    !v ||
                    v.length <= maxlength ||
                    _this.$t("schema-base.rules.maxlength-pre") +
                    `${maxlength}` +
                    _this.$t("schema-base.rules.maxlength-end")
                  );
                } else {
                  return true;
                }
              };

            return validator(v, _this.schema);
          });
        }
        if (schema.pattern) {
          rules.push(v => {
            var validator =
              _this.patternhValidator ||
              function (v, schema) {
                if (schema.pattern) {
                  try {
                    var regex = new RegExp(schema.pattern);
                    return (
                      regex.test(v) ||
                      (schema.patternMessage ||
                        _this.$t("schema-base.rules.pattern"))
                    );
                  } catch (e) {
                    return true;
                  }
                } else {
                  return true;
                }
              };

            return validator(v, _this.schema);
          });
        }
      }
      return rules;
    },
    previewVal() {
      return this.value.replace(/\n/g, "<br/>");
    }
  },
};

</script>

<style>
.vc-label-wrapper.vc-textarea-wrapper .vc-field > .vc-label{
  color: var(--c-color) !important;
  font-size: var(--c-fontSize) !important;
  font-family: var(--c-fontFamily) !important;
  font-weight: var(--c-fontWeight) !important;
  letter-spacing: var(--c-letterSpacing) !important;
  line-height: var(--c-lineHeight) !important;
  border-width: var(--c-borderWidth) !important;
  border-style: var(--c-borderStyle) !important;
  border-color: var(--c-borderColor) !important;
  border-radius: var(--c-borderRadius) !important;
  background: var(--c-background) !important;
  box-shadow: var(--c-shadow) !important;
  margin: var(--c-margin) !important;
}
.vc-textbox .v-input__slot {
  border: 1px solid rgba(0, 0, 0, 0.42);
  border-radius: 0;
}
.vc-textarea-custom-style.vc-textbox {
  margin: var(--c-margin) !important;
}

.vc-textarea-custom-style.vc-textbox .v-input__slot {
  border-width: var(--c-borderWidth) !important;
  border-style: var(--c-borderStyle) !important;
  border-color: var(--c-borderColor) !important;
  border-radius: var(--c-borderRadius) !important;
  background: var(--c-background) !important;
  box-shadow: var(--c-shadow) !important;
  /* padding: var(--c-padding) !important; */
}

.vc-textarea-custom-style textarea {
  color: var(--c-color) !important;
  font-size: var(--c-fontSize) !important;
  font-family: var(--c-fontFamily) !important;
  font-weight: var(--c-fontWeight) !important;
  letter-spacing: var(--c-letterSpacing) !important;
}
</style>

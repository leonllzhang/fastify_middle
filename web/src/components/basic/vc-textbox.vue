<template>
  <div v-if="isEdit" :class="classes">
    <v-layout>
      <div v-show="!schema.disableLabel" class="vc-label"
        :class="{ horizontal: isHorizontal, required: schema.required }">
        <span :style="computeStyle('Label', schema)">{{ label || "&#12288;" }}</span>
        <v-tooltip right :disabled="!schema.tooltip">
          <template v-slot:activator="{ on }">
            <v-icon v-show="schema.tooltip" v-on="on" color="primary">mdi-message-alert</v-icon>
          </template>
          <span>{{ tooltipLabel }}</span>
        </v-tooltip>
      </div>
      <v-flex>
        <template v-if="schema.inputType == 'password'">
          <v-text-field  :disabled="schema.disabled"
          tabindex="0" :aria-label="label + $dm_arialabel(rules, value)" :aria-required="schema.required"
            solo flat class="vc-textbox" single-line v-model="value" :name="name"
            :type="showPassword ? 'text' : 'password'" :rules="rules" :hint="hint"
            :class="schema.revampSchema && schema.revampSchema[0].members ? 'vc-textbox-custom-style' : ''"
            persistent-hint :color="color" @input="onInput" @keyup.enter="onKeyup"
            @click:append="showPassword = !showPassword" @keydown.enter.prevent
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"  :style="[computeStyle('Field', schema), setDisabledBgColor()]"></v-text-field>
        </template>
        <template v-else>
          <v-text-field :disabled="schema.disabled"
          tabindex="0" :aria-label="label + $dm_arialabel(rules, value)" :aria-required="schema.required"
            solo flat class="vc-textbox" single-line v-model="value" :name="name"
            :class="schema.revampSchema && schema.revampSchema[0].members ? 'vc-textbox-custom-style' : ''"
            :type="schema.inputType" :rules="rules" :hint="hint" persistent-hint
             @input="onInput" @keyup.enter="onKeyup" @keydown.enter.prevent :prepend-inner-icon="getIcon"
            :style="[computeStyle('Field', schema), setDisabledBgColor()]">
          </v-text-field>
        </template>
      </v-flex>
    </v-layout>
  </div>
  <vc-label  v-else  class="vc-label-wrapper"
  :class="{'vc-textbox-wrapper':schema.customPreviewStyle}"
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
  data() {
    return {
      showPassword: false
    }
  },
  computed: {
    hint() {
      if (this.schema.hint) {
        return this.schema.hint;
      }

        if (
          this.schema.inputType &&
          this.schema.inputType.toLowerCase() == "number"
        ) {
          return this.$t("schema-base.rules.numberHint");
        }
      },
      value: {
        get() {
          return this.model[this.schema.model];
        },
        set(val) {
          this.model[this.schema.model] = val;
        },
      },
      rules() {
        let schema = this.schema,
          _this = this,
          rules = [];
        if (schema.show !== false) {
          if (schema.required) {
            rules.push((v) => {
              // DefectID:[20220510-00081] [20220222-01750] 在没有 typeof(v)=='number' 时，如果 v 为数字 0 则认为为 false
              return typeof(v) === 'number' || !!v || _this.$t("schema-base.rules.required");
            });

            if (schema.inputType && schema.inputType.toLowerCase() == "number") {
              rules.push((v) => {
                // DefectID:[20220510-00081] [20220222-01750] 将 v 转为 String 为了在 v 为 number类型的 0 时也认为是合法输入。
                return !!String(v) || _this.$t("schema-base.rules.numberReq");
              });
            } else if (schema.pattern) {
              rules.push((v) => {

              var validator =
                _this.patternhValidator ||
                function (v, schema) {
                  if (schema.pattern) {
                    try {
                      var regex = new RegExp(schema.pattern);
                      return (
                        regex.test(v) ||
                        (_this.$te(_this.localeKey + ".patternMessage") ?
                          _this.$t(_this.localeKey + ".patternMessage") :
                          schema.patternMessage) ||
                        _this.$t("schema-base.rules.pattern")
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

        if (schema.maxlength) {
          rules.push((v) => {
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

        if (schema.pattern && _this.value != '') {
          rules.push((v) => {
            var validator =
              _this.patternhValidator ||
              function (v, schema) {
                if (schema.pattern) {
                  try {
                    var regex = new RegExp(schema.pattern);
                    return (
                      regex.test(v) ||
                      (_this.$te(_this.localeKey + ".patternMessage") ?
                        _this.$t(_this.localeKey + ".patternMessage") :
                        schema.patternMessage) ||
                      _this.$t("schema-base.rules.pattern")
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
    getIcon() {
      return (this.schema.preinicon ? (this.schema.preinicon.indexOf('pwc-') > -1 ? 'pwc-icon ' : 'mdi ') : '') + (
        this.schema.preinicon ? this.schema.preinicon : '')
    }
  },
  methods: {
    onKeyup() {
      if (this.schema.onKeyup) {
        return this.eval("$raiseEvent", this.schema.onKeyup);
      }
    },
    onInput() {
      if (this.schema.onInput) {
        return this.eval("$raiseEvent", this.schema.onInput);
      }
    },
    // 生成disabled状态的背景色，默认白色
    setDisabledBgColor() {
      let c = this.schema.disabledBgColor ? this.schema.disabledBgColor : '#fff'
      return {'--disabledBgColor': c}
    }
  },
  mounted() {
    if (this.schema.inputType == 'password' && !this.isEdit) {
      String.prototype.starTimes = function (n) {
        return Array.prototype.join.call({
          length: n + 1
        }, this);
      };
      this.model[this.schema.model] = "*".starTimes(this.model[this.schema.model].length);
    }
  }
};

</script>
<style>
.vc-label-wrapper.vc-textbox-wrapper .vc-field > .vc-label{
  color: var(--c-color);
  font-size: var(--c-fontSize);
  font-family: var(--c-fontFamily);
  font-weight: var(--c-fontWeight);
  letter-spacing: var(--c-letterSpacing);
  line-height: var(--c-lineHeight);
  border-width: var(--c-borderWidth);
  border-style: var(--c-borderStyle);
  border-color: var(--c-borderColor);
  border-radius: var(--c-borderRadius);
  background: var(--c-background);
  box-shadow: var(--c-shadow);
  margin: var(--c-margin);
}


.vc-textbox-custom-style.vc-textbox {
  margin: var(--c-margin);
}
.vc-textbox .v-input__slot {
  border: 1px solid rgba(0, 0, 0, 0.42);
  border-radius: 0;
}
.vc-textbox-custom-style.vc-textbox .v-input__slot {
  border-radius: var(--c-borderRadius);
  background: var(--c-background);
  box-shadow: var(--c-shadow);
  border-width: var(--c-borderWidth);
  border-style: var(--c-borderStyle);
  border-color: var(--c-borderColor);
}
.vc-textbox-custom-style.vc-textbox input {
  color: var(--c-color);
  font-size: var(--c-fontSize);
  font-family: var(--c-fontFamily);
  font-weight: var(--c-fontWeight);
  letter-spacing: var(--c-letterSpacing);
  line-height: var(--c-lineHeight);
  max-height: none;
}

/* 针对textbox的disabled状态，修改背景色 */
.vc-textbox-custom-style.vc-textbox.v-input--is-disabled .v-input__slot{
  background-color: var(--disabledBgColor) !important;
}
</style>

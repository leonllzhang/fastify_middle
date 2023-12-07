<template>
  <div v-if="isEdit" :class="['layout', classes]">
    <v-layout>
      <div v-show="!schema.disableLabel" class="vc-label"
        :class="{ horizontal: isHorizontal, required: schema.required }">
        <span :style="computeStyle('Label', schema)">{{ label }}</span>
        <v-tooltip right :disabled="!schema.tooltip">
          <template v-slot:activator="{ on }">
            <v-icon v-show="schema.tooltip" v-on="on" color="primary">mdi-message-alert</v-icon>
          </template>
          <span>{{ tooltipLabel }}</span>
        </v-tooltip>
      </div>
      <template v-if="row">
        <v-select tabindex="0" :aria-label="label + $dm_arialabel(rules, selectValue)" :aria-required="schema.required"
          :label="schema.emptyText" class="vc-select rounded-0" :items="selectList" solo flat :rules="rules"
          @change="onchange" @keydown.enter.prevent :disabled="selectDisable" :item-text="itemText"
          :item-value="itemValue" :multiple="schema.multiple" v-model="selectValue" :clearable="clearable"
          :class="schema.revampSchema && schema.revampSchema[0].members ? 'vc-select-custom-style' : ''"
          :style="returnComputeStyle" append-icon="mdi-chevron-down"
          :placeholder="placeholder" :return-object="schema.returnObject" :attach="true"></v-select>
      </template>
      <template v-else>
        <v-flex>
          <v-select tabindex="0" :aria-label="label + $dm_arialabel(rules, selectValue)" :aria-required="schema.required"
            :label="schema.emptyText" class="vc-select rounded-0" :items="selectList" solo flat :rules="rules"
            @change="onchange" @keydown.enter.prevent :disabled="selectDisable" :item-text="itemText"
            :item-value="itemValue" :multiple="schema.multiple" v-model="selectValue" :clearable="clearable"
            :class="schema.revampSchema && schema.revampSchema[0].members ? 'vc-select-custom-style' : ''"
            :style="returnComputeStyle" append-icon="mdi-chevron-down"
            :placeholder="placeholder" :return-object="schema.returnObject" :attach="true"></v-select>
        </v-flex>
      </template>
    </v-layout>
  </div>
  <vc-label v-else class="vc-label-wrapper"
  :class="{'vc-select-wrapper':schema.customPreviewStyle}"
  :schema="previewSchema" :model="model" :options="options" />
</template>

<script>
import base from "../utils/form-base";
import queryBase from '../utils/query-base'
import vcLabel from './vc-label';

export default {
  mixins: [base, queryBase],
  components: {
    vcLabel
  },
  data() {
    return {
      selectValue: null,
      setFlag: true
    };
  },
  watch: {
    selectValue: {
      handler(val, oldVal) {
        var self = this;
        if (self.setFlag || oldVal || oldVal && oldVal.length > 0) {
          if (Array.isArray(val)) { //v-select接收的值是对象或者数组
            self.value = JSON.parse(JSON.stringify(val));
          } else {
            self.value = val ? [JSON.parse(JSON.stringify(val))] : [];
          }
        } else {
          //需要区分第一次的赋值和稍后的更改。
          if (oldVal == null && val) { // 空值，赋值为有值
            //第一次的赋值，第一次赋值时， this.value == val ,此时什么都不做
            //前面是多选，后面是单选
            if ((this.schema.multiple && this.value != val) || (!this.schema.multiple && this.value && this.value[
              0] != val)) {
              if (Array.isArray(val)) { //v-select接收的值是对象或者数组
                self.value = JSON.parse(JSON.stringify(val));
              } else {
                self.value = val ? [JSON.parse(JSON.stringify(val))] : [];
              }
            }

          }
        }
      }
    },
    value: {
      handler(val, oldVal) {
        var self = this;
        //此处两种情况会由value 导致 selectValue 的 变更
        //1. selectValue 空，原来没选择，设置value后，设置可选项
        //2. 多选Value 发生变更，导致val 的length 和 selectvalue不一致，此时更新。
        //3. setValue传递过来的数据，需要重置当前数据
        //console.log('select value', JSON.stringify(val));
        //处理多选的时候，如果setValue替换了几个个数据

        if (val && val.length > 0 && (!self.selectValue || (val.length !== self.selectValue.length && self.schema
          .multiple))) {
          self.selectValue = self.schema.multiple ? val : val[0];
          self.setFlag = false;
        }
        //处理多选的时候，如果setValue替换了已选的数据，例如已经选择了两个数据，正好替换的也是两个数据的情况
        else if (val && val.length > 0 && (!self.selectValue ||
          (val.length == self.selectValue.length && self.schema.multiple))) {
          //对比新数据和已选择的数据，是否有变化，如果有变化，则需要重新赋值
          let selectCount = val.length;
          let equalCount = 0;
          val.forEach(function (item) {
            self.selectValue.forEach(function (itemValue) {
              if (item["key"].toLowerCase() == itemValue["key"].toLowerCase()) {
                equalCount++;
              }
            })
          })
          if (equalCount != selectCount) {
            self.selectValue = self.schema.multiple ? val : val[0];
            self.setFlag = false;
          }
        } else if (val && val.length > 0 && (!self.selectValue || !self.schema.multiple)) {
          //对比新数据和已选择的数据，是否有变化，如果有变化，则需要重新赋值
          let selectCount = val.length;
          let equalCount = 0;
          val.forEach(function (item) {
            if (item["key"].toLowerCase() == self.selectValue["key"].toLowerCase()) {
              equalCount++;
            }
          })
          if (equalCount != selectCount) {
            self.selectValue = self.schema.multiple ? val : val[0];
            self.setFlag = false;
          }
        }
        //val 空，导致了selectValue 的 清空。
        else if ((!val || val.length < 1) && self.selectValue) {
          self.selectValue = null;
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
        return{'--c-borderWidth': '1px','--c-borderStyle':'solid','--c-borderColor': '#000000'}
      }
    },
    placeholder() {
      const dis = this.schema.disabled;
      let placeholder = '';
      dis ? placeholder = '' : placeholder = this.$t("select.placeholder");
      return placeholder;
    },
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
          if (this.schema.multiple) {
            //多选判断数组长度，
            rules.push((val) => {
              return (
                (val && val.length > 0) || this.$t("schema-base.rules.required")
              );
            });
          } else {
            //单元判断对象有无
            rules.push((val) => {
              return (
                (val != null) || this.$t("schema-base.rules.required")
              );
            });
          }

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
    },
    selectDisable() {
      var self = this;
      var result = self.schema.disabled;
      if (self.schema.query && self.schema.query.queryKey && self.schema.query.queryKey !== "") {
        if (self.model[self.schema.query.queryKey] && self.model[self.schema.query.queryKey].length < 1) {
          result = true;
        }
      }
      return result;
    },
    clearable() {
      return !(this.schema.required === true);
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
}

</script>

<style>
.vc-label-wrapper.vc-select-wrapper .vc-field > .vc-label{
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

.vc-select-custom-style.vc-select .v-input__control {
  margin: var(--c-margin);
}
.vc-select.v-select .v-input__slot {
  border-radius: var(--c-borderRadius);
  border-color: var(--c-borderColor);
  border: solid 1px rgba(0, 0, 0, 0.42);
}
.vc-select .v-input__slot {
  border: 1px solid rgba(0, 0, 0, 0.42);
  border-radius: 0;
}
.vc-select-custom-style.vc-select .v-input__slot {
  border-width: var(--c-borderWidth);
  border-style: var(--c-borderStyle);
  border-color: var(--c-borderColor);
  border-radius: var(--c-borderRadius);
  background: var(--c-background);
  box-shadow: var(--c-shadow);
}
.vc-select-custom-style.vc-select .v-select__selection{
  color: var(--c-color);
  font-size: var(--c-fontSize);
  line-height: var(--c-lineHeight);
  font-family: var(--c-fontFamily);
  font-weight: var(--c-fontWeight);
  letter-spacing: var(--c-letterSpacing);
}
</style>

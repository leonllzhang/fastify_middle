<template>
  <component
    :is="view"
    :schema="schema"
    :model="model"
    :options="templateOptions"
  />
</template>

<script>
import schemaBase from "../utils/schema-base";
import formBase from '../utils/form-base';
import queryBase from '../utils/query-base';
import { get } from "lodash/core";


var isObject = function (arg) {
  return Object.prototype.toString.call(arg) === "[object Object]";
};
var isFunction = function (arg) { return typeof arg === 'function'; }
var isString = function (arg) { return typeof arg === "string" }
export default {
  mixins: [schemaBase],
  props: {
    emptyView: {
      type: Object,
      default: () => {
        return {
          template: "<div>not empty</div>"
        };
      }
    }
  },
  data() {
    return {
      templateOptions: {},
      view: this.emptyView
    };
  },
  created() {
    this.view = this.build(this.schema.template) || this.emptyView;
  },
  methods: {
    build(template) {
      if (!template || !isObject(template) || !template.template || !template.name) return;

      // var data = template.data;
      // if (data) {
      //   template.data = isFunction(data) ? data : function () { return (Object.assign({}, data)); }
      // }

      var { created, methods, data, watch } = template;

      delete template.created;
      delete template.methods;
      delete template.data;
      delete template.watch;

      template.data = function () {
        return {
          data: {}
        }
      };
      template.created = function () {

        if (data && isObject(data)) {
          for (var n in data) {
            !this[n] && this.$set(this.data, n, data[n]);
          }
        }
        if (created) {
          this.generateFunction(created)()
        }
        if (methods) {
          for (var n in methods) {
            this[n] = this.generateFunction(methods[n])
          }
        }
        if (watch) {
          for (var n in watch) {
            get(this, n) && this.$watch(n, function () {
              this.generateFunction(watch[n])()
            })
          }
        }
      }

      // if (template.created) {
      //   template.created = this.generateFunction(template.created);
      // }
      // if (template.methods && isObject(template.methods)) {
      //   for (var n in template.methods) {
      //     template.methods[n] = this.generateFunction(template.methods[n])
      //   }
      // }
      var type = (this.schema.type || "").toLowerCase()

      switch (type) {
        case "form":
          template.mixins = [formBase]
          break;
        case "query":
          template.mixins = [queryBase]
          break;
        default:
          template.mixins = [schemaBase]
          break;
      }
      return template;
    }
  }
};
</script>

<template>
  <div :class="['vspeeddial', classes]">
    <v-speed-dial tabindex="0"
      v-if="$vuetify.breakpoint.name == 'xs'"
      v-model="schema.fab"
      direction="right"
      :open-on-hover="schema.hover"
      :transition="schema.transition"
      fixed
    >
      <template v-slot:activator>
        <v-btn v-model="schema.fab" fab dark small color="primary" width="60" height="60" class="pl-7">
          <v-icon v-if="schema.fab">{{ schema.hideIcon }}</v-icon>
          <v-icon v-else>{{ schema.showIcon }}</v-icon>
        </v-btn>
      </template>
      <div
        v-for="(item, index) in $store.state.app.floatingButtonItems"
        :key="index"
      >
        <v-btn fab dark small color="primary" @click="btnClick(item)" >
          <v-icon>{{ item.icon }}</v-icon>
        </v-btn>
      </div>
    </v-speed-dial>
  </div>
</template>

<script>
import base from "../utils/schema-base";
import { exportEnvUrl } from "../../utils/env";
import { mapMutations } from "vuex";

export default {
  data() {
    return {};
  },
  mixins: [base],
  methods: {
    ...mapMutations("app", ["setbuttonLoading"]),
    btnClick(item) { 
      let that = this,
       tableCode = that.schema.tableCode || '';
      switch (item.type.toLowerCase()) {
        case "adddocument":
          window.open(exportEnvUrl(item.href, item.target));
          break;
        case "export":
          switch (that.$store.state.app.viewdataExport) {
            case "datatable":
              that.bus.$emit("export-datatable", tableCode);
              break;
            case "datatablegroup":
              that.bus.$emit("export-datatablegroup", tableCode);
              break;
            case "card":
              that.bus.$emit("export-card", tableCode);
              break;
            default:
              break;
          }
          break;
        case "custom":
          that.setbuttonLoading(true);
          if (item.click && Array.isArray(item.click)) {
            this.eval(...item.click);
            setTimeout(function () {
              if (item.action) {
                that["vcForm"].setAction(item.action);
              }
              if (item.buttonType.toLowerCase() == "customsubmit") {
                that.vcForm.submit();
              }
            }, 100);
          } else {
            if (item.action) {
              that["vcForm"].setAction(item.action);
            }
          }
          break;
        default:
          break;
      }
    },
    //,
    //onclick() {
    //  let transactionCallback = this.schema.transactionCallback;
    //  let onclick = this.schema.onclick;
    //  if (onclick) {
    //    if (typeof onclick === "string") {
    //      onclick = [onclick];
    //    }
    //    this.eval(...onclick);
    //  }

    //  if (this.schema.enableTransaction && this.schema.transaction) {
    //    let callbackfunc = function (str) {
    //      return Function("schema", "model", "app", "result", str);
    //    };
    //    this.schema.loading = true;
    //    this.$axios
    //      .post("/a/b/api/test", {
    //        code: this.schema.transaction,
    //        data: this.model
    //      })
    //      .then(result => {
    //        this.schema.loading = false;
    //        if (this.schema.transactionCallback) {
    //          (function (str) {
    //            return Function(
    //              "schema",
    //              "model",
    //              "$raiseEvent",
    //              "result",
    //              str
    //            );
    //          })(this.schema.transactionCallback)(
    //            this.schema,
    //            this.model,
    //            this.raise,
    //            result
    //          );
    //        }
    //      })
    //      .catch(err => {
    //        this.schema.loading = false;
    //      }); // transaction('/a/b/api/test','{"code":"'+this.schema.transaction +'","data":"1"}');
    //  }
    //},
    //onfuc(str, paramObj) {
    //  if (str) {
    //    let func = function (content) {
    //      return Function("schema", "model", "app", "obj", content);
    //    };
    //    func(str)(this.schema, this.model, this, paramObj);
    //  }
    //}
  },
  watch: {
    top(val) {
      this.bottom = !val;
    },
    right(val) {
      this.left = !val;
    },
    bottom(val) {
      this.top = !val;
    },
    left(val) {
      this.right = !val;
    },
  },
  computed: {
    permission: {
      _roles: null,
      get() {
        if (this.schema.pageView) {
          return this.schema.pageView === this.$route.params.pageView;
        }
        if (this.schema.show == undefined) {
          if (!this._roles) {
            this._roles = this.userInfo.roles;
          }
          let permissions = new Set(this.schema.permission);

          if (permissions.size == 0) {
            return true;
          } else {
            let roles = new Set(this._roles.filter((x) => permissions.has(x)));
            if (roles.size) {
              return true;
            } else {
              return false;
            }
          }
        } else {
          return this.schema.show;
        }
      },
      set(newVal) {
        this.schema.show = newVal;
      },
    },
  },
  mounted() {},
};
</script>
<style>
.vspeeddial {
  min-height: 10px;
}

.vspeeddial .v-speed-dial {
  left: 0;
  top: calc(50% + 80px);
  transform: translate(-50%, -50%);
}

.vspeeddial .v-btn--floating {
  position: relative;
}

.vspeeddial .v-speed-dial__list {
  z-index: 1001 !important;
}

.vspeeddial.v-speed-dial__list .v-btn {
  margin: 6px;
}

.vspeeddial .v-sheet {
  z-index: 0;
}
</style>

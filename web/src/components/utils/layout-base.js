import {
  mapState
} from 'vuex';
const props = {
  props: {
    schema: {
      type: Object,
      required: true
    },
    model: {
      type: Object
    },
    options: {
      type: Object,
       default() {
         return {
           color: "#dc6900",
           direction: "vertical"
         };
       }
    }
  }
};
export default {
  mixins: [props],
  data() {
    return {
      flag: false
    }
  },
  computed: {
    ...mapState(['userInfo']),
    rules() {
      let schema = this.schema, rules = [];
      if (schema.show !== false) {
        if (schema.required) {
          rules.push(v => {
            return !!v || this.$t("schema-base.rules.required");
          });
        }
      }
      return rules;
    },
  },
  mounted() {
    this.getFlag();
  },
  methods: {
    getFlag() {
      if (!this.userInfo) {
        return false;
      }
      let roles = this.userInfo.roles;
      let permissions = this.schema.permission || [];
      if (permissions.length == 0) {
        this.flag = true;
      } else {
        for (let i in permissions) {
          // roles中角色校验+form中delegateRole角色校验
          if (roles.indexOf(permissions[i]) > -1 || (this.model['delegateRoles'] && this.model['delegateRoles'].length && this.model['delegateRoles'].indexOf(permissions[i]) > -1)) {
            this.flag = true;
            break;
          }
        }
      }
    },
    returnModel(schema) {       
      if (schema.dataType && !this.model[schema.model]) {
        switch (schema.dataType) {
          case "String":             
            this.$set(this.model, schema.model, "");
            break;
          case "Int":
            this.$set(this.model, schema.model, 0);
            break;
          case "KeyValuePairs":
            this.$set(this.model, schema.model, []);
            break;
          case "Strings":
            this.$set(this.model, schema.model, []);
            break;
          case "User":
            this.$set(this.model, schema.model, []);
            break;
          case "Picker":
            this.$set(this.model, schema.model, []);
            break;
          case "File":
            this.$set(this.model, schema.model, []);
            break;
          case "DateTime":
            this.$set(this.model, schema.model, null);
            break;
          case "Boolean":
              this.$set(this.model, schema.model, false);
              break;
          case "DateTimeRange":
            this.$set(this.model, schema.model, []);
            break;
          default:
            this.$set(this.model, schema.model, "");
            break;
        }
             
      }     
      return this.model;
    }
  },
  template: `
    
      <keep-alive>
        <p>hahahha</p>
        <vc-textbox name="ssss" :schema="schema" :model="{}"></vc-textbox>
      </keep-alive>
  
  `
};

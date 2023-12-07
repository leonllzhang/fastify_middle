import base from "./schema-base";
import { mapMutations } from "vuex";
export default {
  mixins: [base],
  props: {
    model: {
      type: Object,
      required: true
    }
  },
  inject: {
    form: {
      default: {
        register() {},
        unregister() {}
      }
    }
  },
  data() {
    return {
      errMsgs: [],
      valid: true
    };
  },
  computed: {
    value: {
      get() {
        return this.model[this.schema.model]
      },
      set(val) {        
        this.model[this.schema.model] = val;        
      }
    },
    pageMode() {
      if(this.options && this.options.pageMode) {
        return  this.options.pageMode.toLowerCase();
      }else {
        return this.$route.name.toLowerCase();
      }
    },
    isEdit() {
      if (
        this.schema.mode &&
        this.schema.mode.toString().toLowerCase() == "readonly"
      ) {
        return false;
      }
      if (this.options && this.options.pageMode) {
        return this.options.pageMode.toLowerCase() === 'add' || this.options.pageMode.toLowerCase() === 'edit';
      }
      if (this.$route.name.toLowerCase() == "preview") {
        return false;
      }
      return true;
    },
    hasError() {
      return this.errMsgs.length > 0;
    },
    shouldValidate() {
      return false;
    },
    rules() {
      if (this.schema.show !== false && this.schema.required) {
        return [
          v => {
            return !!v || this.$t("schema-base.rules.required");
          }
        ];
      }
    },
    previewSchema() {
      //DefectID: 20211117-01433  应该还需要传递更多的属性，不确定每个组件需要哪些属性，可考虑先全部传递。
      //使用序列化反序列化改变指针。
      return JSON.parse( JSON.stringify(this.schema));
      // var { name, model, label } = this.schema;

      // return { name, model, label }
    }
  },
  created() {
    // this.$rules = _getRules.call(this);
    if (this.$route.name.toLowerCase() === "add") {
      this.setDefaultValue();
    }
    if(this.schema.noStorage){      
      if(this.$store.state.app.formFieldsSettings && Object.keys(this.$store.state.app.formFieldsSettings).length>0){
        //已经有，只是确认添加还是更新
        if(this.$store.state.app.formFieldsSettings[this.pageView] && this.$store.state.app.formFieldsSettings[this.pageView][this.model._id]){
          let currentFormFieldSettings = this.$store.state.app.formFieldsSettings[this.pageView][this.model._id];
          
          if(currentFormFieldSettings.indexOf(this.schema.model)<0){
            currentFormFieldSettings.push(this.schema.model);
          }
        }else{
            
        }        
      }else{
        //没有，需要初始化一下
        let formfieldsettings = {
          formCode: this.pageView,
          docId: this.model._id,
          notUpdateField: [this.schema.model],
        };            
        this.setformFieldsSettings(formfieldsettings); 
      }
    }
  },
  methods: {
    ...mapMutations("app", [
      "setformFieldsSettings",
    ]),
    setDefaultValue() {
      if (
        this.schema.model &&
        this.schema.default &&
        this.schema.default.script
      ) {
        this.value = this.generateFunction(this.schema.default.script)();
      }
    },
    register() {
      this.form.register(this);
    },
    unregister() {
      this.form.unregister(this);
    },
    validate(force = false, value) {      
      value = value || this.value;
      if (this.rules && this.rules.length) {
        this.errMsgs = this.rules
          .map(rule => rule(value))
          .filter(valid => typeof valid === "string");
      }
      return (this.valid = this.errMsgs.length === 0);
    },
    reset() {
      this.valid = true;
      this.errMsgs = [];
    },
    resetValidation() {
      this.reset();
    },
    onchange() {
      if (this.schema.onchange) {        
        return this.generateFunction(this.schema.onchange)();
      }
    },
    onfuc(str, paramObj) {
      if (str) {
        let func = function (content) {
          return Function("schema", "model", "app", "obj", content);
        };
        func(str)(this.schema, this.model, this, paramObj);
      }
    }
  }
};

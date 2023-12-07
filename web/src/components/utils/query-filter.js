import base from "./schema-base";

export default {
  mixins: [base],
  computed: {
    // 兼容searchValluse未放入query节点下&放入query节点下
    watchSearchValues() {
      let searchValues = this.schema.searchValues,
        searchValuesT = this.schema.query.searchValues;
      if (searchValuesT && Object.keys(searchValuesT).length >= 0) {
        return searchValuesT;
      } else if (searchValues && Object.keys(searchValues).length >= 0) {
        return searchValues;
      } else {
        let _query = this.schema.query;
        _query.searchValues = {};
        this.$set(this.schema, "query", _query);
        return this.schema.query.searchValues;
      }
    }
  },
  watch: {
    //table list page组件监听searchVal值变化&axios过滤数据
    watchSearchValues: {
      handler(val) {
        let _this = this;
        let componentType = _this.schema.component || "";
        switch (componentType) {
          case "vc-datatable":
            _this.dataReset();
            break;
          case "vc-chart":
            if(_this.schema.query.type == 'chart') {
              _this.queryChart();
            }else if (_this.schema.query.type == 'api') {
              _this.queryApi();
            }            
            break;
          default:
            _this.GetDataList();
            break;
        }
      },
      //immediate: true,
      deep: true
    }
  }
};

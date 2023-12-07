import base from "./schema-base";
import queryabble from "./queryable";
import _equal from 'lodash/isEqual'

export default {
  mixins: [base, queryabble],
  inject: ["messageDialog"],
  computed: {
    isQueryable() {
      if (this.schema && this.schema.queryOnCreated !== undefined) {
        return this.schema.queryOnCreated;
      }
      if (this.isEdit !== undefined) {
        return this.isEdit;
      }
      return true;
    }
  },
  created() {
    if (this.schema && this.schema.beforeQuery) {
      this.generateFunction(this.schema.beforeQuery);
    }
    if (this.isQueryable) {
      var query = this.query;

      switch (query.type) {
        case "list":
          if (query.queryKey) {
            if (typeof query.queryKey === "string") {
              if (this.model.hasOwnProperty(query.queryKey)) {
                this.queryList(Array.isArray(this.model[query.queryKey]) ?
                  this.model[query.queryKey].map(function (item) {
                    return item.key;
                  }).join(',') :
                  this.model[query.queryKey]);
                let _that = this;
                this.$watch(`model.${query.queryKey}`, async (val, oldVal) => {
                  var currentResult = await _that.queryList(Array.isArray(val) ?
                    val.map(function (item) {
                      return item.key;
                    }).join(',') :
                    val);
                  //数组的比较。这种情况是多选了。
                  if (Array.isArray(val) && val.length > 0) {
                    if (oldVal && val.length == oldVal.length && !_equal(val, oldVal)) {
                      if (oldVal) {
                        _that.model[this.schema.model] = undefined;
                      }
                    } else {
                      //新旧值长度不同，一定是变化了。此时需要清理一下选中得数据。
                      _that.model[this.schema.model] = _that.model[this.schema.model].filter(function (v) {
                        return currentResult.some((item) => {
                          return item.key == v.key;
                        });
                      })
                    }
                  } else {
                    //非数组，单选
                    if (val != oldVal) {
                      //新旧值不同，才清空
                      if (oldVal) {
                        _that.model[this.schema.model] = undefined;
                      }
                    }
                  }
                  // this.queryList(Array.isArray(val)? 
                  // val.map(function(item){ return item.key;}).join(',')
                  // :val);
                }, {
                  deep: true,
                  immediate: true
                });
              }
            }
          } else {
            this.queryList();
          }
          break;
        case "form":
          if (query.searchValues && typeof query.searchValues === "object") {
            for (var key in query.searchValues) {
              this.$watch(`model.${query.searchValues[key]}`, val => {
                this.queryForm();
              });
            }
            this.queryForm();
          }
          if (!query.pageSize) {
            this.$set(query, "pageSize", 10);
          }
          if (!query.pageIndex) {
            this.$set(query, "pageIndex", 1);
          }
          break;
        case "api":
          if (query.code) {
            this.queryApi();
          }
          break;
        case "chart":
          if (query.code) {
            this.queryChart();
          }
          break;
        case "custom":
          if (query.customQueryList) {
            this.queryResult = query.customQueryList;
          }
          break;
        default:
          //给一个默认值         
          this.queryResult = [];
          break;
      }
    }
  },
  methods: {
    callApi(apiName, requestobj) {
      return this.$axios.post('/sdk/' + apiName, requestobj).then(({
        data
      }) => {
        return data;
      });
    },
    callApiFile(apiName, requestobj) {
      return this.$axios.post('/sdkFile/' + apiName, requestobj, {
        responseType: 'blob'
      }).then(({
        data
      }) => {
        return data;
      });
    },
    callLoginApi(apiName, requestobj) {
      return this.$axios.post('/sdkLogin/' + apiName, requestobj).then(({
          data
      }) => {
          return data;
      });
    },
    //禁用这个方法，不允许直接调用
    // callMethod(apiName,requestobj,envParameter){
    //   return this.$axios.post('/api/' + apiName + envParameter, requestobj).then(({ data }) => {
    //     return data;
    //   });
    // },
    // callMethodAdv(apiName,requestobj,responseType,envParameter){
    //   return this.$axios({
    //       method: "post",
    //       url: '/api/' + apiName + envParameter, // 请求地址 ，也可以传递参数
    //       data: requestobj,
    //       responseType: responseType // 表明返回服务器返回的数据类型
    //   }).then(( data ) => {
    //     //  console.log('data', data)
    //     return data;
    //   });
    // },
    queryData(requestobj) {
      return this.$axios.post('/api/queryData', requestobj).then(({
        data
      }) => {
        //  console.log('data', data)
        return data;
      });
    },
    getFile(requestobj) {
      return this.$axios.post('/api/getFile', requestobj, {
        responseType: 'blob'
      }).then((data) => {
        return data;
      });
    },
    processFileData(requestobj) {
      return this.$axios.post('/api/processfileData', requestobj, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }).then(({
        data
      }) => {
        //  console.log('data', data)
        return data;
      });
    },
    queryList(val) {
      var query = this.query;
      if (query.code) {
        return this.performListQuery(query.code, val, query.orders).then(
          this.doAfterQuery
        );
      } else {
        return Promise.reject(new Error("invalid query code"));
      }
    },
    queryForm() {
      var query = this.query;
      if (query.code && query.searchValues) {
        var searchValues = {};
        for (var key in query.searchValues) {
          if (this.model[query.searchValues[key]]) {
            if (Array.isArray(this.model[query.searchValues[key]])) {
              searchValues[key] = this.model[query.searchValues[key]].join("|Ng|");
            } else {
              searchValues[key] = this.model[query.searchValues[key]];
            }
          }
        }
        return this.performFormQuery(
          query.code,
          searchValues,
          query.pageIndex,
          query.pageSize,
          query.orders
        ).then(this.doAfterQuery);
      } else {
        return Promise.reject(new Error("invalid query code"));
      }
    },
    queryChart() {
      var query = this.query;
      if (query.code && query.searchValues) {
        return this.performChartQuery(query.code, query.searchValues).then(
          this.doAfterQuery
        );
      } else if (query.code) {
        return this.performChartQuery(query.code).then(this.doAfterQuery);
      } else {
        return Promise.reject(new Error("invalid query Code"));
      }
    },
    queryApi() {
      var query = this.query;
      if (query.code && query.searchValues) {
        var searchValues = {};
        for (var key in query.searchValues) {
          if (this.model[query.searchValues[key]]) {
            searchValues[key] = this.model[query.searchValues[key]];
            if (searchValues[key] && Array.isArray(searchValues[key])) {
              searchValues[key] = searchValues[key].join("|Ng|");
            }
          }
        }
        return this.performApiQuery(query.code, searchValues).then(
          this.doAfterQuery
        );
      } else if (query.code) {
        return this.performApiQuery(query.code).then(this.doAfterQuery);
      } else {
        return Promise.reject(new Error("invalid query Code"));
      }
    },
    doAfterQuery(data) {
      if (this.query.afterQuery) {
        if (typeof this.query.afterQuery === "function") {
          this.query.afterQuery(data);
        } else {
          this.generateFunction(this.query.afterQuery)();
        }
      }
      return data;
    },
    // async asyncPostCommon(url, param) {
    //   return await this.$axios.asynPost(url,param);
    // },
  }
};

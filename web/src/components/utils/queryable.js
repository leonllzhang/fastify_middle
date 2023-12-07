export default {
  computed: {
    query() {
      return this.schema && this.schema.query ? this.schema.query : {};
    }
  },
  data() {
    return {
      queryResult: [],
      totalCount: 0
    };
  },
  methods: {
    performListQuery(id, queryKey) {
      // (1.1) get cached promise
      var cache = this.$store.state.app.listQueryCache[id];
      if (cache) {
        // (1.4) found cache, waiting for data
        return cache.then(data => {
          // (2.2) response returned and passed to the control
          this.queryResult = data;
          return data;
        });
      } else {
        // (1.2) not found cache, create promise
        var requestURL = `datasource/${id}/detail`;
        if (queryKey && typeof queryKey === "string") {
          // requestURL = `datasource/${id}/detail/bygroupkey/${queryKey}`;
          requestURL = `datasource/GetDataSourceDetailsByNameAndGroupKey/${id}/${queryKey?queryKey:''}`;
        }
        var p = this.performQuery("/api/GetResult", {
          requestURL: requestURL,
          // redisName: 'data_datasource',
          // redisExtend:[
          //   {
          //     extendItem: ":redisPara",
          //     extendKey: "redisPara",
          //     extendValue: id
          //   }
          // ]        
          // queryId: id,
          // queryKey: queryKey
        }).then(data => {
          // (2.1)response returned, remove cache
          // this happens before the data to be passed to the other controls
          // this happens after the promise to be passed to the other controls
          this.queryResult = data;
          this.$store.commit("app/setListQueryCache",
            {
              name: id,
              value: null
            });
          return data;
        });
        // (1.3) store promise to cache
        // do not cache if queryKey is presented
        if (!queryKey) {
          this.$store.commit("app/setListQueryCache",
            {
              name: id,
              value: p
            });
        }
        return p;
      }
    },
    performFormQuery(id, searchValues, PageIndex, PageSize, Orders) {
      return this.performQuery("/api/getDocumentsByQuery/" + id,
        {
          searchValues,
          PageSize: PageSize || 10,
          PageIndex: PageIndex || 1,
          Orders: Orders || {}
        }).then(data => {
          this.queryResult = data.items;
          this.totalCount = data.totalCount;
          return data.items;
        });
    },
    performChartQuery(queryCode, searchValues) {
      return this.performQuery("/api/GetChartDataSource/",
        {
          "queryCode": queryCode,
          "searchValues": searchValues
        }).then(data => {
          if(data && data.columns) {
            this.queryResult = data;
            return data;
          }else {
            //加个清空。
            this.queryResult = [];
            return [];
          }
          
        });
    },
    performApiQuery(queryCode, searchValues) {
      return this.performQuery("/sdk/CallCustomiseAPI/",
        {
          "Id": queryCode,
          "Parameter": {}
        }).then((data) => {
          try {
            this.queryResult = JSON.parse(data.data.result);
          } catch (e) {
            // console.log('e', e)
            // console.log('this.queryResult', this.queryResult);            
            // this.$store.state.loading = false;  
            this.messageDialog.showErr(this.$t("queryapi.apidataerror"));
          }
          return data;
        });
    },
    performQuery(url, body) {
      this.$store.commit("DISABLE_LOADING", true);
      return this.$axios.post(url, body).then(({ data }) => {
        this.$store.commit("DISABLE_LOADING", false);
        return data;
      }).catch(err => {
        this.$store.commit("DISABLE_LOADING", false);
        // console.log("error catched");
        //this.messageDialog.showErr(err);
        this.$store.commit('app/setErrorSnack', {
          showErrorSnack: true,
          errorSnackMsg: err,
          snackTimeOut: 2000,
          snackColor: 'red'
        });  
      });
    },
    setQueryResult(val) {
      this.queryResult = val;
    }
  }
};

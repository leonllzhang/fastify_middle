import { getBaseUrlByLink } from "../../utils/appBaseMethods";
import moment from "moment";

export default {
  methods: {
    watchOrderToLoadJSList(dataMode, pageName) {
      let _this = this;
      let orderToLoadJSExpireTime = moment().add(moment.duration(30000));
      //console.log('watchOrderToLoadJSList', dataMode, pageName, _this.$store.state.orderToLoadJSList);

      if (dataMode && dataMode == "embed") {
        let timer = setInterval(() => {
          let listCount = 0;
          let actualLoadedCount = 0;

          _this.$store.state.embedOrderToLoadJSList.map(m => {
            if (m.pageName == pageName) {
              listCount++;
            }
          });
          _this.$store.state.embedOrderToLoadJSList.map(m => {
            if (
              m.pageName == pageName &&
              typeof Vue.component(m.componentName) === "function"
            ) {
              m.state = "loadjscompleted";
            }
            if (m.pageName == pageName && m.state == "loadjscompleted") {
              actualLoadedCount++;
            }
          });
          var timeleft = orderToLoadJSExpireTime.diff(moment());
          if (timeleft < 0) {
            clearInterval(timer);
          }
          //console.log('embed embedOrderToLoadJSList', _this.$store.state.embedOrderToLoadJSList, listCount, actualLoadedCount);
          if (listCount == actualLoadedCount) {
            _this.$set(
              _this.$store.state.embedOrderToLoadJSStatusFlag,
              pageName,
              true
            );
            _this.$set(
              _this.$store.state.embedOrderToLoadJSFlag,
              pageName,
              false
            );
            clearInterval(timer);
          }
        }, 16);
      } else if (dataMode && dataMode == "popup") {
        let timer = setInterval(() => {
          let listCount = _this.$store.state.popupOrderToLoadJSList.length;
          let actualLoadedCount = 0;
          _this.$store.state.popupOrderToLoadJSList.map(m => {
            if (typeof Vue.component(m.componentName) === "function") {
              m.state = "loadjscompleted";
            }
            if (m.state == "loadjscompleted") {
              actualLoadedCount++;
            }
          });
          //console.log('popup orderToLoadJSList', _this.$store.state.orderToLoadJSList, listCount, actualLoadedCount);
          var timeleft = orderToLoadJSExpireTime.diff(moment());
          if (timeleft < 0) {
            clearInterval(timer);
          }
          if (listCount == actualLoadedCount) {
            _this.$store.state.popupOrderToLoadJSStatusFlag = true;
            _this.$store.state.popupOrderToLoadJSFlag = false;
            clearInterval(timer);
          }
        }, 16);
      } else {
        let timer = setInterval(() => {
          let listCount = _this.$store.state.orderToLoadJSList.length;
          let actualLoadedCount = 0;
          _this.$store.state.orderToLoadJSList.map(m => {
            if (typeof Vue.component(m.componentName) === "function") {
              m.state = "loadjscompleted";
            }
            if (m.state == "loadjscompleted") {
              actualLoadedCount++;
            }
          });
          //console.log('orderToLoadJSList', _this.$store.state.orderToLoadJSList, listCount, actualLoadedCount);
          var timeleft = orderToLoadJSExpireTime.diff(moment());
          if (timeleft < 0) {
            clearInterval(timer);
          }
          if (listCount == actualLoadedCount) {
            _this.$store.state.orderToLoadJSStatusFlag = true;
            _this.$store.state.orderToLoadJSFlag = false;
            clearInterval(timer);
          }
        }, 16);
      }
    },
    async getResources(pageName, pageType, cdnPath, dataMode) {
      var _this = this;
      _this.$store.state.pageStartLoadTime = new Date().getTime();
      let pName = "home";
      if (pageName) {
        pName = pageName;
      }
      if (!document.getElementById("resource")) {
        let parentDiV = document.getElementsByTagName("body")[0];
        var div = document.createElement("div");
        div.setAttribute("id", "resource");
        parentDiV.appendChild(div);
      }
      var _getBaseUrlByLink = getBaseUrlByLink();
      let url = "/api/GetResult";
      let fileId = "";
      let resArray = [];
      let resources = await _this.$axios.asynPost(url, {
        requestURL: `page/${pName}/${pageType}/getresources`
      });
      if (resources.resources) {
        resArray = JSON.parse(resources.resources);
      }
      if (resources.fileId) {
        fileId = resources.fileId;
        this.$store.commit("SET", {
          property: "latestFileId",
          val: fileId
        });
      }
      let hasCustomcomponentjsFlag = false;
      let orderToLoadJSFlag = false;
      if (resources && resources.fileId && resArray && resArray.length > 0) {
        resArray.forEach(function(item, index) {
          if (item.filetype && item.filetype === "css") {
            var style = document.createElement("link");
            style.setAttribute(
              "href",
              _getBaseUrlByLink +
                "/" +
                item.src +
                "?v=" +
                _this.$store.state.latestFileId
            );
            style.setAttribute("rel", "stylesheet");
            style.setAttribute("type", "text/css");
            document.getElementById("resource").appendChild(style);
          }
        });
        resArray.forEach(function(item, index) {
          if (item.filetype && item.filetype === "js") {
            _this.$dm_injectScript(
              _getBaseUrlByLink + "/" + item.src + "?v=" + resources.fileId,
              false
            );
          } else if (item.filetype && item.filetype === "systemeditorjs") {
            _this.$dm_injectScript(
              cdnPath + "/" + item.src + "?v=" + _this.$store.state.latestFileId
            );
          } else if (item.filetype && item.filetype === "customcomponentjs") {
            hasCustomcomponentjsFlag = true;
            if (_this.$store.state.enableJsChunk) {
              if (dataMode && dataMode == "embed") {
                _this.$set(
                  _this.$store.state.embedOrderToLoadJSFlag,
                  pageName.toLowerCase(),
                  true
                );
                orderToLoadJSFlag = true;
              } else if (dataMode && dataMode == "popup") {
                orderToLoadJSFlag = true;
                _this.$store.state.popupOrderToLoadJSFlag = true;
              } else {
                _this.$store.state.orderToLoadJSFlag = true;
                orderToLoadJSFlag = true;
              }
            }
          }
        });
      }
      //如果没有customcomponentjs类型的resource,则采用加载Sys_app.js的方式，兼容旧的业务场景
      if (!hasCustomcomponentjsFlag || !_this.$store.state.enableJsChunk) {
        let _url = "/api/GetResult";
        let hasCustomControl = await _this.$axios.asynPost(_url, {
          requestURL: `cs/ext`
        });
        if (hasCustomControl) {
          await _this.getCustomComponents(
            _getBaseUrlByLink +
              "/api/Resource/Sys_app.js" +
              "?v=" +
              _this.$store.state.latestFileId,
            false,
            dataMode,
            pageName
          );
        }
      } else {
        resArray.forEach(async function(item, index) {
          if (item.filetype && item.filetype === "customcomponentjs") {
            if (orderToLoadJSFlag) {
              let src =
                _getBaseUrlByLink +
                "/" +
                item.src +
                "?v=" +
                _this.$store.state.latestFileId;
              let componentName = item.src
                .replace(/api\/Resource\/Sys_app_/i, "")
                .replace(/.js/i, "");
              if (dataMode && dataMode == "embed") {
                _this.$store.state.embedOrderToLoadJSList.push({
                  status: "loadjs",
                  src: src,
                  componentName: componentName,
                  pageName: pageName
                });
              } else if (dataMode && dataMode == "popup") {
                _this.$store.state.popupOrderToLoadJSList.push({
                  status: "loadjs",
                  src: src,
                  componentName: componentName
                });
              } else {
                _this.$store.state.orderToLoadJSList.push({
                  status: "loadjs",
                  src: src,
                  componentName: componentName
                });
              }
              await _this.getCustomComponents(src, true, dataMode, pageName);
            } else {
              _this.$dm_injectScript(
                _getBaseUrlByLink +
                  "/" +
                  item.src +
                  "?v=" +
                  _this.$store.state.latestFileId
              );
            }
          }
        });
      }
    },
    async getCustomComponents(src, flag, dataMode, pageName) {
      let _this = this;
      await new Promise(function(resolve) {
        var script = document.createElement("script");
        script.setAttribute("type", "text/javascript");
        script.setAttribute("src", src);
        script.async = false;
        if (script.readyState) {
          script.onreadystatechange = function() {
            if (
              script.readyState == "loaded" ||
              script.readyState == "complete"
            ) {
              script.onreadystatechange = null;
              if (flag) {
                _this.watchOrderToLoadJSList(dataMode, pageName);
              }
              resolve(true);
            }
          };
        } else {
          script.onload = function() {
            if (flag) {
              _this.watchOrderToLoadJSList(dataMode, pageName);
            }
            resolve(true);
          };
        }
        document.getElementById("resource").appendChild(script);
      });
    }
  }
};

import Vue from "vue";

import paths from "./paths";
import VueRouter from "vue-router";
import axios from "axios";
import settings from "../../appsettings.yaml";

Vue.use(VueRouter);

function route(path, view, name, pageType, pageCode, requiresAuth) {
  var result = {
    name: name || view,
    path,
    component: (resovle) => import(`../views/${view}.vue`).then(resovle),
    props: true,
    meta: {
      pageType: pageType,
      pageCode: pageCode,
      requiresAuth: requiresAuth,
    },
  };
  console.log("route", result);

  return result;
}

const router = new VueRouter({
  mode: "history",
  base: getBaseUrlByLink(),
  routes: paths.map((path) =>
    route(
      path.path,
      path.view,
      path.name,
      path.pageType,
      path.pageCode,
      path.requiresAuth
    )
  ),
});
debugger;

// 获取对应的路由，格式化为tenant/appCode
function getBaseUrlByLink() {
  // 后期增加无tenant 和appcode 逻辑
  // let endPos = window.urlMode === 'NOTENANTAPPCODE' ? 1 : 3;
  // return window.location.pathname.split("/").splice(0, endPos).join("/");
  return window.location.pathname
    .split("/")
    .filter((item) => item != "")
    .splice(0, 2)
    .join("/");
}

// 获取vProfile使用的appCode，格式为appCode@tenant
function getAppCodeforvProfile() {
  return window.location.pathname
    .split("/")
    .filter((item) => item != "")
    .splice(0, 2)
    .reverse()
    .join("@");
}

function loginUrlConcat(to) {
  var vProfileLoginUrl = `${settings.AppApiUrl.vProfileExternalUrl}${settings.AuthSettings.FormAuthLoginUrl}`;
  console.log("to:", to);
  var finalUrl = "";
  var hasQuery = vProfileLoginUrl.indexOf("?") > 0;
  var appCode = getAppCodeforvProfile();

  if (hasQuery) {
    finalUrl = `${vProfileLoginUrl}&appCode=${appCode}&returnUrl=${encodeURI(
      window.location.href
    )}`;
  } else {
    finalUrl = `${vProfileLoginUrl}?appCode=${appCode}&returnUrl=${encodeURI(
      window.location.href
    )}`;
  }
  window.open(finalUrl, "_self");
}

// 消费serviceTicket
async function useServiceTicket(ServiceTicket) {
  var jwttoken = await this.axios.post("/api/verify", {
    serviceTicket: serviceTicket,
  });
}

// 导航守卫，处理是否登录和匿名等逻辑
router.beforeEach(async (to, from, next) => {
  debugger;
  console.log("call beforeEach");
  var flag = false;
  if (to.meta && to.matched.some((res) => res.meta.requiresAuth)) {
    // 需要鉴权, 判断是否登录过，携带JWT
    let token = localStorage.getItem("Authorization");
    if (token === null || token === "") {
      // 是否是携带serviceticket的登录
      const ServiceTicket = to.query.ServiceTicket;
      if (ServiceTicket) {
        // servieticket处理
        await useServiceTicket(ServiceTicket);
      } else {
        loginUrlConcat(to);
      }
    } else {
      // 在这里设置headers
      axios.defaults.headers.common["Authorization"] = token;

      //数据请求
      if (to.meta && to.meta.pageType) {
        var pageType = to.meta.pageType;
      }
      var pageCode = "home";
      switch (pageType) {
        case "page":
          pageCode = to.params.pageView;
          break;
        case "form":
          pageCode = to.params.formAlias;
          break;
        case "home":
          pageCode = "home";
          break;
        case "error":
          pageCode = to.params.errorCode;
          break;
        default:
          pageCode = "home";
          break;
      }
      var res = await axios.post("/api/getAnony", {
        pageCode: pageCode,
        pageType: pageType === "home" ? "page" : pageType,
      });
      if (res && res.data && res.data.statusCode == 200) {
        console.log("res data", res.data.data);
        flag = res.data.data;
      }
      if (flag) {
        next();
      } else {
        var aclarr = await axios
          .post("/api/getAccess", {
            pageCode: pageCode,
            pageType: pageType === "home" ? "page" : pageType,
          })
          .catch(handleError);
        if (aclarr && aclarr.data && aclarr.data.statusCode == 200) {
          console.log("aclarr data", aclarr.data.data);
          next();
          //acl
        } else {
          next({
            name: "error",
            params: { errorCode: 403, detailCode: "no access" },
          });
        }
      }
    }
  } else {
    // 不需要鉴权
    next();
  }
});

router.onError = function (err) {
  console.log(err, "error info");
  router.go(2);
};

export default router;

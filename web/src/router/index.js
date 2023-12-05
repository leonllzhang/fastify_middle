import Vue from "vue";

import paths from "./paths";
import VueRouter from "vue-router";
import axios from "axios";

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

router.beforeEach(async (to, from, next) => {
  var flag = false;
  if (to.meta && !to.meta.requiresAuth) {
    next();
  } else {
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
      var aclarr = await axios.post("/api/getAccess", {
        pageCode: pageCode,
        pageType: pageType === "home" ? "page" : pageType,
      }).catch(handleError);
      if (aclarr && aclarr.data && aclarr.data.statusCode == 200) {
        console.log("aclarr data", aclarr.data.data);
        next();
        //acl
      }else{
        next({name: 'error', params: {errorCode: 403, detailCode: 'no access'}});
      }
    }
  }
});

function handleError(err, vm, info) {
  console.log(err, 'error info');
  router.go(2);
}

router.onError = function (err) {
  console.log(err, 'error info');
  router.go(2);
}


export default router;

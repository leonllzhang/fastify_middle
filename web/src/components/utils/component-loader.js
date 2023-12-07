/*
 * @Author: your name
 * @Date: 2021-11-12 14:04:56
 * @LastEditTime: 2021-11-29 16:48:55
 * @LastEditors: your name
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \GeneratorMaker\components\utils\component-loader.js
 */
/* eslint-disable no-redeclare */
/* eslint-disable no-eval */

let components = {};
let basic = require.context("../basic", true, /^\.\/.+\.vue$/);

basic.keys().forEach(key => {
  let name = key.replace(/^\.\//, "").replace(/\.vue/, "").replace(/.*?\//i, '').replace(/cms\//i, '');
  components[name] = basic(key).default;
});

let queryComponent = require.context("../query-component", false, /^\.\/.+\.vue$/);

queryComponent.keys().forEach(key => {
  let name = key.replace(/^\.\//, "").replace(/\.vue/, "");
  let newComponents = {};
  newComponents[name] = queryComponent(key).default;
  Object.assign(components, newComponents);
});

export { components as default };

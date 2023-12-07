/*
 * @Author: your name
 * @Date: 2021-11-12 14:04:56
 * @LastEditTime: 2021-11-29 17:09:25
 * @LastEditors: your name
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \GeneratorMaker\utils\guid.js
 */
var guid = function () { // 获取随机ID，组件拖到预览视图后就会被设置个ID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0;
    var v = c === 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
}
export default guid

/**
 * @description Admin & Generator都要使用的工具类
 * @author ronky tang
 * @email ronky.tang@digiqal.com
 */


/**
 * @description rgb颜色转16进制
 * @author ronky tang
 */
function setRGBTo16(e) {
  return `#${((1 << 24) + (e.r << 16) + (e.g << 8) + e.b).toString(16).slice(1)}`
}
/**
 * @description 16进制颜色转rgb
 * @author ronky tang
 */
function set16ToRGB(str) {
  const regExp = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
  if (!regExp.test(str)) {
    str = "#000";
  }
  let newStr = str.toLowerCase().replace(/\#/g, "");
  let len = newStr.length;
  if (len == 3) {
    let t = "";
    for (let i = 0; i < len; i++) {
      t += newStr.slice(i, i + 1).concat(newStr.slice(i, i + 1));
    }
    newStr = t;
  }
  let arr = [];
  for (let i = 0; i < 6; i = i + 2) {
    let s = newStr.slice(i, i + 2);
    arr.push(parseInt("0x" + s));
  }
  return arr;
}

/**
 * @description 获取文件类型对应的ICON
 * @author ronky tang
 */
function getFileIcon(ext) {
  const maps = {
    "doc": "doc.svg",
    "docx": "docx.svg",
    "xls": "xls.svg",
    "xlsx": "xlsx.svg",
    "ppt": "ppt.svg",
    "pptx": "pptx.svg",
    "psd": "psd.svg",
    "pdf": "pdf.svg",
    "bmp": "bmp.svg",
    "csv": "csv.svg",
    "gif": "gif.svg",
    "html": "html.svg",
    "jpeg": "jpeg.svg",
    "jpg": "jpeg.svg",
    "png": "png.svg",
    "tiff": "tiff.svg",
    "vsdx": "vsdx.svg",
    "file": "file.svg",
  };
  return maps[ext] ? maps[ext] : maps['file'];
}


/**
 * @description 转化文件路径
 * @author ronky tang
 */
function pathTrans(path) {
  let endPos = window.urlMode === 'NOTENANTAPPCODE' ? 1 : 3;
  return window.location.pathname.split("/").splice(0, endPos).join("/") + path;
}

/**
 * @description 格式化处理编辑器html
 * @author ronky tang
 */
function formatValue(val, fileIcon) {
  const srcReg = new RegExp('src="[^"]*\/api\/DownloadFile', "ig");
  const hrefReg = new RegExp('href="[^"]*\/api\/DownloadFile', "ig");
  const srcLinkTrackingReg = new RegExp('src="[^"]*\/api\/LinkTracking', "ig");
  const hrefLinkTrackingReg = new RegExp('href="[^"]*\/api\/LinkTracking', "ig");
  const srcFileIconReg = new RegExp('src="[^"]*\/static\/Content\/Images\/', "ig");
  const originName = 'src="' + window.location.origin + pathTrans('/api/DownloadFile');
  const hrefOriginName = 'href="' + window.location.origin + pathTrans('/api/DownloadFile');
  const originLinkTrackingName = 'src="' + window.location.origin + pathTrans('/api/LinkTracking');
  const hrefOriginLinkTrackingName = 'href="' + window.location.origin + pathTrans('/api/LinkTracking');
  const cdnHostAndVersionPath = 'src="' + fileIcon;
  return (val !== undefined && val.length > 0) ?
    val.replace(srcReg, originName)
      .replace(hrefReg, hrefOriginName)
      .replace(srcLinkTrackingReg, originLinkTrackingName)
      .replace(hrefLinkTrackingReg, hrefOriginLinkTrackingName)
      .replace(srcFileIconReg, cdnHostAndVersionPath) :
    '';

}





export {
  setRGBTo16, set16ToRGB, getFileIcon,formatValue
}

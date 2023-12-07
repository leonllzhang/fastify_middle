// import html2canvas from "html2canvas";
///特定触发器的定制事件和拦截
const colorTypeIncludes = ['color', 'bgColor']

const fullScreen = {
  name: 'fullScreen', event: (onEvent, pointer) => {

    const editorElement = document.getElementsByClassName(pointer.componentId)[0];
    if (editorElement != null) {
      editorElement.style.zIndex = 300;
    }
    const editorCatalogElement = document.getElementById('editor-catalog-' + pointer.componentId);
    if (editorCatalogElement != null) {
      editorCatalogElement.style.height = '100%';
      editorCatalogElement.style.position = 'fixed';
      editorCatalogElement.style.zIndex = 301;
      editorCatalogElement.style.right = '0px';
      editorCatalogElement.style.top = '0px';
    }
    pointer.catalogFullScreenEvent();
  }
}
const unFullScreen = {
  name: 'unFullScreen', event: (onEvent, pointer) => {
    const editorElement = document.getElementsByClassName(pointer.componentId)[0];
    if (editorElement != null) {
      // editorElement.style.zIndex = 102;
      editorElement.style.removeProperty('z-index')

    }
    const editorCatalogElement = document.getElementById('editor-catalog-' + pointer.componentId);
    if (editorCatalogElement != null) {
      editorCatalogElement.style.removeProperty('height');
      editorCatalogElement.style.removeProperty('position');
      editorCatalogElement.style.removeProperty('z-index');
      editorCatalogElement.style.removeProperty('right');
      editorCatalogElement.style.removeProperty('top');
    }
    pointer.catalogFullScreenEvent();
  }
}
const emailFullScreen = {
  name: 'fullScreen', event: (onEvent, pointer) => {
    const editorElement = document.getElementById("emailEditorContainer-main-container-" + pointer.editorName);
    if (editorElement != null) {
      editorElement.style.zIndex = 300;

    }
  }
}
const emailUnFullScreen = {
  name: 'unFullScreen', event: (onEvent, pointer) => {
    const editorElement = document.getElementById("emailEditorContainer-main-container-" + pointer.editorName);
    if (editorElement != null) {
      editorElement.style.removeProperty('z-index');
      editorElement.style.width = '100%';
    }
  }
}
const modalOrPanelHide = {
  name: 'modalOrPanelHide', event: (onEvent, pointer) => {
    if (pointer != null && pointer.colorPicker != null && pointer.colorPicker.isShow) {
      if (colorTypeIncludes.includes(pointer.colorPicker.type) && pointer.colorPicker.event != null) {
        return
        // if (pointer.colorPicker.event.isHover !== false) return
      }
      pointer.clearColorPanel();
    }
  }
}
const catalogEvent = {
  name: 'catalogEvent', event: (onEvent, pointer) => {
    pointer.showCatalog = !pointer.showCatalog;
    pointer.showCatalogContainer();
  }
}
const viewHTML = {
  name: 'viewHTML', event: (onEvent, pointer) => {
    pointer.htmlDialog = true;
    if (pointer.editor != null) {
      pointer.html = pointer.editor.getHtml();
    }
  }
}
const downloadFile = {
  name: 'downloadFile', event: (onEvent, pointer) => {
    if (onEvent != null && onEvent.link != null) {
      const downLink = "/" + pointer.tenantId + "/" + pointer.appCode + onEvent.link;
      window.open(downLink, "_blank")
    }

  }
}
const exportPDF = {
  name: 'exportPDF', event: (onEvent, pointer) => {
    pointer.$store.state.loading = true;
    const stateData = pointer.$store.state;
    const tenantId = stateData.userInfo.tenantId;
    const appCode = stateData.appInfo.AppCode;
    let htmlData = pointer.editor.getHtml();

    pointer.$axios.post('/api/dgqEditorConvertPDF', {
      contents: htmlData,
      tenantId,
      appCode,
      responseType: 'blob'
    }).then(e => {
      // console.log(e)
      if (e != null) {
        let fileName = e.headers['content-disposition'].split('=')[1]
        const downloadUrl = window.URL.createObjectURL(new Blob([e.data]));
        const link = document.createElement('a');
        fileName = fileName.substring(0, fileName.indexOf('.pdf') + 4)
        // console.log(fileName)
        link.download = fileName
        link.href = downloadUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      // if (e != null && e.data != null && e.data.data != null && e.data.statusCode != null && e.data.statusCode == 200) {
      //   //
      //   // const downLink = "/" + pointer.tenantId + "/" + pointer.appCode + "/api/DownloadFile?pageCode=" + pointer.$store.state.route.params.pageView + "&fileId=" + e.data.data.id;
      //   // window.open(downLink, "_blank")
      //   // const downA = document.createElement('a');
      //   //downA.download = e.data.data.fileName;
      //   // downA.style.display = 'none';
      //   //downA.href = downlink;
      //   // downA.id = 'a_word_' + pointer.componentId;
      //   // document.body.appendChild(downA);
      //   // downA.click();
      //   // document.body.removeChild(downA)
      // }
      pointer.$store.state.loading = false;
    })
  }
};

const exportWord = {
  name: 'exportWord',
  event: (event, pointer) => {
    pointer.$store.state.loading = true;
    let contents = pointer.editor.getHtml();
    if (contents != null && contents != '') {
      const cdnPath = pointer.$store.getters.cdnHostAndVersionPath || window.location.host || '';
      contents = contents.replaceAll(`src="/static`, `src="https://${cdnPath}/static`);
      let preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
      let postHtml = "</body></html>";
      const imgReg = /img.*?src=".*?"/g
      const srcReg = RegExp('src=".*?"')
      const matchImgs = contents.match(imgReg);
      let promiseList = [];
      if (matchImgs != null) {
        matchImgs.forEach((element) => {
          let imgSrc = element.match(srcReg)[0] || ''
          imgSrc = imgSrc.replace('src="', '').replace('"', '')
          if (imgSrc != '' && imgSrc.includes('http')) {
            promiseList.push(getBase64(imgSrc))
          }
        });
      }
      if (promiseList.length > 0) {

        Promise.all(promiseList).then(proResult => {
          proResult.forEach(imgItem => {
            contents = contents.replace(imgItem.url, imgItem.base64)
          })
          downloadWord(pointer, preHtml + contents + postHtml)
        }).finally(() => {
          pointer.$store.state.loading = false;
        })
      } else {
        downloadWord(pointer, preHtml + contents + postHtml)
        pointer.$store.state.loading = false;
      }
    } else {
      pointer.$store.state.loading = false;
    }

    // let html = preHtml+contents+postHtml;

    // pointer.$store.state.loading = false;

    // pointer.$axios.post('/api/dgqEditorConvert/word', {
    //   contents,
    //   tenantId,
    //   appCode
    // }).then(e => {
    //   console.log(e)
    //   if (e != null && e.data != null && e.data.data != null && e.data.statusCode != null && e.data.statusCode == 200) {
    //
    //     const downLink = "/" + pointer.tenantId + "/" + pointer.appCode + "/api/DownloadFile" +
    //       "?pageCode=" + pointer.$store.state.route.params.pageView + "&fileId=" + e.data.data.id;
    //     window.open(downLink, "_blank")
    //     // const downA = document.createElement('a');
    //     //downA.download = e.data.data.fileName;
    //     // downA.style.display = 'none';
    //     //downA.href = downlink;
    //     // downA.id = 'a_word_' + pointer.componentId;
    //     // document.body.appendChild(downA);
    //     // downA.click();
    //     // document.body.removeChild(downA)
    //   }
    //   pointer.$store.state.loading = false;
    // })
  }
};

const colorPickerEvent = {
  name: "colorPickerEvent",
  event: (event, pointer) => {
    if (pointer != null) {

      pointer.clearColorPanel();
      let fromFont = false;
      if (event.type != null) {
        pointer.colorPicker.type = event.type
        fromFont = colorTypeIncludes.includes(event.type)
        if (event.type === 'input') {
          pointer.colorPicker.isShow = false;
        } else if (event.type === 'btn') {
          pointer.colorPicker.isShow = !pointer.colorPicker.isShow
        } else if (fromFont) {

          pointer.colorPicker.isShow = true
          pointer.colorPicker.event = event

        }
      } else {
        pointer.colorPicker.type = '';
        pointer.colorPicker.isHover = false;
      }
      if (fromFont) {
        pointer.colorPicker.color = '#000000';
      }
      if (event.position != null) {
        // console.log(event.position)
        pointer.colorPicker.position = event.position
        pointer.colorPicker.position.x = event.position.clientX + 20
        pointer.colorPicker.position.y = event.position.clientY - 20

        // const element = document.getElementById(pointer.componentId+'-toolbar-container')
        // if(element!=null){
        //   const x =  element.offsetLeft + 314
        //   const y = element.offsetTop + 130
        //   pointer.colorPicker.position.x = x
        //   pointer.colorPicker.position.y = y
        // }
      }
      if (event.inputEle != null) {
        pointer.colorPicker.inputEle = event.inputEle
        pointer.colorPicker.color = event.inputEle.value
      }
      if (event.opacityEle != null) {
        pointer.colorPicker.opacityEle = event.opacityEle
        pointer.colorPicker.opacity = event.opacityEle.value;
      }
      if (event.btnEle != null) pointer.colorPicker.btnEle = event.btnEle;
    }
  }
}

function getBase64(imgUrl) {
  return new Promise(function (resolve, reject) {
    window.URL = window.URL || window.webkitURL;
    let xhr = new XMLHttpRequest();
    xhr.open("get", imgUrl, true);
    xhr.responseType = "blob";
    xhr.onload = function () {
      if (this.status == 200) {
        let blob = this.response;
        let oFileReader = new FileReader();
        oFileReader.onloadend = function (e) {
          let base64 = e.target.result;
          resolve({url: imgUrl, base64: base64})
        };
        oFileReader.readAsDataURL(blob);
      }
    }
    xhr.send();
  })
}

function downloadWord(pointer, html) {
  const stateData = pointer.$store.state;
  const tenantId = stateData.userInfo.tenantId;
  const appCode = stateData.appInfo.AppCode;
  let blob = new Blob(['\ufeff', html], {
    type: 'application/msword'
  });
  let downloadLink = 'data:application/vnd.ms-word;charset=uft-8,' + encodeURIComponent(html);
  const dateNow = Date.now();
  let fileName = `${tenantId}_${appCode}_${dateNow}.doc`;
  const downA = document.createElement('a');
  downA.download = fileName;
  downA.style.display = 'none';
  downA.href = downloadLink;
  downA.id = `a_word_${pointer.componentId}_${dateNow}`;
  document.body.appendChild(downA);
  if (navigator.msSaveOrOpenBlob) {
    navigator.msSaveOrOpenBlob(blob, filename);
  } else {
    downA.click();
  }
  document.body.removeChild(downA)
}

const editorEvents = [fullScreen, unFullScreen, modalOrPanelHide, catalogEvent, exportPDF, exportWord, viewHTML, colorPickerEvent, downloadFile];
const editorEmailEvents = [modalOrPanelHide, emailFullScreen, emailUnFullScreen, viewHTML, colorPickerEvent, downloadFile];

export {
  editorEvents,
  editorEmailEvents
}

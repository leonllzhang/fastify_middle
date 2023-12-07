<template>
  <div :class="classes" ref="mainDiv">
    <v-overlay :value="showPdfViewerOverLay" :absolute="absolute" >
      <v-progress-circular indeterminate size="64">
        {{ $store.state.app.uploadOverlayProgress }}
      </v-progress-circular>
    </v-overlay>
    <object :id="'mainIframe_' + schema.model" ref="mainIframe" :data="previewurl" width="100%" height='610' type="text/html" scrolling="no"></object>
  </div>
</template>

<script>
  import base from "../utils/schema-base";
  export default {
    mixins: [base],
    data() {
      return {
        showPdfViewerOverLay:false,
        localemapping: {
          "zh-cn": "zh-CN",
          "en": "en-US",
          "zh-tw": "zh-TW"
        },
        absolute:true
      };
    },
    props: {
      fileLists: [],
      cdnHost:''
    },
    computed: {
      previewurl() {
        return "/static/pdfjs.2.0.943.dist/web/viewer.html";
      },
      translateLocale() {
        return this.localemapping[this.$i18n.locale];
      }
    },
    watch: {
      "$i18n.locale": function () {
        document.querySelector('#mainIframe_' + this.schema.model).data = this.previewurl;
        //document.querySelector(".pdf-viewer").contentWindow.location.reload(true);
      },
      //页面存在两个pdf preview的时候，存在OverLay不能隐藏的问题.
      showPdfViewerOverLay(val) {
        val && setTimeout(() => {
          this.showPdfViewerOverLay = false
        }, 3000)
      },
      //watch 父级传递fileLists
      fileLists:{
        handler(newVal){
          if(newVal){
            //给pdfviewer传递最新值
            this.onloadPdf(newVal,1)
          }
        },
        deep:true,
        immediate: true
      }
    },
    created() {
      let that = this;
      window.ClosePdfViewerOverLay = () => {
        // 当iframe中的报表提交按钮点击之后，回调此方法
        that.showPdfViewerOverLay = false;
      };
      window.OpenPdfViewerOverLay = () => {
        // 当iframe中的报表提交按钮点击之后，回调此方法
        that.showPdfViewerOverLay = true;
      };
      //注册common method
      // 拿到当前控件的code
      let currentComponentCode = that.schema.name + that.pageView.toLowerCase()
      // 监听预览事件
      that.bus.$on(`assignPreview_${currentComponentCode}`, (event) => {  
        const mapFrame = that.$refs['mainIframe'];
        const iframeWin = mapFrame.contentWindow         
        // 备份文件列表数组
        let list = JSON.parse(JSON.stringify(that.fileLists))    
        // 找到传入的参数fileId一致的pdf对象
        let chosenFile = list.find(obj=> obj.fileDownloadurl.indexOf(event.fileId) > -1);
        if (chosenFile) {
          // 首先设置所有pdf的状态为空     
          list.forEach( item => item.status = '');  
          // 设置其状态为active 
          chosenFile.status = 'active'
          // 向pdf预览组件的iframe传递数据，预览组件根据哪个pdf的status是active，再预览对应的pdf文件        
          iframeWin.postMessage({
            name: 'previewFile',
            objectName: mapFrame.id,
            fileLists: list,
            pd: that.schema.enableDownload,
            currentLanguage: that.$i18n.locale,
            index: chosenFile.index,
            cdnHost: that.cdnHost
          }, '*');
        }       
      });
    },
    mounted() {
      //获取父组件fileList
      this.onloadPdf();
    },
    methods: {
      onloadPdf(newVal,status){
        let that = this;
        const mapFrame = that.$refs['mainIframe'];
        const mapDiv = that.$refs['mainDiv'];
        if (that.fileLists.length > 0) {
          that.showPdfViewerOverLay = true;
        }      
        if (mapFrame && mapFrame.attachEvent) { // 兼容浏览器判断
          if(status !== 1) {
            mapFrame.onload = function() {
              const iframeWin = mapFrame.contentWindow
              iframeWin.postMessage({
                name: 'pdfPreviewInfo',
                objectName: mapFrame.id,
                fileLists: that.fileLists,
                pd: that.schema.enableDownload,
                currentLanguage: that.$i18n.locale,
                cdnHost: that.cdnHost,
                chosenIndex: that.schema.showFileIndex || 0
              }, '*');
            }
          } else {
            if(newVal !== undefined){
              mapFrame.onload = function() {
                const iframeWin = mapFrame.contentWindow
                //fileLists获取数据后排序
                let newFileLists = JSON.parse(JSON.stringify(newVal))
                let newSortArr = newFileLists.sort((r1,r2)=>{
                    let r = r1.index-r2.index;
                    return r;
                });
                iframeWin.postMessage({
                  name: 'pdfPreviewInfo',
                  objectName: mapFrame.id,
                  fileLists: newSortArr,
                  pd: that.schema.enableDownload,
                  currentLanguage: that.$i18n.locale,
                  cdnHost: that.cdnHost,
                  chosenIndex: that.schema.showFileIndex || 0
                }, '*');
              }
            }
          }
        } else {
          //normal fileupload mode
          if(status !== 1 && mapFrame) {
            mapFrame.onload = function() {
              const iframeWin = mapFrame.contentWindow
              iframeWin.postMessage({
                name: 'pdfPreviewInfo',
                fileLists: that.fileLists,
                objectName: mapFrame.id,
                pd: that.schema.enableDownload,
                currentLanguage: that.$i18n.locale,
                cdnHost: that.cdnHost,
                chosenIndex: that.schema.showFileIndex || 0
              }, '*');
            }
          } else {
            //large fileupload mode
            if(newVal !== undefined && mapFrame){
                mapFrame.onload = function() {
                  const iframeWin = mapFrame.contentWindow
                  //fileLists获取数据后排序
                  let newFileLists = JSON.parse(JSON.stringify(newVal))
                  let newSortArr = newFileLists.sort((r1,r2)=>{
                      let r = r1.index-r2.index;
                      return r;
                  });
                  iframeWin.postMessage({
                    name: 'pdfPreviewInfo',
                    objectName: mapFrame.id,
                    fileLists: newSortArr,
                    pd: that.schema.enableDownload,
                    currentLanguage: that.$i18n.locale,
                    cdnHost: that.cdnHost,
                    chosenIndex: that.schema.showFileIndex || 0
                  }, '*');
                }
                //解决大文件上传多文件preview NoData的问题
                mapDiv.appendChild(mapFrame);
            }
          }
          
        }
      }
    },
  }
</script>

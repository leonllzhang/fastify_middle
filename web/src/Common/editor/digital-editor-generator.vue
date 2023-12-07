
<template>
  <div>
    <div class="d-flex">

      <div style=" width: 100%" :class="componentId">

        <div :id="componentId+'-toolbar-container'" style="border: 1px solid #ccc; border-bottom:0; width: 100%"></div>
        <div :id="componentId+'-editor-container'"
             :style="{height:height,border:'1px solid #ccc',width: showCatalog?'': '100%'}"></div>
      </div>
      <div v-show="showCatalog"
           style="width: 240px;min-width:240px; background-color: #f1f1f1; border: 1px solid #ccc;"
           :id="'editor-catalog-'+componentId">
        <ul :id="componentId + 'header-container'" class="header-container"></ul>
      </div>
    </div>

    <div v-if="!dropzone.renew">
      <uploadByDropzone v-show="dropzone.isShow" ref="myeditorVueDropzone" :schema="dropzone.dropzoneSchema"
                        :model="model"
                        :isEditorUpload="dropzone.isEditorUpload"></uploadByDropzone>
      <uploadByDropzone v-show="dropzone.isShow" ref="myeditorImageVueDropzone" :schema="dropzone.dropzoneImageSchema"
                        :model="model" :isEditorUpload="dropzone.isEditorUpload"></uploadByDropzone>
    </div>

    <snackbar v-show="snackBar.message !== ''" :isShowSnackbar="snackBar.isShow" :snackbarMessage="snackBar.message"
              :snackbarTimeout="snackBar.timeout"/>
    <div v-show="colorPicker.isShow"
         :style="{'position':'fixed','left':colorPicker.position.x+'px','top':colorPicker.position.y+'px','z-index':'10001'}"
         class="colorPickerPanel">
      <v-color-picker :hide-inputs="['color', 'bgColor'].includes(colorPicker.type)" hide-mode-switch dot-size="10"
                      v-model="colorPanelPicker" :swatches="colorPicker.swatches" show-swatches
                      swatches-max-height="200px"></v-color-picker>
      <div class="d-flex justify-space-around mb-2">
        <v-btn outlined color="primary" small @click="colorPicker.isShow=false">
          {{ $t("peoplepicker-base.close") }}
        </v-btn>
        <v-btn v-if="['color', 'bgColor'].includes(colorPicker.type)"  class="primary" small @click="saveColor">
          {{ $t("peoplepicker-base.ok") }}
        </v-btn>
      </div>
    </div>
    <htmlDialogContainer />

  </div>
</template>
<script>
import xss from 'xss'
let _ = require("lodash");
import {formatValue, getFileIcon} from '../utils'
import {editorEvents} from './editorEvent'
import editorMixin from './mixin'

export default {
  mixins: [editorMixin],
  props: {
    appCode: {
      type: String,
      default: '',
    },
    tenantId: {
      type: String,
      default: '',
    },
    height: {
      type: String,
      default: '600px',
    },
    needXSS: {
      type: Boolean,
      default: true,
    },

    schema: {
      type: Object,
      default: {}
    },
    model: {
      type: Object,
      default: null
    },
    value: {
      type: String,
      default: ''
    },
  },

  inject: {
    messageDialog: {
      default: {
        showMsg() {
        },
      },
    }
  },

  provide: function () {
    return {
      EditorManager: {
        InsertResource: this.InsertResource
      }
    }
  },

  components: {
    htmlDialogContainer: () => import('./html.vue'),
    snackbar: () => import('../../GeneratorMaker/components/snackbar.vue'),
    uploadByDropzone: () => import('../../GeneratorMaker/components/basic/vc-dropzone.vue'),
  },

  watch: {
    "schema.disabled": function () {
      if (this.editor == null) {
        return;
      }
      this.schema.disabled ? this.editor.disable() : this.editor.enable();
    },
  },

  mounted() {
    let that = this;
    setTimeout(() => {
      if (window.editorUpload === undefined) {
        window.editorUpload = [];
      }
      that.allFileIds = that.returnFileIdArray(that.html);
      window.editorUpload[that.componentId] = that.$refs.myeditorVueDropzone;
      window.editorUpload[that.componentId + "-image"] = that.$refs.myeditorImageVueDropzone;
      that.initBus();
    }, 200)
    this.initDIGIQALEditor();
  },
  methods: {
    initDIGIQALEditor() {
      let that = this;

      that.html = that.value

      const {createEditor, createToolbar, i18nChangeLanguage} = window.wangEditor

      const editorConfig = {
        placeholder: '',
        autoFocus: that.schema.isAutoFocus,
        readOnly : that.schema.disabled,
        onCreated(editor) {
          that.editor = Object.seal(editor);
          const headerContainer = document.getElementById(that.componentId + 'header-container')
          headerContainer.removeEventListener('mousedown', that.catalogEvent)
          headerContainer.addEventListener('mousedown', that.catalogEvent)
          let colors = that.getEditorColors();
          colors = colors.slice(0, colors.length - 1)
          const chunk = 1;
          const colorTotalPageCount = Math.ceil(colors.length / chunk);
          let colorPickerColorList = new Array(colorTotalPageCount);
          for (let i = 0; i < colorTotalPageCount; i++) {
            const start = i * chunk;
            const end = start + chunk;
            colorPickerColorList[i] = colors.slice(start, end)
          }
          that.colorPicker.swatches = colorPickerColorList;
          if (that.value != null) {
            // const value = that.formatValue2(that.value);
            const value = formatValue(that.value);
            that.editor.clear();
            that.editor.dangerouslyInsertHtml(value)
          }
        },
        onChange(editor) {

          let newHtml = editor.getHtml()
          // console.log('editor content', newHtml, editor)

          if (that.showCatalog) {
            that.showCatalogContainer();
          }
          that.$set(that.model, that.schema.model, newHtml
            .replace(that.srcReg, 'src="/api/DownloadFile')
            .replace(that.hrefReg, 'href="/api/DownloadFile')
            .replace(that.srcLinkTrackingReg, 'src="/api/LinkTracking')
            .replace(that.hrefLinkTrackingReg, 'href="/api/LinkTracking')
            .replace(that.srcFileIconReg, 'src="/static/Content/Images/')
          );
          if (that.needXSS != null && that.needXSS) {
            let xssNewHtml = newHtml.replace(/&lt;/ig, '<').replace(/&gt;/ig, '>');
            let xsshtml = xss(xssNewHtml, {
              whiteList: [], // 白名单为空，表示过滤所有标签
              stripIgnoreTag: true, // 过滤所有非白名单标签的HTML
              stripIgnoreTagBody: ["script"] // script标签较特殊，需要过滤标签中间的内容
            });
            that.$set(that.model, that.schema.model + "_noHtml", xsshtml)
          }
          that.html = newHtml
          // console.log(newHtml)
        },
        customAlert(s, t) {
          if (t === 'linkError') {
            that.snackBar.isShow = false;
            that.snackBar.message = that.$t("message.linkFormatError");
            that.snackBar.isShow = true;
            setTimeout(function () {
              that.snackBar.message = "";
            }, that.snackBar.timeout);
          }
        },
        customPaste(editor, event) {
          that.customPasteFn(editor, event)
        },
        MENU_CONF: {
          color: {
            colors: that.getEditorColors()
          },
          bgColor: {
            colors: that.getEditorColors()
          }
        }
      }

      const editor = createEditor({
        selector: '#' + that.componentId + '-editor-container',
        html: '',
        config: editorConfig,
        mode: 'default',
      })

      editor.id = that.componentId + "|imgClass:" + that.dropzone.dropzoneImageSchema.model + "|fileClass:" + that.dropzone.dropzoneSchema.model;
      if (editorEvents) {
        editorEvents.forEach((eventItem) => {
          editor.on(eventItem.name, (e) => {
            eventItem.event(e, that)
          })
        })
      }
      editor.handleTab = () => {
        const cIndex = editor.selection.anchor.path[0];
        const nList = ['numbered-list', 'bulleted-list'];
        const cType = editor.children[cIndex].type;
        if (nList.indexOf(cType) >= 0) {
          editor.insertNode({type: cType, children: [{type: "list-item", children: [{text: ''}]}]});
        } else {
          editor.insertText('    ')
        }
      };
      let allList = [
        'headerSelect',
        'blockquote',
        'bold',
        'underline',
        'italic',
        'group-more-style',
        'color',
        'bgColor',
        'fontSize',
        'fontFamily',
        'lineHeight',
        'bulletedList',
        'numberedList',
        'todo',
        'group-justify',
        'group-indent',
        'digiqalImage',
        'digiqalAttachment',
        'digiqalQRCode',
        'catalog',
        'exportPDF',
        'exportWord',
        'history',
        'html',
        'emotion',
        'insertLink',
        'insertTable',
        'codeBlock',
        'divider',
        'undo',
        'redo',
        'fullScreen'
      ];
      const differenceArray = _.difference(allList, this.schema.selectedItems).concat(['history', 'emotion']);
      const toolbarConfig = {
        excludeKeys: differenceArray,
      }

      const toolbar = createToolbar({
        editor,
        selector: '#' + that.componentId + '-toolbar-container',
        config: toolbarConfig,
        mode: 'default',
      })
      i18nChangeLanguage(that.$i18n.locale)
    },
    showCatalogContainer() {
      const headers = this.editor.getElemsByTypePrefix('header')
      const headerContainer = document.getElementById(this.componentId + 'header-container')
      headerContainer.innerHTML = '';
      const {SlateNode} = window.wangEditor
      headerContainer.innerHTML = headers.map(header => {
        const text = SlateNode.string(header)
        const {id, type} = header
        return `<li id="${id}" type="${type}">${text}</li>`
      }).join('');
      this.catalogFullScreenEvent();
    },
    catalogFullScreenEvent() {
      const element = document.getElementsByClassName(this.componentId)[0];
      if (element != null) {
        if (this.editor.isFullScreen && this.showCatalog) {
          element.classList.remove('w-e-full-screen-container');
          element.classList.add('catalogWidth');
          document.getElementById(this.componentId+'-editor-container').style.height = '100%'
        } else if (this.editor.isFullScreen && !this.showCatalog) {
          element.classList.remove('catalogWidth');
          element.classList.add('w-e-full-screen-container');
          document.getElementById(this.componentId+'-editor-container').style.height = this.height
        }else{
          element.classList.remove('catalogWidth');
          element.classList.remove('w-e-full-screen-container');
          document.getElementById(this.componentId+'-editor-container').style.height = this.height
        }
      }

    },
    catalogEvent(event) {
      if (event.target.tagName !== 'LI' || !this.showCatalog) return
      event.preventDefault()
      const id = event.target.id
      this.editor.scrollToElem(id)
    },
    customPasteFn(editor, event) {
      let that = this;
      const clipboardData = event.clipboardData || event.originalEvent && event.originalEvent.clipboardData || {}
      let textHtmlContent = clipboardData.getData('text/html');

      if (textHtmlContent != null && textHtmlContent !== '' && textHtmlContent.indexOf('xmlns') >= 0) {
        that.$store.state.loading = true;
        const stateData = that.$store.state;
        const tenantId = stateData.userInfo.tenantId;
        const appCode = stateData.appInfo.AppCode;
        that.$axios.post('/api/dgqEditorConvert/html', {
          contents: textHtmlContent,
          tenantId,
          appCode
        }).then(e => {
          if (e != null && e.data != null && e.data.data != null && e.data.statusCode != null && e.data.statusCode === 200) {
            editor.dangerouslyInsertHtml(e.data.data)
          }
          that.$store.state.loading = false;
        })
        event.preventDefault()
        return false;
      } else {
        const items = clipboardData.items
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') >= 0) {
            let file = items[i].getAsFile();
            if (file != null) {
              let reader = new FileReader();
              reader.readAsDataURL(file)
              reader.onload = function (e) {
                if (e.target != null && e.target.result != null) {
                  editor.insertNode({
                    alt: '',
                    children: [{text: ''}],
                    href: e.target.result,
                    src: e.target.result,
                    style: {},
                    type: "image"
                  });
                }
              }
            }
            event.preventDefault()
            return false;
          }
        }
      }

    },
    InsertResource(uploadResult) {
      let that = this;
      if (uploadResult.hasError) {
        that.snackBar.message = uploadResult.errorMessage;
        that.snackBar.isShow = true;
        setTimeout(function () {
          that.snackBar.message = "";
        }, that.snackBar.timeout);
        return;
      }
      if (!that.allFileIds.includes(uploadResult.fileId)) {
        that.allFileIds.push(uploadResult.fileId);
      }
      that.dropzone.renew = true;
      setTimeout(() => {
        that.dropzone.renew = false;
      }, 10)
      let insertNodeItem = {};
      const extension = uploadResult.fileName.substring(uploadResult.fileName.lastIndexOf(".") + 1).toLowerCase();
      if ("jpg,png,svg,jpeg,gif,bmp".indexOf(extension) !== -1 && uploadResult.showImage) {
        const imgUrl = window.location.origin + that.pathTrans(uploadResult.imgUrl);
        insertNodeItem = {
          alt: uploadResult.fileName,
          children: [{text: ''}],
          href: imgUrl,
          src: imgUrl,
          style: {},
          type: "image"
        };
      } else {
        const iconUrl = that.fileIcon + 'Fileicon/' + getFileIcon(extension);

        insertNodeItem = {
          type: 'attachment',
          icon: iconUrl,
          fileName: uploadResult.fileName,
          link: uploadResult.url,
          children: [{text: ''}],
        };
      }
      that.editor.insertNode(insertNodeItem)
      // console.log(that.editor)
      that.$store.state.loading = false;
    },
    returnFileIdArray(content) {
      //每一次内容的改变，都需要进行文件内容检查，筛对是否删除了图片，如果删除了图片，则需要调用一下删除图片的方法
      if (content == undefined || content == '') {
        return [];
      }
      const regexp = /fileid=.+?[&|"]/gi;
      const matches_array = content.match(regexp);
      const fileIdArray = [];
      if (matches_array != undefined) {
        matches_array.map(item => {
          fileIdArray.push(item.replace('fileid=', '').replace('&', '').replace('/"', '').replace('"', ''))
        })
      }
      return fileIdArray
    },
    initBus() {
      let that = this;
      let loadType = that.options && that.options.loadType ? that.options.loadType : "normal";
      let newComponentStatus = null;
      let componentStatusName = "";
      let busName = '';
      let pageCode = that.options && that.options.pageView ? that.options.pageView.toLowerCase() : "";
      switch (loadType) {
        case "embed":
          busName = "$dmembedbus";
          if (that.$store.state.embedComponentStatus[pageCode] === undefined) {
            that.$store.state.embedComponentStatus[pageCode] = {};
          }
          newComponentStatus = that.$store.state.embedComponentStatus[pageCode];
          componentStatusName = pageCode + "_" + that.schema.name;
          break;
        case "popup":
          busName = "$dmpopupbus";
          if (that.$store.state.popupComponentStatus[pageCode] === undefined) {
            that.$store.state.popupComponentStatus[pageCode] = {};
          }
          newComponentStatus = that.$store.state.popupComponentStatus[pageCode];
          componentStatusName = pageCode + "_" + that.schema.name;
          break;
        default:
          busName = "$dmbus";
          newComponentStatus = that.$store.state.componentStatus;
          componentStatusName = that.schema.name;
          break;
      }
      that.$set(newComponentStatus, componentStatusName, {"status": "complete"});
      that.bus.$emit(busName, newComponentStatus, componentStatusName, that.schema.model);
    },
    pathTrans(path) {
      let endPos = window.urlMode === 'NOTENANTAPPCODE' ? 1 : 3;
      return window.location.pathname.split("/").splice(0, endPos).join("/") + path;
    }
  },

  data() {
    return {
      allFileIds: [],
      fileIcon: this.$store.getters.cdnHostAndVersionPath + '/static/Content/Images/',
      dropzone: {
        renew: false,
        isShow: false,
        isEditorUpload: true,
        dropzoneSchema: {
          "name": this.schema.model,
          "model": this.schema.model.toLowerCase() + "-uploadByDropzone" + "_" + this.$dm_getGuid(),
          "component": "vc-dropzone",
          "enablePdf": false,
          "show": true,
          "direction": "level",
          "disableLabel": true,
          "maxFiles": 1,
          "acceptedFiles": this.schema.acceptedFiles ? this.schema.acceptedFiles : null,
          "uploadByDropzone": true,
          "pageCode": this.schema.pageCode ? this.schema.pageCode : '',
          "documentId": this.schema.documentId ? this.schema.documentId : ''
        },
        dropzoneImageSchema: {
          "name": this.schema.model,
          "model": this.schema.model.toLowerCase() + "-uploadImageByDropzone" + "_" + this.$dm_getGuid(),
          "component": "vc-dropzone",
          "enablePdf": false,
          "show": true,
          "direction": "level",
          "disableLabel": true,
          "maxFiles": 1,
          "acceptedFiles": "image/gif,image/jpeg,image/jpg,image/bmp,image/png,image/tif,image/tiff",
          "uploadByDropzone": true,
          "pageCode": this.schema.pageCode ? this.schema.pageCode : '',
          "documentId": this.schema.documentId ? this.schema.documentId : ''
        },
      },
      componentId: this.schema.model.toLowerCase() + "_" + this.$dm_getGuid(),
      snackBar: {
        isShow: false,
        message: '',
        timeout: 3000,
        color: ''
      },
      showCatalog: false,
      html: '<p></p>',
      formatHTML: '',
    }
  },
}

</script>

<style scoped>
@import 'editor.css';
.theme--light.v-application code {
  background-color: transparent !important;
}
</style>

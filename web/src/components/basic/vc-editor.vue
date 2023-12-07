<template>
  <v-layout :class="[classes,{'dark-editor':$vuetify.theme.dark}]" class="editor-module" :style="schema.style">
    <v-flex v-show="schema.model && !schema.disableLabel" class="vc-label"
            :class="{ horizontal: isHorizontal, required: isEdit ? schema.required : '' }"
            :style="{'display':!useDGQEditor && isEdit?'flex':'block','justify-content':!useDGQEditor && isEdit?'space-between':''}">
      <span :style="computeStyle('Label',schema)">{{ label }}</span>
      <v-tooltip right :disabled="!schema.tooltip">
        <template v-slot:activator="{ on }">
          <v-icon v-show="schema.tooltip" v-on="on" color="primary">mdi-message-alert</v-icon>
        </template>
        <span>{{ tooltipLabel }}</span>
      </v-tooltip>
      <v-tooltip v-if="!useDGQEditor && isEdit" bottom color="#ffffff" content-class="notesEditorTips" z-index="9999">
        <template v-slot:activator="{ on, attrs }">
          <v-icon
            color="grey"
            dark
            v-bind="attrs"
            v-on="on"
          >
            pwc-icon pwc-information-outline
          </v-icon>
        </template>
        <span>{{ $t("editor.tips.notesEditor") }}</span>
      </v-tooltip>
    </v-flex>
    <v-flex>
      <div :id="schema.model">
        <template v-if="!useDGQEditor && isEdit">
          <div tabindex="0" :aria-label="label + $dm_arialabel(rules, value)" :aria-required="schema.required"
               class="pwc pwc-editor-content" :id="componentId"></div>
          <v-text-field tabindex="0" :aria-label="label" :aria-required="schema.required" v-if="schema.required"
                        class="validationModule" height="0px" v-model="editorData" :rules="rules"></v-text-field>
          <div>
            <uploadByDropzone v-show="isShow" ref="myeditorVueDropzone" :schema="dropzoneSchema" :model="model"
                              :isEditorUpload="isEditorUpload"></uploadByDropzone>
            <uploadByDropzone v-show="isShow" ref="myeditorImageVueDropzone" :schema="dropzoneImageSchema"
                              :model="model" :isEditorUpload="isEditorUpload"></uploadByDropzone>
          </div>
        </template>
        <template v-else-if="useDGQEditor && isEdit">
          <DIGIQALEditor ref="editorRef" :schema="schema" :height="height" v-if="isEdit" :value="value"
                         :appCode="appCode" :tenantId="tenantId" :model="model"></DIGIQALEditor>
          <v-text-field tabindex="0" :aria-label="label" :aria-required="schema.required" v-if="schema.required"
                        class="validationModule pl-3 pt-1" height="0px" v-model="editorData"
                        :rules="rules"></v-text-field>
        </template>
        <template v-else>
          <div :aria-label="label" v-html="transferFileUrl"
               class="preview-text inner-label pwc-editor-content w-e-text-container w-e-text"></div>
        </template>
      </div>
    </v-flex>
    <snackbar v-if="!useDGQEditor && isEdit" v-show="snackbarMessage != ''" :isShowSnackbar="isShowSnackbar"
              :snackbarMessage="snackbarMessage"
              :snackbarTimeout="snackbarTimeout"/>
    <v-dialog v-model="dialog.isShow" width="30%" persistent>
      <v-card class="common-dialog">
        <v-card-title class="primary white--text">{{ dialog.title }}</v-card-title>
        <v-card-text class="content">
          <div class='msg-bg'><!-- <v-icon>{{dialog.icon}}</v-icon> --><span v-html="dialog.message"></span></div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn outlined tile @click="dialog.isShow = false">
            {{
              this.$t("vc.form.ok")
            }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import base from "../utils/form-base";
import {
  getEnv,
  pathTrans,
  exportEnvUrl,
  getCookie,
  extractMethod,
  hashParams
} from "../../utils/baseMethods";
import {
  FILE_LANGUAGE_PENDING,
  FILE_LANGUAGE_INSECURITY,
  FILE_LANGUAGE_ERROR
} from "../../utils/const";
import i18next from 'i18next'
import xss from 'xss'
import snackbarComponent from "../snackbar"

// 需要使用require的方式引入
let cryptoJs = require("crypto-js");

export default {
  mixins: [base],
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
  data() {
    return {
      editor: null,
      editorData: '',
      isShow: false,
      isEditorUpload: true,
      allFileIds: [],
      fileIcon: this.$store.getters.cdnHostAndVersionPath + '/static/Content/Images/',
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
      },
      menuList: [
        'undo',
        'redo',
        'fontSize',
        'fontName',
        'foreColor',
        'backColor',
        'head',
        'bold',
        'italic',
        'underline',
        'strikeThrough',
        'justify',
        'list',
        'indent',
        'lineHeight',
        'link',
        'quote',
        'imagefile',
        'file',
        'table',
        'tableProperties',
        'splitLine'
      ],
      isShowSnackbar: false,
      snackbarMessage: "",
      snackbarTimeout: 3000,
      snackbarColor: "",
      componentId: this.schema.model.toLowerCase() + "_" + this.$dm_getGuid(),
      srcReg: new RegExp('src="[^"]*\/api\/DownloadFile', "ig"),
      hrefReg: new RegExp('href="[^"]*\/api\/DownloadFile', "ig"),
      srcLinkTrackingReg: new RegExp('src="[^"]*\/api\/LinkTracking', "ig"),
      hrefLinkTrackingReg: new RegExp('href="[^"]*\/api\/LinkTracking', "ig"),
      srcFileIconReg: new RegExp('src="[^"]*\/static\/Content\/Images\/', "ig"),
      useDGQEditor: true,
      height: '500px',
      appCode: '',
      tenantId: '',
      dialog: {
        title: 'Info',
        message: null,
        isShow: false,
        icon: 'pwc-close'
      },
    }
  },
  components: {
    uploadByDropzone: () =>
      import("./vc-dropzone.vue"),
    DIGIQALEditor: () => import('../../../Common/editor/digital-editor-generator'),
    snackbar: snackbarComponent
  },
  watch: {
    "$i18n.locale": function () {
      this.editor ? this.editor.destroy() : null;
      this.editor = null
      this.init();
    },
    "schema.disabled": function () {
      if (this.editor == null) {
        return;
      }
      this.schema.disabled ? this.editor.disable() : this.editor.enable();
    },
    value: {
      handler(val, oldVal) {
        if (!this.useDGQEditor) {
          if (this.editor && val != undefined && this.schema.insertContentByExternal) {
            this.editor.txt.html(this.formatValue(val))
            this.editorData = this.formatValue(val);
            this.renderSection();
            this.renderFigure();
          }
        } else {
          this.editorData = this.$refs.editorRef != null ? this.$refs.editorRef.getEditorData() : '';
          if (val == '<p><br></p>') {
            this.value = '';
            this.editorData = '';
          }
        }
      },
      immediate: true,
    },
  },
  mounted() {
    let _this = this;
    if (_this.isEdit) {
      if (!_this.useDGQEditor) {
        _this.init();
      }
      setTimeout(() => {
        if (window.editorUpload == undefined) {
          window.editorUpload = [];
        }
        _this.allFileIds = _this.returnFileIdArray(_this.editorData);
        window.editorUpload[_this.componentId] = _this.$refs.myeditorVueDropzone;
        window.editorUpload[_this.componentId + "-image"] = _this.$refs.myeditorImageVueDropzone;
        _this.initBus();
      }, 200)
    } else {
      _this.renderSection();
      if (_this.useDGQEditor) {
        const aLabel = document.getElementById(_this.schema.model).getElementsByTagName('a');
        for (let a of aLabel) {
          a.addEventListener("click", function (e) {
            e.preventDefault();
            const link = e.currentTarget.getAttributeNode("href").value;
            if (e && e.currentTarget.getAttributeNode("href")) ;
            let params = new Object();
            if (link.indexOf("?") != -1) {
              let str = link.substr(1),
                strs = str.split("&");
              for (let i = 0; i < strs.length; i++) {
                params[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
              }
            }
            const fileId = params["fileid"] || params["fileId"];
            _this.fileProcessing(fileId, link);
          });
        }
      } else {
        _this.renderFigure();
      }
    }

  },
  created() {
    let that = this;
    that.height = this.getPropertiesValue('Style', 'richEditorHeight') + 'px';
    const appInfo = this.getAppInfo();
    that.appCode = appInfo.appCode
    that.tenantId = appInfo.tenantId
    that.editorData = that.value;
    if (that.value == '') {
      that.useDGQEditor = true
    } else {
      const notesTags = ['<html', '<body', '<style', '<meta']
      notesTags.forEach(item => {
        if (that.value.includes(item)) {
          that.useDGQEditor = false
        }
      })
    }
    if (this.$vuetify.theme.dark) {
      this.appendCSSToHead()
    }
    ;

  },
  computed: {
    transferFileUrl() {
      return this.formatValue(this.value);
    },
  },
  methods: {
    appendCSSToHead() {
      let css = `body {
                            --w-e-textarea-color: #fff;
                            --w-e-textarea-slight-bg-color: #333;
                            --w-e-toolbar-border-color: #666;
                          }`
      let head = document.head || document.getElementsByTagName('head')[0]
      if (document.getElementById('digiqal-editor-css')) document.getElementById('digiqal-editor-css').remove();
      let style = document.createElement('style');
      head.appendChild(style);
      style.type = 'text/css';
      style.id = "digiqal-editor-css";
      if (style.styleSheet) {
        // This is required for IE8 and below.
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
    },
    fileProcessing(fileId, link) {
      const _this = this;
      _this.getEnableScanData().then((data) => {
        if (data.data.value === "enable") {
          _this.getFileStatus(fileId).then((data) => {
            const _data = data.data;
            //状态没完成弹框提示
            if (_data.status != "ok") {
              _this.dialog.isShow = true;
              _this.languageConversion("title", ["信息", "信息", "Info"]);
              switch (_data.status) {
                case "pending":
                  _this.languageConversion(
                    "message",
                    FILE_LANGUAGE_PENDING
                  );
                  break;
                case "insecurity":
                  _this.languageConversion(
                    "message",
                    FILE_LANGUAGE_INSECURITY
                  );
                  break;
                case "error":
                  _this.languageConversion(
                    "message",
                    FILE_LANGUAGE_ERROR
                  );
                  break;
                default:
                  _this.dialog.isShow = false;
                  window.open(link);
                  break;
              }
            } else {
              window.open(link);
            }
          });
        } else {
          window.open(link);
        }
      });
    },
    renderFigure() {
      const _this = this;
      var figures = document.querySelectorAll("figure");
      for (let figure of figures) {
        figure.addEventListener("click", function (e) {
          if (e && e.currentTarget.getAttributeNode("src")) ;
          const fileId = figure.getAttribute("id");
          const val = e.currentTarget.getAttributeNode("src").value;
          _this.fileProcessing(fileId, val);
        })
      }
    },
    renderSection() {
      let that = this;
      var sectionIndex = 0;
      document.querySelectorAll('.pwc-editor-content div.Section').forEach(context => {
        let sectionTitle = context.querySelector('div.SectionTitle');
        let newh3 = document.createElement('h3');
        newh3.setAttribute('style', 'cursor:pointer;');
        newh3.setAttribute('class', 'collapsed');
        newh3.setAttribute('domNumber', 'v_sec_' + that.schema.model + '_' + sectionIndex);
        newh3.innerHTML = '<i class="mdi mdi-chevron-down" aria-hidden="true"></i>' + sectionTitle.innerHTML;
        context.before(newh3);

        let newdiv = document.createElement('div');
        newdiv.setAttribute('id', 'v_sec_' + that.schema.model + '_' + sectionIndex);
        newdiv.setAttribute('hidden', 'hidden');
        newdiv.setAttribute('style', 'margin-left:15px;');
        context.before(newdiv);
        sectionTitle.remove();
        let newDiv = document.querySelector('#v_sec_' + that.schema.model + '_' + sectionIndex);
        if (context.innerHTML != undefined && newDiv != undefined) {
          newDiv.innerHTML = context.innerHTML;
        }
        newh3.addEventListener('click', function () {
          let divClass = this.getAttribute('class');
          let divDomID = '#' + this.getAttribute('domNumber');
          if (divClass == 'collapse') {
            document.querySelector(divDomID).setAttribute('hidden', 'hidden');
            this.setAttribute('class', 'collapsed');
            this.querySelector('i').setAttribute('class', 'mdi mdi-chevron-down');
          } else {
            document.querySelector(divDomID).removeAttribute('hidden', 'hidden');
            this.setAttribute('class', 'collapse');
            this.querySelector('i').setAttribute('class', 'mdi mdi-chevron-up');
          }
        }, false);
        context.remove();
        sectionIndex++;
      });
    },
    formatValue(val) {
      let originName = 'src="' + window.location.origin + pathTrans('/api/DownloadFile');
      let hrefOriginName = 'href="' + window.location.origin + pathTrans('/api/DownloadFile');
      let originLinkTrackingName = 'src="' + window.location.origin + pathTrans('/api/LinkTracking');
      let hrefOriginLinkTrackingName = 'href="' + window.location.origin + pathTrans('/api/LinkTracking');
      let cdnHostAndVersionPath = 'src="' + this.fileIcon;
      let newVal =
        (val != undefined && val.length > 0) ?
          val.replace(this.srcReg, originName)
            .replace(this.hrefReg, hrefOriginName)
            .replace(this.srcLinkTrackingReg, originLinkTrackingName)
            .replace(this.hrefLinkTrackingReg, hrefOriginLinkTrackingName)
            .replace(this.srcFileIconReg, cdnHostAndVersionPath) :
          '';
      return newVal;
    },
    //dialog多语配置
    languageConversion(_variable, script) {
      const locale = this.$i18n.locale;
      if (locale === 'zh-cn') {
        this.dialog[_variable] = script[0]
      } else if (locale === 'zh-tw') {
        this.dialog[_variable] = script[1]
      } else {
        this.dialog[_variable] = script[2]
      }
    },
    async getEnableScanData() {
      let _this = this,
        result = await _this.$axios.post('api/getJObjectResult', {
          requestURL: "adm/pref/enablescan",
        })
      return result
    },
    async getFileStatus(fileId) {
      let _this = this,
        result = await _this.$axios.post(
          "/api/GetJObjectResult", {
            requestURL: "runtime/GetFileStatus/" + fileId
          })
      return result
    },
    init() {
      let that = this;
      const editor = new wangEditorNotes('#' + that.componentId)

      ////// 配置 onchange 回调函数，将数据同步到 vue 中
      editor.config.onchange = (newHtml) => {

        var fileIdArray = that.returnFileIdArray(newHtml);

        //判断之前的fileid,是否在当前的记录当中，如果不在，则视为删除
        if (that.allFileIds != undefined) {
          that.allFileIds.map(b => {
            var notExist = true;
            fileIdArray.map(c => {
              if (b == c) {
                notExist = false;
              }
            })
            if (notExist) {
              window.editorUpload[that.componentId].addFileToDeleteList(b)
            }
          })
        }

        that.$set(that.model, that.schema.model, newHtml
          .replace(that.srcReg, 'src="/api/DownloadFile')
          .replace(that.hrefReg, 'href="/api/DownloadFile')
          .replace(that.srcLinkTrackingReg, 'src="/api/LinkTracking')
          .replace(that.hrefLinkTrackingReg, 'href="/api/LinkTracking')
          .replace(that.srcFileIconReg, 'src="/static/Content/Images/')
        );

        let xssNewHtml = newHtml.replace(/&lt;/ig, '<').replace(/&gt;/ig, '>');
        let xsshtml = xss(xssNewHtml, {
          whiteList: [], // 白名单为空，表示过滤所有标签
          stripIgnoreTag: true, // 过滤所有非白名单标签的HTML
          stripIgnoreTagBody: ["script"] // script标签较特殊，需要过滤标签中间的内容
        });
        that.$set(that.model, that.schema.model + "_noHtml", xsshtml)
        that.editorData = newHtml
      }
      editor.config.pasteTextHandle = function (content) {
        editor.cmd.do('insertHTML', content);
        return;
      }
      editor.config.placeholder = '';
      editor.config.zIndex = 0
      editor.config.height = this.getPropertiesValue('Style', 'richEditorHeight');
      //// 配置字体
      //editor.config.fontNames = [
      //  'Arial',
      //  'Georgia',
      //]
      // 选择语言
      editor.config.lang = this.$i18n.locale
      // 引入 i18next 插件
      editor.i18next = i18next
      // 配置菜单栏，删减菜单，调整顺序
      editor.config.menus = that.menuList;
      editor.config.menuTooltipPosition = 'down'
      const IDS = document.getElementById(this.componentId)
      IDS.addEventListener('paste', (e) => {
        const result = []
        const clipboardData = e.clipboardData || e.originalEvent && e.originalEvent.clipboardData || {}
        const items = clipboardData.items


        let isBase64ImagePaste = false;
        that.objForEach(items, function (key, value) {
          var type = value.type
          if (/image/i.test(type)) {
            isBase64ImagePaste = true;
            result.push(value.getAsFile())
          }
        })
        console.log('isBase64ImagePaste', isBase64ImagePaste);
        if (!isBase64ImagePaste) {
          return;
        }

        if (result.length <= 0) {
          return;
        }
        let file = result[0];
        let fileid = that.$dm_getObjectId();
        let fileName = fileid + file.name.substr(file.name.lastIndexOf('.'));
        let form = new FormData();
        form.append("file", file); //第一个参数是后台读取的请求key值
        form.append("fileName", fileName);

        form.append("dzuuobjectid", fileid);
        form.append("dzchunkindex", 0);
        form.append("dztotalfilesize", file.size);
        form.append("dzchunksize", file.size);
        form.append("formAlias", that.$route.params.pageView);
        form.append("documentId", that.model._id);
        form.append("fieldName", that.schema.model);
        var xhr = new XMLHttpRequest();
        var action = exportEnvUrl(pathTrans("/api/UploadEditorThumbnail")); //上传服务的接口地址
        xhr.open("POST", action);
        // 设置请求头，用于富文本编辑器粘贴上传图片过程中的权限校验
        xhr.setRequestHeader("x-requested-with", "XMLHttpRequest");
        xhr.setRequestHeader("env", getEnv() || 'prod');
        xhr.setRequestHeader("x-xsrf-token", getCookie("XSRF-TOKEN"));
        this.generateHeaders(xhr, action);
        xhr.send(form); //发送表单数据
        xhr.onreadystatechange = function () {
          if (xhr.readyState == 4 && xhr.status == 200) {
            var resultObj = JSON.parse(xhr.responseText);
            var fileUrl = "/api/DownloadFile" +
              "?pageCode=" +
              that.$route.params.pageView +
              "&fileid=" +
              resultObj.fileId +
              "&docId=" +
              that.model._id +
              "&fieldName=" +
              that.schema.model;

            let uploadResult = {
              url: fileUrl,
              fileId: resultObj.fileId,
              fileName: fileName,
              hasError: false,
              errorMessage: '',
              showImage: true
            };
            that.InsertResource(uploadResult);
            //处理返回的数据......
          }
        }

      })

      // 创建编辑器
      editor.create()
      editor.txt.html(that.formatValue(that.value))
      that.editorData = that.formatValue(that.value);

      that.editor = editor
    },
    objForEach(obj, fn) {
      let key = void 0,
        result = void 0
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          result = fn.call(obj, key, obj[key])
          if (result === false) {
            break
          }
        }
      }
    },
    getFileIcon(ext) {
      var maps = {
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
    },
    InsertResource(uploadResult) {
      let that = this;
      if (uploadResult.hasError) {
        that.snackbarMessage = uploadResult.errorMessage;
        that.isShowSnackbar = true;
        setTimeout(function () {
          that.snackbarMessage = "";
        }, that.snackbarTimeout);
        return;
      }
      if (!this.allFileIds.includes(uploadResult.fileId)) {
        this.allFileIds.push(uploadResult.fileId);
      }

      let imghtml = '';
      var extension = uploadResult.fileName.substr(uploadResult.fileName.lastIndexOf(".") + 1).toLowerCase();
      if ("jpg,png,svg,jpeg,gif,bmp".indexOf(extension) != -1 && uploadResult.showImage) {
        imghtml = '<img class="editor-image" src="' + window.location.origin + pathTrans(uploadResult.imgUrl) + '" />';

        //imghtml = `
        //  <p data-we-empty-p=""><br></p>
        //  <figure class="image pwc-figure pwc-widget image-style-align-left" contenteditable="false"><img src="${window.location.origin + pathTrans(uploadResult.url)}">
        //  </figure>
        //  <p data-we-empty-p=""><br></p>
        //  `
      } else {
        let iconUrl
        iconUrl = that.fileIcon + 'Fileicon/' + that.getFileIcon(extension);

        imghtml = `
              <p data-we-empty-p=""><br></p>
                <figure class="image pwc-figure pwc-widget image-style-align-left" id="${uploadResult.fileId}" src="${uploadResult.url}" ondragstart="return false;" contenteditable="false">
                    <img class="pwc-figure-image" src="${iconUrl}" ondragstart="return false;">
                    <figcaption class="pwc-figure-figcaption" ondragstart="return false;" contenteditable="false" title="${uploadResult.fileName}">
                      ${uploadResult.fileName}
                    </figcaption>
                </figure>
              <p class="pwc-figure-p" data-we-empty-p=""><br></p>
              `
      }
      that.editor.cmd.do('insertHTML', imghtml);
      that.$store.state.loading = false;
    },
    returnFileIdArray(content) {
      //每一次内容的改变，都需要进行文件内容检查，筛对是否删除了图片，如果删除了图片，则需要调用一下删除图片的方法
      if (content == undefined || content == '') {
        return [];
      }
      let regexp = /fileid=.+?[&|"]/gi;
      let matches_array = content.match(regexp);
      let fileIdArray = [];
      if (matches_array != undefined) {
        matches_array.map(item => {
          fileIdArray.push(item.replace('fileid=', '').replace('&', '').replace('/"', '').replace('"', ''))
        })
      }
      return fileIdArray
    },
    getEditorData() {
      if (this.useDGQEditor) {
        const editorRef = this.$refs.editorRef;
        return editorRef != null ? editorRef.getEditorData() : '';
      } else {
        return this.editor.txt.html()
      }
    },
    initBus() {
      var _this = this;
      let loadType = _this.options && _this.options.loadType ? _this.options.loadType : "normal";
      let newComponentStatus = null;
      let componentStatusName = "";
      let busName = '';
      let pageCode = _this.options && _this.options.pageView ? _this.options.pageView.toLowerCase() : "";
      switch (loadType) {
        case "embed":
          busName = "$dmembedbus";
          if (_this.$store.state.embedComponentStatus[pageCode] == undefined) {
            _this.$store.state.embedComponentStatus[pageCode] = {};
          }
          newComponentStatus = _this.$store.state.embedComponentStatus[pageCode];
          componentStatusName = pageCode + "_" + _this.schema.name;
          break;
        case "popup":
          busName = "$dmpopupbus";
          if (_this.$store.state.popupComponentStatus[pageCode] == undefined) {
            _this.$store.state.popupComponentStatus[pageCode] = {};
          }
          newComponentStatus = _this.$store.state.popupComponentStatus[pageCode];
          componentStatusName = pageCode + "_" + _this.schema.name;
          break;
        default:
          busName = "$dmbus";
          newComponentStatus = _this.$store.state.componentStatus;
          componentStatusName = _this.schema.name;
          break;
      }
      _this.$set(newComponentStatus, componentStatusName, {"status": "complete"});
      _this.bus.$emit(busName, newComponentStatus, componentStatusName, _this.schema.model);
    },
    // 设置富文本编辑器粘贴图片接口的请求头中的4个字段，必须同时设置
    generateHeaders(xhr, action) {
      let app = this.getAppInfo();
      let key = `${app.tenantId}_${app.appCode}`;
      let arr = new Uint16Array(1);
      let rNum = crypto.getRandomValues(arr);
      let timestamp = new Date().getTime();
      let prepareParams = hashParams(action);
      let dealedParams = prepareParams.map(function (item, index) {
        let encryp = cryptoJs.HmacSHA256(item, key);
        return cryptoJs.enc.Base64.stringify(encryp);
      });
      let actionName = extractMethod(action);
      let precrystamp = `${actionName}_${timestamp}_${rNum}_sys`;
      let crystamp = cryptoJs.HmacSHA256(precrystamp, key);
      let _stamp = cryptoJs.enc.Base64.stringify(crystamp);
      xhr.setRequestHeader("requeststamp", _stamp);
      xhr.setRequestHeader("rn", rNum);
      xhr.setRequestHeader("ts", timestamp);
      xhr.setRequestHeader("ps", dealedParams);
    },
    // 获取app信息
    getAppInfo() {
      var appInfo = {};
      var url = window.location.href
      if (window.urlMode == 'NOTENANTAPPCODE') {
        appInfo.tenantId = window.tenantInRequest
        appInfo.appCode = window.appCodeInRequest
      } else if (url && url.split('/').length > 4) {
        appInfo.tenantId = url.split('/')[3];
        appInfo.appCode = url.split('/')[4];
      }
      return appInfo;
    },
  },
  beforeDestroy() {
    // 调用销毁 API 对当前编辑器实例进行销毁
    this.editor ? this.editor.destroy() : null;
    this.editor = null
  }

}

</script>

<style lang="scss">
.notesEditorTips {
  box-shadow: 0 0 10px 0.1px #ccc;
}

.notesEditorTips span {
  color: var(--v-info-base) !important;
}

.editor-module {
  width: 100%;
  margin: auto;
  position: relative;
  font-family: Arial;
  margin-bottom: 12px;
}

.editor-module img {
  max-width: 100%;
}

.editor-module a {
  text-decoration: underline;
}

.editor-module a:hover {
  text-decoration: none;
}

.editor-module .btn {
  position: absolute;
  right: 0;
  top: 0;
  padding: 5px 10px;
  cursor: pointer;
}

/*    .editor-module h3 {
      margin: 30px 0 15px;
    }*/
.editor-module .w-e-toolbar .w-e-droplist ul {
  padding: 0px;
}

.dark-editor.editor-module .w-e-toolbar,
.dark-editor.editor-module .w-e-text-container,
.dark-editor.editor-module .w-e-menu-panel {
  background-color: #000;
}

.dark-editor.editor-module .preview-text.w-e-text-container {
  background-color: #272727;
}


.editor-module .w-e-text-container ol li {
  list-style-type: decimal;
}

.editor-module .w-e-text-container ul li {
  list-style-type: disc;
}

.editor-module .w-e-droplist p {
  margin-bottom: 0px;
}

.common-dialog {
  border: 1px solid rgba(255, 255, 255, 0.5);

}

.common-dialog .v-card__text.content {
  padding: 1rem !important;
  min-height: 5rem;
  line-height: 5rem;
  white-space: pre-wrap;
  max-height: 500px;

  &::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: #626262;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-track {
    background: #2d2d2d;
  }
}
</style>

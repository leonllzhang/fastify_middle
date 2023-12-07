<template>

  <v-layout :column="isVertical" :class="[classes,'vc-dropzone',{'dark-dropzone':$vuetify.theme.dark}]">
  <!---删除弹框-->
    <div v-show="delDialog">
      <div class="v-overlay v-overlay--active theme--dark" style="z-index: 1000">
      <div class="v-overlay__scrim"
        style="opacity: 0.46;background-color: rgb(33, 33, 33);border-color: rgb(33, 33, 33);"></div>
      <div class="v-overlay__content"></div>
    </div>
    <div role="document" tabindex="0" class="v-dialog__content v-dialog__content--active" style="z-index: 2000">
      <span id="temFile" data-fileid></span>
        <div class="v-dialog v-dialog--active" style="transform-origin: center center; max-width:22%">
          <div class="v-card del-card">
            <v-card-title class="primary white--text" primary-title>{{$t("dropzone.dictRemoveTitle")}}</v-card-title>
            <v-container>
              <div tabindex="0" class="v-card__text content">{{$t("dropzone.dictCancelUploadConfirmation")}}</div>
              <v-card-actions class="justify-end">
                <v-btn outlined text  @click="delDialog = false">{{$t("button.cancel")}}</v-btn>
                <v-btn outlined text  @click="deleteFile">{{$t("peoplepicker-base.ok")}}</v-btn>
              </v-card-actions>
            </v-container>
          </div>
        </div>
      </div>
    </div>
    <v-flex v-show="schema.model && !schema.disableLabel" class="vc-label"
      :class="{'horizontal': isHorizontal,required: schema.required }">
      <span :style="computeStyle('Label',schema)">{{ label }}</span>
      <v-tooltip right :disabled="!schema.tooltip">
        <template v-slot:activator="{ on }">
          <v-icon v-show="schema.tooltip" v-on="on" color="primary">mdi-message-alert</v-icon>
        </template>
        <span>{{ tooltipLabel }}</span>
      </v-tooltip>
    </v-flex>
    <v-flex class="word-wrap">

      <div class="vdropzone-box" :class="{'dark-mode' : $vuetify.theme.dark }">
        <template v-if="!isEdit && schema.enablePdf">
          <vc-pdfviewer :schema="schema" :fileLists="fileLists" :cdnHost="$store.getters.cdnHostAndVersionPath"></vc-pdfviewer>
        </template>
        <template v-else>
          <vue-dropzone tabindex="0" :aria-label="label + $dm_arialabel(rules,value)" :aria-required="schema.required"
            :style="returnBorderStyle"
            :class="schema.model" ref="myVueDropzone" id="dropzone" :options="dropzoneOptions"
            v-on:vdropzone-files-added="filesAdd" v-on:vdropzone-sending="sendingFile"
            v-on:vdropzone-success="uploadFileSuccess" v-on:vdropzone-removed-file="removedFile"
            v-on:vdropzone-canceled="canceledFile" v-on:vdropzone-error="error"
            v-on:vdropzone-thumbnail="thumbnailGenerated" v-on:vdropzone-total-upload-progress="totalUploadProgress"
            v-on:vdropzone-upload-progress="uploadProgress" :useCustomSlot=true
            v-on:vdropzone-processing="uploadProcessing" v-on:vdropzone-drag-drop="dragDropEvent" v-on:vdropzone-complete="uploadComplete">
            <div v-html="$t('dropzone.dictDefaultMessage')">
            </div>
          </vue-dropzone>
          <v-text-field v-show="false" v-model="value" :rules="rules"></v-text-field>
          <v-layout justify-start>
            <v-flex class="message" :class="{ lg10: true, active: !valid }">{{ errMsgs.toString() }}</v-flex>
          </v-layout>
        </template>
      </div>
    </v-flex>
    <snackbar v-show="snackbarMessage != ''" :isShowSnackbar="isShowSnackbar" :snackbarMessage="snackbarMessage"
      :snackbarTimeout="snackbarTimeout" />
    <!--file scan dialog-->
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
  import appInfo from "../../utils/appInfo";
  import base from "../utils/form-base";
  import vue2Dropzone from "vue2-dropzone";
  import "vue2-dropzone/dist/vue2Dropzone.min.css";
  import pathTrans from "../../utils/transUrl";
  import vcpdfviewer from "./vc-pdfviewer";
  import {
    mapMutations
  } from "vuex";
  import {
    getEnv,
    getCookie,
    extractMethod,
    hashParams
  } from "../../utils/appBaseMethods";
  import snackbarComponent from "../snackbar"
  import {
    FILE_UPLOAD_EXPIRATION,
    FILE_LANGUAGE_PENDING,
    FILE_LANGUAGE_INSECURITY,
    FILE_LANGUAGE_SCANNING,
    FILE_LANGUAGE_CONVERTING,
    FILE_LANGUAGE_CONVERTERROR,
    FILE_LANGUAGE_ERROR
  } from "../../utils/const"
  import cryptoJs from "crypto-js"

  var app = appInfo();

  export default {
    mixins: [base],
    props: {
      isEditorUpload: false,
      isImageUploader: false,
    },
    inject: {
      messageDialog: {
        default: {
          showMsg() {},
          showErr() {}
        }
      },
      EditorManager: {
        default: {
          InsertResource() {}
        }
      },
      ImageUploaderManager: {
        default: {
          InsertResource() {},
          errorMsgMethod() {}
        }
      },
    },
    components: {
      vueDropzone: vue2Dropzone,
      "vc-pdfviewer": vcpdfviewer,
      snackbar: snackbarComponent
    },
    data: function () {
      return {
        id: this.$dm_getGuid(),
        delDialog: false,
        count: parseInt(this.schema.maxFiles),
        valLength: 0,
        fileListStatus: [],
        fileLists: [],
        allfileUploaded: false,
        dropzoneOptions: {
          autoProcessQueue: true,
          parallelUploads:1,
          maxFiles: this.schema.maxFiles ? this.schema.maxFiles : null,
          name: this.schema.model,
          url: (window.urlMode === 'NOTENANTAPPCODE' ? '' : `/${app.tenantId}/${app.appCode}`) + "/api/UploadFileByChunk",
          createImageThumbnails: this.schema.enableThumbnail ? this.schema.enableThumbnail : null,
          thumbnailWidth: 400,
          thumbnailHeight: null,
          addRemoveLinks: false,
          maxFilesize: this.schema.maxFilesize ? this.schema.maxFilesize : 1024,
          chunking: true,
          forceChunking: true,
          timeout: undefined,
          chunkSize: this.schema.chunkSize ? this.schema.chunkSize : 260096,
          dictFallbackMessage: this.$t("dropzone.dictFallbackMessage"),
          dictFallbackText: this.$t("dropzone.dictFallbackText"),
          dictFileTooBig: this.$t("dropzone.dictFileTooBig"),
          dictInvalidFileType: this.isEditorUpload ? "invalidFileType" : this.$t("dropzone.dictInvalidFileType"),
          dictResponseError: this.$t("dropzone.dictResponseError"),
          dictCancelUpload: this.$t("dropzone.dictCancelUpload"),
          dictUploadCanceled: this.$t("dropzone.dictUploadCanceled"),
          dictCancelUploadConfirmation: this.$t(
            "dropzone.dictCancelUploadConfirmation"
          ),
          dictRemoveFile: this.$t("dropzone.dictRemoveFile"),
          dictMaxFilesExceeded: this.$t("dropzone.dictMaxFilesExceeded"),
          dictDefaultMessage: this.getDefaultMessage(),
          dictRemoveFileConfirmation: this.$t(
            "dropzone.dictRemoveFileConfirmation"
          ),
          previewTemplate: '<div class="dz-preview dz-file-preview">\n  <div class="dz-image"><img data-dz-thumbnail /></div>\n  <div class="dz-details">\n    <div class="dz-size"><span data-dz-size></span></div>\n    <div class="dz-filename"><span data-dz-name></span></div>\n  </div>\n  <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>\n  <div class="dz-error-message"><span data-dz-errormessage></span></div>\n  <div class="dz-success-mark">\n    <svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">\n      <title>Check</title>\n      <defs></defs>\n      <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">\n        <path d="M23.5,31.8431458 L17.5852419,25.9283877 C16.0248253,24.3679711 13.4910294,24.366835 11.9289322,25.9289322 C10.3700136,27.4878508 10.3665912,30.0234455 11.9283877,31.5852419 L20.4147581,40.0716123 C20.5133999,40.1702541 20.6159315,40.2626649 20.7218615,40.3488435 C22.2835669,41.8725651 24.794234,41.8626202 26.3461564,40.3106978 L43.3106978,23.3461564 C44.8771021,21.7797521 44.8758057,19.2483887 43.3137085,17.6862915 C41.7547899,16.1273729 39.2176035,16.1255422 37.6538436,17.6893022 L23.5,31.8431458 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" stroke-opacity="0.198794158" stroke="#747474" fill-opacity="0.816519475" fill="#FFFFFF" sketch:type="MSShapeGroup"></path>\n      </g>\n    </svg>\n  </div>\n  <div class="dz-error-mark">\n    <svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">\n      <title>Error</title>\n      <defs></defs>\n      <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">\n        <g id="Check-+-Oval-2" sketch:type="MSLayerGroup" stroke="#747474" stroke-opacity="0.198794158" fill="#FFFFFF" fill-opacity="0.816519475">\n          <path d="M32.6568542,29 L38.3106978,23.3461564 C39.8771021,21.7797521 39.8758057,19.2483887 38.3137085,17.6862915 C36.7547899,16.1273729 34.2176035,16.1255422 32.6538436,17.6893022 L27,23.3431458 L21.3461564,17.6893022 C19.7823965,16.1255422 17.2452101,16.1273729 15.6862915,17.6862915 C14.1241943,19.2483887 14.1228979,21.7797521 15.6893022,23.3461564 L21.3431458,29 L15.6893022,34.6538436 C14.1228979,36.2202479 14.1241943,38.7516113 15.6862915,40.3137085 C17.2452101,41.8726271 19.7823965,41.8744578 21.3461564,40.3106978 L27,34.6568542 L32.6538436,40.3106978 C34.2176035,41.8744578 36.7547899,41.8726271 38.3137085,40.3137085 C39.8758057,38.7516113 39.8771021,36.2202479 38.3106978,34.6538436 L32.6568542,29 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" sketch:type="MSShapeGroup"></path>\n        </g>\n      </g>\n    </svg>\n  </div>\n</div>',
          acceptedFiles: this.schema.acceptedFiles ? this.schema.acceptedFiles : null,
          headers: {
            "x-xsrf-token": getCookie("XSRF-TOKEN"),
            "env": getEnv() ? getEnv() : 'prod',
            "requeststamp": '',
          },
          enableImageUpload: this.schema.enableImageUpload ? this.schema.enableImageUpload : false,
          transformFile: function (file, done) {
            var _this = this;
            if (!_this.options.enableImageUpload || file.size < 1000 * 200 || file.type.indexOf("image") === -1) {
              return done(file);
            }
            var _file = file;
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function (e) {
              var base64 = this.result;
              var img = new Image()
              img.src = base64;
              img.onload = function () {
                var _width = img.naturalWidth;
                var _height = img.naturalHeight;
                var _canvas = document.createElement('canvas');
                _canvas.setAttribute("width", _width);
                _canvas.setAttribute("height", _height);
                _canvas.getContext("2d").drawImage(img, 0, 0, _width, _height);
                _canvas.toBlob(function (blob) {
                  _this.options._size = blob.size;
                  return done(blob);
                }, _file.type !== "image/png" ? _file.type : "image/jpeg", 0.65);
              }
            }
          }
        },
        temporaryFile: "",
        removeurl: "",
        downloadurl: "",
        dropzoneValue: [],
        enablePdf: this.schema.enablePdf ? this.schema.enablePdf : false,
        thumbnailUrl: "",
        // 因为后台接受的Id 要求为objectId, 而dropzone 控件中 生成的为guid，所以需要一个字典来维护mapping 关系。用来多文件上传的时候匹配查询。
        thumbnailFiledic: [{
          fileuuId: "",
          fileobjectId: "",
          thumbnailUrl: "",
          thumbnailobjectId: ""
        }],
        isShowSnackbar: false,
        snackbarMessage: "",
        snackbarTimeout: 3000,
        snackbarColor: "",
        limitFileType: ',.exe,.com,.dll,.bat,.xml,.php,.aspx,.jsp,.asp,',
        loadType:'',
        largeFileId:[],
        allLargeFiles:'',
        newLargeFiles:'',
        allLargeFilesArr:[],
        newLargeFilesArr:[],
        allowLargeFileUpload: false,
        localemapping: {
          "zh-cn": "-zhcn",
          "en": "",
          "zh-tw": "-zhtw"
        },
        thumbnailobjectIdList: [],
        uploadArr:[],
        dialog: {
          title: 'Info',
          message: null,
          isShow: false,
          icon: 'pwc-close'
        },
        btnLoading: null
      };
    },
    methods: {
      ...mapMutations("app", [
        "setbuttonLoading",
        "setUploadOverlayProgress"
      ]),
      dragDropEvent(event){
        // console.log('event',event)
      },
      updateFileStatus(id) {
        this.allfileUploaded = true;
        this.fileListStatus.map(m => {
          if (m.fileId == id) {
            m.status = "uploaded";
          }
          if (m.status == 'uploading') {
            this.allfileUploaded = false;
          }
        });
        this.updateComponentStatus(this.schema.name, {
          "status": this.allfileUploaded == true ? "complete" : "uploading"
        });
        this.bus.$emit("$dmbus", this.$store.state.componentStatus);
      },      
      getDefaultMessage() {
        return this.$t("dropzone.dictDefaultMessage");
      },
      manuallyAddFileByEditor() {
        let _this = this;
        _this.$refs.myVueDropzone.removeAllFiles();
        _this.$nextTick(() => {
          document.querySelector('.' + _this.schema.model).click();
          if (_this.isEditorUpload) {
            _this.setUploadOverlayProgress('');
          }
        });
      },
      manuallyAddFileByImageUploader() {
        let _this = this;
        this.$refs.myVueDropzone.removeAllFiles();
        _this.$nextTick(() => {
          document.querySelector('.' + _this.schema.model).click();
          if (this.isImageUploader) {
            this.setUploadOverlayProgress('');
          }
        });
      },
      renderPdf() {
        if (
          this.schema.enablePdf &&
          this.pageMode.toLowerCase() == "preview"
        ) {
          return true;
        } else {
          return false;
        }
      },
      deleteFile() {
        let _this = this,
          id = document.getElementById("temFile").dataset.fileid.slice(0,-4),
          buttonElement = document.getElementById(id);
        //edit模式，已存在file
        const fileModel = document.getElementById("temFile").dataset.file;
        if(this.pageMode.toLowerCase() == "edit" && this.value && this.value.length > 0 && fileModel === "edit"){
          //computed fileSize
          let count = _this.count - _this.valLength + 1
          _this.count += 1;
          _this.$refs.myVueDropzone.setOption('maxFiles', count.toString());
          buttonElement.remove();
        }
        // //Last file left
        // if(!document.getElementsByClassName('dz-preview').length){
        //    _this.$refs.myVueDropzone.setOption('maxFiles', _this.schema.maxFiles);
        // }
        _this.$refs.myVueDropzone.removeFile(_this.temporaryFile)
        // pending,notsupported,dz-complete
        const _index = buttonElement.className.indexOf('dz-complete');
        if(_index !== -1){
          _this.removedFile(id)
        } else {
          _this.canceledFile(id);
        }
        _this.delDialog = false;
      },
      sendingFile(file, xhr, formData) {
        if(this.schema.largeFileEnabled && this.allowLargeFileUpload){
          this.allfileUploaded = false;
          //针对大文件上传特殊处理，直接发送请求，将file传递给minIO
          let _this = this;
          let _send = xhr.send;
          xhr.send = () => {
          _send.call(xhr, file);
          _this.setbuttonLoading(true);
          }
        } else {
          //重写headers
          this.generateHeaders();
          //文件类型检查
          var extType = "," + file.name.slice(file.name.lastIndexOf(".")).toLowerCase() + ",";
          if (this.limitFileType.indexOf(extType) != -1) {
            errorFlag = true;
            errorMsgs += this.$t("dropzone.invalidFileTypeMessage") + "(" + file.name + ") </br>";
            return;
          }
          this.allfileUploaded = false;
          var realSize = this.$refs.myVueDropzone.$refs.dropzoneElement.dropzone.options._size;
          formData.append("formAlias", this.schema.pageCode ? this.schema.pageCode : this.pageView);
          formData.append("documentId", this.schema.documentId ? this.schema.documentId :this.model._id);
          formData.append("realSize", realSize ? realSize : "");
          var reordindic = this.checkmatchGenerateId(file.upload.uuid);
          formData.append("dzuuobjectid", reordindic.fileobjectId);
          this.setbuttonLoading(true);
          if (this.isEditorUpload || this.isImageUploader) {
            this.$store.state.loading = true;
            formData.append("fieldName", this.schema.name);
          } else {
            formData.append("fieldName", this.schema.model);
          }
          var _find = require("lodash/find");
          let existItem = _find(this.fileListStatus, function (o) {
            return o.fileId == reordindic.fileobjectId;
          });
          if (!existItem) {
            this.fileListStatus.push({
              fileId: reordindic.fileobjectId,
              status: 'uploading'
            });
          }

          this.updateComponentStatus(this.schema.name, {
            "status": "uploading"
          });
          this.bus.$emit("$dmbus", this.$store.state.componentStatus);
        }
      },
      uuidv4() {
        var timestamp = ((new Date().getTime() / 1000) | 0).toString(16);
        return (
          timestamp +
          "xxxxxxxxxxxxxxxx"
          .replace(/[x]/g, function () {
            return ((Math.random() * 16) | 0).toString(16);
          })
          .toLowerCase()
        );
      },
      getThumbnailId(file){
        try {
          let resp = JSON.parse(file.xhr.responseText);
          let thumbnailIdItem = {
            uuid: file.upload.uuid,
            thumbnailId: resp.thumbnialFileId || "",
          }
          if(resp.thumbnialFileId) {
            this.thumbnailobjectIdList.push(thumbnailIdItem)
          }
        } catch (error) {
          // console.log("err==============",error)
        }
      },
      // method use to loop the dic to check if the uuid already exist. then return same objectid.
      checkmatchGenerateId(uuid, imageObject) {
        var baseurl = "/api/Downloadthumbnail";
        var matchrecord = this.thumbnailFiledic.filter(
          item => item.fileuuId === uuid
        );
        if (matchrecord.length > 0) {
          if (imageObject) {
            matchrecord[0].imageWidth = imageObject.imageWidth ? imageObject.imageWidth : '';
            matchrecord[0].imageHeight = imageObject.imageHeight ? imageObject.imageHeight : '';
          }
          return matchrecord[0];
        } else {
          // not in dic, create one for dictionary to find when next chunk arrive.
          var newthumbObjectid = this.uuidv4();
          var newitem = {
            fileuuId: uuid,
            fileobjectId: this.uuidv4(),
            thumbnailobjectId: newthumbObjectid,
            thumbnailUrl: baseurl +
              "?" +
              "fileId=" +
              newthumbObjectid +
              "&" +
              "docId=" +
              this.model._id
          };
          if (imageObject) {
            newitem.imageWidth = imageObject.imageWidth ? imageObject.imageWidth : '';
            newitem.imageHeight = imageObject.imageHeight ? imageObject.imageHeight : '';
          }

          this.thumbnailFiledic.push(newitem);
          return newitem;
        }
      },
      uploadComplete(file, response) {
        var _this = this;
        var resp = {result:''};
        if(this.schema.largeFileEnabled && this.allowLargeFileUpload){
          resp.result = true
        } else {
          resp = JSON.parse(file.xhr.responseText);
          _this.getThumbnailId(file)
        }
        if (!resp.result) {
          switch (resp.errorCode) {
            case "0x00NA01":
              _this.snackbarMessage = this.$t("dropzone.invalidFileTypeMessage");
              break;
            default:
              _this.snackbarMessage = this.$t("dropzone.uploadFileError");
              break;
          }
          _this.isShowSnackbar = true;
          setTimeout(function () {
            _this.snackbarMessage = "";
          }, _this.snackbarTimeout);
        }
        var thumbnailId = '', thumbnailUrl = '', transferId = '', transferFileUrl = '', imageWidth, imageHeight = '';
        if (_this.dropzoneOptions.createImageThumbnails) {
          imageWidth = _this.checkmatchGenerateId(file.upload.uuid).imageWidth;
          imageHeight = _this.checkmatchGenerateId(file.upload.uuid).imageHeight;
        }

        let strOriginalFileUrl = "/api/DownloadFile" +
          "?pageCode=" +
          _this.pageView +
          "&fileid=" +
          resp.fileId +
          "&docId=" +
          _this.model._id +
          "&fieldName=",
          imgStrOriginalFileUrl = 
           "/api/DonwloadImage" +
          "?pageCode=" +
          _this.pageView +
          "&fileid=" +
          resp.fileId +
          "&docId=" +
          _this.model._id +
            "&fieldName=";
        //动态拼接thumbnailId
        let thumbnailItem = _this.thumbnailobjectIdList.filter(
          item => item.uuid === file.upload.uuid
        );
        if (thumbnailItem[0] && thumbnailItem[0].thumbnailId) {
          thumbnailId = thumbnailItem[0].thumbnailId;
          thumbnailUrl = "/api/Downloadthumbnail" +
            "?pageCode=" +
            _this.pageView +
            "&fileid=" +
            thumbnailId +
            "&docId=" +
            _this.model._id +
            "&fieldName=" +
            _this.schema.model;
        } 
        if (resp.pdfFileId) {
          transferId = resp.pdfFileId;
          transferFileUrl = "/api/DownloadFile" +
            "?pageCode=" +
            _this.pageView +
            "&fileid=" +
            transferId +
            "&docId=" +
            _this.model._id +
            "&fieldName=" +
            _this.schema.model;
        } 
        if (this.isEditorUpload || this.isImageUploader) {
          //editorUpload和imageUploader单独处理下载URL
          strOriginalFileUrl = strOriginalFileUrl + this.schema.name;
          imgStrOriginalFileUrl = imgStrOriginalFileUrl + this.schema.name;
        } else {
          strOriginalFileUrl = strOriginalFileUrl + this.schema.model;
        }
        var result = {
          id: resp.fileId,
          fileGuid: _this.checkmatchGenerateId(file.upload.uuid).fileuuId,
          thumbnailobjectId: thumbnailId,
          transferId: transferId,
          thumbnailUrl: thumbnailUrl, // this.thumbnailUrl,
          originalFileUrl: strOriginalFileUrl,
          transferFileUrl: transferFileUrl,
          name: file.name,
          size: file.size,
          imageWidth: imageWidth,
          imageHeight: imageHeight,
          largeFileEnabled: this.schema.largeFileEnabled
        };
        if (_this.isEditorUpload) {
          _this.addFileToPendingList(resp.fileId);
          let uploadResult = {
            url: result.originalFileUrl + (getEnv() ? '&env=' + getEnv() : ''),
            imgUrl: imgStrOriginalFileUrl + (getEnv() ? '&env=' + getEnv() : ''),
            fileId: resp.fileId,
            fileName: file.name,
            hasError: false,
            errorMessage: '',
            showImage: _this.schema.model.indexOf('-uploadImageByDropzone') != -1 ? true : false
          };
          _this.EditorManager.InsertResource(uploadResult);
          _this.updateFileStatus(resp.fileId);
          if (_this.allfileUploaded) {
            _this.setbuttonLoading(false);
            _this.fileListStatus = [];
          }
          return;
        } else if (_this.isImageUploader) {
          _this.addFileToPendingList(resp.fileId);
          result.originalFileUrl = imgStrOriginalFileUrl;
          _this.ImageUploaderManager.InsertResource(-1, result);
          _this.updateFileStatus(resp.fileId);
          if (_this.allfileUploaded) {
            _this.setbuttonLoading(false);
            _this.fileListStatus = [];
          }
          //if (_this.value) {
          //  _this.value.push(result);
          //} else {
          //  _this.value = [];
          //  _this.value.push(result);
          //}
          return;
        } else {
          //this is fileupload component
          if(this.schema.largeFileEnabled && this.allowLargeFileUpload){
            let uploadFileId = this.largeFileId.filter(el=>el.fileName == file.name)[0].fileId
            //大文件url拼接
            let commonUrl = "/api/downloadLargeFile" +
              "?pageCode=" +
              this.pageView +
              "&fileid=" +
              uploadFileId +
              "&docId=" +
              this.model._id +
              "&fieldName=" +
              this.schema.model;
            result.transferFileUrl = commonUrl + "&fileType=transfer";
            result.originalFileUrl = commonUrl + "&fileType=original";
            result.thumbnailUrl = commonUrl + "&fileType=thumbnail";
            result.id = uploadFileId;
            //将search相关数据append到model上
            Object.assign(_this.model,{'Ng_AllLargeFiles': _this.allLargeFiles},{'Ng_NewLargeFiles': _this.newLargeFiles});
            if (this.value) {
              this.value.push(result);
            } else {
              this.value = [];
              this.value.push(result);
            }
            //确定都上传完了，释放按钮loading，允许用户点击按钮提交数据，并清空fileListStatus
            if(file.xhr.status === 200){
              clearInterval(_this.btnLoading);
              _this.btnLoading = null;
            }
            this.addFileToPendingList(result.fileGuid);
            this.updateFileStatus(result.fileGuid);
            if (this.allfileUploaded) {
              this.setbuttonLoading(false);
              this.fileListStatus = [];
            }
            return
          } else {
            // transferPdf
            if (_this.enablePdf) {
              //enable文件预览，因现在处理文件需要排队，除图片类型外的文件统一给一个别针的默认图片
              _this.addFileToPendingList(resp.fileId);
              _this.validate();
              _this.updateFileStatus(resp.fileId);
              if (_this.value) {
                _this.value.push(result);
              } else {
                _this.value = [];
                _this.value.push(result);
              }
              const extType = file.name.slice(file.name.lastIndexOf(".")).toLowerCase(),
                limitString = ".png,.jpg,.jpeg,.gif,.bmp";
              if (limitString.indexOf(extType) == -1) {
                let imgElement = file.previewElement.querySelector(".dz-image img");
                imgElement.src= this.$store.getters.cdnHostAndVersionPath + "/static/images/sample.png";
              }
              _this.setbuttonLoading(false);
              _this.isShowSnackbar = true;
              _this.fileListStatus = [];

            } else {
              // normal file upload
              const extType = file.name.slice(file.name.lastIndexOf(".")).toLowerCase(),
                limitString = ".png,.jpg,.jpeg,.gif,.bmp";
              if (limitString.indexOf(extType) == -1) {
                let imgElement = file.previewElement.querySelector(".dz-image img");
                imgElement.src= this.$store.getters.cdnHostAndVersionPath + "/static/images/sample.png";
              }
              if (_this.value) {
                _this.value.push(result);
              } else {
                _this.value = [];
                _this.value.push(result);
              }
              _this.addFileToPendingList(resp.fileId);
              _this.validate();
              _this.updateFileStatus(resp.fileId);
              //确定都上传完了，释放按钮loading，允许用户点击按钮提交数据，并清空fileListStatus
              if (_this.allfileUploaded) {
                _this.setbuttonLoading(false);
                _this.fileListStatus = [];
              }
            }
          }
        }
      },
      thumbnailGenerated(file, dataUrl) {
        //this will called in
        // 1. add new file, generate thumbnail
        if (dataUrl && dataUrl.indexOf("data:image/png;base64") >= 0 && !this.enablePdf) {
          let thumnailObject = {
            imageWidth: file.width,
            imageHeight: file.height
          }
          this.$axios
            .post("/api/UploadThumbnail", {
              formAlias: this.pageView,
              documentId: this.model._id,
              fieldName: this.schema.model,
              dzuuobjectid: this.checkmatchGenerateId(file.upload.uuid, thumnailObject)
                .thumbnailobjectId,
              thumbnail: dataUrl.split(",")[1]
            })
            .then(({
              data
            }) => {
              var thumbnailobjectId = this.checkmatchGenerateId(file.upload.uuid, thumnailObject).thumbnailobjectId;
              //this.addFileToPendingList(thumbnailobjectId);
              return thumbnailobjectId;
            });
        } else {
          // 2. load saved file, load thumbnail from url.
        }
      },
      totalUploadProgress(totaluploadprogress, totalBytes, totalBytesSent) {
        // console.log(totalBytes)
        // console.log(totalBytesSent)
        //this.setbuttonLoading(true);
      },
      uploadProgress(file, progress, bytesSent) {
        const _this = this;
        let progressElement = file.previewElement.querySelector("[data-dz-uploadprogress]");
        if(this.schema.largeFileEnabled && this.allowLargeFileUpload){
          if(file.xhr.status == 0 && progress < 90){
            progressElement.style.width = progress + "%"
          } else if(file.xhr.status == 0 && progress > 90){
            progressElement.style.width = 90 + "%"
          } else {
            progressElement.style.width = 100 + "%"
            file.upload.progress = 100
          }
        }
        if (this.isEditorUpload) {
          if (progress != 100) {
            this.setUploadOverlayProgress(Math.round(progress) + '%');
          } else if (bytesSent > file.size) {
            this.setUploadOverlayProgress(Math.round(progress) + '%');
          }
        } else if (this.isImageUploader) {
          if (progress === 100) {
            this.ImageUploaderManager.InsertResource(progress, file);
          }
        } else if(this.schema.largeFileEnabled && this.allowLargeFileUpload){
          if(!_this.btnLoading){
            this.btnSetInterval() 
          }
        }
      },
      //button定时器
      btnSetInterval(){
        const _this = this;
        _this.btnLoading = setInterval(() => {
          _this.setbuttonLoading(true);
        }, 800)  
      },
      removedFile(uuid, error, xhr) {
        var _this = this;
        if (_this.value == undefined) {
          return;
        }
        var match = this.value.filter(function (item, index, array) {
          //针对大文件删除匹配项
          if(_this.allowLargeFileUpload && _this.schema.largeFileEnabled){
            return (
              item.fileGuid == uuid
            );
          } else {
            return (
              item.id == _this.checkmatchGenerateId(uuid).fileobjectId
            );
          }
        });
        var remains = this.value.filter(function (item, index, array) {
          //针对大文件删除过滤
          if(_this.allowLargeFileUpload && _this.schema.largeFileEnabled){
            return (
              item.fileGuid != uuid
            );
          } else {
            return (
             item.id != _this.checkmatchGenerateId(uuid).fileobjectId
            );
          }
        });
        // console.log(match);
        // add this file to Ng_DeleteFileIds array
        // thumbnail remove, need to put it in Ng_DeleteFileIds
        this.addFileToDeleteList(
          _this.checkmatchGenerateId(uuid).thumbnailobjectId
        );
        if (match && match.length > 0) {
          this.addFileToDeleteList(match[0].id);
        }

        var matchrecord = this.thumbnailFiledic.filter(
          item => item.fileuuId === uuid
        );
        let _pullAll = require('lodash/pullAll');
        _pullAll(this.thumbnailFiledic, matchrecord);
        this.value = remains;
        if(_this.allowLargeFileUpload && _this.schema.largeFileEnabled){
          _this.value.forEach(item => {
            //针对大文件删除文件，Ng_AllLargeFiles,Ng_NewLargeFiles数据更新
            if(uuid === item.fileGuid){
              let arr = _this.model.Ng_AllLargeFiles.split(",")
              arr.splice(arr.findIndex(subItem => subItem.includes(item.id)),1)
              _this.allLargeFiles = arr.toString();
              _this.newLargeFiles = _this.allLargeFiles
              Object.assign(_this.model,{'Ng_AllLargeFiles': _this.allLargeFiles},{'Ng_NewLargeFiles': _this.newLargeFiles})
            }
          })
        }
      },
      // fileid operations for pending and delete.
      addFileToDeleteList(fileId) {
        if (!fileId) {
          return;
        }
        if (!this.model.Ng_DeleteFileIds) {
          this.model.Ng_DeleteFileIds = [fileId];
          // set(this.model, "Ng_DeleteFileIds", [fileId]);
        } else {
          if (!this.model.Ng_DeleteFileIds.includes(fileId)) {
            this.model.Ng_DeleteFileIds.push(fileId);
          }
        }
        if (this.model.Ng_PendingFileIds && !this.model.Ng_PendingFileIds.includes(fileId)) {
          let _pullAll = require('lodash/pullAll');
          _pullAll(this.model.Ng_PendingFileIds, [fileId]);
        }
      },
      addFileToPendingList(fileId) {
        if (!fileId) {
          return;
        }
        //排除大文件插入Ng_PendingFileIds中
        if(this.allowLargeFileUpload && this.schema.largeFileEnabled) {
          return;
        } else {
          if (!this.model.Ng_PendingFileIds) {
            this.model.Ng_PendingFileIds = [fileId];
          } else {
            if (!this.model.Ng_PendingFileIds.includes(fileId)) {
              this.model.Ng_PendingFileIds.push(fileId);
            }
          }
        }
      },
      clearFileStatus(uuid) {
        let _this = this;
        var reordindic = _this.checkmatchGenerateId(uuid);
        _this.updateFileStatus(reordindic.fileobjectId);
        _this.addFileToDeleteList(
          reordindic.fileobjectId
        );
        _this.setbuttonLoading(false);
        if(this.schema.largeFileEnabled && this.allowLargeFileUpload){
          clearInterval(_this.btnLoading); 
          _this.btnLoading = null;
          _this.setbuttonLoading(false);
        }
      },
      canceledFile(uuid) {
        this.clearFileStatus(uuid);
      },
      error(file, msg) {
        let _this = this;
        let errorMsgs = '';
        let errorFlag = false;
        _this.clearFileStatus(file.upload.uuid);

        //文件类型检查
        var extType = "," + file.name.slice(file.name.lastIndexOf(".")).toLowerCase() + ",";
        if (this.limitFileType.indexOf(extType) != -1) {
          errorFlag = true;
          errorMsgs += _this.$t("dropzone.invalidFileTypeMessage") + "(" + file.name + ") </br>";
          _this.$refs.myVueDropzone.removeFile(file);
        } else if (file.status == "error") {
          errorFlag = true;
          errorMsgs = msg;
          _this.$refs.myVueDropzone.removeFile(file);
        }
        if (_this.isImageUploader) {
          _this.ImageUploaderManager.errorMsgMethod(file, msg);
        }
        if (errorFlag) {
          _this.snackbarMessage = errorMsgs;
          _this.isShowSnackbar = true;
          setTimeout(function () {
            _this.snackbarMessage = "";
          }, _this.snackbarTimeout);
        }

        if (_this.isImageUploader) {
          _this.ImageUploaderManager.errorMsgMethod(file, msg);
        }
        
      },
      filesAdd(file) {
        let _this = this;
        let errorMsgs = '';
        let errorFlag = false;
        var _forEach = require("lodash/forEach");
        let uploadArr = [];
        _forEach(file, function (m,index) {
          //超出maxFiles限制后处理逻辑
          if((file.length + _this.model[_this.schema.name].length > _this.schema.maxFiles) && !_this.isEditorUpload &&  !_this.isImageUploader) {
            let uuid = m.upload.uuid;
            let fileGuid = _this.checkmatchGenerateId(uuid).fileGuid;
            _this.canceledFile(fileGuid);
            _this.$refs.myVueDropzone.removeFile(m);
            _this.snackbarMessage = _this.$t(
                    "dropzone.dictFileTooMany"
                  ).replace("{maxfile}", _this.schema.maxFiles)
            _this.isShowSnackbar = true;
            setTimeout(function () {
              _this.snackbarMessage = "";
            }, _this.snackbarTimeout);
          }
          //文件类型检查
          var extType = "," + m.name.slice(m.name.lastIndexOf(".")).toLowerCase() + ",";
          if (_this.limitFileType.indexOf(extType) != -1) {
            errorFlag = true;
            errorMsgs += _this.$t("dropzone.invalidFileTypeMessage") + "(" + m.name + ") </br>";
            _this.$refs.myVueDropzone.removeFile(m)
            return;
          }
          if(_this.allowLargeFileUpload && _this.schema.largeFileEnabled && m.status !== 'error'){
            //判断大文件上传请求
              const params = {};
              params.requestURL = _this.pageView + "/getLargeFileUploadInfo/" + _this.model._id;
              params.FileSize = m.size;
              params.FileName = m.name;
              params.Field = _this.schema.name;
              params.Expiration = FILE_UPLOAD_EXPIRATION;
              _this.$axios
              .post(
                '/api/PostJObjectResult',
                params
              )
              .then(({ data }) => {
                if(data){
                  uploadArr.push(data);
                  //存储minIO Url集合
                  if(file.length == uploadArr.length){
                    //数组重新排序
                    _this.uploadArr = _this.sortArr(uploadArr,file);
                    //手动上传
                    _this.$refs.myVueDropzone.processQueue();
                  }
                  //存储id 集合
                  _this.largeFileId.push(data);
                  // search相关
                  let fileSyncId = data.fileSyncId;
                  _this.allLargeFilesArr.push(fileSyncId);
                  _this.newLargeFilesArr.push(fileSyncId);
                  _this.allLargeFiles = _this.allLargeFilesArr.toString();
                  _this.newLargeFiles = _this.newLargeFilesArr.toString()
                }
              })
            }
        })
        if (_this.isEditorUpload && errorFlag) {
          let uploadResult = {
            url: "",
            fileId: "",
            fileName: "",
            hasError: errorFlag,
            errorMessage: errorMsgs,
            showImage: false
          };

          _this.EditorManager.InsertResource(uploadResult);
          return;
        }
        if (errorFlag) {
          _this.snackbarMessage = errorMsgs;
          _this.isShowSnackbar = true;
          setTimeout(function () {
            _this.snackbarMessage = "";
          }, _this.snackbarTimeout);
        }  
      },
      sortArr(returnArr,fileArr){
        let resArr = [];
        for(let i = 0;i<fileArr.length;i++){
          let item = returnArr.find(obj => {
            return obj.fileName == fileArr[i].name
          })
          resArr.push(item.uploadUrl)
        }
        return resArr
      },
      uploadProcessing(file) {
        let _this = this;
        if(_this.schema.largeFileEnabled && _this.allowLargeFileUpload){
          _this.$refs.myVueDropzone.setOption('method', 'put');
          _this.$refs.myVueDropzone.dropzone.options.url = _this.uploadArr.shift();
        }
        //Add Delete Event
        //file.previewElement.querySelector(".dz-remove").remove();
        if(_this.isEditorUpload || _this.isImageUploader){
          // isEditorUpload || isImageUploader不做处理
        } else{
          let spanElement = document.createElement('span');
          spanElement.className = "dz-remove";
          //spanElement.className +=" "+ file.upload.uuid
          spanElement.innerHTML = this.$t("dropzone.dictRemoveFile");
          file.previewElement.append(spanElement)
          spanElement.onclick = function () {
            _this.delDialog = true;
            let fileElement = document.querySelector("#temFile");
            fileElement.dataset.fileid = file.upload.uuid + 'Guid';
            _this.temporaryFile = file;
            fileElement.dataset.file = 'add';
          };
          file.previewElement.setAttribute("id", file.upload.uuid);
        }
      },
      reWriteConfirm() {
        window.confirm = function (title, message, callback) {
          this.messageDialog.showMsg("Dcoument has beed successfully saved.");
        }
      },
      loadData() {
        let _this = this;
        if (this.pageMode.toLowerCase() != "add" && this.value && this.value.length > 0) {
          this.valLength = this.value.length
          let url , downloadUrl, fileDownloadUrl = "";
          this.value.forEach((key,index) => {
            if(key.largeFileEnabled && (key.transferId == "" || key.transferId == null)){
              let imageUrl = '';
              let file = {
                name: key.name,
                size: key.size,
                status: "success",
                // this is always image.
                type: "image/png",
                upload: {
                  uuid: key.fileGuid,
                  objectid: key.id,
                  filename: key.name
                }
              };
              url = key.thumbnailUrl;
              downloadUrl = key.originalFileUrl;
              //请求缩略图实际接口拿数据
              this.$axios.get(url).then(data => {
                if(data.data.status == 'pending' || data.data.status == 'notsupported'){
                  imageUrl = this.$store.getters.cdnHostAndVersionPath + "/static/images/sample.png";
                } else if(data.data.status == "completed"){
                  if(_this.schema.enableThumbnail){
                    imageUrl = data.data.url;
                  } else {
                    imageUrl = _this.$store.getters.cdnHostAndVersionPath + "/static/images/sample.png";
                  }
                  
                }
              }).then(()=>{
                _this.$refs.myVueDropzone.dropzone.options.previewTemplate = "";
                _this.$refs.myVueDropzone.dropzone.options.previewTemplate =
                '<div class="dz-preview dz-file-preview" id="' + key.fileGuid +
                  '">\n  <div class="dz-image"><img id=" '+ index +'" data-dz-thumbnail src="' +
                imageUrl +
                '" /></div>\n  <div class="dz-details">\n    <div class="dz-size"><span data-dz-size></span></div>\n    <div class="dz-filename">' +
                '<span data-dz-name></span>' +
                '</div>\n  </div>\n  <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>\n  <div class="dz-error-message"><span data-dz-errormessage></span></div>\n  <div class="dz-success-mark">\n    <svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">\n      <title>Check</title>\n      <defs></defs>\n      <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">\n        <path d="M23.5,31.8431458 L17.5852419,25.9283877 C16.0248253,24.3679711 13.4910294,24.366835 11.9289322,25.9289322 C10.3700136,27.4878508 10.3665912,30.0234455 11.9283877,31.5852419 L20.4147581,40.0716123 C20.5133999,40.1702541 20.6159315,40.2626649 20.7218615,40.3488435 C22.2835669,41.8725651 24.794234,41.8626202 26.3461564,40.3106978 L43.3106978,23.3461564 C44.8771021,21.7797521 44.8758057,19.2483887 43.3137085,17.6862915 C41.7547899,16.1273729 39.2176035,16.1255422 37.6538436,17.6893022 L23.5,31.8431458 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" stroke-opacity="0.198794158" stroke="#747474" fill-opacity="0.816519475" fill="#FFFFFF" sketch:type="MSShapeGroup"></path>\n      </g>\n    </svg>\n  </div>\n  <div class="dz-error-mark">\n    <svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">\n      <title>Error</title>\n      <defs></defs>\n      <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">\n        <g id="Check-+-Oval-2" sketch:type="MSLayerGroup" stroke="#747474" stroke-opacity="0.198794158" fill="#FFFFFF" fill-opacity="0.816519475">\n          <path d="M32.6568542,29 L38.3106978,23.3461564 C39.8771021,21.7797521 39.8758057,19.2483887 38.3137085,17.6862915 C36.7547899,16.1273729 34.2176035,16.1255422 32.6538436,17.6893022 L27,23.3431458 L21.3461564,17.6893022 C19.7823965,16.1255422 17.2452101,16.1273729 15.6862915,17.6862915 C14.1241943,19.2483887 14.1228979,21.7797521 15.6893022,23.3461564 L21.3431458,29 L15.6893022,34.6538436 C14.1228979,36.2202479 14.1241943,38.7516113 15.6862915,40.3137085 C17.2452101,41.8726271 19.7823965,41.8744578 21.3461564,40.3106978 L27,34.6568542 L32.6538436,40.3106978 C34.2176035,41.8744578 36.7547899,41.8726271 38.3137085,40.3137085 C39.8758057,38.7516113 39.8771021,36.2202479 38.3106978,34.6538436 L32.6568542,29 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" sketch:type="MSShapeGroup"></path>\n        </g>\n      </g>\n    </svg>\n  </div>\n'
                  + (_this.pageMode !== 'preview' ? '<span class="dz-remove" id="' + key.fileGuid + _this.schema.name + '">'+_this.$t("dropzone.dictRemoveFile")+'</span>\n</div>' : '</div>')
                if (_this.isEdit) {
                  //_this.$refs.myVueDropzone.dropzone.options.addRemoveLinks = true;
                  //每次上传对模板进行初始化
                  _this.$nextTick(() => {
                    //Add Delete Event
                    document.getElementById(key.fileGuid).onclick = function () {
                      _this.delDialog = true;
                      let fileElement = document.querySelector("#temFile");
                      fileElement.dataset.fileid = key.fileGuid + 'Guid';
                      fileElement.dataset.file = 'edit';
                    };
                
                    _this.$refs.myVueDropzone.dropzone.options.previewTemplate = _this.dropzoneOptions.previewTemplate;
                  })
                };
                //to fill up the thumbnailFiledic
                var matchrecord = _this.thumbnailFiledic.filter(
                  item => item.fileuuId === key.fileGuid
                );
                if (matchrecord.length <= 0) {
                  var newitem = {
                    fileuuId: key.fileGuid,
                    fileobjectId: key.id,
                    thumbnailobjectId: key.thumbnailobjectId,
                    thumbnailUrl: key.thumbnailUrl
                  };
                  _this.thumbnailFiledic.push(newitem);
                  _this.$refs.myVueDropzone.manuallyAddFile(file, imageUrl);
                }
              });
              //请求下载链接实际接口拿数据
              this.$axios.get(downloadUrl).then(data => {
                if(data.data.status == "pending"){
                  fileDownloadUrl = ''
                } else if(data.data.status == "completed"){
                  fileDownloadUrl = data.data.url
                }
              }).then(() => {
                _this.$refs.myVueDropzone.dropzone.options.previewTemplate = "";
                _this.$refs.myVueDropzone.dropzone.options.previewTemplate =
                  '<div class="dz-preview dz-file-preview" id="' + key.fileGuid +
                    '">\n  <div class="dz-image"><img id=" '+ index +'" data-dz-thumbnail src="' +
                  imageUrl +
                  '" /></div>\n  <div class="dz-details">\n    <div class="dz-size"><span data-dz-size></span></div>\n    <div class="dz-filename">' +
                  '<span data-dz-name></span>' +
                  '</div>\n  </div>\n  <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>\n  <div class="dz-error-message"><span data-dz-errormessage></span></div>\n  <div class="dz-success-mark">\n    <svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">\n      <title>Check</title>\n      <defs></defs>\n      <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">\n        <path d="M23.5,31.8431458 L17.5852419,25.9283877 C16.0248253,24.3679711 13.4910294,24.366835 11.9289322,25.9289322 C10.3700136,27.4878508 10.3665912,30.0234455 11.9283877,31.5852419 L20.4147581,40.0716123 C20.5133999,40.1702541 20.6159315,40.2626649 20.7218615,40.3488435 C22.2835669,41.8725651 24.794234,41.8626202 26.3461564,40.3106978 L43.3106978,23.3461564 C44.8771021,21.7797521 44.8758057,19.2483887 43.3137085,17.6862915 C41.7547899,16.1273729 39.2176035,16.1255422 37.6538436,17.6893022 L23.5,31.8431458 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" stroke-opacity="0.198794158" stroke="#747474" fill-opacity="0.816519475" fill="#FFFFFF" sketch:type="MSShapeGroup"></path>\n      </g>\n    </svg>\n  </div>\n  <div class="dz-error-mark">\n    <svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">\n      <title>Error</title>\n      <defs></defs>\n      <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">\n        <g id="Check-+-Oval-2" sketch:type="MSLayerGroup" stroke="#747474" stroke-opacity="0.198794158" fill="#FFFFFF" fill-opacity="0.816519475">\n          <path d="M32.6568542,29 L38.3106978,23.3461564 C39.8771021,21.7797521 39.8758057,19.2483887 38.3137085,17.6862915 C36.7547899,16.1273729 34.2176035,16.1255422 32.6538436,17.6893022 L27,23.3431458 L21.3461564,17.6893022 C19.7823965,16.1255422 17.2452101,16.1273729 15.6862915,17.6862915 C14.1241943,19.2483887 14.1228979,21.7797521 15.6893022,23.3461564 L21.3431458,29 L15.6893022,34.6538436 C14.1228979,36.2202479 14.1241943,38.7516113 15.6862915,40.3137085 C17.2452101,41.8726271 19.7823965,41.8744578 21.3461564,40.3106978 L27,34.6568542 L32.6538436,40.3106978 C34.2176035,41.8744578 36.7547899,41.8726271 38.3137085,40.3137085 C39.8758057,38.7516113 39.8771021,36.2202479 38.3106978,34.6538436 L32.6568542,29 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" sketch:type="MSShapeGroup"></path>\n        </g>\n      </g>\n    </svg>\n  </div>\n'
                    + (_this.pageMode !== 'preview' ? '<span class="dz-remove" id="' + key.fileGuid + _this.schema.name + '">'+_this.$t("dropzone.dictRemoveFile")+'</span>\n</div>' : '</div>')
                  if (_this.isEdit) {
                    //_this.$refs.myVueDropzone.dropzone.options.addRemoveLinks = true;
                    //每次上传对模板进行初始化
                    _this.$nextTick(() => {
                      //Add Delete Event
                      document.getElementById(key.fileGuid).onclick = function () {
                        _this.delDialog = true;
                        let fileElement = document.querySelector("#temFile");
                        fileElement.dataset.fileid = key.fileGuid + 'Guid';
                        fileElement.dataset.file = 'edit';
                      };
                      _this.$refs.myVueDropzone.dropzone.options.previewTemplate = _this.dropzoneOptions.previewTemplate;
                    })
                  };
              });
            } else {
              _this.loadNomalFileData(key)
            } 
          })
        }
      },
      // Nomal file data
      loadNomalFileData(key){
        const _this = this;
        var imageUrl, url = "";
        var file = {
          name: key.name,
          size: key.size,
          status: "success",
          type: "image/png",
          upload: {
            uuid: key.fileGuid,
            objectid: key.id,
            filename: key.name
          }
        };
        url = key.thumbnailUrl || "";
        //兼容旧数据，直接从model里取值，如没有走getFileStatus接口拼接imageUrl
        let fileUploadInfo = _this.model[_this.schema.model].filter(val => {
          return val.id == key.id
        })
        if(fileUploadInfo[0].thumbnailUrl){
          //旧数据
          imageUrl = window.location.origin + pathTrans(fileUploadInfo[0].thumbnailUrl)
        } else if(!_this.schema.enableThumbnail) {
          // load thumbnail
          imageUrl = this.$store.getters.cdnHostAndVersionPath + "/static/images/sample.png";
        } else {
          if (this.pageMode == "preview") {
             //处理病毒扫描，开启缩略图，但是未开启预览
            if(this.schema.enableThumbnail && !this.schema.enablePdf){
                _this.getFileStatus(key.id).then(data =>{
                  const _data = data.data;
                  if(_data.status != 'ok'){ 
                    //状态没完成给默认曲别针图
                    imageUrl = this.$store.getters.cdnHostAndVersionPath + "/static/images/sample.png";
                  } else {
                    //用户上传不可转换为图片的格式时，需要做处理
                    if(_data.thumbnailFileId == null) {
                      imageUrl = this.$store.getters.cdnHostAndVersionPath + "/static/images/sample.png";
                    } else {
                      //状态完成请求接口获取thumbnailFileId
                      let srcUrl =  "/api/Downloadthumbnail" +
                      "?pageCode=" +
                      _this.pageView +
                      "&fileid=" +
                      _data.thumbnailFileId +
                      "&docId=" +
                      _this.model._id +
                      "&fieldName="+
                      _this.schema.model;
                    imageUrl = window.location.origin + pathTrans(srcUrl);
                    }
                  }
                })
            }
          } else if(this.pageMode == "edit") {
            _this.getFileStatus(key.id).then(data =>{
              const _data = data.data;
              if(_data.status != 'ok'){
                //状态没完成给默认曲别针图
                imageUrl = this.$store.getters.cdnHostAndVersionPath + "/static/images/sample.png";
              } else {
                  if(_data.thumbnailFileId == null) {
                    imageUrl = this.$store.getters.cdnHostAndVersionPath + "/static/images/sample.png";
                  } else {
                    //状态完成请求接口获取thumbnailFileId
                    let  srcUrl =  "/api/Downloadthumbnail" +
                        "?pageCode=" +
                        _this.pageView +
                        "&fileid=" +
                        _data.thumbnailFileId +
                        "&docId=" +
                        _this.model._id +
                        "&fieldName="+
                        _this.schema.model;
                    imageUrl = window.location.origin + pathTrans(srcUrl);
                  }
              }
            })
          } else {
            imageUrl = this.$store.getters.cdnHostAndVersionPath + "/static/images/sample.png";
          }
        }
        var wait = setInterval(function(){  
            //判断url不为空
            if (imageUrl) {
              clearInterval(wait);
               //生成模板
              var filedownloadUrl = window.location.origin + pathTrans(key.originalFileUrl);
                _this.$refs.myVueDropzone.dropzone.options.previewTemplate =
                  '<div class="dz-preview dz-file-preview" id="' + key.fileGuid + '">\n'
                  + ' <div class="dz-image"><img data-dz-thumbnail src="' + imageUrl + '" /></div>\n'
                + (_this.pageMode !== 'preview' ? '<button id="refresh_' + key.fileGuid + '" type="button" class="v-btn v-btn--flat v-btn--text theme--dark v-size--default" style="top:0;padding:0px;justify-content:flex-end;position:absolute;z-index:888;width:100%;"><span class="v-btn__content"><i style="font-size:36px" aria-hidden="true" class="v-icon notranslate pwc pwc-icon pwc-refresh-outline theme--dark" style="font-size: 50px;"></i></span></button>\n' : '')
                  +' <div class="dz-details">\n    <div class="dz-size"><span data-dz-size></span></div>\n    <div class="dz-filename">' +
                  '<span data-dz-name></span>' +
                    '</div>\n  </div>\n  <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>\n  <div class="dz-error-message"><span data-dz-errormessage></span></div>\n  <div class="dz-success-mark">\n    <svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">\n      <title>Check</title>\n      <defs></defs>\n      <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">\n        <path d="M23.5,31.8431458 L17.5852419,25.9283877 C16.0248253,24.3679711 13.4910294,24.366835 11.9289322,25.9289322 C10.3700136,27.4878508 10.3665912,30.0234455 11.9283877,31.5852419 L20.4147581,40.0716123 C20.5133999,40.1702541 20.6159315,40.2626649 20.7218615,40.3488435 C22.2835669,41.8725651 24.794234,41.8626202 26.3461564,40.3106978 L43.3106978,23.3461564 C44.8771021,21.7797521 44.8758057,19.2483887 43.3137085,17.6862915 C41.7547899,16.1273729 39.2176035,16.1255422 37.6538436,17.6893022 L23.5,31.8431458 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" stroke-opacity="0.198794158" stroke="#747474" fill-opacity="0.816519475" fill="#FFFFFF" sketch:type="MSShapeGroup"></path>\n      </g>\n    </svg>\n  </div>\n  <div class="dz-error-mark">\n    <svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">\n      <title>Error</title>\n      <defs></defs>\n      <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">\n        <g id="Check-+-Oval-2" sketch:type="MSLayerGroup" stroke="#747474" stroke-opacity="0.198794158" fill="#FFFFFF" fill-opacity="0.816519475">\n          <path d="M32.6568542,29 L38.3106978,23.3461564 C39.8771021,21.7797521 39.8758057,19.2483887 38.3137085,17.6862915 C36.7547899,16.1273729 34.2176035,16.1255422 32.6538436,17.6893022 L27,23.3431458 L21.3461564,17.6893022 C19.7823965,16.1255422 17.2452101,16.1273729 15.6862915,17.6862915 C14.1241943,19.2483887 14.1228979,21.7797521 15.6893022,23.3461564 L21.3431458,29 L15.6893022,34.6538436 C14.1228979,36.2202479 14.1241943,38.7516113 15.6862915,40.3137085 C17.2452101,41.8726271 19.7823965,41.8744578 21.3461564,40.3106978 L27,34.6568542 L32.6538436,40.3106978 C34.2176035,41.8744578 36.7547899,41.8726271 38.3137085,40.3137085 C39.8758057,38.7516113 39.8771021,36.2202479 38.3106978,34.6538436 L32.6568542,29 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" sketch:type="MSShapeGroup"></path>\n        </g>\n      </g>\n    </svg>\n  </div>\n'
                    + (_this.pageMode !== 'preview' ? '<span class="dz-remove" id="' + key.fileGuid + _this.schema.name +'">'+_this.$t("dropzone.dictRemoveFile")+'</span>\n</div>' : '</div>');
              if (_this.pageMode !== 'preview') {
                //每次上传对模板进行初始化
                _this.$nextTick(() => {
                  const elementId = `${key.fileGuid}${_this.schema.name}`;
                  //Add Delete Event
                  document.getElementById(elementId).onclick = function () {
                    _this.delDialog = true;
                    let fileElement = document.querySelector("#temFile");
                    fileElement.dataset.fileid = key.fileGuid + 'Guid';
                    fileElement.dataset.file = 'edit';
                  };
                  _this.$refs.myVueDropzone.dropzone.options.previewTemplate = _this.dropzoneOptions.previewTemplate;
                })
              }
              if (_this.pageMode == "preview" && _this.schema.enableThumbnail) {
                _this.$nextTick(() => {
                  //Add refresh Event
                  document.getElementById("refresh_" + key.fileGuid).onclick =
                    function () {
                      //请求接口刷新缩略图
                      _this.getFileStatus(key.id).then(data =>{
                        const _data = data.data;
                        if(_data.status == 'ok'){
                          let imgElement = document.getElementById(key.fileGuid).firstElementChild.firstElementChild,
                            srcUrl =  "/api/Downloadthumbnail" +
                              "?pageCode=" +
                              _this.pageView +
                              "&fileid=" +
                            _data.thumbnailFileId +
                              "&docId=" +
                              _this.model._id +
                              "&fieldName="+
                              _this.schema.model;
                          imgElement.src= window.location.origin + pathTrans(srcUrl);
                        }
                      })
                    };
                });
              }
              // to fill up the thumbnailFiledic
              var matchrecord = _this.thumbnailFiledic.filter(
                item => item.fileuuId === key.fileGuid
              );
              if (matchrecord.length <= 0) {
                var newitem = {
                  fileuuId: key.fileGuid,
                  fileobjectId: key.id,
                  thumbnailobjectId: key.thumbnailobjectId,
                  thumbnailUrl: key.thumbnailUrl
                };
                _this.thumbnailFiledic.push(newitem);
                _this.$refs.myVueDropzone.manuallyAddFile(file, imageUrl);
              }
            }
        },100);
      },
      //dialog多语配置
      languageConversion (_variable, script){
        const locale = this.$i18n.locale;
        if(locale === 'zh-cn'){
          this.dialog[_variable] = script[0]
        } else if (locale === 'zh-tw') {
          this.dialog[_variable] = script[1]
        } else {
          this.dialog[_variable] = script[2]
        }
      },
      async getEnableScanData() {
        let _this = this,
        result = await  _this.$axios.post('api/getJObjectResult', {
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
      initDownloadFileEvent() {
        let _this = this;
        if (this.value && this.value.length > 0) {
          this.value.forEach((key, index) => {
            var downloadBtn = document.querySelector("#d_" + key.id);
            downloadBtn.addEventListener(
              "click",
              function (e, key) {
                var fileId = e.currentTarget.id.replace("d_", "");
                var url = downloadBtn.getAttribute("data-url");
                if (!_this.schema.enableDownload) return;
                _this.getEnableScanData().then((data) => {
                  if (data.data.value === "enable") {
                    //开启了文件扫描
                    _this.getFileStatus(fileId).then((data) => {
                      const _data = data.data;
                      //状态没完成弹框提示
                      if (_data.status != "ok") {
                        _this.dialog.isShow = true;
                        _this.languageConversion("title", ["信息","信息","Info"]);
                        switch (_data.status) {
                          case "pending":
                            _this.languageConversion(
                              "message",
                              FILE_LANGUAGE_PENDING
                            );
                            break;
                          case "scanning":
                            _this.languageConversion(
                              "message",
                              FILE_LANGUAGE_SCANNING
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
                            window.open(url);
                            break;
                        }
                      } else {
                        window.open(url);
                      }
                    });
                  } else {
                    window.open(url);
                  }
                });
              },
              false
            );
          });
        }
      },
      extractMethod(url) {
        //先处理url 中 的 ？ 和 &
        var urlclean = url;
        let queryIndex = url.indexOf('?');
        if (queryIndex > -1) {
          //存在？，去除后面的
          urlclean = urlclean.substring(0, queryIndex);
        }
        let methodSplit = urlclean.split('/');
        //格式应该是api/xxx/ccc
        let apiIndex = methodSplit.indexOf("api");
        let lastMethodName = methodSplit[apiIndex + 1];
        return lastMethodName.toLocaleLowerCase();
      },
      hashParams(method) {
        let params = [];
        let lastMethodName = this.extractMethod(method);
        for (let index = 0; index < 10; index++) {
          params[index] = String.fromCharCode(65 + Math.round(Math.random() * 6));
        }
      },      
      generateHeaders() {
        //stamp logic
        if (this.dropzoneOptions) {
          let key = `${app.tenantId}_${app.appCode}`; //this.dropzoneOptions.url.substring(1).replace("/", "_");
          var arr = new Uint16Array(1);
          let rNum = crypto.getRandomValues(arr);
          let timestamp = new Date().getTime();
          let prepareParams = hashParams(this.dropzoneOptions.url);
          let dealedParams = prepareParams.map(function (item, index) {
            let encryp = cryptoJs.HmacSHA256(item, key);
            return cryptoJs.enc.Base64.stringify(encryp);
          });
          let actionName = extractMethod(this.dropzoneOptions.url);
          let precrystamp = `${actionName}_${timestamp}_${rNum}_sys`;
          let crystamp = cryptoJs.HmacSHA256(precrystamp, key);

          //this.$set(this.dropzoneOptions.headers, 'requeststamp', cryptoJs.enc.Base64.stringify(crystamp));
          this.dropzoneOptions.headers.requeststamp = cryptoJs.enc.Base64.stringify(crystamp);
          this.dropzoneOptions.headers.rn = rNum;
          this.dropzoneOptions.headers.ts = timestamp;
          this.dropzoneOptions.headers.ps = dealedParams;
          //return cryptoJs.enc.Base64.stringify(crystamp);
        }
      },
      showOrHideRemoveLinkByStyle(type) {
        let removeLinkStyle = type == 'hide' ? "." + this.schema.model + this.loadType + '_VueDropzone' +
          "  .vdropzone-box .dz-preview .dz-remove{display:none};" : "";
        this.$dm_injectStyle("body", removeLinkStyle, this.schema.model + '_VueDropzone');
      },
      initBus() {
        var _this = this;
        _this.loadType = _this.options && _this.options.loadType ? _this.options.loadType : "normal";
        let newComponentStatus = null;
        let componentStatusName = "";
        let busName = '';
        let pageCode = _this.options && _this.options.pageView ? _this.options.pageView.toLowerCase() : "";
        switch (_this.loadType) {
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
        _this.$set(newComponentStatus, componentStatusName, {
          "status": "complete"
        });
        _this.bus.$emit(busName, newComponentStatus, componentStatusName, _this.schema.model);
      }
     
    },
    beforeCreate() {
      this.uploadurl = (window.urlMode === 'NOTENANTAPPCODE' ? '' : `/${app.tenantId}/${app.appCode}`) + "/api/UploadFileByChunk";
      this.removeurl =
        (window.urlMode === 'NOTENANTAPPCODE' ? '' : `/${app.tenantId}/${app.appCode}`) +
        "/File/DeleteFile?formAlias=" +
        this.pageView +
        "&fileId={0}";
      this.downloadurl =
        (window.urlMode === 'NOTENANTAPPCODE' ? '' : `/${app.tenantId}/${app.appCode}`) +
        "/File/DownloadFile?formAlias=" +
        this.pageView +
        "&fileId={0}";
    },
    watch: {
      value: {
        handler(val, oldVal) {
          let _this = this;
          if (val && val.length == 0) {
            if (oldVal && oldVal.length > 0) {
              oldVal.forEach(function (obj) {
                _this.addFileToDeleteList(obj.id);
                _this.addFileToDeleteList(obj.thumbnailobjectId);
                _this.addFileToDeleteList(obj.transferId);
              })
            }
            if (_this.$refs.myVueDropzone) {
              _this.$refs.myVueDropzone.removeAllFiles();
            }
          } else {
            if (_this.isEdit && _this.$refs.myVueDropzone) {
              _this.loadData();
            }
          }
        },
        immediate: true,
      },
      'schema.disabled': {
        handler: function (val) {
          if (this.$refs.myVueDropzone == null) {
            return;
          }
          if (val != undefined && val) {
            this.$refs.myVueDropzone.disable();
            this.showOrHideRemoveLinkByStyle('hide');
          } else {
            if (this.pageMode == "preview") {
              return;
            }
            this.$refs.myVueDropzone.enable()
            this.showOrHideRemoveLinkByStyle('show');
          }
        },
        immediate: true,
        deep: true
      }
    },
    created() {
      let _this = this;
     
      //获取大文件是否开启状态
      _this.$axios.post(
        "/api/vp/GetOrganizationByCode", {
        OrganizationCode: _this.$store.state.appInfo.tenantCode,
      }).then(data =>{
        if(data && data.data)
        //根据master site大文件开关和design 大文件开关的开启关闭逻辑进行判断
        _this.allowLargeFileUpload = data.data.Data.AllowLargeFileUpload;
        if(!_this.allowLargeFileUpload && _this.schema.largeFileEnabled){
          if(_this.$refs.myVueDropzone){
            if(_this.schema.maxFilesize < 1024){
              _this.$refs.myVueDropzone.dropzone.options.maxFilesize = _this.schema.maxFilesize
            } else {
              _this.$refs.myVueDropzone.dropzone.options.maxFilesize = 1024
            }
            _this.$refs.myVueDropzone.dropzone.options.chunking = true
          }
        } else if(_this.allowLargeFileUpload && _this.schema.largeFileEnabled){
            if(_this.$refs.myVueDropzone){
              _this.$refs.myVueDropzone.dropzone.options.maxFilesize = _this.schema.maxFilesize;
              _this.$refs.myVueDropzone.dropzone.options.chunking = false;
              //如果是大文件上传，将自动上传属性改为false，手动上传
              _this.$refs.myVueDropzone.setOption('autoProcessQueue', false);
            }
          // })
        } else {
          if(_this.$refs.myVueDropzone){

            _this.$refs.myVueDropzone.dropzone.options.maxFilesize = _this.schema.maxFilesize
            _this.$refs.myVueDropzone.dropzone.options.chunking = true
          }
        }

      });

      _this.register();
      if (_this.renderPdf()) {
        if (_this.value != null && _this.value.length > 0) {
          let appHost = "/" + app.tenantId + "/" + app.appCode;
          _this.value.forEach(function (value, index, array) {
            if(value.largeFileEnabled && (value.transferId == "" || value.transferId == null)){
              _this.$axios.get(value.transferFileUrl).then(data => {
                if(data.data.status == 'pending'){
                  let filePendingUrl = _this.$store.getters.cdnHostAndVersionPath ? _this.$store.getters.cdnHostAndVersionPath + '/static/pdf/pendingPreview'+_this.localemapping[_this.$i18n.locale]+'.pdf' : 'https://' + window.location.host + '/static/pdf/pendingPreview'+_this.localemapping[_this.$i18n.locale]+'.pdf';
                  _this.fileLists.push({
                    status: index == 0 ? 'active' : '',
                    filepdfurl: filePendingUrl,
                    fileDownloadurl: filePendingUrl,
                    index: index,
                    filepdfInfo: ''
                  });
                } else if(data.data.status == "notsupported"){
                  let fileNotsupportedUrl = _this.$store.getters.cdnHostAndVersionPath ? _this.$store.getters.cdnHostAndVersionPath + '/static/pdf/unPreview'+_this.localemapping[_this.$i18n.locale]+'.pdf' : 'https://' + window.location.host + '/static/pdf/unPreview.pdf';
                  _this.fileLists.push({
                      status: index == 0 ? 'active' : '',
                      filepdfurl: fileNotsupportedUrl,
                      fileDownloadurl: fileNotsupportedUrl,
                      index: index,
                      filepdfInfo: ''
                  })
                } else {
                  _this.$axios.get(value.originalFileUrl).then(item => {
                    if(item.data.status == 'completed'){
                      _this.fileLists.push({
                      status: index == 0 ? 'active' : '',
                      filepdfurl: data.data.url,
                      fileDownloadurl: item.data.url,
                      index: index,
                      filepdfInfo: ''
                    });
                    }
                  })
                  
                }
              });
            } else {
              //兼容旧数据，直接从model里取值，如没有走getFileStatus接口拼接filepdfurl
              let fileUploadInfo = _this.model[_this.schema.model].filter(val => {
                return val.id == value.id
              })
              if(fileUploadInfo[0].transferFileUrl){
                //旧数据
                const transferFileUrl = fileUploadInfo[0].transferFileUrl;
                _this.fileLists.push({
                  status: index == 0 ? 'active' : '',
                  filepdfurl: window.location.origin + pathTrans(transferFileUrl),
                  fileDownloadurl: window.location.origin + pathTrans(value.originalFileUrl),
                  index: index,
                  filepdfInfo: ''
                });
              } else {
                  //pdf病毒扫描状态查询
                //  _this.getEnableScanData().then(data =>{
                //   if(data.data.value){
                  _this.getFileStatus(value.id).then(data =>{
                    const _data = data.data;
                    //状态没完成，现为静态PDF，后续hotfix已做成给一张默认的空PDF，自定义文案
                    let filePendingUrl = _this.$store.getters.cdnHostAndVersionPath ? _this.$store.getters.cdnHostAndVersionPath + '/static/pdf/filePending-blank.pdf' : 'https://' + window.location.host + '/static/pdf/filePending-blank.pdf',
                        fileScanningUrl = _this.$store.getters.cdnHostAndVersionPath ? _this.$store.getters.cdnHostAndVersionPath + '/static/pdf/fileScanning-blank.pdf' : 'https://' + window.location.host + '/static/pdf/fileScanning-blank.pdf',
                        fileConverterrorUrl = _this.$store.getters.cdnHostAndVersionPath ? _this.$store.getters.cdnHostAndVersionPath + '/static/pdf/fileConverterror-blank.pdf' : 'https://' + window.location.host + '/static/pdf/fileConverterror-blank.pdf',
                        fileConvertingUrl = _this.$store.getters.cdnHostAndVersionPath ? _this.$store.getters.cdnHostAndVersionPath + '/static/pdf/fileConverting-blank.pdf' : 'https://' + window.location.host + '/static/pdf/fileConverting-blank.pdf',
                      fileDownloadurl = '',
                      filepdfurl= '',
                          srcUrl =  "/api/DownloadFile" +
                            "?pageCode=" +
                            _this.pageView +
                            "&fileid=" +
                          _data.previewFileId +
                            "&docId=" +
                            _this.model._id +
                            "&fieldName="+
                            _this.schema.model;
                    if(_data.status != 'ok'){
                      let filepdfText = _this.filepdfText[_data.status]
                      switch (_data.status) {
                        case 'pending':
                          fileDownloadurl = '';
                          filepdfurl = filePendingUrl;
                        break;
                        case 'scanning':
                          fileDownloadurl = '';
                          filepdfurl = fileScanningUrl;
                        break;
                        case 'insecurity':
                          fileDownloadurl = '';
                          filepdfurl = fileConverterrorUrl;
                        break;
                        case 'error':
                          fileDownloadurl = '';
                          filepdfurl = fileConverterrorUrl;
                        break;
                        case 'converting':
                          fileDownloadurl = window.location.origin + pathTrans(value.originalFileUrl);
                          filepdfurl = fileConvertingUrl;
                          break;
                        case 'converterror':
                          fileDownloadurl = window.location.origin + pathTrans(value.originalFileUrl);
                          filepdfurl = fileConverterrorUrl;
                        break;
                        default:
                          fileDownloadurl = "";
                          filepdfurl = fileConverterrorUrl;
                        break;
                      }
                      _this.fileLists.push({
                        status: index == 0 ? 'active' : '',
                        filepdfurl: filepdfurl,
                        fileDownloadurl: fileDownloadurl,
                        index: index,
                        filepdfInfo: filepdfText
                      });
                    } else {
                      //用户上传不可预览的文件格式时，需要做处理
                      let fileNotsupportedUrl = _this.$store.getters.cdnHostAndVersionPath ? 
                                                _this.$store.getters.cdnHostAndVersionPath + '/static/pdf/unPreview'+_this.localemapping[_this.$i18n.locale]+'.pdf' 
                                                : 'https://' + window.location.host + '/static/pdf/unPreview'+_this.localemapping[_this.$i18n.locale]+'.pdf';
                      if(_data.previewFileId == null) {
                        _this.fileLists.push({
                          status: index == 0 ? 'active' : '',
                          filepdfurl: fileNotsupportedUrl,
                          fileDownloadurl: window.location.origin + pathTrans(value.originalFileUrl),
                          index: index,
                          filepdfInfo: ''
                        });
                      } else {
                        _this.fileLists.push({
                          status: index == 0 ? 'active' : '',
                          filepdfurl: window.location.origin + pathTrans(srcUrl),
                          fileDownloadurl: window.location.origin + pathTrans(value.originalFileUrl),
                          index: index,
                          filepdfInfo: ''
                        });
                      }
                    }
                })
              }
            
            }
          });
        }
        return;
      }
    },
    mounted() {
      let _this = this;
      if (_this.renderPdf()) {
        return;
      }
      _this.loadData();
      if (_this.pageMode != "preview") {
        //_this.$refs.myVueDropzone.dropzone.options.addRemoveLinks = true;
      } else {
        //处理Dropzone控件在preview模式下，自动设置为禁用模式
        if (_this.schema.uploadByDropzone == undefined) {
          this.$refs.myVueDropzone.disable();
        }
        _this.initDownloadFileEvent();
      }
      _this.generateHeaders();

      _this.initBus();
    },
    computed: {
      returnBorderStyle() {
        let primaryColor = this.$vuetify.theme.themes.light.primary;
        return {
          border: `1px dashed ${primaryColor}`
        }
      },
      classes() {
        return this.schema.classes + " " + this.schema.model + this.loadType + '_VueDropzone px-2 px-sm-3'
      },
      rules() {
        var rules = [];
        let schema = this.schema;
        if (schema.show != false) {
          if (this.schema.required) {
            rules.push(val => {
              return (
                (this.value && this.value.length > 0) || this.$t("schema-base.rules.required")
              );
            });
          }
        }
        return rules;
      },
      filepdfText(){
        let fileArr = {};
        fileArr.pending =  this.$te(this.localeKey + ".filePending") && this.$t(this.localeKey + ".filePending")? this.$t(this.localeKey + ".filePending"): this.$t("dropzone.filePending");
        fileArr.scanning =  this.$te(this.localeKey + ".fileScanning") && this.$t(this.localeKey + ".fileScanning")? this.$t(this.localeKey + ".fileScanning"): this.$t("dropzone.fileScanning");
        fileArr.insecurity =  this.$te(this.localeKey + ".fileInsecurity") && this.$t(this.localeKey + ".fileInsecurity")? this.$t(this.localeKey + ".fileInsecurity"): this.$t("dropzone.fileInsecurity");
        fileArr.converting =  this.$te(this.localeKey + ".filecConverting") && this.$t(this.localeKey + ".filecConverting")? this.$t(this.localeKey + ".filecConverting"): this.$t("dropzone.filecConverting");
        fileArr.converterror =  this.$te(this.localeKey + ".fileConverterror") && this.$t(this.localeKey + ".fileConverterror")? this.$t(this.localeKey + ".fileConverterror"): this.$t("dropzone.fileConverterror");
        fileArr.error =  this.$te(this.localeKey + ".fileInsecurityerror") && this.$t(this.localeKey + ".fileInsecurityerror")? this.$t(this.localeKey + ".fileInsecurityerror"): this.$t("dropzone.fileInsecurityerror");
        return fileArr
      }
    },
    beforeDestroy() {
      clearInterval(this.btnLoading);
      this.btnLoading = null;
    }
  };

</script>

<style lang="scss">
  .vdropzone-box.dark-mode .dropzone{
    background: rgba(255,255,255,0.08);
  }
  .vdropzone-box.dark-mode .dropzone:hover{
    background: rgba(255,255,255,0.16);
  }
  .vdropzone-box.dark-mode .dropzone .dz-message {
    color: #fff;
  }
  .v-application .vue-dropzone {
    color: #2d2d2d;
  }

  .vdropzone-box .dz-preview .dz-remove {
    border: 0;
    width: 100%;
    text-align: center;
    margin-left: 0;
    background-color: rgba(45, 45, 45, 0.2);
    padding:  5px 0;
  }

  .vdropzone-box .message {
    min-height: 14px;
    font-size: 12px;
    line-height: 14px;
    position: relative;
    padding: 12px 8px;
    color: #d72222 !important;
    min-height: 14px;
    opacity: 0;
  }

  .vdropzone-box .message.active {
    opacity: 1;
  }

  .vdropzone-box .require-tip {
    font-style: normal;
    font-size: 14px;
    color: red;
    margin-left: 6px;
    vertical-align: middle;
  }

  .vue-dropzone .dz-preview .dz-image img {
    width: 150px !important;
    height: 150px !important;
  }

  .dropzone .dz-preview.dz-file-preview .dz-image {
    border-radius: 0px !important;
  }

  .vue-dropzone>.dz-preview .dz-details {
    background-color: rgba(255, 255, 255, 0.2) !important;
    padding-top: 80px;
  }

  .vue-dropzone>.dz-preview .dz-details .dz-size {
    background-color: rgba(45, 45, 45, 0.2);
    margin-bottom: 0;
  }

  .vue-dropzone .dz-preview.dz-image-preview .dz-details {
    opacity: 1;
  }

  .vue-dropzone .dz-message {
    margin: 0px;
  }

  .vue-dropzone .dz-message .dz-icon .icon-5x {
    font-size: 5em;
    line-height: 1em;
    color: #dedede;
  }

  .v-application .vue-dropzone>.dz-preview .dz-details {
    color: #fff;
    text-align: center;

    a {
      color: #fff;
    }
  }

  .v-application .vue-dropzone>.dz-preview .dz-remove {
    color: #fff;
    bottom: 0;
    text-transform: none;
    font-size: 14px;
    background-color: rgba(45, 45, 45, 0.2);
    padding:  5px 0;
  }
  
  .vue-dropzone>.dz-preview .dz-details .dz-filename{
    background-color: rgba(45, 45, 45, 0.2);
  }
  .common-dialog {
   border: 1px solid rgba(255, 255, 255, 0.5);
 
  }
  .common-dialog .v-card__text.content {
    padding: 1rem !important;
    min-height: 5rem;
    line-height:5rem;
    white-space: pre-wrap;
    max-height:500px;
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
  .v-card__title{
    padding:10px 14px 10px;
  }
  .vc-dropzone .del-card {
    background-color: #fff;
  }
  .dark-dropzone.dark-dropzone .del-card {
    background-color: #1e1e1e;

  }

</style>

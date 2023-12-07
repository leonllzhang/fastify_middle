<template>
  <div>
    <v-dialog
      max-width="746"
      class="dialog-content"
      v-model="importShow"
      :persistent="true"
      :no-click-animation="true"
    >
   
    <v-card class="export-dialog">
        <v-card-title class=" primary white--text fix-title" primary-title>
          <v-row>
            <v-col cols="6">
              {{ $t(tipsTitle) }}
            </v-col>
            <v-col cols="6" style="text-align: right">
              <v-btn icon @click="close">
                <v-icon class="pwc-icon" color="#fff">pwc-close-outline</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card-title>
        <v-container fluid class="pt70 contaniner">
          <v-card-text class="export-title">
            {{$t('importExcel.guideTitle1')}}<span class="templete-color" @click="downLoadTemplete">{{$t('importExcel.guideTitle2')}}</span>{{$t('importExcel.guideTitle3')}}<span  @click="docLink" class="templete-color">{{$t('importExcel.guideTitle4')}}</span>{{$t('importExcel.guideTitle5')}}
          </v-card-text>
           <v-card-text class="export-tips">
            <div class="showTips-content">
              <!-- <div class="guide-btn" @click="showTips = !showTips">
                <v-btn
                  icon
                >
                  <v-icon>{{ showTips ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                </v-btn>
                {{$t('importExcel.guideTitle4')}}
              </div> -->
            </div>
            <v-dialog
              v-model="showTips"
              persistent
              max-width="726"
            >
              <v-card>
                <v-toolbar
                  color="primary"
                  dark
                >{{$t('importExcel.guideTitle4')}}</v-toolbar>
                <div class="tips-content" v-show="showTips">
                  <!-- <v-divider></v-divider> -->
                  <v-card-text>
                    <ul>
                      <li v-for="(item, index) in guidetTips" :key="index">{{index + 1}}.{{ $t(item.name) }}</li>
                    </ul>
                  </v-card-text>
                  <v-divider></v-divider>
                </div>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="primary darken-1"
                    text
                    @click="showTips = false"
                  >
                    {{$t('importExcel.close')}}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <!-- <v-expand-transition>
              <div class="tips-content" v-show="showTips">
                <v-divider></v-divider>
                <v-card-text>
                  <ul>
                    <li v-for="(item, index) in guidetTips" :key="index">{{index + 1}}.{{ $t(item.name) }}</li>
                  </ul>
                </v-card-text>
                <v-divider></v-divider>
              </div>
            </v-expand-transition> -->
            
            <div class="upload-file">
                 <div :class="[isuploadfileError ? 'dropzone-Error' : 'dropzone-border']" >
                    <vue-dropzone 
                      class="upload-file-button-dropzone" 
                      @vdropzone-sending = fileSending
                      v-on:vdropzone-transform-file="transformFile"
                      v-on:vdropzone-files-added="filesAdd" 
                      v-on:vdropzone-removed-file="removedFile"
                      @vdropzone-success="uploadSuccess"
                      @vdropzone-complete-multiple="uploadComplete"
                      ref="myVueDropzone" 
                      id="dropzone"
                      :useCustomSlot=true
                      :options="dropzoneOptions">
                      <div v-html="$t('dropzone.dictDefaultMessage')"></div>
                    </vue-dropzone>
                  </div>
            </div>
            <div v-if="isuploadfileError" class="fileErrTips-content">
              <p>{{fileErrTips}}</p>
            </div>
            <div class="import-button">
                    <v-btn id="btn_upload" type="button" color="primary" :disabled="isuploadfileError || !uploadFileName" :class="[(isuploadfileError || !uploadFileName )? 'diasplayBtn' : '', 'mx-1 import-btn', classes]" >
                      {{$t('importExcel.import')}}
                    </v-btn>
                    <v-btn type="button" color="primary" :disabled="isuploadfileError || !uploadFileName" :class="['mx-1 import-btn', classes]" @click="cancelImportFun">
                      {{$t('importExcel.cancel')}}
                    </v-btn>
                  </div>
            <div class="import-record">
              <div @click="showRecordFun" class="import-record-Title">
                <div class="guide-btn" >
                    <v-btn
                      icon
                    >
                      <v-icon>{{ showRecord ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                    </v-btn>
                  </div>
                  {{$t('importExcel.fileDetails')}}
              </div>
              <v-divider v-if="showRecord" ></v-divider>
              <div v-if="showRecord" class="file-record client-results">
                <div v-for="(item, index) in recordList" :key="index" class="record-content">
                  <div class="file-record-item">
                    <p class="fileName">{{item.fileName}}</p>
                    <!-- 进行中的状态 -->
                    <v-progress-circular v-if="item.status === 'Processing'" class="circleLoading" indeterminate size="32" width="3" :color="sysColor"></v-progress-circular>
                    <!-- 已完成但是有错误 -->
                    <div class="errTips" v-if="item.failInfo.length" :id="`${'tips' + index}`" >{{ item.failInfo[0].errorInfo }}</div>
                    <p v-if="(item.status === 'Completed' && !item.failInfo.length)">{{$t('importExcel.succeesdTips', {total: item.totalCount, succeesNum: item.successCount, failedNum: item.failCount})}}</p>
                    <p v-if="(item.status === 'BeQueuing')">{{$t('importExcel.taskQueuing')}}</p>
                    <div class="btn-width">
                      <!-- 进行中的状态刷新按钮 -->
                      <v-btn v-if="item.status === 'Processing' || item.status === 'BeQueuing'" type="button" color="primary" :class="['mx-1 import-btn', classes]"  @click="refreshFun(item, index)">
                          {{$t('importExcel.refresh')}}
                        </v-btn>
                      <!-- 取消进行中任务按钮 -->
                      <v-btn v-if="item.status === 'BeQueuing'" type="button" color="primary" :class="['mx-1 import-btn', classes]"  @click="cancelTask(item, index)">
                          {{$t('importExcel.cancel')}}
                        </v-btn>
                        <!-- 已完成但是有错误 复制错误信息按钮 -->
                      <v-btn v-if="item.failInfo.length" :data-clipboard-target="`${'#tips' + index}`"  @click="copyTips" type="button" color="primary" :class="['mx-1 import-btn', classes, 'copyExamplePropertiesToClipboard']"  >
                        {{$t('importExcel.copyErrRecords')}}
                        </v-btn>
                    </div>
                  </div>
                </div>
                  <div
                    ref="load_more_record"
                    v-show="!this.pageEnd"
                    class="text-center"
                    style="height: 50px; line-height: 50px"
                  >
                    <v-progress-circular
                      indeterminate
                      color="pwcYellow"
                    ></v-progress-circular>
                  </div>
                  <p @click.stop style="text-align: center" v-show="this.pageEnd"></p>
              </div>
            </div>
          </v-card-text>
          
        </v-container>
    </v-card>
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
          <div class="v-card v-sheet theme--light">
            <v-card-title class="primary white--text" primary-title>{{$t("dropzone.dictRemoveTitle")}}</v-card-title>
            <v-container>
              <div tabindex="0" class="v-card__text content">{{$t("dropzone.dictCancelUploadConfirmation")}}</div>
              <v-card-actions class="justify-end">
                <v-btn text @click="delDialog = false">{{$t("button.cancel")}}</v-btn>
                <v-btn text @click="deleteFile">{{$t("peoplepicker-base.ok")}}</v-btn>
              </v-card-actions>
            </v-container>
          </div>
        </div>
      </div>
    </div>
    </v-dialog>
    <snackbar class="snackbarIndex" :isShowSnackbar="isShowSnackbar" @closeSnackbar="closeSnackbar" :snackbarColor="snackbarColor" :snackbarMessage="snackbarMessage" />
  </div>
  </template>
  
  <script>
  import {
    getEnv
  } from "../../utils/env.js"
  import appInfo from "../../utils/appInfo";
  import base from "../utils/form-base";
  import vue2Dropzone from 'vue2-dropzone'
  import 'vue2-dropzone/dist/vue2Dropzone.min.css'
  import Clipboard from 'clipboard';
  import snackbarComponent from "../snackbar"
  import cryptoJs  from "crypto-js";
  
  const ExcelJS = require('exceljs');
  let allThis
  var app = appInfo();
  export default {
      mixins: [base],
      name: "vc-import",
      components: {
        vueDropzone: vue2Dropzone,
        snackbar: snackbarComponent
      },
      props:{
        // System Theme Colors
        sysColor: {
          type: String,
          default: 'orange'
        },
        schema: {
          type: Object,
        },
        isEditorUpload: false,
        // Pop up display status
        importShow: {
            type: Boolean,
            default: false,
            required: true
        },
        // i18n Multilingual variable name
        tipsTitle: {
          type: String,
          default: 'importExcel.title'
        },
        // Guidance prompt
        guidetTips: {
          type: Array,
          default: [
            {
              name: 'importExcel.guide1',
            },
            {
              name: 'importExcel.guide2',
            },
            {
              name: 'importExcel.guide3',
            },
            {
              name: 'importExcel.guide4',
            },
            {
              name: 'importExcel.guide5',
            },
            {
              name: 'importExcel.guide6',
            },
            {
              name: 'importExcel.guide7',
            },
            {
              name: 'importExcel.guide8',
            },
            {
              name: 'importExcel.guide9',
            },
          ]
        },
        // Allowed file types to import
        allowedFileTypes: {
          type: String,
          default: 'xlsx'
        },
      },
      inject: {
        messageDialog: {
          default: {
            showMsg() {},
            showErr() {},
          },
        }
      },
      data() {
        return {
          delDialog: false,
          fileDeleteFrom: '',
          uploadedFiles: [],
          dateFormat: '',
          pageIndex: 1,
          pageEnd: false,
          pageSize: 5,
          loadMore: true, //当load请求成功之后，才可以发送第二个
          io: null, // observer 监听器，监听实例，在mounted中实例化的
          uploadFileName: "",
          thisVue: this,
          fileBlob: '',
          schemaDataModel:{},
          showRecord: false, // Whether the task record displays the status
          showTips: false, // Whether specification zh displays status
          fileErrTips: '', // Verification error prompt after front end obtains files
          snackbarColor: "#299D8F",
          isShowSnackbar: false,
          snackbarMessage: "",
          recordList: [],
          propertiesExample: '123123erds',
          isuploadfileError: false,
          dropzoneOptions: {
            vueThis: this,
            headers: { "x-xsrf-token": this.getCookie("XSRF-TOKEN") },
  
            url: `${"/" + app.tenantId + "/" + app.appCode + "/admin-api/UploadOrUpdateResourceByChunk"}`,
            thumbnailWidth: 400,
            maxFilesize: 1024,
            parallelUploads:1,
            maxFiles: 1,
            name: "this.schema.model",
            autoProcessQueue: false,
            createImageThumbnails: null,
            thumbnailHeight: null,
            addRemoveLinks: true,
            chunking: true,
            forceChunking: true,
            timeout: undefined,
            chunkSize: 260096,
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
            dictDefaultMessage: this.$t("importExcel.dropFileTips"),
            dictRemoveFileConfirmation: this.$t(
              "dropzone.dictRemoveFileConfirmation"
            ),
            // previewTemplate: '<div class="dz-preview dz-preview-box dz-file-preview">\n  <div class="dz-image dz-image-box"><img data-dz-thumbnail /></div>\n  <div class="dz-details dz-details-box">\n    <div class="dz-size"><span data-dz-size></span></div>\n    <div class="dz-filename"><span data-dz-name></span></div>\n  </div>\n  <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>\n  <div class="dz-error-message"><span data-dz-errormessage></span></div>\n  <div class="dz-success-mark">\n    <svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">\n      <title>Check</title>\n      <defs></defs>\n      <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">\n        <path d="M23.5,31.8431458 L17.5852419,25.9283877 C16.0248253,24.3679711 13.4910294,24.366835 11.9289322,25.9289322 C10.3700136,27.4878508 10.3665912,30.0234455 11.9283877,31.5852419 L20.4147581,40.0716123 C20.5133999,40.1702541 20.6159315,40.2626649 20.7218615,40.3488435 C22.2835669,41.8725651 24.794234,41.8626202 26.3461564,40.3106978 L43.3106978,23.3461564 C44.8771021,21.7797521 44.8758057,19.2483887 43.3137085,17.6862915 C41.7547899,16.1273729 39.2176035,16.1255422 37.6538436,17.6893022 L23.5,31.8431458 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" stroke-opacity="0.198794158" stroke="#747474" fill-opacity="0.816519475" fill="#FFFFFF" sketch:type="MSShapeGroup"></path>\n      </g>\n    </svg>\n  </div>\n  <div class="dz-error-mark">\n    <svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">\n      <title>Error</title>\n      <defs></defs>\n      <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">\n        <g id="Check-+-Oval-2" sketch:type="MSLayerGroup" stroke="#747474" stroke-opacity="0.198794158" fill="#FFFFFF" fill-opacity="0.816519475">\n          <path d="M32.6568542,29 L38.3106978,23.3461564 C39.8771021,21.7797521 39.8758057,19.2483887 38.3137085,17.6862915 C36.7547899,16.1273729 34.2176035,16.1255422 32.6538436,17.6893022 L27,23.3431458 L21.3461564,17.6893022 C19.7823965,16.1255422 17.2452101,16.1273729 15.6862915,17.6862915 C14.1241943,19.2483887 14.1228979,21.7797521 15.6893022,23.3461564 L21.3431458,29 L15.6893022,34.6538436 C14.1228979,36.2202479 14.1241943,38.7516113 15.6862915,40.3137085 C17.2452101,41.8726271 19.7823965,41.8744578 21.3461564,40.3106978 L27,34.6568542 L32.6538436,40.3106978 C34.2176035,41.8744578 36.7547899,41.8726271 38.3137085,40.3137085 C39.8758057,38.7516113 39.8771021,36.2202479 38.3106978,34.6538436 L32.6568542,29 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" sketch:type="MSShapeGroup"></path>\n        </g>\n      </g>\n    </svg>\n  </div>\n</div>',
            acceptedFiles:  ".xlsx",
            
            enableImageUpload: false,
            init: function() {
              document.getElementById("btn_upload").addEventListener("click", ()=> {
                  console.log('Tell Dropzone to process all queued files.')
                  this.options.vueThis.importFun(this)
              });
              this.on("removedfile", function(file) {
                let that = this.options.vueThis
                if (that.fileDeleteFrom !== 'fileForEach') {
                  that.cancelImportFun()
                }
                that.fileDeleteFrom = ''
              });
            }
          },
          // 因为后台接受的Id 要求为objectId, 而dropzone 控件中 生成的为guid，所以需要一个字典来维护mapping 关系。用来多文件上传的时候匹配查询。
          thumbnailFiledic: [
            {
              fileuuId: "",
              fileobjectId: "",
              thumbnailUrl: "",
              thumbnailobjectId: "",
            },
          ],
        }
      },
      watch: {
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
        },
        importShow (newVal,oldVal) {
          if (!newVal) {
            this.cancelImportFun()
          }
        }
      },
      mounted() {
        // 实例化监听器io，
        if (this.loadMoreRecord) {
          this.io = new IntersectionObserver(this.loadMoreRecord);
        }
        
        this.initClipboard()
        this.getFormschema()
        this.generateHeaders();
        this.getAllTaskList()
        this.getDateFormat()
      },
      beforeDestroy() {
        // 取消观察
        this.io.disconnect();
      },
      methods: {
        docLink () {
          let startStr = window.location.origin + '/digiqaldocs';
            let lang = this.$i18n.locale == "en" ? "/en" : "/zh-cn";
            let endStr = "pages/page-form-operate";
            let allStr = (
              startStr +
              lang +
              "/" +
              endStr +
              "/"
            ).toLowerCase();
            window.open(allStr, "_blank");
      },
        deleteFile() {
          let that = this
          if (that.fileDeleteFrom !== 'fileForEach') {
            that.cancelImportFun()
          }
          that.fileDeleteFrom = ''
          that.delDialog = false;
        },
        uploadProcessing(file) {
          let _this = this;
          let file1 = file[0]
          let spanElement = document.createElement('span');
          spanElement.className = "dz-remove";
          //spanElement.className +=" "+ file.upload.uuid
          spanElement.innerHTML = this.$t("dropzone.dictRemoveFile");
          file1.previewElement.append(spanElement)
          spanElement.onclick = function () {
            _this.delDialog = true;
            let fileElement = document.querySelector("#temFile");
            fileElement.dataset.fileid = file1.upload.uuid + 'Guid';
            _this.temporaryFile = file1;
            fileElement.dataset.file = 'add';
          };
          file1.previewElement.setAttribute("id", file1.upload.uuid);
        },
        getDateFormat() {
          this.$store.state.loading = true;
          this.$axios
          .post("/api/GetResult", {
            requestURL: "run/pref/globaldateformat"
          })
          .then(async (res) => {
            this.$store.state.loading = false;
            if (res.status == 200) {
              this.dateFormat = res.data
            }
          })
          .catch((err) => {
              this.$store.state.loading = false;
              console.log("err")
              console.log(err)
              this.messageDialog.showErr(err)
          });
        },
        generateHeaders() {
          //stamp logic        
          if(this.dropzoneOptions){
            let key = `${appInfo().tenantId}_${appInfo().appCode}`;//this.dropzoneOptions.url.substring(1).replace("/", "_");
            var arr = new Uint16Array(1);
            let rNum = crypto.getRandomValues(arr);
            let timestamp = new Date().getTime();
            let prepareParams = this.hashParams(this.dropzoneOptions.url);
            let dealedParams = prepareParams.map(function (item, index) {
              let encryp = cryptoJs.HmacSHA256(item, key);
              return cryptoJs.enc.Base64.stringify(encryp);
            });
            let actionName = this.extractMethod(this.dropzoneOptions.url);
            let precrystamp = `${actionName}_${timestamp}_${rNum}_sys`;
            let crystamp = cryptoJs.HmacSHA256(precrystamp, key);

            this.dropzoneOptions.headers.requeststamp = cryptoJs.enc.Base64.stringify(crystamp);
            this.dropzoneOptions.headers.rn = rNum;
            this.dropzoneOptions.headers.ts = timestamp;
            this.dropzoneOptions.headers.ps = dealedParams;
            //return cryptoJs.enc.Base64.stringify(crystamp);
          }
        },
        getCookie(cname) {
          var name = cname + "=";
          var ca = document.cookie.split(';');
          for (var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(name) == 0) { return c.substring(name.length, c.length); }
          }
          return "";
        },

        handleUpload() {
          this.$refs.selectExcel.value = ''
          this.$refs.selectExcel.click()
        },
        getFormschema() {
          let hostUrl = window.location.protocol + "//" + window.location.host
          let requestUrl = hostUrl + "/" + this.$store.state.appInfo.OrganizationCode + "/" + this.$store.state.appInfo
          .AppCode + "/" + "form" + "/" + this.schema.formName + "/" + "Add" + "/" + "" + (
            getEnv() ? "?env=" + getEnv() : "")
          this.$store.dispatch("actionsGetDocumentResult", {
            pageAlias: this.schema.formName,
            pageMode: "Add",
            pageType: "form",
            hostUrl: hostUrl,
            requestUrl: requestUrl
          }).then(({
            result
          }) => {
            if (result.statusCode == 200) {
              this.resolveSchema(result.schemas, result.schemas[0].pageView.toLowerCase())
            }

          });
        },
        // 只解析获取fieldTypeArr中类型的form提交的schema数据
        resolveSchema(schemas, pageCode) {
            if (pageCode) {
              pageCode = pageCode.toLowerCase();
            } else {
              this.messageDialog.showErr(this.$t('importExcel.correspondingForm'))
            }
            let fieldTypeArr = ['vc-textbox', 'vc-tags', 'vc-radio', 'vc-checkbox', 'vc-datetime-picker', 'vc-select', 'vc-peoplepicker', 'vc-datapicker', 'vc-textarea','vc-daterange-picker']
            for (var i = 0; i < schemas.length; i++) {
              let code = schemas[i] && schemas[i].model || schemas[i].code || "";
              if (code != '' && !schemas[i].schemas && fieldTypeArr.indexOf(schemas[i].component) > -1) {
                this.schemaDataModel[code] = schemas[i];
              }
              if (schemas[i].schemas && schemas[i].schemas.length > 0) {
                this.resolveSchema(schemas[i].schemas, pageCode)
              }
            }
        },
        downLoadTemplete() {
          let that = this;
          if (!that.schema.formName) {
            this.messageDialog.showErr(this.$t('importExcel.correspondingForm'))
            return false
          }
          that.$axios
            .get(`/api/DownloadImportTaskTemplate?pageCode=${that.schema.formName}`, {
              responseType: "blob",
            })
            .then((res) => {
              // 处理返回的文件流
              //主要是将返回的data数据通过blob保存成文件
              let appHost = "/" + app.tenantId + "/" + app.appCode;
               window.open(`${appHost}/api/DownloadImportTaskTemplate/?pageCode=${that.schema.formName}`);
            })
            .catch((err) => {
              console.log(err);
            });
        },
        copyTips() {
          this.isShowSnackbar = true;
          this.snackbarColor = '#299D8F'
          this.snackbarMessage = this.$t('importExcel.codeSuccessful')
        },
        closeSnackbar(status) {
          this.isShowSnackbar = status;
        },
        initClipboard() {
          const clipboardProperties = new Clipboard(
            ".copyExamplePropertiesToClipboard"
          );
          clipboardProperties.on('success', function (e) {
            e.clearSelection();
          });
  
          clipboardProperties.on('error', function (e) {
            console.error('Action:', e.action);
            console.error('Trigger:', e.trigger);
          });
        },
        importFun(dropZoneObj) {
          if (!this.isuploadfileError) {
            dropZoneObj.processQueue()
          }
        },
        uploadSuccess(file, response) {
          let resp = JSON.parse(file.xhr.responseText);
          // this.$refs.myVueDropzone.removeAllFiles()
          this.startTask(resp.fileId)
          this.cancelImportFun()
        },
        uploadComplete(response) {
        },
        // Call the start task interface after uploading the file
        startTask(FileId) {
            this.$store.state.loading = true;
            this.$axios
            .post("/api/PostJObjectResult", {
              requestURL: "ImportData/CreateTask",
              pageCode: this.schema.formName,
              timeDeviation: 0 - new Date().getTimezoneOffset() / 60,
              defaultDateFormat: this.$store.state.app.appPerference.GlobalDateFormat,
              FileId: FileId,
              Env: getEnv() ? getEnv() : ""
            })
            .then(async (res) => {
              this.$store.state.loading = false;
              this.snackbarColor = '#299D8F'
              this.snackbarMessage = this.$t("importExcel.taskCreatedSuccessfully")
              this.isShowSnackbar = true;
              this.getAllTaskList(false, true)
            })
            .catch((err) => {
                this.$store.state.loading = false;
                console.log(err)
                this.messageDialog.showErr(err)
            });
        },
        getAllTaskList(isLoadMore, isRefresh) {
          this.$store.state.loading = true;
          if (isLoadMore) this.pageIndex += 1;
          if (isRefresh) {
            this.pageIndex = 1
            this.recordList = []
          }
          this.$axios
          .post("/api/PostJObjectResult", {
            requestURL: "ImportData/GetTaskList",
            pageCode: this.schema.formName,
            PageIndex: this.pageIndex,
            PageSize: this.pageSize,
          })
          .then(async (res) => {
            // 这里判断是否到底
            if (res.data.data.items.length < this.pageSize) {
              this.pageEnd = true;
            } else {
              this.pageEnd = false;
            }
            this.$store.state.loading = false;
            if (res.status == 200) {
              if (res.data.data.items.length) {
                res.data.data.items.forEach((info) => {
                  if (info.failInfo && info.failInfo.length) {
                    this.catchErrTips(info)
                  } else if (info.status === 'Failed') { // failInfo为空的错误处理
                    info.failInfo.push({
                      errorInfo: 'Failed'
                    })
                  }
                })
              }
              this.recordList = this.recordList.concat(res.data.data.items)
            }
          })
          .catch((err) => {
              this.$store.state.loading = false;
              console.log(err)
              this.messageDialog.showErr(err)
          });
        },
        catchErrTips(info) {
          let tips
          switch (info.failInfo[0].errorCode)
          {
            case '1': tips = 'errTips4' // 参数为空
            break;
            case '2': tips = 'errTips6' // 数据值无匹配值不一致，不能上传
            break;
            case '3': tips = 'errTips7' // 数据值有重复值，不能上传。
            break;
            case '4': tips = 'errTips3' // 数据类型与应用设置不一致，无法上传
            break;
            case '5': tips = 'errTips12' // 参数为空
            break;
            default: tips = 'errTips12' // 参数为空
          }
          if (info.failInfo[0].failList.length) {
            info.failInfo[0].failList.forEach((val) => {
              if (!info.failInfo[0].errorInfo) {
                info.failInfo[0].errorInfo = ''
              }
              info.failInfo[0].errorInfo += this.$t(`importExcel.${tips}`, {row: val.row, column: val.column})
            })
          }
        },
        refreshFun(item, index) {
          this.$store.state.loading = true;
            this.$axios
            .post(`/api/GetResult`, {
              requestURL: `importdata/GetTaskByCode/${item.code}`,
            })
            .then(async (res) => {
              if (res.data.data.failInfo && res.data.data.failInfo.length) {
                this.catchErrTips(res.data.data)
              }
              this.recordList.splice(index, 1, res.data.data)
              
              this.$store.state.loading = false;
            })
            .catch((err) => {
                this.$store.state.loading = false;
                console.log(err)
                this.messageDialog.showErr(err)
            });
        },
        cancelImportFun() {
          this.$refs.myVueDropzone.removeAllFiles()
          this.uploadedFiles = []
          this.uploadFileName = ''
        },
        cancelTask(item, index) {
          // return new Promise((resolve, reject) => {
            this.$store.state.loading = true;
            this.$axios
            .post("/api/PostJObjectResult", {
              requestURL: "ImportData/CancelTask",
              TaskCode: item.code,
            })
            .then(async (res) => {
              this.$store.state.loading = false;
              if (res.data.data === null) {
                this.messageDialog.showErr(this.$t("importExcel.cancelTaskFailed"))
              } else {
                this.isShowSnackbar = true;
                this.snackbarColor = '#299D8F'
                this.snackbarMessage = that.$t('importExcel.cancelTaskSuccess')
              }
              this.refreshFun(item, index)
              // resolve(res)
            })
            .catch((err) => {
                this.$store.state.loading = false;
                this.messageDialog.showErr(err)
                // reject(err)
            });
          // })
        },
        getDefaultMessage() {
          return this.$t("dropzone.dictDefaultMessage");
        },
        close() {
          this.$emit("fileDialogClose", false)
        },
        showOrHideRemoveLinkByStyle(type) {
          let removeLinkStyle = type == 'hide' ? "." + this.schema.model + this.loadType + '_VueDropzone' +
            "  .vdropzone-box .dz-preview .dz-remove{display:none};" : "";
          this.$dm_injectStyle("body", removeLinkStyle, this.schema.model + '_VueDropzone');
        },
        
        fileForEach(_forEach, file) {
          return new Promise((resolve, reject) => {
            let that = this
            let isReturn = false
            _forEach(file, function (m,index) {
              if (m.status === 'error') {
                that.fileDeleteFrom = 'fileForEach'
                that.$refs.myVueDropzone.removeFile(m, true);
                that.snackbarMessage = that.$t(
                      "dropzone.dictFileTooMany"
                    ).replace("{maxfile}",that.dropzoneOptions.maxFiles)
                that.snackbarColor = '#ff5252'
                that.isShowSnackbar = true;
                isReturn = true
                resolve(isReturn)
              } else {
                resolve(isReturn)
                that.uploadedFiles.push(m);
              }
            })
          })
        },
        // 读取文件并校验文件内容
        async filesAdd(file) {
          let that = this
          that.uploadProcessing(file)
          var _forEach = require("lodash/forEach");
          let isReturn = await that.fileForEach(_forEach, file)
          
          if (isReturn) {
            if (that.fileErrTips) { // 存在错误信息，因为重新上传文件状态重置了，所以有错误需要显示
              that.isuploadfileError = true
            }
            return false
          }

          that.isuploadfileError = false
          that.fileErrTips = ''
          let formCellIsQueryInfo = {}
          let formLableInfo = []
          // 标题列总数数据，封装成模板用来校验必填为空
          let allColData = []
          let schemaLabel = []
          let schemaModel = []
          const workbook = new ExcelJS.Workbook();
          that.uploadFileName = file[0] && file[0].name
          
          // 文件类型、大小校验
          if (file && file[0]) {
            if ((file[0].size && file[0].size/ 1024/ 1024 > 5) || (file[0].name && file[0].name.indexOf(that.allowedFileTypes) === -1)) {
              that.isuploadfileError = true
              that.fileErrTips = that.$t('importExcel.guide2')
              return false
            }
          }
          
          workbook.xlsx.load(file[0]).then(function(){
            let count = 0
            workbook.eachSheet(function(worksheet, sheetId) {
              count++
            });
            // sheet单元格不能为空校验
            if (count != 1) {
              that.fileErrTips = that.$t('importExcel.guide1')
              return false
            }
            let worksheet = workbook.getWorksheet(workbook.worksheets[0].name); //获取第一个worksheet
            // 标题和类型固定占两行，所以少于2行判断为空excel
            if (worksheet.rowCount <= 2) {
              that.isuploadfileError = true
              that.fileErrTips = that.$t('importExcel.errTips2')
              return false
            }
            if (worksheet) {
              Object.keys(that.schemaDataModel).map((key, item) => {
                schemaLabel.push(that.schemaDataModel[key].label)
                schemaModel.push(that.schemaDataModel[key].model)
              })
              // row：当前行数据，rowNumber：当前是第几行
              worksheet.eachRow(function(row, rowNumber) {
                let rowSize = row.cellCount;
                let numValues = row.actualCellCount;

                if (rowNumber === 1) {
                    row.eachCell(function(cell, colNumber) {
                      if (that.schemaDataModel[cell.value]) {
                        formCellIsQueryInfo[cell.address.slice(0,1)] = that.schemaDataModel[cell.value]
                      }
                      allColData.push(cell.address.slice(0,1))
                    });
                    // 第一行标题校验
                    if (schemaModel.length !== Object.keys(formCellIsQueryInfo).length) {
                      that.isuploadfileError = true
                      that.fileErrTips = that.$t('importExcel.guide1')
                      return false
                    }
                    
                  }
                  // 第二行标题校验
                  if (rowNumber === 2) {
                    row.eachCell(function(cell, colNumber) {
                      let data = schemaLabel.find((item) => {
                        return cell.value === item
                      })
                      if (data) {
                        formLableInfo.push(data)
                      }
                    });
                    // 第二行标题校验
                    if (schemaLabel.length !== formLableInfo.length) {
                      that.isuploadfileError = true
                      that.fileErrTips = that.$t('importExcel.guide1')
                      return false
                    }
                  }
                  
                  // console.log("单元格数量/实际数量:"+rowSize+"/"+numValues);
                  if (rowNumber > 2) {
                    
                    let currentColData = []
                    row.eachCell(function(cell, colNumber) {
                      currentColData.push(cell.address)
                    });
                    // 必填校验逻辑
                    let resData = allColData.filter((info) => {
                      return !currentColData.find((val) => {
                        return val === info + rowNumber
                      }) && formCellIsQueryInfo[info] && formCellIsQueryInfo[info].required
                    })
                    if (resData.length) {
                      that.isuploadfileError = true
                      resData.forEach((cel) => {
                        that.fileErrTips += that.$t('importExcel.errTips10', {row: rowNumber, column:cel}) + ', '
                      })
                      that.fileErrTips += that.$t('importExcel.errTips11')
                    }
                    // 日期格式校验
                    if (currentColData.length) {
                      currentColData.forEach((info) => {
                        if (formCellIsQueryInfo[info.slice(0,1)] && formCellIsQueryInfo[info.slice(0,1)].component === "vc-datetime-picker") {
                            
                            let dateVal = ''
                            row.eachCell((data)=> {
                              if (data.address === info) {
                                dateVal = data.value
                              }
                            })
                            if (dateVal ) {
                              // excel获取的是utc时间
                              let formatDateTime = that.moment.utc(dateVal).format(formCellIsQueryInfo[info.slice(0,1)].defaultDateFormat || that.dateFormat)
                              if (formatDateTime !== dateVal) {
                                dateVal = formatDateTime
                              }
                            }
                        }
                      })
                    }
                  }
                  
              });
              that.isShowSnackbar = true;
              that.snackbarColor = '#299D8F'
              that.snackbarMessage = that.$t('importExcel.fileAddSuccessful')
            }
          }).catch((err) => {
            console.log(err)
            that.isuploadfileError = true
            that.fileErrTips = that.$t('importExcel.errTips2')
            return false
          })
        },
        removedFile(file, flag) {
          this.isuploadfileError = false
          const index = this.uploadedFiles.findIndex((f) => f.name === file.name);
          if (index !== -1 && !flag) {
            this.uploadedFiles.splice(index, 1);
          }
        },
        fileSending(file, xhr, formData) {
          this.generateHeaders();
          formData.append("uploadType", "ImportRuntimeData");
          this.generateHeaders();
          var reordindic = this.checkmatchGenerateId(file.upload.uuid);
          formData.append("dzuuobjectid", reordindic.fileobjectId);
          formData.append("uploadType", "ImportRuntimeData");
          formData.append("id", undefined);
          formData.append("fileContentType", "application/x-zip-compressed");
          formData.append("concurrencyStamp", undefined);
          formData.append("show", false);
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
          let apiIndex = methodSplit.indexOf("admin-api");
          let lastMethodName = methodSplit[apiIndex + 1];
          return lastMethodName.toLocaleLowerCase();
        },
        hashParams(method) {
          let params = [];
          let lastMethodName = this.extractMethod(method);
          for (let index = 0; index < 10; index++) {
          params[index] = String.fromCharCode(65 + Math.round(Math.random() * 6));
          }
          let firstAlpha = lastMethodName.substr(0, 1).toLocaleLowerCase();
          let index = firstAlpha.charCodeAt();
          //小写字母a-z对应的ASCII码值是97-122
          //此处需要散列到10个参数中。
          var finalIndex = (index - 97) % 10;
        
          params[finalIndex] = 'sys';
          return params;
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
        // method use to loop the dic to check if the uuid already exist. then return same objectid.
        checkmatchGenerateId(uuid) {
          var baseurl = "/api/Downloadthumbnail";
          var matchrecord = this.thumbnailFiledic.filter(
            (item) => item.fileuuId === uuid
          );
          if (matchrecord.length > 0) {
            return matchrecord[0];
          } else {
            // not in dic, create one for dictionary to find when next chunk arrive.
            var newthumbObjectid = this.uuidv4();
            var newitem = {
              fileuuId: uuid,
              fileobjectId: this.uuidv4(),
              thumbnailobjectId: newthumbObjectid,
            };
            this.thumbnailFiledic.push(newitem);
            return newitem;
          }
        },
        // 观察者的回调函数
        loadMoreRecord(obj) {
          var isIntersecting = obj[0].isIntersecting;
          var target = obj[0].target;
          if (isIntersecting) {
            const ul = target.offsetParent;
            const scrollTop = target.offsetParent.scrollTop;
            if (!this.pageEnd) this.getAllTaskList(true);
            this.$nextTick(function () {
              ul.scrollTop = scrollTop;
            });
          }
        },
        showRecordFun() {
          this.showRecord = !this.showRecord
          this.$nextTick(function () {
            this.io.observe(this.$refs.load_more_record);
          });
        }
      }
  }
  </script>
  
  <style lang="scss" scoped>
  
  .dialog-content{
    .v-dialog{
      // border-radius: 10px !important;
    }
  }
  
  .export-dialog{
    overflow: hidden;
    .fix-title {
      position: fixed;
      width: 746px;
      height: 60px;
      z-index: 6666;
      box-sizing: border-box;
      
    }
    .contaniner{
      // height: 700px;
      overflow-y: auto;
    }
    .fileErrTips-content{
      padding: 10px 46px;
      color: #ff5252 !important;
    }
  }
  .v-dialog .export-dialog .v-card__title {
    padding: 0 24px;
  }
  .export-title {
    color: #2d2d2d;
    font-size: 18px;
    .templete-color{
      cursor: pointer;
      color: #2288FF;
    }
  }
  .export-select-radio {
    position: relative;
    font-size: 18px;
    color: #2d2d2d;
  }
  .export-dialog .v-input--selection-controls {
    margin-top: 0px;
  }
  .pt70 {
    padding-top: 70px;
  }
  .export-tips {
    padding: 16px 8px;
    border: 1px solid #dedede;
    width: 94%;
    margin: 8px 16px;
    border-radius: 10px;
    .showTips-content{
      display: flex;
      justify-content: end;
      overflow: hidden;
      .guide-btn{
        cursor: pointer;
        width: 100px;
        height: 30px;
        border: 1px solid #e5e5e5;
        border-radius:  15px 0 0 15px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        margin-right: -65px;
        transition: margin-right 0.5s;
        overflow: hidden;
      }
      .guide-btn:hover{
        width:100px;
        margin-right: -8px;
        height: 30px;
        border: 1px solid #e5e5e5;
        border-radius:  15px 0 0 15px;
        display: flex;
        align-items: center;
        margin-right: -8px;
        transition: margin-right 0.5s;
      }
    }
  }
  
  .export-tips ul {
    padding-left: 0;
    margin-left: 20px;
  }
  .export-tips ul li {
    position: relative;
    font: normal normal normal 14px/24px Source Han Sans CN;
    color: #000;
    line-height: 2.6rem;
  }
  .upload-file {
    width: 100%;
    height: 150px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    .fileUpload-content{
      width: 546px;
      height: 150px;
      position: relative;
      .fileUpload-view{
        
        width: 546px;
        height: 150px;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        // display: flex;
        // justify-content: center;
        align-items: center;
        text-align: center;
        padding: 0;
        p{
          line-height: 45px;
        }
      }

    }
    
    .upload-file-button-dropzone{
      width: 546px;
      height: 150px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0;
      span{
        text-align: center;
      }
    }
    .upload-file-button{
      position: absolute;
      top: 0;
      left: 0;
      width: 546px;
      height: 150px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0;
      span{
        text-align: center;
      }
      // opacity: 0;
      display: none;
    }
    .upload-file-button:hover {
          background-color: #f6f6f6;
      }
    
    .dropzone {
      min-height: 150px;
      // border: 1px dashed #7d7d7d;
    }
    .dropzone-Error{
      border-radius: 10px;
      border: 1px solid red;
    }
    .dropzone-border{
      border-radius: 10px;
      border: 1px solid #e5e5e5;
    }
  }
  .import-button{
    width:100%;
    height: 80px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    .impbutton{
      padding: 0 30px;
    }
    .diasplayBtn{
      background-color: rgba(0,0,0,.12)!important;
    }
  }
  .import-record{
    .import-record-Title{
      height: 45px;
      line-height: 45px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      cursor: pointer;
    }
    .file-record{
      height: 200px;
      overflow-y: auto;
      .file-record-item{
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        p {
          width: 35%;
          padding-right: 5px;
        }
        .btn-width{
          display: flex;
          justify-content: flex-end;
          width: 150px;
        }
      }
    }
    
  }
  .fa-spinner {
    // -webkit-animation: spin 0.75s linear 0.75s 5 alternate;
    // animation: spin 0.75s linear infinite;
    -webkit-animation: spin 0.75s infinite linear;
    animation: spin 0.75s infinite linear;
  }
  @-moz-keyframes spin {
      100% {
        -moz-transform: rotate(360deg);
      }
    }
  
    @-webkit-keyframes spin {
      100% {
        -webkit-transform: rotate(360deg);
      }
    }
  
    @keyframes spin {
      100% {
        -webkit-transform: rotate(360deg);
        transform: rotate(360deg);
      }
    }
    .errTips{
      display: inline-block;
      width: 38%;
      height: 72px;
      line-height: 24px;
      border: 1px solid#ff5252;
      border-radius: 5px;
      outline-color: #ff5252;
      resize: none;
      text-overflow: -o-ellipsis-lastline;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 3;  
      line-clamp: 3;
      -webkit-box-orient: vertical;

    }
    .client-results::-webkit-scrollbar {
      width: 7px;
      height: 10px;
    }

    .client-results::-webkit-scrollbar-track {
      border-radius: 3px;
    }

    .client-results::-webkit-scrollbar-thumb {
      background: rgba(144,147,153,.3);
      border-radius: 12px;
    }

    .client-results::-webkit-scrollbar-thumb:hover {
      background: rgba(144,147,153,.3);
    }
    .tips-content{
      margin-top: 10px;
    }
  </style>
  <style lang="scss">
  .file-record {
    .v-progress-circular--indeterminate:not(.v-progress-circular--visible) .v-progress-circular__overlay, .v-progress-circular--indeterminate:not(.v-progress-circular--visible)>svg {
        -webkit-animation-play-state: running!important; 
        animation-play-state: running!important; 
      }
  }
  .dz-preview-box {
    .dz-details-box{
      padding-top: 30 !important;
    }
  }
  .upload-file .vue-dropzone>.dz-preview .dz-remove {
      width: 100%;
      color: #fff;
      bottom: 0;
      text-transform: none;
      font-size: 14px;
      background-color: rgba(45, 45, 45, 0.2);
      padding:  5px 0;
      margin: 0;
      border: none;
    }
    
    .vue-dropzone>.dz-preview .dz-details .dz-filename{
      background-color: rgba(45, 45, 45, 0.2);
    }
    .upload-file-button-dropzone .dz-preview .dz-progress{
      display: none !important;
    }
    .snackbarIndex{
      z-index: 2001!important;
    }
  </style>

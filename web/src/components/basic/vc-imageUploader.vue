<template>
  <v-layout :column="isVertical" :class="classes">
    <v-flex v-show="schema.model && !schema.disableLabel" :class="['vc-label', { 'horizontal': isHorizontal,required: schema.required }]">
      <span :style="computeStyle('Label',schema)">{{ label }}</span>
    </v-flex>
    <v-flex class="word-wrap">
      <div class="vdropzone-box" :class="{'dark-mode' : $vuetify.theme.dark }">
        <template v-if="pageMode === 'edit' || pageMode === 'add' || pageMode === 'chooseview'">
          <div>
            <v-card flat tabindex="0" :aria-label="label + $dm_arialabel(rules,value)" 
             :aria-required="schema.required"
             :disabled="schema.disabled" class="layout imageUploaderContainer rounded-0" min-height="150px" @click.native="uploadImage" 
             style="cursor: pointer;"
             :style="returnBorderStyle">
              <template v-if="model[schema.model].length< 1">
                <v-card flat class="pa-5 text-center image-center-wrap" width="100%" style="background:unset;">
                  <div v-html="$t('imageUploader.dictDefaultMessage')"></div>
                </v-card>
              </template>
              <template v-else>
                <v-card class="pa-5" width="100%" style="background:unset; position: relative;">
                  <v-card class="ma-4 float-left imageFile" width="150" height="150" v-for="(item,index) in model[schema.model]" :key="index" style="position: relative">
                    <template v-if="item.uploadProgress">
                      <v-progress-circular :rotate="360" :size="100" :width="15" :value="item.uploadProgress" color="primary" style="position: absolute; top:50%; left: 50%; transform: translate(-50%,-50%); z-index: 999">
                        {{ item.uploadProgress }}%
                      </v-progress-circular>
                    </template>
                    <template v-else>
                      <div @click="replaceImage(index);">
                        <v-img class="imageObj" :src="displayUrl(item.originalFileUrl)" width="150" height="150" />
                        <v-card class="imageInfo" style="background: unset; position: absolute; top: 40%; opacity: 0; width:100%; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; padding: 0 8px;">
                          {{item.name}}
                        </v-card>
                        <v-card class="imageInfo" style="background: unset; position: absolute; bottom: 10px; opacity: 0; width:100%; z-index: 10">
                          <v-icon style="cursor: pointer; font-size: 20px; color: #fff;" @click="editImage(item, index);">
                            pwc-icon pwc-image
                          </v-icon>
                          <v-icon class="ml-5" style="cursor: pointer; font-size: 20px; color: #fff;" @click="deleteImageById(item.id);">
                            pwc-icon pwc-delete
                          </v-icon>
                        </v-card>
                      </div>
                    </template>
                  </v-card>
                  <v-card class="ma-4 float-left" width="150" height="150" style="border: 1px dashed #7d7d7d;">
                    <v-icon style="font-size: 80px; text-align: center; display: block; line-height: 140px;">
                      pwc-icon pwc-plus
                    </v-icon>
                  </v-card>
                </v-card>
              </template>
            </v-card>
            <uploadByDropzone v-show="isShow" ref="myImageUploaderVueDropzone" :schema="dropzoneSchema" :model="model" :isImageUploader="isImageUploader"></uploadByDropzone>
          </div>
          <v-text-field v-show="false" v-model="value" :rules="rules"></v-text-field>
          <v-layout justify-start>
            <v-flex :class="['message', { lg10: true, active: !valid }]">{{ errMsgs.toString() }}</v-flex>
            <v-flex :class="['message', { lg10: true, active: !validImageUploader }]">{{ msgImageUploader.toString() }}</v-flex>
          </v-layout>
        </template>
        <template v-else>
          <template v-if="model[schema.model] && model[schema.model].length > 0">
            <div v-for="(vItem, vIndex) in model[schema.model]" :key="vIndex" style="display: -webkit-box;">
              <!--<img :src="displayUrl(vItem.originalFileUrl)" style="width:auto; height:auto; max-width:100%" />-->
              <v-img :src="displayUrl(vItem.originalFileUrl)" :lazy-src="displayUrl(vItem.thumbnailUrl)" contain max-width="100%" width="auto" height="auto" />
            </div>
          </template>
        </template>
      </div>
    </v-flex>
    <v-dialog v-model="vueCropperDialog" fullscreen hide-overlay persistent transition="dialog-bottom-transition">
      <v-toolbar dark>
        <v-toolbar-title>{{ vueCropperOption.title }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <div style="font-size: 1.25rem; position: absolute; left: 50%; transform: translate(-50%);">{{ vueCropperOption.index }}/{{ model[schema.model].length }}</div>
        <v-spacer></v-spacer>
        <v-btn icon @click.native="closeDialog">
          <v-icon>pwc-icon pwc-close-outline</v-icon>
        </v-btn>
      </v-toolbar>
      <div style="height: calc(100vh - 100px); position: relative">
        <v-card style="position:absolute; z-index: 20; text-align: center; background: unset; width: 100%;" flat>
          <v-btn-toggle dark color="white" class="mt-5" style="background-color: black" v-model="vueCropperOption.chooseToggle" tile mandatory>
            <v-btn class="ma-0" value="0">
              Original image
            </v-btn>
            <v-btn v-if="schema.enableThumbnail" class="ma-0" value="1">
              Thumbnail
            </v-btn>
          </v-btn-toggle>
        </v-card>
        <v-card v-if="vueCropperOption.chooseToggle==='1' && vueCropperOption.thumbnailUrl===''" style="position:absolute; z-index: 20; text-align: center; background: unset; width: 100%; bottom: 80px">
          <v-card class="pa-2" dark style="background-color: black; width: 400px; margin: 0 auto;">
            <v-btn icon class="mr-10" @click="originalRatioMinus">
              <v-icon>pwc-icon pwc-circleminus-outline</v-icon>
            </v-btn>
            <span>
              {{ vueCropperOption.originalRatio }}
            </span>
            <v-btn icon class="ml-10" @click="originalRatioPlus">
              <v-icon>pwc-icon pwc-circleplus-outline</v-icon>
            </v-btn>
            <v-btn icon class="ml-10" @click="uploadCropper">
              <v-icon>pwc-icon pwc-checkmark-outline</v-icon>
            </v-btn>
          </v-card>
        </v-card>
        <div v-if="vueCropperOption.chooseToggle==='1' && vueCropperOption.thumbnailUrl!==''" style="width:100%; height:100%; background-repeat: repeat; background-image: url('data:image /png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA3NCSVQICAjb4U/gAAAABlBMVEXMzMz////TjRV2AAAACXBIWXMAAArrAAAK6wGCiw1aAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAABFJREFUCJlj+M/AgBVhF/0PAH6/D/HkDxOGAAAAAElFTkSuQmCC');}">
          <div style="position: absolute; top:50%; left: 50%; transform: translate(-50%,-50%); border: 1px solid #50bfff;">
            <v-img :src="displayUrl(vueCropperOption.thumbnailUrl)" />
            <v-btn dark icon style="position: absolute; bottom: 0; left: 0; background: #000; border-radius: 0;" @click="removeCropper">
              <v-icon>pwc-icon pwc-delete-outline</v-icon>
            </v-btn>
            <v-btn dark icon style="position: absolute; bottom: 0; right: 0; background: #000; border-radius: 0;" @click="editCropper">
              <v-icon>pwc-icon pwc-edit-outline</v-icon>
            </v-btn>
          </div>
        </div>
        <vueCropper v-if="enableCropper" ref="cropper"
                    :img="displayUrl(vueCropperOption.src)" :outputSize="vueCropperOption.size" :outputType="vueCropperOption.outputType" :info="vueCropperOption.info"
                    :autoCrop="vueCropperOption.autoCrop" :autoCropWidth="vueCropperOption.autoCropWidth" :autoCropHeight="vueCropperOption.autoCropHeight"
                    :fixedBox="vueCropperOption.fixedBox" :fixed="vueCropperOption.fixed" :fixedNumber="vueCropperOption.fixedNumber" :canScale="vueCropperOption.canScale"
                    :centerBox="vueCropperOption.centerBox" :canMove="vueCropperOption.canMove"></vueCropper>
      </div>
    </v-dialog>
  </v-layout>
</template>

<script>
  import base from "../utils/form-base";
  import { VueCropper } from 'vue-cropper'
  import { mapMutations } from "vuex";

  export default {
    mixins: [base],
    provide: function () {
      return {
        ImageUploaderManager: {
          InsertResource: this.InsertResource,
          errorMsgMethod: this.errorMsgMethod
        }
      }
    },
    inject: {
      messageDialog: {
        default: {
          showMsg() { },
          showErr() { }
        }
      },
    },
    components: {
      uploadByDropzone: () =>
        import("./vc-dropzone.vue"),
      VueCropper
    },
    data() {
      return {
        isImageUploader: true,
        isShow: false,
        validImageUploader: true,
        msgImageUploader: [],
        dropzoneSchema: {
          "name": this.schema.model,
          "model": this.schema.model + "-uploadByDropzone" + "_" + this.$dm_getGuid(),
          "component": "vc-dropzone",
          "enablePdf": false,
          "show": true,
          "direction": "level",
          "disableLabel": true,
          "maxFiles": this.schema.maxFiles ? this.schema.maxFiles : 10,
          "maxFilesize": this.schema.maxFilesize ? this.schema.maxFilesize : 20,
          //"acceptedFiles": "image/gif,image/jpeg,image/jpg,image/bmp,image/png",
          "acceptedFiles": this.schema.acceptedFiles ? this.schema.acceptedFiles : ".jpg, .png, .gif, .jpeg, .bmp",
          "enableImageUpload": true,
          "disabled": false,
          "uploadByDropzone": true,
        },
        imageIcon: this.$store.getters.cdnHostAndVersionPath + '/static/images/vc-imageUploaderIcon.svg',
        vueCropperDialog: false,
        enableCropper: true,
        vueCropperOption: {
          title: "",
          fileId: "",
          chooseToggle: "0",
          originalRatio: "100%",
          index: 1,
          thumbnailId: "",
          thumbnailUrl: "",
          src: "",
          size: 1,
          info: true,
          outputType: "png",
          autoCrop: false,
          autoCropWidth: 200,
          autoCropHeight: 200,
          fixed: true,
          fixedBox: false,
          fixedNumber: [1, 1],
          canScale: false,
          centerBox: false,
          canMove: false
        },
        replaceIndex: -1,
      };
    },
    computed: {
      returnBorderStyle() {
        let primaryColor = this.$vuetify.theme.themes.light.primary;
        return {
          border: `1px dashed ${primaryColor}`
        }
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
      }
    },
    watch: {
      "vueCropperOption.chooseToggle": {
        handler: function (val, oldVal) {
          var self = this;
          if (val === "0") {
            self.enableCropper = false;
            self.vueCropperOption.autoCrop = false;
          } else {
            self.enableCropper = false;
            self.vueCropperOption.autoCrop = true;
          }
          self.$nextTick(() => {
            self.vueCropperOption.originalRatio = "100%";
            if (self.vueCropperOption.thumbnailUrl === "" || val === "0") {
              self.enableCropper = true;
            }
          });
        }
      },
    },
    methods: {
      uploadImage() {
        if (this.schema.disabled != undefined && this.schema.disabled) {
          return;
        }
        this.valid = true;
        this.errMsgs = [];
        this.msgImageUploader = [];
        this.validImageUploader = true;
        this.$refs.myImageUploaderVueDropzone.manuallyAddFileByImageUploader();
      },
      editImage(item, index) {
        var self = this;
        event.stopPropagation();
        self.vueCropperOption.fileId = item.id;
        self.vueCropperOption.title = item.name;
        self.vueCropperOption.index = index + 1;
        self.vueCropperOption.originalRatio = "100%";
        self.vueCropperOption.src = item.originalFileUrl;
        self.vueCropperOption.chooseToggle = "0";
        self.vueCropperOption.thumbnailId = item.thumbnailobjectId ? item.thumbnailobjectId : "";
        self.vueCropperOption.thumbnailUrl = item.thumbnailUrl && item.thumbnailUrl !== "" ? item.thumbnailUrl : "";
        self.vueCropperDialog = true;
      },
      replaceImage(replaceIndex) {
        event.stopPropagation();
        this.replaceIndex = replaceIndex;
        this.uploadImage();
      },
      closeDialog() {
        this.vueCropperDialog = false;
      },
      deleteImageById(id) {
        event.stopPropagation();
        this.model[this.schema.model] = this.model[this.schema.model].filter(function (item, index, array) {
          return item.id !== id;
        });
        this.$refs.myImageUploaderVueDropzone.addFileToDeleteList(id);
      },
      InsertResource(progress, result) {
        var self = this;
        if (progress === -1) {
          var newArray = [];
          self.model[self.schema.model].forEach(function (item, index) {
            var newItem = {};
            newItem = item;
            if (item.fileGuid === result.fileGuid) {
              newItem = result;
            }
            newArray.push(newItem);
          });
          self.model[self.schema.model] = newArray;
          self.$store.state.loading = false;
        } else {
          if (result && result.upload && result.upload.totalChunkCount && result.upload.chunks && result.upload.chunks.length <= result.upload.totalChunkCount) {
            var fileObj = self.model[self.schema.model].find(i => { return i.fileGuid === result.upload.uuid; });
            if (!fileObj) {
              var newObj = {};
              newObj.fileGuid = result.upload.uuid;
              newObj.uploadProgress = Math.floor(result.upload.chunks.length / result.upload.totalChunkCount * 100);
              if (self.model[self.schema.model].length < self.schema.maxFiles) {
                if (self.replaceIndex !== -1) {
                  self.model[self.schema.model][self.replaceIndex] = newObj;
                  self.model[self.schema.model] = JSON.parse(JSON.stringify(self.model[self.schema.model]));
                  self.replaceIndex = -1;
                } else {
                  self.model[self.schema.model].push(newObj);
                }
              } else {
                self.msgImageUploader = [];
                self.msgImageUploader.push(self.$t("dropzone.dictMaxFilesExceeded"));
                self.validImageUploader = false;
              }
            } else {
              fileObj.uploadProgress = Math.floor(result.upload.chunks.length / result.upload.totalChunkCount * 100) > fileObj.uploadProgress ? Math.floor(result.upload.chunks.length / result.upload.totalChunkCount * 100) : fileObj.uploadProgress;
            }
          }
        }
      },
      originalRatioMinus() {
        var self = this;
        if (self.vueCropperOption.originalRatio !== '25%') {
          var ratioArray = [{ key: "25%", value: -30 }, { key: "33%", value: -26.8 }, { key: "50%", value: -20 }, { key: "67%", value: -13.2 },
          { key: "100%", value: 0 }, { key: "200%", value: 40 }, { key: "300%", value: 80 }, { key: "400%", value: 120 }, { key: "500%", value: 160 }];
          var originalRatioIndex = ratioArray.findIndex((n) => n.key === self.vueCropperOption.originalRatio);
          var originalRatioValue = 0;
          var newRatioValue = 0;
          if ((originalRatioIndex - 1) > -1) {
            self.vueCropperOption.originalRatio = ratioArray[originalRatioIndex - 1]["key"];
            originalRatioValue = ratioArray[originalRatioIndex]["value"];
            newRatioValue = ratioArray[originalRatioIndex - 1]["value"];
            if (originalRatioValue !== 0) {
              originalRatioValue = -originalRatioValue;
              self.$refs.cropper.changeScale(originalRatioValue);
            }
            self.$nextTick(() => {
              if (newRatioValue !== 0) {
                self.$refs.cropper.changeScale(newRatioValue);
              }
            });
          }
        }
      },
      originalRatioPlus() {
        var self = this;
        if (self.vueCropperOption.originalRatio !== '500%') {
          var ratioArray = [{ key: "25%", value: -30 }, { key: "33%", value: -26.8 }, { key: "50%", value: -20 }, { key: "67%", value: -13.2 },
          { key: "100%", value: 0 }, { key: "200%", value: 40 }, { key: "300%", value: 80 }, { key: "400%", value: 120 }, { key: "500%", value: 160 }];
          var originalRatioIndex = ratioArray.findIndex((n) => n.key === self.vueCropperOption.originalRatio);
          var originalRatioValue = 0;
          var newRatioValue = 0;
          if (originalRatioIndex < (ratioArray.length - 1)) {
            self.vueCropperOption.originalRatio = ratioArray[originalRatioIndex + 1]["key"];
            originalRatioValue = ratioArray[originalRatioIndex]["value"];
            newRatioValue = ratioArray[originalRatioIndex + 1]["value"];
            if (originalRatioValue !== 0) {
              originalRatioValue = -originalRatioValue;
              self.$refs.cropper.changeScale(originalRatioValue);
            }
            self.$nextTick(() => {
              if (newRatioValue !== 0) {
                self.$refs.cropper.changeScale(newRatioValue);
              }
            });
          }
        }
      },
      uploadCropper() {
        var self = this;
        self.$refs.cropper.getCropData((data) => {
          if (data && data.indexOf("data:image/png;base64") >= 0) {
            self.$axios
              .post("/api/UploadThumbnail", {
                formAlias: self.$route.params.pageView,
                documentId: self.model._id,
                fieldName: self.schema.model,
                dzuuobjectid: self.uuidv4(),
                thumbnail: data.split(",")[1]
              })
              .then(({ data }) => {
                if (data && data.fileId && self.model[self.schema.model] && self.model[self.schema.model].length > 0) {
                  var fileObj = self.model[self.schema.model].find(i => { return i.id === self.vueCropperOption.fileId; });
                  fileObj.thumbnailUrl = "/api/DownloadFile?fileid=" + data.fileId +
                    "&docId=" + self.model._id + "&pageCode=" + self.$route.params.pageView + "&fieldName=" + self.schema.model;
                  if (fileObj.thumbnailobjectId && fileObj.thumbnailobjectId !== "") {
                    self.$refs.myImageUploaderVueDropzone.addFileToDeleteList(fileObj.thumbnailobjectId);
                  }
                  fileObj.thumbnailobjectId = data.fileId;
                  self.vueCropperOption.thumbnailUrl = fileObj.thumbnailUrl;
                  self.enableCropper = false;
                }
              });
          }
        })
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
      editCropper() {
        var self = this;
        self.enableCropper = false;
        self.vueCropperOption.thumbnailUrl = "";
        self.$nextTick(() => {
          self.vueCropperOption.originalRatio = "100%";
          if (self.vueCropperOption.thumbnailUrl === "") {
            self.enableCropper = true;
          }
        });
      },
      removeCropper() {
        var self = this;
        self.vueCropperOption.chooseToggle = "0";
        self.vueCropperOption.thumbnailUrl = "";
        self.vueCropperOption.thumbnailId = "";
        var fileObj = this.model[this.schema.model].find(i => { return i.id === self.vueCropperOption.fileId; });
        if (fileObj) {
          fileObj.thumbnailobjectId = "";
          fileObj.thumbnailUrl = "";
        }
      },
      displayUrl(url) {        
        if(url){
          return this.$store.getters.baseUrl + url;
        }else{
          return "";
        }        
      },
      errorMsgMethod(file, msg) {
        var self = this;
        self.$nextTick(() => {
          self.msgImageUploader = [];
          self.msgImageUploader.push(msg);
          self.validImageUploader = false;
        });
      }
    },
    created() {
      this.register();
    },
    mounted() {
      var self = this;
      if (self.schema.enableThumbnail && self.schema.widthRatio && self.schema.heightRatio) {
        self.vueCropperOption.autoCropHeight = Math.floor(200 * parseInt(self.schema.heightRatio) / parseInt(self.schema.widthRatio));
        self.vueCropperOption.fixedNumber = [];
        self.vueCropperOption.fixedNumber.push(parseInt(this.schema.widthRatio));
        self.vueCropperOption.fixedNumber.push(parseInt(this.schema.heightRatio));
        if (self.pageMode === 'add') {
          self.model[self.schema.model] = [];
        }
      }
    }
  };

</script>

<style lang="scss">
  .imageUploaderContainer {
    // border: 1px dashed #7d7d7d;
    cursor: pointer;
  }

  .imageUploaderContainer:hover {
    background-color: #f6f6f6;
  }
  .vdropzone-box.dark-mode .imageUploaderContainer{
    background: rgba(255,255,255,0.08);
    color: #fff;
  }
  .vdropzone-box.dark-mode .imageUploaderContainer:hover{
    background: rgba(255,255,255,0.16);
  }
  .imageFile {
    outline: 1px dashed #7d7d7d;
  }

  .imageFile:hover {
    background: #000 !important;
  }

  .imageFile:hover .imageObj {
    opacity: 0.5;
    -moz-opacity: 0.5;
    filter: alpha(opacity=50);
  }

  .imageFile:hover .imageInfo {
    opacity: 1 !important;
    color: #fff;
    text-align: center;
  }

  .vue-cropper {
    background-repeat: initial;
  }

  .cropper-modal {
    background: rgba(0,0,0,.5);
  }
  
  .imageUploaderContainer .image-center-wrap .dz-icon .icon-5x {
    font-size: 5em;
    line-height: 1em;
    color:#dedede;
  }
</style>

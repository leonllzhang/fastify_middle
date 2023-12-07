<!--Email template-->
<!--1.不需要上传文件等功能，具体参考：excludeKeys-->
<!--author: ronky tang: ronky.tang@digiqal.com-->

<template>
  <div style="width: 100%">
    <div :id="'emailEditorContainer-main-container-'+editorName">
      <div :id="'emailEditorContainer-toolbar-container-'+editorName"
           style="border: 1px solid #ccc; border-bottom:0; width: 100%"></div>
      <div :id="'emailEditorContainer-editor-container-'+editorName" style="height:500px;border:1px solid #ccc;width:100%"></div>
    </div>
    <div v-show="colorPicker.isShow"
         style="width: 300px;background: #ffffff;position:fixed;left:30%;top: 22%;z-index: 10001; box-shadow: 0 0 15px #a5a5a5;border-radius: 10px;padding-bottom:10px;">
      <v-color-picker width="300px" light hide-mode-switch
                      dot-size="10"
                      v-model="colorPanelPicker" :swatches="colorPicker.swatches" show-swatches
      ></v-color-picker>
      <div v-if="['color', 'bgColor'].includes(colorPicker.type)" class="d-flex justify-space-around mt-3">
        <v-btn outlined color="primary" small @click="clearColorPanel">
          {{ $t("peoplepicker-base.close") }}
        </v-btn>
        <v-btn class="primary" small @click="saveColor">
          {{ $t("peoplepicker-base.ok") }}
        </v-btn>
      </div>
      <div v-else class="d-flex justify-center mt-3">
        <v-btn outlined color="primary" small @click="clearColorPanel">
          {{ $t("peoplepicker-base.close") }}
        </v-btn>
      </div>
    </div>

    <snackbar v-show="snackBar.message !== ''" :isShowSnackbar="snackBar.isShow" :snackbarMessage="snackBar.message"
              :snackbarTimeout="snackBar.timeout" :snackbarColor="snackBar.color"/>
    <htmlDialogContainer />


  </div>
</template>
<script>
import mixin from "../../AdminManagement/plugins/admin-mixins";
import editorMixin from './mixin'
import {editorEmailEvents} from './editorEvent'

export default {
  mixins: [mixin,editorMixin],
  props: {
    model: {
      type: Object,
      default: null
    },
    editorName:{
      type: String,
      default: 'editorEmail',
    },
    editorData:{
      type: String,
      default: '<p></p>',
    },
  },
  components: {
    htmlDialogContainer: () => import('./html.vue'),
    snackbar: () => import('../../AdminManagement/components/common/common-component/snackbar.vue'),
  },
  mounted() {
    this.initDIGIQALEditor();
  },
  methods: {
    initDIGIQALEditor() {
      let that = this;
      const {createEditor, createToolbar, i18nChangeLanguage} = window.wangEditor
      if(that.editorData!=null && that.editorData!=''){
        that.html = that.editorData
      }
      const editorConfig = {
        placeholder: '',
        onCreated(editor) {
          that.editor = Object.seal(editor);
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
        },
        onChange(editor) {
          that.html = editor.getHtml()
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
        selector: '#emailEditorContainer-editor-container-' + that.editorName,
        html: that.html,
        config: editorConfig,
        mode: 'default',
      })
      // editor.id = "emailEditorContainer|imgClass:" + that.dropzone.dropzoneImageSchema.model;
      if (editorEmailEvents) {
        editorEmailEvents.forEach((eventItem) => {
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
      const toolbarConfig = {
        excludeKeys: ['history', 'code', 'group-image', 'group-video', 'emotion', 'codeBlock', 'digiqalAttachment', 'exportPDF', 'exportWord', 'digiqalQRCode', 'catalog', 'digiqalImage'],
      }

      const toolbar = createToolbar({
        editor,
        selector: '#emailEditorContainer-toolbar-container-' + that.editorName,
        config: toolbarConfig,
        mode: 'default',
      })
      i18nChangeLanguage(that.$i18n.locale)

    },
  },
  data() {
    return {
      snackBar: {
        isShow: false,
        message: '',
        timeout: 3000,
        color: '#D04A02'
      },
      html: '<p></p>',
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


<!--Design page 仅做展示使用-->
<!--1.不需要上传等功能。-->
<!--2.禁用编辑，防止页面加载后focus-->
<!--author: ronky tang: ronky.tang@digiqal.com-->

<template>
  <div style=" width: 100%">
    <div :id="componentId+'-toolbar-container'" style="border: 1px solid #ccc; border-bottom:0; width: 100%"></div>
    <div :id="componentId+'-editor-container'" :style="{height:height,border:'1px solid #ccc',width:'100%'}"></div>
  </div>
</template>
<script>

export default {
  props: {
    height: {
      type: String,
      default: '200px',
    },
    schema: {
      type: Object,
      default: {}
    },
  },
  created() {
    this.componentId = this.schema.model.toLowerCase() + "_" + this.$dm_getGuid()
  },
  watch: {
    "$i18n.locale": function () {
      let that = this
      const {i18nChangeLanguage} = window.wangEditor
      i18nChangeLanguage(this.$i18n.locale)
      that.beforeDestroy()
      setTimeout(()=>{
        that.initDIGIQALEditor()
      },1)
    },

  },

  mounted() {
    this.initDIGIQALEditor();
  },

  methods: {
    initDIGIQALEditor() {
      let that = this;


      const {createEditor, createToolbar, i18nChangeLanguage} = window.wangEditor

      const editorConfig = {
        placeholder: '',
        onCreated(editor) {
          that.editor = Object.seal(editor);
          that.editor.disable()
        },
      }

      const editor = createEditor({
        selector: '#' + that.componentId + '-editor-container',
        html: '<p></p>',
        config: editorConfig,
        mode: 'default',
      })
      const toolbarConfig = {
        excludeKeys: ['history', 'code', 'group-image', 'group-video', 'emotion', 'codeBlock'],
      }

      const toolbar = createToolbar({
        editor,
        selector: '#' + that.componentId + '-toolbar-container',
        config: toolbarConfig,
        mode: 'default',
      })

      i18nChangeLanguage(that.$i18n.locale)

    },
  },

  beforeDestroy() {
    const editor = this.editor
    if (editor == null) return
    editor.destroy()
  },

  data() {
    return {
      componentId: '',
      editor: null,
    }
  },
}

</script>

<style>
.w-e-bar-item {
  padding: 4px !important;
}

.w-e-drop-panel {
  padding: 10px !important;
}

.w-e-text-container ul li {
  /*list-style: disc;*/
}

.w-e-text-container ol li {
  /*list-style: decimal;*/
}

.w-e-bar ul {
  padding-left: 0 !important;
}

.w-e-bar-item button .title {
  font-size: 14px !important;
}

.w-e-modal {
  padding: 1rem !important;
}

.w-e-bar-item button {
  width: auto !important;
}

.w-e-select-list {
  width: auto !important;
}

.w-e-bar-item svg {
  width: 18px !important;
  height: 18px !important;
}

.w-e-modal select {
  -webkit-appearance: auto !important;
  border: 1px solid #ccc;
  width: 33.3%;
  height: 30px;
}

.w-e-modal input {
  border: 1px solid #ccc;
}

.header-container li {
  color: #333;
  margin: 10px 0;
  cursor: pointer;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
  white-space: nowrap;
}

.header-container li:hover {
  text-decoration: underline;
}

.header-container li[type="header1"] {
  font-size: 20px;
  font-weight: bold;
}

.header-container li[type="header2"] {
  font-size: 16px;
  padding-left: 16px;
  font-weight: bold;
}

.header-container li[type="header3"] {
  font-size: 14px;
  padding-left: 24px;
}

.header-container li[type="header4"] {
  font-size: 12px;
  padding-left: 30px;
}

.header-container li[type="header5"] {
  font-size: 12px;
  padding-left: 36px;
}
</style>


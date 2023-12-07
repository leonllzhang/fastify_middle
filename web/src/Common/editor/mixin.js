
import {set16ToRGB, setRGBTo16} from "../utils";
const editorMixin = {
  watch: {
    "$i18n.locale": function () {
      try {
        if (window.wangEditor != null) {
          const {i18nChangeLanguage} = window.wangEditor
          if (i18nChangeLanguage != null) {
            i18nChangeLanguage(this.$i18n.locale)
            if (this.editor != null) {
              this.html = this.editor.getHtml();
              this.editor.destroy()
              this.initDIGIQALEditor();
            }
          }
        }
      } catch (ex) {
        console.error(ex)
      }
    },
  },

  created: function () {
  },
  computed: {
    colorPanelPicker: {
      get() {
        const rgb = set16ToRGB(this.colorPicker.color);
        return {
          r: rgb[0],
          g: rgb[1],
          b: rgb[2],
          a: ['color', 'bgColor'].includes(this.colorPicker.type) ? 100 : this.colorPicker.opacity / 100
        };
      },
      set(v) {
        const color = setRGBTo16(v);
        if (!['color', 'bgColor'].includes(this.colorPicker.type)) {
          if (this.colorPicker.inputEle) this.colorPicker.inputEle.value = color;
          if (this.colorPicker.opacityEle) this.colorPicker.opacityEle.value = (v.a * 100).toFixed();
          if (this.colorPicker.btnEle) {
            this.colorPicker.btnEle.style.background = color;
            this.colorPicker.btnEle.style.opacity = v.a
          }
        } else {
          this.colorPicker.color = color
        }
      },
    }
  },
  methods: {
    updateColor(e) {
      console.log(e.rgba);
      let that = this;
      if (that.colorPicker.inputEle != null) {
        const rgbColor = setRGBTo16(e.rgba)
        that.colorPicker.inputEle.value = rgbColor
        that.colorPicker.btnEle.style.background = rgbColor
      }
    },
    beforeDestroy() {
      const editor = this.editor
      if (editor == null) return
      editor.destroy()
    },
    saveHTML() {
      //this.editor.setHtml(this.formatHTML.replaceAll('\r\n', '').replaceAll('    ', ''));
      this.editor.clear();
      this.editor.dangerouslyInsertHtml(this.html.replaceAll('\r\n', '').replaceAll('<br></br>', '<br>'));
      this.htmlDialog = false;
    },
    getEditorData() {
      return this.editor.isEmpty() ? '' : this.html;
    },
    getEditorTextData() {
      return this.editor.getText();
    },
    updateEditorData(content) {
      if (!this.editor) return;
      this.editor.clear();
      this.editor.dangerouslyInsertHtml(content);
    },
    clearColorPanel() {
      this.colorPicker.isShow = false;
      if (this.colorPicker.isShow === false) {
        this.colorPicker.position = {x: 0, y: 0};
        this.colorPicker.inputEle = null;
        this.colorPicker.btnEle = null;
        this.colorPicker.opacityEle = null;
        this.colorPicker.opacity = '';
        this.colorPicker.color = '';
      }
    },
    saveColor() {
      this.editor.addMark(this.colorPicker.type, this.colorPicker.color)
    },
    getEditorColors() {
      return ['#3D26DF', '#2E53EF', '#2288FF', '#05B8BF', '#FF8A25', '#F8A012', '#FF8093', '#D72222', '#169B6A', '#FFFFFF', '#F3F3F3', '#E8E8E8', '#DDDDDD', '#D1D1D1', '#C5C5C5', '#BABABA', '#A3A3A3', '#979797', '#8C8C8C', '#818181', '#7C7C7C', '#757575', '#696969', '#5E5E5E', '#535353', '#474747', '#3B3B3B', '#303030', '#191919', '#000000', 'others'];
    },
  },
  data() {
    return {
      htmlDialog: false,
      srcReg: new RegExp('src="[^"]*\/api\/DownloadFile', "ig"),
      hrefReg: new RegExp('href="[^"]*\/api\/DownloadFile', "ig"),
      srcLinkTrackingReg: new RegExp('src="[^"]*\/api\/LinkTracking', "ig"),
      hrefLinkTrackingReg: new RegExp('href="[^"]*\/api\/LinkTracking', "ig"),
      srcFileIconReg: new RegExp('src="[^"]*\/static\/Content\/Images\/', "ig"),
      editor: null,
      colorPicker: {
        btnEle: null,
        inputEle: null,
        opacityEle: null,
        isShow: false,
        position: {
          x: 0,
          y: 0
        },
        swatches: [],
        color: '#ffffff',
        opacity: 100,
        type: '',
        event: null
      },
      windowHeight: window.innerHeight,
      windowWidth: window.innerWidth,
    }
  },
}
export default editorMixin;

<template>
  <v-layout :class="classes" class="editor-module" :style="schema.style">
    <v-flex v-show="schema.model && !schema.disableLabel" class="vc-label"
            :class="{ horizontal: isHorizontal, required: isEdit ? schema.required : '' }">
      <span :style="schema.revampSchema ? {
        display: 'inline-block',
        fontFamily: getPropertiesValue('Style', 'Label', 'fontFamily'),
        fontSize: getPropertiesValue('Style', 'Label', 'fontSize') + 'px',
        color: getPropertiesValue('Style', 'Label', 'fontColor').color,
        opacity:
          getPropertiesValue('Style', 'Label', 'fontColor').opacity / 100,
        fontWeight: getPropertiesValue('Style', 'Label', 'fontWeight'),
        letterSpacing:
          getPropertiesValue('Style', 'Label', 'letterSpacing') + 'px',
        padding: getPropertiesValue('Style', 'Label', 'padding'),
        margin: getPropertiesValue('Style', 'Label', 'margin'),
        textShadow: getPropertiesValue('Style', 'Label', 'shadow'),
        background: getRGBA(
          getPropertiesValue('Style', 'Label', 'backgroundColor').color,
          getPropertiesValue('Style', 'Label', 'backgroundColor').opacity
        ),
      } : ''">{{ label }}</span>
      <v-tooltip right :disabled="!schema.tooltip">
        <template v-slot:activator="{ on }">
          <v-icon v-show="schema.tooltip" v-on="on" color="primary">mdi-message-alert</v-icon>
        </template>
        <span>{{ tooltipLabel }}</span>
      </v-tooltip>
    </v-flex>
    <v-flex>
      <DIGIQALEditor ref="editorRef" :schema="schema" :height="height" v-if="isEdit" :value="value"
                     :appCode="appCode" :tenantId="tenantId" :model="model"></DIGIQALEditor>
      <template v-else>
        <div :aria-label="label" v-html="transferFileUrl"
             class="preview-text inner-label pwc-editor-content w-e-text-container w-e-text"></div>
      </template>
    </v-flex>
  </v-layout>

</template>

<script>
import appInfo from "../utils/appInfo";
import base from "../utils/form-base";
import DIGIQALEditor from '../../Common/editor/digital-editor-generator'

import {formatValue} from '../../Common/utils'

export default {
  mixins: [base],
  components: {
    DIGIQALEditor,
  },

  computed: {
    transferFileUrl() {
      return formatValue(this.value, this.fileIcon);
    },
  },
  mounted() {
    // console.log(this.isEdit)
    this.renderFigure()
    // this.useNotesEditor = !!(this.value.includes("html") || this.value.includes("style") || this.value.includes("meta"))
    // console.log(this.useNotesEditor,this.schema)
  },
  created() {
    const app = appInfo();
    this.appCode = app.appCode;
    this.tenantId = app.tenantId;
    this.height = this.getPropertiesValue('Style', 'richEditorHeight') + 'px';
  },
  methods: {

    getEditorData() {
      return this.$refs.editorRef != null ? this.$refs.editorRef.getEditorData() : "";
    },
    renderFigure() {
      if (!this.isEdit) {
        const figures = document.querySelectorAll("figure");
        for (let figure of figures) {
          figure.style.cursor = 'pointer';
          figure.addEventListener("click", function (e) {
            if (e && e.currentTarget.getAttributeNode("src"))
              window.open(e.currentTarget.getAttributeNode("src").value);
          })
        }
      }
    },
  },

  data() {
    return {
      appCode: '',
      tenantId: '',
      height: '0px',
      fileIcon: this.$store.getters.cdnHostAndVersionPath + '/static/Content/Images/',
    }
  },
}

</script>

<template>
  <v-dialog v-model="$parent.htmlDialog" max-width="60%" scrollable>
    <v-card light elevation="10">
      <v-card-title style="background-color: #ffb600; color: #000">
        <span class="headline">{{ $t("editor.html.title") }}</span>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text :style="{'height': $parent.windowHeight/2-10 + 'px','padding-left':'10px','padding-right':'10px',}" class="pb-0">
        <v-container class="editorHTML">
          <v-row style="height: 100%">
            <v-col style="height: 100%">
              <codemirror style="height: 100%" v-if="$parent.htmlDialog" v-model="$parent.html" :options="cOption"></codemirror>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions style="background-color:#1e1e1e">
        <v-spacer></v-spacer>
        <v-btn tile color="pwcYellow" @click="saveHTML"> {{ $t("peoplepicker-base.ok") }}</v-btn>
        <v-btn tile dark outlined @click="$parent.htmlDialog = false">
          {{ $t("peoplepicker-base.close") }}
        </v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {codemirror, codemirrorOption} from '../codemirror'

export default {
  components: {
    codemirror,

  },
  methods: {
    saveHTML() {
      if (this.$parent != null && this.$parent.saveHTML != null) {
        this.$parent.saveHTML();
      }
    },
  },
  data() {
    return {
      cOption: codemirrorOption,
    }
  },
}

</script>

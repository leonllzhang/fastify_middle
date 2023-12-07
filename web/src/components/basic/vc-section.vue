<template>
  <v-card tile outlined :class="['mb-3', 'section-wrapper', classes]" style="border: 0; min-width:100%;">
    <v-toolbar height="40" flat class="section-header">
      <span :style="computeStyle('Label', schema)">{{ label }}</span>
      <v-spacer style="height:40px;" @click="collapseStatus = !collapseStatus"></v-spacer>
      <template v-if="schema.collapse">
        <v-btn tabindex="0" :aria-label="$t('icon.chevronup')" v-if="collapseStatus"
          @click="collapseStatus = !collapseStatus" icon>
          <v-icon size="24" :color="$vuetify.theme.dark ? '' :'#000'">pwc-icon pwc-chevronup-outline</v-icon>
        </v-btn>
        <v-btn tabindex="0" :aria-label="$t('icon.chevrondown')" v-if="!collapseStatus"
          @click="collapseStatus = !collapseStatus" icon>
          <v-icon size="24" :color="$vuetify.theme.dark ? '' :'#000'">pwc-icon pwc-chevrondown-outline</v-icon>
        </v-btn>
      </template>
    </v-toolbar>

    <v-divider class="mx-2 mb-3"></v-divider>
    <v-card v-show="collapseStatus" min-height="50">
      <wrapper v-for="(subschema, i) in schema.schemas" :key="i" :schema="subschema" :model="model"
        :options="options" />
    </v-card>
  </v-card>
</template>

<script>
import base from "../utils/form-base";

export default {
  mixins: [base],
  data() {
    return {
      collapseStatus: true,
    };
  },
  methods: {
    setChildShow(show, schemas) {
      schemas.forEach((el) => {
        this.$set(el, "show", show);

        if (!el.schemas || el.schemas.length == 0) {
          return;
        }
        this.setChildShow(show, el.schemas);
      });
    },
  },
  created() {
    this.$watch(
      "schema.show",
      (val, oldVal) => {
        let newVal = this.schema;

        if (newVal.watch && Object.keys(newVal.watch).length > 0) {
          if (newVal && newVal.schemas && newVal.schemas.length > 0) {
            let show = newVal.show;
            this.setChildShow(show, newVal.schemas);
          }
        }
      },
      {
        deep: true,
      }
    );
  },
};
</script>

<style>
</style>

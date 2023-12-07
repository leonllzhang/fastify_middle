<template>
  <div v-if="$vuetify.breakpoint.name != 'xs'"
       :class="['toggle-btn pwc-toggle-btn', classes]">
    <v-btn-toggle v-model="viewMode" mandatory color="primary">
      <v-btn icon @click="toggle">
        <v-icon>pwc-icon pwc-3by3grid</v-icon>
      </v-btn>
      <v-btn icon @click="toggle">
        <v-icon>pwc-icon pwc-listview</v-icon>
      </v-btn>
    </v-btn-toggle>
  </div>
  <div v-else class="view-mobile-toggle-btn">
    <v-btn small dark
           text
           @click="toggle">
      <v-icon v-if="$store.state.app.currentViewMode == 'datatable'">mdi mdi-view-grid</v-icon>
      <v-icon v-else>mdi mdi-view-sequential</v-icon>
    </v-btn>
  </div>
</template>

<script>
  import base from '../utils/form-base';
  import { mapMutations } from "vuex";

  export default {
  mixins: [base],
    data() {
      return {
      }
    },
    computed: {
      viewMode() {
        return this.$store.state.app.currentViewMode == 'datatable' ? 1 : 0;
      }
    },
    methods: {
      ...mapMutations("app", ["setViewDataExport"]),
      toggle() {
        this.$store.state.app.currentViewMode = this.$store.state.app.currentViewMode == 'cardlist' ? "datatable" : "cardlist";
        if (this.$store.state.app.currentViewMode == 'cardlist') {
          this.bus.$emit("toggle-datatable", false);
          this.bus.$emit("toggle-view-card", true);
          //this.bus.$emit("toggle-sortbtn", true);
          this.setViewDataExport('card');
        } else {
          this.bus.$emit("toggle-datatable", true);
          this.bus.$emit("toggle-view-card", false);
          //this.bus.$emit("toggle-sortbtn", false);
          this.setViewDataExport('datatable');
        }
      }
    },
    mounted() {
    }
};
</script>
<style>
  .toggle-btn {
    margin-left: 6px;
    display: inline-block;
  }
    .toggle-btn .v-btn {
      height:40px !important;
    }
  .view-mobile-toggle-btn {
    margin-top: 5px;
  }
</style>

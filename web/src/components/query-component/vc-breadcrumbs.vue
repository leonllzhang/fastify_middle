<template>
  <v-breadcrumbs tabindex="0" :class="[$vuetify.breakpoint.name == 'xs' ? 'breadcrumbs-mobileStatus' : 'breadcrumbs-status', classes]" :items="$store.getters['app/getBreadcrumbsData']" divider=">"></v-breadcrumbs>
</template>

<script>
  import base from '../utils/schema-base';
  export default {
    mixins: [base],
    data() {
      return {
      }
    },
    mounted() {
      //console.log('vc-breadcrumbs', this.schema)
    }
  }
</script>
<style>
  .breadcrumbs-status {
    padding: 10px 0px 0px 10px !important;
  }

  @media (min-width: 600px) and (max-width: 960px) {
    .v-breadcrumbs {
      padding: 0px !important;
    }
  }

  @media (max-width: 600px) {


    .breadcrumbs-mobileStatus {
      padding: 8px 0px 0px 10px !important;
    }
  }
</style>

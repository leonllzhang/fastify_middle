<template>
  <component :is="schema.component" :schema="schema" :model="model" :options="options"></component>
</template>

<script>
  //import vcLabel from "./vc-view-card-label.vue";
  //import vcButton from './vc-button.vue';
  //import vcRate from './vc-rate.vue';
  import vcLayout from '../basic/vc-layout';
  //import vcviewcardImage from './vc-view-card-image';

  export default {
    components: {
      //'vc-view-card-label': vcLabel,
      //'vc-button': vcButton,
      //'vc-rate': vcRate,
      'vc-layout': vcLayout,
      //'vc-view-card-image': vcviewcardImage,
    },
    data() {
      return {
      }
    },
    props: {
      schema: { type: Object, default: {} },
      model: { type: Object, default: {} },
      options: {},
      cardParameter: {}
    },
    mounted() {
    }   
  }
</script>

<style>
</style>

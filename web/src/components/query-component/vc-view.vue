<template>
  <div class="view-content">
    <wrapper v-for="(schema, index) in schema.schemas"
               :key="index"
               :schema="schema"
               :model="model"
               :options="schema.options" />
  </div>
</template>
<script>
  import base from "../utils/form-base";

  export default {
    mixins: [base],
    mounted() {
      //console.log('vc-view', this.schema.schemas)
    }
  }

</script>
<style>
</style>

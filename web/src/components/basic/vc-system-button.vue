<template>
  <component :is="schema.systemButtonType.toLowerCase()" :schema="schema" :model="model" :options="options"/>
</template>

<script>
  import base from "../utils/form-base";
  import queryBase from "../utils/query-base";
  import { mapMutations } from "vuex";
  import vcEditButton from "./vc-edit-button";
  import vcSaveButton from "./vc-save-button";
  import vcCloseButton from "./vc-close-button";
  import vcCancelButton from "./vc-cancel-button";
  import vcDeleteButton from "./vc-delete-button";
  import vcRecoverButton from "./vc-recover-button";

  export default {
    mixins: [base, queryBase],
    components: {
      "vc-save-button": vcSaveButton,
      "vc-close-button": vcCloseButton,
      "vc-edit-button": vcEditButton,
      "vc-cancel-button": vcCancelButton,
      "vc-delete-button": vcDeleteButton,
      "vc-recover-button": vcRecoverButton
    },
    methods: {
      setLabel(val){
        let label = val.split('-')[1].charAt(0).toUpperCase() + val.split('-')[1].slice(1);
        this.$set(this.schema,'label',label) 
      }
    },
    created () {
      if(!this.schema.hasOwnProperty('label')){
        this.setLabel(this.schema.systemButtonType)
      }
    }
  }
</script>

<style>

</style>

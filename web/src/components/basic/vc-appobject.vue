<template>
  <div :id="schema.microappname" class="mx-auto appObjectWrap">
    <object
      :data="schema.microappadd"
      width="100%"
      height="100%"
      class="appObject" type="text/html"
    ></object>
  </div>
</template>

<script>
import base from "../utils/form-base";
export default {
  name: "vc-appobject",
  mixins: [base]
};
</script>

<style lang="scss" scoped>
.appObjectWrap {
  height: 100%;
}
</style>

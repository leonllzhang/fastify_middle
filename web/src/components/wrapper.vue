<script>
import components from "./utils/component-loader.js";
import base from './utils/layout-base';
console.log('components1', components)
export default {
  components: components,
  mixins: [base],
  computed: {
    component() {
      return this.schema.component;
    }
  }
}
</script>

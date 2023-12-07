<template>
    <div :class="[classes, 'custom-switch']">
        <v-layout>
            <div v-show="!schema.disableLabel" class="vc-label" :class="{ horizontal: isHorizontal, required: schema.required }">
                <span :style="computeStyle('Label', schema)">{{ label || "&#12288;" }}</span>
                <v-tooltip right :disabled="!schema.tooltip">
                    <template v-slot:activator="{ on }">
                        <v-icon v-show="schema.tooltip" v-on="on" color="primary">mdi-message-alert</v-icon>
                    </template>
                    <span>{{ tooltipLabel }}</span>
                </v-tooltip>
            </div>
            <v-flex>              
                <v-switch v-model="value" :color="primary" :disabled="schema.disabled || !isEdit" :hide-details="!isEdit" inset label="" :class="['vc-switch', isEdit ? '' : 'previewMode']" />
            </v-flex>
        </v-layout>
    </div>
</template>
  
<script>
import base from "../utils/form-base";
export default {
    mixins: [base],
    computed: {
        value: {
            get() {
                return !!this.model[this.schema.model];
            },
            set(val) {
                this.model[this.schema.model] = !!val;
            }
        }
    }
};
</script>
<style>
.vc-switch.v-input--switch {
    margin: 0;
}

.custom-switch .vc-switch.v-input--selection-controls {
    padding-top: 0;
}

.custom-switch .vc-switch.v-input--selection-controls .v-input__slot {
    height: 48px;
    margin-bottom: 8px;
}

.custom-switch .vc-switch.v-input--selection-controls.previewMode .v-input__slot {
    margin-bottom: 0px;
}

.custom-switch .vc-switch.v-input--selection-controls .v-messages {
    margin-bottom: 8px;
}

.custom-switch .vc-switch.v-input--selection-controls .v-input--selection-controls__input {
    margin-left: 4px;
}</style>
  
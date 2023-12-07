<template>
    <v-dialog v-model="dialog" max-width="600" :width="400">
        <v-card class="px-2 py-5">
            <!-- <v-card-title>
                <span class="headline">输入框弹窗</span>
            </v-card-title> -->
            <v-card-text class="pb-0">
                <v-form ref="form">
                    <v-text-field v-model="inputValue" required :rules="[v => !!v || $t('ckEditor.inputIsRequired')]"
                        clearable :label="$t('ckEditor.inputAUrl')"></v-text-field>
                </v-form>
                <div id="qrcode" class="mb-4"></div>
            </v-card-text>
            <v-card-actions class="d-flex justify-center">
                <v-btn color="primary" outlined @click="setCurLink">{{ $t("ckEditor.thisPageLink") }}</v-btn>
                <v-btn color="primary" @click="genQR">{{ $t("ckEditor.generate") }}</v-btn>
                <v-btn color="primary" v-show="qrInst" @click="insert">{{ $t("ckEditor.insert") }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
  
<script>
import QRCode from 'qrcodejs2'
export default {
    data() {
        return {
            dialog: false,
            inputValue: '',
            qrInst: null
        }
    },
    mounted() {
    },
    methods: {
        showDialog() {
            this.dialog = true
            this.inputValue = ''
            if (this.$refs.form) this.$refs.form.reset()
            if (this.qrInst) this.qrInst.clear()
        },
        setCurLink() {
            this.inputValue = location.href
        },
        genQR() {
            if (this.qrInst) {
                // 后续在当前实例上更新二维码
                this.qrInst.makeCode(this.inputValue)
            } else {
                // 首次生成二维码实例
                this.qrInst = new QRCode(document.getElementById("qrcode"), {
                    text: this.inputValue,
                    width: 128,
                    height: 128,
                })
            }
        },
        insert() {
            if (this.$refs.form.validate()) {
                // 表单验证通过
                this.genQR()
                // 返回二维码的base64格式字符串
                this.$emit('insertQR', document.querySelector("#qrcode img").src)
                this.dialog = false
            } else {
                // 表单验证失败
                console.log("Form validation failed");
            }
        }
    }
}
</script>

<style scoped lang="scss">
#qrcode::v-deep img {
    margin: auto;
}
</style>
  
<template>
    <div :id="schema.name">
        <v-skeleton-loader
      class="mx-auto"      
      type="card"
    ></v-skeleton-loader>
    </div>
</template>

<script>
import base from "../utils/form-base";
import {loadMicroApp, addGlobalUncaughtErrorHandler } from 'qiankun'
export default {
    mixins: [base],
    data(){
        return {
            htmlsimple:"<span>this is test</span>",

        }
    },
    created(){
        this.htmlsimple = ``;
        /**
         * 添加全局的未捕获异常处理器
         */
        // addGlobalUncaughtErrorHandler((event) => {
        // console.error(event);
        // const { message: msg } = event;
        // // 加载失败时提示
        // if (msg && msg.includes("died in status LOADING_SOURCE_CODE")) {
        //     message.error("微应用加载失败，请检查应用是否可运行");
        // }
        // });

        loadMicroApp({
            name: this.schema.microappname? this.schema.microappname: 'ReactMicroApp',
            entry: this.schema.microappadd, //'http://localhost:3000',
            container: `#${this.schema.name}`,//'#testeee',            
            props: {}
        });    
        
    }
}
</script>

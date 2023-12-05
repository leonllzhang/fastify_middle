<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <P>app main</P>
    <!-- <HelloWorld msg="Welcome to Your Vue.js App" /> -->
    <p>page head</p>
    <router-view />
    <p>page foot</p>
  </div>
</template>

<script>
// import axios from "axios";

export default {
  name: "App",

  async created() {
    // var flag = false;
    // var pageCode = "home";
    // var pageType = "page";
    // var res = await axios.post("/api/getAnony", {
    //   pageCode: pageCode,
    //   pageType: pageType,
    // });
    // if(res && res.data && res.data.statusCode==200) {
    //   console.log('res data', res.data.data)
    //   flag = res.data.data;
    // }
    // if (!flag){
    //     var aclarr = await axios.post("/api/getAccess", {
    //       pageCode: pageCode,
    //       pageType: pageType,
    //     });
    //     if(aclarr && aclarr.data && aclarr.data.statusCode==200) {
    //       console.log('aclarr data', aclarr.data.data)
    //       //acl
    //     }
    //   }
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

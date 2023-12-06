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
    console.log("app created");
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

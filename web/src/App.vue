<template>
  <v-app>
    <template>
      <router-view />
    </template>
  </v-app>
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

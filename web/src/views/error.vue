<template>
    <div class="hello">     
      <p>
        Error Page
      </p>
      <h3>{{errorCode}}</h3>
      
    </div>
  </template>
  
  <script>
  export default {   
    name:'error',
    data() {
      return {
        errorCode:''
      }
    },
    created() {
      this.errorCode = this.$route.params.errorCode;
    }
  }
  </script>
  
  <!-- Add "scoped" attribute to limit CSS to this component only -->
  <style scoped>
  h3 {
    margin: 40px 0 0;
  }
  ul {
    list-style-type: none;
    padding: 0;
  }
  li {
    display: inline-block;
    margin: 0 10px;
  }
  a {
    color: #42b983;
  }
  </style>
  
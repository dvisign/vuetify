<template>
  <v-app id="loader">
    <v-container class="h-100">
      <v-layout class="h-100" align-center justify-center>
        <v-progress-linear color="info" :indeterminate="true"></v-progress-linear>
      </v-layout>
    </v-container>
  </v-app>
</template>

<script>
  export default {

  }
</script>
<style scope>
  #loader {
    position:fixed;
    z-index:1000;
    top:0;
    left:0;
    width:100%;
    height:100%;
    background-color:#000;
  }
</style>
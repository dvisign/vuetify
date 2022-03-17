<template>
  <div id="content" fill-width>
      <router-view></router-view>
  </div>
</template>


<script>
import contextRoot from "../../config/contextRoot";
export default {
  data() {
    return {
      logined: false,
      authChk: false
    };
  },  
  created () {
    let loginPath = '';
    if (process.env.NODE_ENV == "development"){
      loginPath = '/';
    } else {
      loginPath = contextRoot;
    }

    if (this.$route.fullPath == loginPath) {
      // pass
    } else {
      this.logined = true;
      this.authChk = true;
      // if(localStorage.getItem("userAuth") == "MANAGER") {
      //     this.authChk = true
      // }

      // if (localStorage.getItem("userEmail") == null) {
      //     this.logined = false
      //     this.$router.push({name : "Login"})
      // } else {
      //     this.logined = true
      // }
    }
  }
}



</script>

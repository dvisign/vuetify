<template>
  <v-app>
    <div v-if="logined">
      <Header @change-menu="changeMenu"></Header>
      <SideMenu v-bind:selectedMenu="selectedMenu"></SideMenu>
    </div>
    <v-main>
      <ContentArea></ContentArea>
    </v-main>
  </v-app>
</template>

<script>
import ContentArea from "./components/ContentArea"
import SideMenu from "./components/SideMenu"
import Header from "./components/Header"

export default {
  name: 'App',
  components: {
    ContentArea,
    SideMenu,
    Header,
  },
  data() {
    return {
      logined: false,
      authChk: false,
      // selected header menu: payment, blockchain
      selectedMenu: 'payment',
    };
  },  
  methods: {
    loginChk(to, from, next) {
      if(localStorage.getItem("userAuth") == "MANAGER"){
        this.authChk = true
      }
      if(localStorage.getItem("userEmail") == null){
        this.logined = false
        this.$router.push({name : "Login"})
      }else{
        this.logined = true
        next()
      }
    },
    changeMenu: function(menu) {
      this.selectedMenu = menu;
    },
  },
}
</script>

<style>


</style>
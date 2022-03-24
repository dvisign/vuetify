<template>
  <v-app>
    <Header 
      v-if="logined" 
    ></Header>
    <SideMenu 
      v-if="logined" 
    ></SideMenu>
    <AppLayout></AppLayout>
    <Loading
      v-if="loading"
    ></Loading>
  </v-app>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

import SideMenu from "@/components/common/SideMenu";
import Header from "@/components/common/Header";
import AppLayout from '@/components/common/AppLayout';
import Loading from '@/components/common/Loading';

import contextRoot from "../config/contextRoot";

export default {
  name: 'App',
  components: {
    AppLayout,
    Loading,
    SideMenu,
    Header
  },
  data() {
    return {
      logined : true,
      loading : false,
      // selected header menu: payment, blockchain
      selectedMenu: 'payment',
    };
  },
  computed : {
    ...mapGetters('userStore', [
      'GET_LOGIN',
      'GET_LOGIN_ERROR',
      'GET_LOGOUT_MESSAGE'
    ])
  },
  watch : {
    GET_LOGIN(val) {
      this.logined = this.GET_LOGIN;
      if (!val && this.GET_LOGOUT_MESSAGE) {
        alert(this.GET_LOGOUT_MESSAGE);
        this.$router.push({
          name : 'Login'
        })
      }
    },
    GET_LOGIN_ERROR(val) {
      if (val) {
        alert(val);
        this.ACTION_LOGIN_FALSE('');
      }
    }
  },
  created () {
    this.logined = this.GET_LOGIN;
  },
  methods: {
    ...mapActions('userStore', [
      'ACTION_USERINFO',
      'ACTION_LOGIN_FALSE'
    ]),
    changeMenu: function(menu) {
      this.selectedMenu = menu;
    },
  },
}
</script>

<style>


</style>
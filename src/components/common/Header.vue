<template>
  <v-app-bar 
    app
    dark
    tabs
    flat
    clipped-left
    width="100%"
    color="#3f51b5"
  >
    <div
      class="d-flex justify-space-between align-center"
      style="width:100%;"
    >
      <v-toolbar-title>inside</v-toolbar-title>
      <div>
        <v-btn 
          color="#2c4f91" 
          bright 
          small 
          block
          @click="logoutSubmit"
        >LOGOUT</v-btn>
      </div>
    </div>
    <v-spacer></v-spacer>
    <template 
      v-slot:extension
    >
      <v-tabs 
        align-with-title 
      >
        <v-tab 
          v-for="item of naviItems" 
          :key="item.title" 
          @click="test(auth)"
          v-if="item.auth <= auth"
        >
          <router-link :to="{path:item.path}">{{ item.title }}</router-link>
        </v-tab>

        <!-- 
        <v-tab v-for="item of items" :key="item.title" @click="selectMenu(item)" v-if="item.id == 'auth' && authChk">{{ item.title }}</v-tab>
        -->
        <v-tabs-slider color="pink"></v-tabs-slider>
      </v-tabs>
    </template>
  </v-app-bar>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex';
  import contextRoot from '../../../config/contextRoot';
  export default {
    data () { 
      return {
        auth: 0,
        naviItems : []
      }
    },
    created () {
      this.auth = this.$store.getters['userStore/GET_USER_INFO'].auth;
    	// 매니저일떄만 관리자 관리 필요.
    	this.authChk = this.$router.app.$children[0].authChk;
    },
    mounted () {
      const tabIdx = Number(localStorage.getItem('lastTab'));
      // this.activeTab = tabIdx;
      // this.$emit('change-menu', this.items[tabIdx].id);
    },
    methods : {
      ...mapActions('userStore', [
        'ACTION_LOGOUT'
      ]),
      test : function(val) {
        console.log(val);
      },
      selectMenu: function(menu) {
        this.$emit('change-menu', menu.id);
        this.$router.push({ name: menu.main });
      },
      logoutSubmit() {
        this.ACTION_LOGOUT();
      }
    }
  }
</script>

<template>
  <v-main>
    <div id="content" fill-width>
      <router-view></router-view>
    </div>
  </v-main>
</template>


<script>
import contextRoot from "../../../config/contextRoot";
export default {
  data() {
    return {
      logined: false,
      authChk: false,
      selectedMenu: 'payment'
    };
  },  
  created () {
    
  },
  methods : {
    changeMenu: function(menu) {
      this.selectedMenu = menu;
    }
  }
}



</script>

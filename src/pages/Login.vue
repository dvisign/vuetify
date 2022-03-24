<template>
  <v-app id="app">
    <v-main class="h-100">
      <v-layout row wrap class="text-xs-center h-100 justify-center">
        <v-flex class="h-100 d-flex align-center justify-center">
          <v-card flat class="mx-auto">
            <v-form id="login_form">
              <div class="mx-3">
                <div class="mx-1">
                  <v-text-field 
                    label="userEmail" 
                    v-model="userEmail" 
                    ref="userEmailRef" 
                    :rules="[rules.required]"
                  ></v-text-field>
                </div>
              </div>
              <div class="mx-3">
                <div class="mx-1">
                  <v-text-field 
                    label="userPassword" 
                    v-model="userPwd" 
                    :type="'password'" 
                    v-on:keyup.enter="loginSubmit" 
                    :rules="[rules.required]"
                  ></v-text-field>
                </div>
              </div>
              <v-card-actions>
                <v-btn 
                  color="#2c4f91" 
                  dark 
                  large 
                  block 
                  @click="loginSubmit"
                >Login</v-btn>
              </v-card-actions>
            </v-form>
          </v-card>
        </v-flex>
      </v-layout>
    </v-main>
  </v-app>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { serverCall } from "@/api/payment/common";

export default {
  data() {
    return {
      logins : false,
      userEmail: "",
      userPwd: "",
      pwd: "",
      userInfoDialog: false,
      encryptKey: "INSIDE",
      rules: {
        required: value => !!value || 'Required.'
      }
    };
  },
  mounted(){
    this.startFocus()
  },
  computed : {
    ...mapGetters('userStore', [
      'GET_LOGIN'
    ])
  },
  watch: {
    GET_LOGIN(val) {
      if (val) {
        this.$router.push({
          path : 'Payment'
        })
      }
    }
  },
  created () {
    // if("localhost" == window.location.hostname){
    //   this.userEmail= "MANAGER"
    //   this.userPwd= "1234"
    // }
  },
  methods: {
    ...mapActions('userStore', [
      'ACTION_LOGIN'
    ]),
    loginSubmit() {
      const payload = {
        userId : this.userEmail,
        userPw : this.userPwd
      }
      this.ACTION_LOGIN(payload);
    },
    startFocus() {
      this.$refs.userEmailRef.focus()
    }
  }, 
};
</script> 

<style scoped>
  #login_form {
    width: 400px; 
    height: 300px;
  }
</style>

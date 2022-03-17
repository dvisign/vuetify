<template>
  <v-app id="app">
    <v-main>
      <v-container style="position: relative; top: 20%; margin-left: 20%" class="text-xs-center">
        <v-layout row wrap class="text-xs-center">
          <v-flex>
            <v-card flat class="mx-auto" max-width="800">
              <v-row style="margin-top: 60px">
                <v-col>
                  <v-form style="width: 400px; height: 300px">
                    <div class="mx-3">
                      <div class="mx-1">
                        <v-text-field label="userEmail" v-model="userEmail" ref="userEmailRef" :rules="[rules.required]"></v-text-field>
                      </div>
                    </div>
                    <div class="mx-3">
                      <div class="mx-1">
                        <v-text-field label="userPassword" v-model="userPwd" :type="'password'" v-on:keyup.enter="loginSubmit" :rules="[rules.required]"></v-text-field>
                      </div>
                    </div>
                    <v-card-actions>
                      <v-btn color="#2c4f91" dark large block @click="loginSubmit">Login</v-btn>
                    </v-card-actions>
                  </v-form>
                </v-col>
              </v-row>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-main>
      <v-row justify="center">
        <v-dialog v-model="userInfoDialog" persistent max-width="320">
          <v-card>
            <v-card-title>
              <span class="text-h12">비밀번호 변경</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field label="패스워드" v-model="pwd" :type="'password'" ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-btn color="blue darken-1" text @click="userInfoSave()">저장</v-btn>
              <v-btn color="blue darken-1" text @click="userInfoClose()">닫기</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
  </v-app>
</template>

<script>
import {serverCall} from "@/api/payment/common";

export default {
    data() {
        return {
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
    created () {
      // 키의 데이터 삭제
      // localStorage.removeItem("userEmail");

      // 모든 키의 데이터 삭제
      localStorage.clear();
      this.$router.app.$children[0].logined = false
      if("localhost" == window.location.hostname){
        this.userEmail= "MANAGER"
        this.userPwd= "1234"
      }
    },
    mounted(){
       this.startFocus()
    },
    methods: {
        loginSubmit() {
          const encryptedEmail = this.$CryptoJS.AES.encrypt(this.userEmail, this.encryptKey).toString()
          const encryptedPwd = this.$CryptoJS.AES.encrypt(this.userPwd, this.encryptKey).toString()
          if(this.userEmail == ""){
        	  alert("이메일을 입력하세요.")
          }else if(this.userPwd == ""){
        	  alert("패스워드를 입력하세요.")
          }else{
              var params = new URLSearchParams()
              params.append('email', encryptedEmail)
              params.append('pwd', encryptedPwd)
              serverCall("/getUserInfo", params).then(res => {
                console.log(res);
                  if(res.data == ""){
                    alert("이메일 패스워드를 확인하세요.")
                  }else if(res.data.loginFailCnt > 3){
                    alert("비밀번호 3회 이상 틀렸습니다.\n관리자에게 비밀번호 초기화 요청하세요.")
                  }else if(res.data.loginFailYn != null){
                      alert("이메일 패스워드를 확인하세요.")
                  }else if(res.data.pwdFirstYn == "Y"){
                    alert("초기 비밀번호로 비밀번호 변경이 필요합니다.")
                    this.userInfoDialog = true
                  }else{
                    localStorage.setItem("userEmail", this.userEmail)
                    localStorage.setItem("userAuth", res.data.auth)
                    setTimeout( () => {
                          alert('2시간이 경과하여 로그인창으로 이동합니다.')
                          localStorage.clear()
                          this.$router.app.$children[0].logined = false
                          this.$router.push({ name: 'Login', params: {}}).catch(()=>{});
                      }
                    , 7200000);
                    this.$router.push({ name: 'Payment', params: {}})
                  }
                }).catch(err => {
                  console.log(err.response)
                })
          }
        },
        userInfoSave() {
          if(this.pwd == "1234"){
            alert("초기비밀번호로는 변경 불가능합니다.")
            return
          }else{
              var params = new URLSearchParams()
              params.append('email', this.userEmail)
              params.append('pwd', this.pwd)
              serverCall("/mergeUser", params).then(res => {
				alert('비밀번호 변경이 완료되었습니다.')
              	this.userInfoDialog = false
              	this.userPwd = ""
            }).catch(err => {
              console.log(err.response)
            })
          }
        },
        userInfoClose() {
          this.userInfoDialog = false
        },
        startFocus() {
          this.$refs.userEmailRef.focus()
        }
    }, 
};
</script> 

<style scoped>
</style>

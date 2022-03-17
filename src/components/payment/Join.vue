<template>
  <v-app id="join">
      <div class="panel-heading">
        <h3 class="panel-title">관리자 목록</h3>
      </div>       
      <v-container fluid>
        <v-row>
          <v-col>             
            <v-text-field label="이메일" v-model="emailSearch"></v-text-field>
          </v-col>
          <v-col>
            <v-text-field label="연락처" v-model="telSearch"></v-text-field>
          </v-col>
          <v-col>
            <v-btn color="success" value="Search" @click="search()" x-large>조회</v-btn>
            <v-btn color="success" value="userInfoArea" @click="userInfoArea('NEW', '', '', '')" x-large>회원 추가</v-btn>
            <!-- <v-btn color="success" value="paymentList" @click="paymentList()" x-large>결제리스트</v-btn> -->
          </v-col>
        </v-row>
      </v-container>
      <v-simple-table fixed-header>
       <template v-slot:default>
          <thead>
            <tr>
              <th>이메일</th>
              <!-- <th>패스워드</th> -->
              <th>연락처</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="item in userList" :key="item.userId">
              <td><a href="" @click.prevent="userInfoArea('Edit',item.email,item.pwd,item.tel)"><font color="blue">{{item.email}}</font></a></td>
              <!-- <td>{{item.pwd}}</td> -->
              <td>{{item.tel}}</td>          
            </tr>
          </tbody>
        </template>
      </v-simple-table>
      <div class="text-center">
       <v-pagination v-model="currentPage" :length="totalPages" :total-visible="7" @input="getPage()"></v-pagination>
      </div>
      <v-row justify="center">
        <v-dialog v-model="userInfoDialog" persistent max-width="320">
          <v-card>
            <v-card-title>
              <span class="text-h12">관리자 정보</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field label="이메일" v-model="email" :readonly="modeVal == 'NEW' ? false : true" :rules="[rules.required, rules.email]"></v-text-field>
                    <v-text-field label="저장구분" v-model="modeVal" v-show="modeValShow"></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field label="패스워드" v-model="pwd" :type="'password'" v-show="modeValShow"></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field label="연락처" v-model="tel" :rules="[rules.tel]"></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-btn color="blue darken-1" text @click="userPwdReset()" v-if="modeVal == 'NEW' ? false : true">패스워드 초기화</v-btn>
              <v-btn color="blue darken-1" text @click="userInfoSave()">저장</v-btn>
              <v-btn color="blue darken-1" text @click="userInfoClose()">닫기</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
  </v-app>
</template>

<script>
import {select, save} from "@/api/payment/join";
import {serverCall} from "@/api/payment/common";

export default {
  name: "Join",
  data() {
    return {      
      userList: [], 
      emailSearch: '',
      telSearch: '',
      email: '',
      pwd: '',
      tel: '',
      modeVal: '',
      currentPage: 1,
      totalPages: 1,
      listSize: 10,
      pageOffset: 0,
      userInfoDialog: false,
      modeValShow: false,
      encryptKey: "INSIDE",
      rules: {
          required: value => !!value || 'Required.',
          // counter: value => value.length <= 20 || 'Max 20 characters',
          email: value => {
            const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            return pattern.test(value) || 'Invalid e-mail.'
          },
          tel: value => {
            // const pattern = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/
            // return pattern.test(value) || 'Invalid telephone number.'
            return true
          }
        },
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    search() {
      this.currentPage = 1
      this.getPage()
    },
    getPage() {
      this.pageOffset = (this.currentPage - 1) * this.listSize
      this.getUserList()
    },
    getUserList() {
      select(this.emailSearch, this.telSearch, this.pageOffset, this.listSize).then(res => {
        this.userList = res.data
        if(res.data.length > 0) {
          this.totalPages = res.data[0].totalPages
        }        
      }).catch(err => {
        console.log(err)
      })
    },    
    userInfoArea(gubun, email, pwd, tel) {
      this.userInfoDialog = true
      this.email = email
      this.pwd = pwd
      this.tel = tel
      this.modeVal = gubun
      // if(gubun == "NEW"){
      //   this.email = ""
      //   this.pwd = ""
      //   this.tel = ""
      // }else{

      // }
    },
    userInfoSave() {
        const encryptedEmail = this.$CryptoJS.AES.encrypt(this.email, this.encryptKey).toString()
        var params = new URLSearchParams()
        params.append('email', encryptedEmail)
        params.append('joinYn', "Y")
        serverCall("/getUserInfo", params).then(res => {
        	console.log(res.data)
        	if(res.data != ""){
        		alert("이미 존재하는 이메일입니다.")
        	}else{
                this.tel = this.tel.replace(/-/gi, "")
                save(this.email, null, this.tel).then(res => {
                  alert('저장되었습니다.');
                  this.userInfoDialog = false
                  this.getUserList();
          			}).catch(err => {
          				console.log(err)
                })
        	}
        }).catch(err => {
            console.log(err.response)
        })
    },
    userPwdReset() {
      // 패스워드 초기화
      if(confirm("패스워드 초기화를 진행하시겠습니까?")){
        save(this.email, '1234', null).then(res => {
          alert('초기화 되었습니다.');
          this.userInfoDialog = false
          this.getUserList();
        }).catch(err => {
          console.log(err)
        })
      }
    },
    userInfoClose() {
      this.userInfoDialog = false
      this.getUserList()
    },
    paymentList(){
      this.$router.push({ name: 'Payment', params: {}});
    }
  }
}
</script> 

<style scoped>
label{
  margin: 0 auto;
}
input{
  margin-left: 10px;
}
div{
  padding: 10px;
}
</style>

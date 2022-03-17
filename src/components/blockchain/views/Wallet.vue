<template>
  <v-app id="wallet">
      <div class="panel-heading">
        <h3 class="panel-title">Wallet 목록</h3>
      </div>
      <v-container fluid>
        <v-row>
          <v-col>
            <v-text-field label="사용자 ID" placeholder="Placeholder" v-model="userId" outlined></v-text-field>
          </v-col>
          <v-col>             
            <v-text-field label="사용자 address" placeholder="Placeholder" v-model="address" outlined></v-text-field>  
          </v-col>
          <v-col>
            <v-btn color="success" value="Search" @click="search()" x-large>조회</v-btn>
          </v-col>
        </v-row>
      </v-container>

      <v-data-table 
        fixed-header 
        :headers="headers" 
        :items="walletList" 
        
        :page.sync="page"
        :items-per-page="itemsPerPage"
        hide-default-footer
        :page-count="pageCount"
      >
        <!-- index 넘버링 삭제
        <template v-slot:item.index="{ item }">
          {{ ( (page - 1) * itemsPerPage) + walletList.indexOf(item) + 1 }}
        </template>
        -->

        <template v-for="header in headers.filter((header) => header.hasOwnProperty('formatter'))"
         v-slot:[`item.${header.value}`]="{ header, value }"
        >
          {{ header.formatter(value) }}
        </template>
        
        <template v-slot:item.change="{ item }">
          <v-btn color="primary"@click.prevent="chgConfirm(item.userId, item.status)">상태변경</v-btn>
        </template>
        <template v-slot:item.delete="{ item }">
          <v-btn color="error" @click.prevent="delConfirm(item.userId, item.status)" >계정삭제</v-btn>
        </template>
      </v-data-table>

      <!-- 페이징 처리 삭제
      <div class="text-center pt-2">
        <v-pagination v-model="page" :length="pageCount" @input="updatePagination"></v-pagination>
      </div>
      -->

      <snackbar ref="snackbar"/>

      <Modal v-if="showModal" @close="showModal = false">
      <h3 class="text-center" slot="header">검색조건을 입력해주세요.</h3>
      <p slot="body"><v-btn block color="success" dark @click="showModal=false" x-large>OK</v-btn></p>
      </Modal>

      <v-row justify="center">

          <!-- 계정 삭제 Dialog -->
          <v-dialog v-model="dialogDeleteConfirm" persistent max-width="400">
            <v-card>
              <v-card-title>
                <span class="text-h5">계정삭제</span>
              </v-card-title>
              <v-card-text>
                <v-form ref="mintForm" lazy-validation>
                  <v-row>
                    <v-col cols="12">
                      <span v-if="this.selectUserStatus !== 'KASdeleted'">현재 사용자 상태는 '{{this.selectUserStatus}}' 입니다. 삭제하시겠습니까?</span>
                      <span v-if="this.selectUserStatus == 'KASdeleted'">현재 사용자 상태는 '{{this.selectUserStatus}}'로 삭제된 계정입니다.</span>
                    </v-col>
                  </v-row>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn v-if="this.selectUserStatus !== 'KASdeleted'" color="green darken-1" text @click="delAgree(false)"> 아니오 </v-btn>
                <v-btn color="red dark-1" text @click="delAgree(true)"> 네 </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

        <!-- 계정 삭제 결과 Dialog -->
         <v-dialog v-model="dialogDelete" persistent max-width="320">
          <v-card>
            <v-card-title>
              <span class="text-h12">계정 삭제 결과</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field label="사용자 ID" filled dense disabled v-model="deleteUser.userId"></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field label="상태" filled dense disabled v-model="deleteUser.status"></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-btn color="blue darken-1" text @click="deleteClose()">닫기</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        
        <!-- 계정 상태 변경 Dialog -->
        <v-dialog v-model="dialogChangeConfirm" persistent max-width="470">
            <v-card>
              <v-card-title>
                <span class="text-h5">계정 상태 변경</span>
              </v-card-title>
              <v-card-text>
                <v-form ref="mintForm" lazy-validation>
                  <v-row>
                    <v-col cols="12">
                      <span v-if="this.selectUserStatus == 'enabled'" >현재 사용자 상태는 '{{this.selectUserStatus}}' 입니다. 'disable'로 변경하시겠습니까?</span>
                      <span v-if="this.selectUserStatus == 'disable'" >현재 사용자 상태는 '{{this.selectUserStatus}}' 입니다. 'enabled'로 변경하시겠습니까?</span>
                      <span v-if="this.selectUserStatus == 'KASdeleted'" >현재 사용자 상태는 '{{this.selectUserStatus}}' 입니다. 변경이 불가합니다.</span>
                    </v-col>
                  </v-row>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn v-if="this.selectUserStatus !== 'KASdeleted'" color="green darken-1" text @click="chgAgree(false)"> 아니오 </v-btn>
                <v-btn color="red dark-1" text @click="chgAgree(true)"> 네 </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

        <!-- 계정 상태 변경 결과 Dialog -->
        <v-dialog v-if="this.selectUserStatus !== 'KASdeleted'" v-model="dialogChange" persistent max-width="320">
          <v-card>
            <v-card-title>
              <span class="text-h12">계정 상태 변경 결과</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field label="사용자 ID" filled dense disabled v-model="changeUser.userId"></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field label="상태" filled dense disabled v-model="changeUser.status"></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-btn color="blue darken-1" text @click="changeClose()">닫기</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
  </v-app>
</template>

<script>
import axios from "axios";
import Modal from "../components/Modal.vue";
import snackbar from "../components/Snackbar.vue";

// target: go-dev
const baseUrl = 'https://api-go-dev.inside-world.net/blockchain'
// target: local
// const baseUrl = '/BC'

export default {
  
  name: "wallet",
  data: function() {
    return {
      userId : '',
      address: '',
      walletList: [],
      page: 1,
      pageCount: 0,
      itemsPerPage: 5,
      headers: [],
      showModal: false,
      dialogDeleteConfirm: false,
      dialogDelete: false,
      deleteUser: [],
      changeUser: [],
      selectUserId: '',
      selectUserStatus: '',
      dialogChangeConfirm: false,
      dialogChange: false
    }
  },
  mounted () {
    this.headers = [
        // Index 넘버링 삭제
        // { text: 'No.', align: 'center', sortable: false, value: 'index'},
        { text: '사용자 ID', align: 'center', sortable: true, value: 'userId'},
        { text: '주소', align: 'center', sortable: false, value: 'address'},
        { text: '생성일', align: 'center', sortable: true, value: 'createdAt', formatter: this.dateFormatter},
        { text: 'status', align: 'center', sortable: false, value: 'status'},
        { text: '상태변경', align: 'center', sortable: false, value: 'change'},
        { text: '계정삭제', align: 'center', sortable: false, value: 'delete'}
      ];
    this.$root.snackbar = this.$refs.snackbar    
  },
  methods: {

    getWallet: function() {
      const getWalletUri = "/admin/account/wallet/retrive"; 
      const self = this;
            
      let requestData = { 
        currentNum: self.page - 1,
        pageSize: 5
      };
    
       let option = {};

      // userid check
       if (self.userId.length > 0) {
         option.userId = self.userId;
       }

      // Address check
       if (self.address.length > 0) {
         option.address = self.address;
       }

      //option check & add option in requestData
      if (Object.keys(option).length > 0) {
        requestData.option = option;
      }else{
        this.showModal = !this.showModal;
        return
      }

      axios.post(
        baseUrl + getWalletUri, 
        JSON.stringify(requestData),
        { 
          headers: { 'Content-Type': 'application/json', Accept: '*' }
        }
      )
      .then(function(response) {
        console.log('call wallet api..');
       
        if (response.data.lists) {  
          self.walletList = response.data.lists;
          self.itemsPerPage = response.data.pageSize;
          self.pageCount = Math.ceil(response.data.totalCount / self.itemsPerPage);

          if(response.data.lists.length>0){
            self.$root.snackbar.show({message: '조회가 완료되었습니다'});
          }
        } else {
          self.walletList = [];
        }
      })
      .catch(function(error){
        console.log(error);
      });
    },
    search: function()  {
      const self = this;
      self.page = 1;
      self.getWallet();
    },
    updatePagination: function(pagination) {
      const self = this;
      self.page = pagination;
      self.getWallet();
    },
    dateFormatter: function(date) {
      if (date.length > 0) {
        return date.substring(0, 10);
      } else {
        return '';
      }
    },
    delConfirm(userId,userStatus) {
      this.dialogDeleteConfirm = true
      this.selectUserId = userId
      this.selectUserStatus= userStatus
    },
    chgConfirm(userId,userStatus) {
      this.dialogChangeConfirm = true
      this.selectUserId = userId
      this.selectUserStatus= userStatus      
    },
    delAgree(agree) {
      this.dialogDeleteConfirm = false
      if(agree) {
        this.deleteWallet()
      }
    },
    chgAgree(agree) {
      this.dialogChangeConfirm = false
      if(agree) {
        this.changeWallet() 
      }
    },

    //delete user
    deleteWallet: function(){

      if(this.selectUserStatus!=="KASdeleted"){
      const deleteWalletUri = "/admin/account/wallet/delete";     
        console.log("call api delete wallet..");
        const self = this;

        let deleteData = { 
          userId: this.selectUserId
        };

        // if(this.selectUserStatus=="KASdeleted"){
        //   self.$root.snackbar.show({message: '이미 삭제된 계정입니다.'});}

        axios.post(
          baseUrl + deleteWalletUri, 
          JSON.stringify(deleteData),
          { 
            headers: { 'Content-Type': 'application/json', Accept: '*' }
          }
        )
        .then(function (res) {
          self.dialogDelete = true; 
          self.deleteUser = [];

          if(res.data) {
          self.deleteUser = res.data
          }
        })
        .catch(function (error) {
          console.log(error);
        })
    } 
    },
    //change status
    changeWallet: function(){

      if(this.selectUserStatus!=="KASdeleted"){
      const changeWalletUri = "/admin/account/wallet/changestate";     
        console.log("call api changeState wallet..");
        const self = this;
        let changeData = { 
          userId: this.selectUserId,
          status: this.selectUserStatus
        };
        axios.post(
          baseUrl + changeWalletUri, 
          JSON.stringify(changeData),
          { 
            headers: { 'Content-Type': 'application/json', Accept: '*' }
          }
        )
        .then(function (res) {
          self.dialogChange = true; 
          self.changeUser = [];

          if(res.data) {
          self.changeUser = res.data
          }
        })
        .catch(function (error) {
          console.log(error);
        })
      }
    },
    deleteClose() {
      this.dialogDelete = false
      this.getWallet()
    },
    changeClose() {
      this.dialogChange = false
      this.getWallet()
    }
  },
  components: {
    Modal,
    snackbar
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
.overflow{
  overflow: ellipsis;
}
.th {
  text-align: center;
}

.v-simple-table th {
  text-align: center;
}
</style>

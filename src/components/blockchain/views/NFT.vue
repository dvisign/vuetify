<template>
  <v-app id="NFT">
    <div class="panel-heading">
        <h3 class="panel-title">NFT 조회(Inside)</h3>
    </div>
    <v-container fluid>
        <v-row>
          <v-col>
            <v-text-field label="token ID" placeholder="Placeholder" v-model="tokenId" outlined></v-text-field>
          </v-col>  
          <v-col>
            <v-text-field label="사용자 ID" placeholder="Placeholder" v-model="ownerUserId" outlined></v-text-field>
          </v-col>  
          <v-col>
            <v-text-field label="사용자 Address" placeholder="Placeholder" v-model="ownerAddress" outlined></v-text-field>
          </v-col> 
          <v-col>
            <v-btn color="success" value="Search" @click="search()" x-large>조회</v-btn>
          </v-col>
        </v-row>
    </v-container>

    <v-data-table 
        fixed-header 
        :headers="headers" 
        :items="NFTList" 
        
        :page.sync="page"
        :items-per-page="itemsPerPage"
        hide-default-footer
        :page-count="pageCount"
    >
        <template v-slot:item.index="{ item }">
          {{ ( (page - 1) * itemsPerPage) + NFTList.indexOf(item) + 1 }}
        </template>
        <template v-for="header in headers.filter((header) => header.hasOwnProperty('formatter'))"
         v-slot:[`item.${header.value}`]="{ header, value }">
          {{ header.formatter(value) }}
        </template>
        <template v-slot:item.TokenHistory="{ item }">
          <v-btn color="primary" @click.prevent="searchHistory(item)">토큰이력</v-btn>
        </template>
    </v-data-table>

        <div class="text-center pt-2">
            <v-pagination v-model="page" :length="pageCount" @input="updatePagination"></v-pagination>
        </div>

        <snackbar ref="snackbar"/>

        <Modal v-if="showModal" @close="showModal = false">
            <h3 class="text-center" slot="header">검색조건을 입력해주세요.</h3>
            <p slot="body"><v-btn block color="success" dark @click="showModal=false" x-large>OK</v-btn></p>
        </Modal>

      <!-- Token 이력조회 시 출력되는 Modal 창 -->
      <TModal v-if="showTModal" @close="showTModal = false">
        <h3 slot="header" >Token 이력조회</h3>
        <v-container class="text-center" fluid slot="body" >
          <v-row>
            <v-col cols="12" sm="2">
              <v-text-field label="토큰ID" filled dense disabled v-model="seletedRow.nftTokenId"></v-text-field>
            </v-col>
            <v-col cols="12" sm="5">
            <v-text-field label="계약주소" filled dense disabled v-model="seletedRow.scAddress"></v-text-field>
            </v-col>
          </v-row>
        </v-container>

        <v-data-table 
          slot="body"
          fixed-header 
          :headers="popupTableHeaders" 
          :items="NFTHistory"
          
          :page.sync="popupPage"
          :items-per-page="popupItemsPerPage"
          hide-default-footer
          :page-count="popupPageCount"
          
        >
        <template v-slot:item.index="{ item }">
          {{ ( (popupPage - 1) * popupItemsPerPage) + NFTHistory.indexOf(item) + 1 }}
        </template>
          <template v-for="header in popupTableHeaders.filter((header) => header.hasOwnProperty('formatter'))"
          v-slot:[`item.${header.value}`]="{ header, value }"
          >
            {{ header.formatter(value) }}
          </template>
          
        </v-data-table>
        <v-btn slot="footer" color="success" dark @click="showTModal=false" x-large>OK</v-btn>
        
        <div slot="footer" class="text-center pt-2">
            <v-pagination v-model="popupPage" :length="popupPageCount" @input="popupUpdatePagination" :total-visible="9"></v-pagination>
        </div>
        
      </TModal>    
    </v-app>
</template>

<script>
import axios from "axios";
import Modal from "../components/Modal.vue";
import snackbar from "../components/Snackbar.vue";
import TModal from "../components/TableModal";

const baseUrl = 'https://api-go-dev.inside-world.net/blockchain'

export default {
  
  name: "NFT",
  data: function() {
    return {
      ownerUserId : '',
      ownerAddress: '',
      NFTList: [],
      NFTHistory: [],
      headers: [],
      showModal: false,
      page: 1,
      itemsPerPage: 5,
      pageCount: 0,
      tokenId: '',
      scAddress:'',
      seletedRow: undefined,
      popupPage: 1,
      popupPageCount:0,
      popupItemsPerPage: 5,
      showTModal: false
      //window.open('http://www.daum.net ', 'newWindow');

    }
  },

  mounted () {
    this.headers = [
      { text: 'No.', align: 'center', sortable: false, value: 'index'},
      { text: '소유자ID', align: 'center', sortable: true, value: 'ownerId'},
      { text: '소유자주소', align: 'center', sortable: false, value: 'ownerAddress'},
      { text: '계약주소', align: 'center', sortable: false, value: 'scAddress'},
      { text: '토큰ID', align: 'center', sortable: false, value: 'nftTokenId'},
      //{ text: 'metaData', align: 'center', sortable: false, value: 'metaData'},
      { text: 'metaUri', align: 'center', sortable: false, value: 'metaUri'},
      { text: '상태', align: 'center', sortable: false, value: 'status'},
      //{ text: 'transactionHash', align: 'center', sortable: false, value: 'transactionHash'},
      //{ text: 'TransactionId', align: 'center', sortable: false, value: 'blockchainTransactionId'},
      { text: '생성일', align: 'center', sortable: true, value: 'createdAt', formatter: this.$datetimeFormatter},
      { text: '토큰이력', align: 'center', sortable: false, value: 'TokenHistory'}
    ];
    this.popupTableHeaders = [
      { text: 'No.', align: 'center', sortable: false, value: 'index'},
      { text: '소유자ID', align: 'center', sortable: false, value: 'ownerId'},
      { text: '소유자주소', align: 'center', sortable: false, value: 'ownerAddress'},
      { text: '이전소유자 ID', align: 'center', sortable: false, value: 'previousId'},
      { text: '이전소유자 주소', align: 'center', sortable: false, value: 'previousAddress'},
      { text: '상태', align: 'center', sortable: false, value: 'status'},
      //{ text: 'transactionHash', align: 'center', sortable: false, value: 'transactionHash'},
      //s{ text: '트랜잭션ID', align: 'center', sortable: false, value: 'blockchainTransactionId'},
      { text: '생성일', align: 'center', sortable: false, value: 'createdAt'},
      //{ text: '유효일', align: 'center', sortable: false, value: 'effectiveDate',formatter: this.convertDateFormat}
    ];
    this.$root.snackbar = this.$refs.snackbar    
  },

  methods: {
    search: function()  {
      const self = this;
      self.page = 1;
      self.getNFT();
    },
    getNFT: function()  {
      const getNFTUri = "/admin/ip/token/retrive"; 
      const self = this;

      let requestData = { 
        currentNum: self.page - 1,
        pageSize: 5
      };

      let option = {};

      if (self.tokenId.length > 0) {
         option.tokenId = self.tokenId;
      }
      if (self.ownerUserId.length > 0) {
         option.ownerUserId = self.ownerUserId;
      }
      if (self.ownerAddress.length > 0) {
         option.ownerAddress = self.ownerAddress;
      }
      if (Object.keys(option).length > 0) {
        requestData.option = option;
      }else{
        self.showModal = !self.showModal;
        return
      }
      axios.post(
        baseUrl + getNFTUri, 
        JSON.stringify(requestData),
        { 
          headers: { 'Content-Type': 'application/json', Accept: '*' }
        }
      )
      .then(function(response) {
        console.log('call NFT api..');
       
        if (response.data.lists) {  
          self.NFTList = response.data.lists;
          self.itemsPerPage = response.data.pageSize;
          self.pageCount = Math.ceil(response.data.totalCount / self.itemsPerPage);

          if(response.data.lists.length>0){
            self.$root.snackbar.show({message: '조회가 완료되었습니다'});
          }
        } else {
          self.NFTList = [];
        }
      })
      .catch(function(error){
        console.log(error);
      });

    },
    updatePagination: function(pagination) {
      const self = this;
      self.page = pagination;
      self.getNFT();
    },
    popupUpdatePagination: function(popupPagination) {
      const self = this;
      self.popupPage = popupPagination;
      self.getTokenHistory(self.seletedRow);
    },
    dateFormatter: function(date) {
      if (date.length > 0) {
        return date.substring(0, 10);
      } else {
        return '';
      }
    },
    convertDateFormat: function(date) {
      var year = date.substr(0, 4);
      var month = date.substr(4, 2);
      var day = date.substr(6, 2);

      if (date.length > 0) {
        return [year, month, day].join('-');
      } else {
        return '';
      }
    },
    searchHistory: function(row)  {
      const self = this;
      self.popupPage = 1;
      self.getTokenHistory(row);
    },
    getTokenHistory: function(row){

      console.log('Token Hostory..') 

      const TokenHistoryUri = "/admin/ip/token/history"; 
      const self = this;

      self.seletedRow = row 

      self.tokenId = self.seletedRow.nftTokenId
      self.scAddress = self.seletedRow.scAddress

      let requestData = { 
        currentNum: self.page - 1,
        pageSize: 5
      };

      let option = {};

      if (self.tokenId.length > 0) {
         option.tokenId = self.tokenId;
      }
      if (self.scAddress.length > 0) {
         option.scAddress = self.scAddress;
      }
      if (Object.keys(option).length > 0) {
        requestData.option = option;
      }else{
        self.showTModal = !self.showTModal;
        return
      }
      axios.post(
          
        baseUrl + TokenHistoryUri, 
        JSON.stringify(requestData),
        { 
          headers: { 'Content-Type': 'application/json', Accept: '*' }
        }
      )
      .then((response) => {
        if (response.data.lists) { 
          const NFTHistory = [];
          self.NFTHistory = response.data.lists;
          self.popupItemsPerPage = response.data.pageSize;
          self.popupPageCount = Math.ceil(response.data.totalCount / self.popupItemsPerPage);
          self.showTModal = true;
        } else {
          self.NFTHistory = [];
        }
      })
      .catch(function(error){
        console.log(error);
      });
    }
  },
  
  components: {
    Modal,
    snackbar,
    TModal
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

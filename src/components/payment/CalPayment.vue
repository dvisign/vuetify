<template>
  <v-app id="CalPayment">
      <div class="panel-heading">
        <h3 class="panel-title">정산 목록</h3>
      </div>       
      <v-container fluid>
        <v-row>
			<v-col cols="11" sm="5"> 
				<v-dialog ref="dialog" v-model="modal" :return-value.sync="orderYYYYMM" persistent width="290px" >
					<template v-slot:activator="{ on, attrs }">
						<v-text-field v-model="orderYYYYMM" label="생성년월" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"></v-text-field>
					</template>
					<v-date-picker v-model="orderYYYYMM" type="month" scrollable>
						<v-spacer></v-spacer> 
						<v-btn text color="primary" @click="modal = false"> Cancel </v-btn> 
						<v-btn text color="primary" @click="$refs.dialog.save(orderYYYYMM)"> OK </v-btn> 
					</v-date-picker> 
				</v-dialog> 
			</v-col>
          <v-col>
            <v-btn color="success" value="Search" @click="search()" x-large>조회</v-btn>
            <v-btn color="success" value="Search" @click="excelDown()" x-large>엑셀다운로드</v-btn>
          </v-col>
        </v-row>
      </v-container>
      <v-simple-table fixed-header>
       <template v-slot:default>
          <thead>
            <tr>
              <th>사용자ID</th>
              <th>사용자명</th>
              <th>주문번호</th>
              <th>주문일시</th>
              <th>결제수단</th>
              <th>결제상태</th>
              <th>결제금액</th>
              <th>결제번호</th> 
            </tr>
            </thead>
            <tbody>
            <tr v-for="item in payments" :key="item.seq">
              <td>{{item.userId}}</td>
              <td>{{item.userName}}</td>
              <td>{{item.orderId}}</td> 
              <td>{{item.orderDateF}}</td>
              <td>{{item.serviceCodeNm}}</td>
              <td>{{item.statusNm}}</td>
              <td>{{item.amountF}}</td>
              <td>{{item.transactionId}}</td>   
            </tr>
          </tbody>
        </template>
      </v-simple-table>
      <div class="text-center">
       <v-pagination v-model="currentPage" :length="totalPages" :total-visible="7" @input="getPage()"></v-pagination>
      </div>
  </v-app>
</template>

<script>
// import {selectList} from "../../api/payment/calPayment";
import {selectCode, excelDown, serverCall} from  "@/api/payment/common";

const d = new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000);
const year = d.getFullYear(); // 년
const month = d.getMonth();   // 월
const day = d.getDate();      // 일

export default {
  name: "CalPayment",
  data() {
    return {      
      payments: [], 
      currentPage: 1,
      totalPages: 1,
      listSize: 10,
      pageOffset: 0,
      orderYYYYMM: new Date(year, month - 1, day).toISOString().substr(0, 7),
      modal: false
    }
  },
  created () {
    this.getCalPayments()
  },
  methods: {
    search() {
      this.currentPage = 1
      this.getPage()
    },
    getPage() {
      this.pageOffset = (this.currentPage - 1) * this.listSize
      this.getCalPayments()
    },
    getCalPayments() {
        var params = new URLSearchParams();
        params.append('pageOffset', this.pageOffset);
        params.append('listSize', this.listSize);
        params.append('orderYYYYMM', this.orderYYYYMM);
    	serverCall("/getCalPaymentList", params).then(res => {
    		this.payments = res.data
            if(res.data.length > 0) {
              this.totalPages = res.data[0].totalPages
            }
    	}).catch(err => {
             console.log(err.response)
        })
    },    
    excelDown() {
    	alert("준비중입니다.")
    	return
    	let param = { serviceCode: this.serviceCode
    		    , status: this.status
    		    , orderYYYYMM: this.orderYYYYMM };
		excelDown("/getCalExcellData", "정산", param).catch(err => {
			console.log(err.response)
		})
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

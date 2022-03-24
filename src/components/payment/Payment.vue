<template>
  <v-app id="payment">
      <div class="panel-heading">
        <h3 class="panel-title">결제 목록</h3>
      </div>       
      <v-container fluid>
        <v-row>
          <v-col>             
            <v-text-field label="사용자ID" v-model="userId"></v-text-field>
          </v-col>
          <v-col>             
            <v-text-field label="사용자명" v-model="userName"></v-text-field>
          </v-col>
          <v-col>
            <v-text-field label="주문번호" v-model="orderId"></v-text-field>
          </v-col>
          <v-col>

            <v-dialog ref="dialogDateStr" v-model="modalDateStr" :return-value.sync="dateStr" persistent width="290px">
              <template v-slot:activator="{ on, attrs }">
                <v-text-field v-model="dateStr" label="주문 시작일시" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"/>
              </template>
              <v-date-picker v-model="dateStr" scrollable>
                <v-spacer/>
                <v-btn text color="primary" @click="modalDateStr = false">Cancel</v-btn>
                <v-btn text color="primary" @click="dateSet(dateStr,'dateStr')">OK</v-btn>
              </v-date-picker>
            </v-dialog>
          </v-col>
          <v-col>
            <v-dialog ref="dialogDateEnd" v-model="modalDateEnd" :return-value.sync="dateEnd" persistent width="290px">
              <template v-slot:activator="{ on, attrs }">
                <v-text-field v-model="dateEnd" label="주문 종료일시" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"/>
              </template>
              <v-date-picker v-model="dateEnd" scrollable>
                <v-spacer/>
                <v-btn text color="primary" @click="modalDateEnd = false">Cancel</v-btn>
                <v-btn text color="primary" @click="dateSet(dateEnd,'dateEnd')">OK</v-btn>
              </v-date-picker>
            </v-dialog>

          </v-col>
          <v-col>
            <v-select label="결제수단" outlined :items="serviceCodeInfos" item-text="cdVal" item-value="cdKey" v-model="serviceCode"></v-select>
          </v-col>
          <v-col>
            <v-select label="결제방법" outlined :items="paymentTypeInfos" item-text="cdVal" item-value="cdKey" v-model="paymentType"></v-select>
          </v-col>
          <v-col>
            <v-select label="결제상태" outlined :items="statusInfos" item-text="cdVal" item-value="cdKey" v-model="status"></v-select>
          </v-col>
          <v-col>
            <v-btn color="success" value="Search" @click="search()" x-large>조회</v-btn>
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
              <th>결제방법</th>
              <th>결제상태</th>
              <th>결제금액</th>
              <th>결제번호</th> 
              <th>처리결과</th>          
              <th>결제취소하기</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="item in payments" :key="item.orderId+item.status">
              <td>{{item.userId}}</td>
              <td>{{item.userName}}</td>
              
              <td>
                <span v-if="item.status == 'C'"><a href="" @click.prevent="showOrderDetal(item.orderId)"><font color="blue">{{item.orderId}}</font></a></span>
                <span v-else>{{item.orderId}}</span>
              </td> 

              <td>{{item.orderDateF}}</td>
              <td>{{item.serviceCodeNm}}</td>
              <td>{{item.paymentTypeNm}}</td>
              <td>{{item.statusNm}}</td>
              <td>{{item.amountF}}</td>
              <td>{{item.transactionId}}</td>   
              <td>{{item.responseMessage}}</td>          
              <td>
                <a href="" @click.prevent="delConfirm(item.orderId, item.status)" v-if="item.status == 'A'"><font color="red">결제취소</font></a>
              </td>        
            </tr>
          </tbody>
        </template>
      </v-simple-table>
      <div class="text-center">
       <v-pagination v-model="currentPage" :length="totalPages" :total-visible="7" @input="getPage()"></v-pagination>
      </div>
      <v-row justify="center">
        <v-dialog v-model="dialogConfirm" persistent max-width="320">
          <v-card>
            <v-card-title class="text-h12">결제 취소 하시겠습니까?</v-card-title>
            <v-card-actions>
              <v-btn color="green darken-1" text @click="delAgree(false)">아니요</v-btn>
              <v-btn color="red dark-1" text @click="delAgree(true)">네</v-btn>
            </v-card-actions>
            <v-card-actions>
              <!-- <v-row> -->
              <v-text-field label="사유" v-model="cont"></v-text-field>
              <!-- </v-row> -->
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialogCancel" persistent max-width="320">
          <v-card>
            <v-card-title>
              <span class="text-h12">결제 취소 결과</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field label="결제 취소 결과" filled dense disabled v-model="cancelPayment.responseMessage"></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field label="주문번호" filled dense disabled v-model="cancelPayment.orderId"></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field label="결제일시" filled dense disabled v-model="cancelPayment.orderDate"></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-btn color="blue darken-1" text @click="cancelClose()">닫기</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        
        <v-dialog v-model="dialogDetail" persistent max-width="800">
            <v-card>
              <v-card-title>
                <span class="text-h12">결제 상세</span>
              </v-card-title>
              <v-simple-table fixed-header>
              <template v-slot:default>
                  <thead>
                    <tr>
                      <th>결재상태</th>
                      <th>일시</th>
                      <th>처리자</th>
                      <th>사유</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="item in paymentDetail" :key="item.seq">
                      <td>{{item.serviceCodeNm}}</td> 
                      <td>{{item.regDateF}}</td>
                      <td>{{item.regId}}</td>
                      <td>{{item.cont}}</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
              <v-card-actions >
                <v-row align="center" justify="space-around">
                <v-btn color="blue darken-1" text @click="detailClose()">닫기</v-btn>
                </v-row>
              </v-card-actions>
            </v-card>
        </v-dialog>
      </v-row>
  </v-app>
</template>

<script>
import {del, select, selectDetail, getCreditStatus} from "../../api/payment/payment";
import {selectCode} from  "../../api/payment/common";

const d = new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000);
const year = d.getFullYear(); // 년
const month = d.getMonth();   // 월
const day = d.getDate();      // 일

export default {
  name: "Payment",
  data() {
    return {      
      count : 1,
      dateStr: new Date(year, month - 1, day).toISOString().substr(0, 10),
      dateEnd: (new Date(d)).toISOString().substr(0, 10),
      payments: [], 
      cancelPayment: [],
      serviceCode: '',
      paymentType: '',
      status: '', 
      userId: '',
      userName: '',
      orderId: '',
      cont: '',
      orderDate: '',
      responseMessage: '',
      serviceCodeInfos: [],
      statusInfos: [],
      paymentTypeInfos: [],
      currentPage: 1,
      totalPages: 1,
      listSize: 10,
      pageOffset: 0,
      dialogConfirm: false,
      selectOrderId: '',
      dialogCancel: false,
      dialogDetail: false,
      paymentDetail: [],
      modalDateStr: false,
      modalDateEnd: false,
      userEmail: null
    }
  },
  created () {
	  // 코드 셋팅
    // selectCode("service_code_infos","","","","ALL").then(res => {
    // 	this.serviceCodeInfos = res.data
	  // }).catch(err => {console.log(err.response)})
    // selectCode("status_infos","","","","ALL").then(res => {
    // 	this.statusInfos = res.data
	  // }).catch(err => {console.log(err.response)})
    // selectCode("paytype_infos","","","","ALL").then(res => {
    // 	this.paymentTypeInfos = res.data
	  // }).catch(err => {console.log(err.response)})
	
    // this.userEmail = localStorage.getItem("userEmail")
    // this.getPayments();
    console.log(this.$store.state)
  },
  methods: {
    search() {
      this.currentPage = 1
      this.getPage()
    },
    getPage() {
      this.pageOffset = (this.currentPage - 1) * this.listSize
      this.getPayments()
    },
    getPayments() {
    	let param = { serviceCode: this.serviceCode
    		    , status: this.status
    		    , userId: this.userId 
    		    , userName: this.userName 
    		    , orderId: this.orderId 
    		    , paymentType: this.paymentType
    		    , dateStr: this.dateStr 
    		    , dateEnd: this.dateEnd 
    		    , pageOffset: this.pageOffset
    		    , listSize: this.listSize
    		    };
      select(param).then(res => {
        this.payments = res.data
        if(res.data.length > 0) {
          this.totalPages = res.data[0].totalPages
        }
      }).catch(err => {
         console.log(err.response)
      })
    },    
    delConfirm(orderId) {
      this.cont = "";
      this.dialogConfirm = true
      this.selectOrderId = orderId
    },
    delAgree(agree) {
      this.dialogConfirm = false
      if(agree) {
        this.delExec()
      }
    },
    delExec() {
      del(this.selectOrderId, this.userEmail, this.cont).then(res => {
        this.dialogCancel = true
        this.cancelPayment = []
        if(res.data.length > 0) {
          this.cancelPayment = res.data[0]
        }
      }).catch(err => {
          console.log(err.response)
      })
    },
    cancelClose() {
      this.dialogCancel = false
      this.getPayments()
    },
    showOrderDetal(orderId) {
      selectDetail(orderId).then(res => {
        this.dialogDetail = true
        if(res.data.length > 0) {
         this.paymentDetail = res.data
        }
      }).catch(err => {
          console.log(err.response)
      })
    },
    detailClose() {
      this.dialogDetail = false
      this.getPayments()
    },
    dateSet(selDate, gubun){
      var arr1 = this.dateStr.split('-')
      var arr2 = this.dateEnd.split('-')
      var diff = new Date(arr1[0], arr1[1], arr1[2]) - new Date(arr2[0], arr2[1], arr2[2])
      var currDay = 24 * 60 * 60 * 1000;// 시 * 분 * 초 * 밀리세컨
      var currMonth = currDay * 30;// 월 만듬

      if(parseInt(diff/currMonth) < -3){
        alert("3개월 이상 조회하실수 없습니다.")
        return
      }else{
        if(gubun == "dateStr"){
          this.$refs.dialogDateStr.save(selDate)
        }else{
          this.$refs.dialogDateEnd.save(selDate)
        }
      }
    },
    join(){
      this.$router.push({ name: 'Join', params: {}})
    }
    //TODO 빌게이트 연동 조회시.
          // getCreditStatus(orderId).then(res => {
      //   this.dialogDetail = true
      //   if(res.data.length > 0) {
      //     console.log(res)
      //    this.paymentDetail = res.data
      //   }
      // }).catch(err => {
      //   console.log(err)
      // })
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

<template>
  <v-app id="FT">
    <div class="panel-heading">
      <h3 class="panel-title">포인트 보유현황</h3>
    </div>
    <v-container fluid>
      <v-row>
        <v-col>
          <v-text-field
            label="사용자 ID"
            placeholder="Placeholder"
            v-model="userId"
            outlined
          ></v-text-field>
        </v-col>
        <v-col>
          <v-btn color="success" value="Search" @click="search()" x-large
            >조회</v-btn
          >
        </v-col>
      </v-row>
    </v-container>

    <v-data-table
      fixed-header
      :headers="headers"
      :items="FTList"
      :page.sync="page"
      :items-per-page="itemsPerPage"
      hide-default-footer
      :page-count="pageCount"
    >
      <template v-slot:item.index="{ item }">
        {{ (page - 1) * itemsPerPage + FTList.indexOf(item) + 1 }}
      </template>
      <template
        v-for="header in headers.filter(header =>
          header.hasOwnProperty('formatter')
        )"
        v-slot:[`item.${header.value}`]="{ header, value }"
      >
        {{ header.formatter(value) }}
      </template>

      <template v-slot:item.transitionFT="{ item }">
        <v-btn color="primary" @click="searchTransition(item)"
          >거래내역조회</v-btn
        >
      </template>
      <template v-slot:item.KAStransitionFT="{ item }">
        <v-btn color="error" @click.prevent="searchKASTransition(item)"
          >KAS 거래내역</v-btn
        >
      </template>
      <template v-slot:item.KASBalance="{ item }">
        <v-btn color="error" @click.prevent="getKAS(item)">잔액비교</v-btn>
      </template>
    </v-data-table>

    <div class="text-center pt-2">
      <v-pagination
        v-model="page"
        :length="pageCount"
        @input="updatePagination"
      ></v-pagination>
    </div>

    <snackbar ref="snackbar" />

    <Modal v-if="showModal" @close="showModal = false">
      <h3 class="text-center" slot="header">검색조건을 입력해주세요.</h3>
      <p slot="body">
        <v-btn block color="success" dark @click="showModal = false" x-large
          >OK</v-btn
        >
      </p>
    </Modal>

    <!-- INSIDE DB 거래내역 조회 시 출력되는 Modal 창 -->
    <TModal v-if="showTModal" @close="showTModal = false">
      <h3 slot="header">INSIDE 거래내역 조회</h3>
      <v-container class="text-center" fluid slot="body">
        <v-row>
          <v-col>
            <v-text-field
              label="사용자 ID"
              filled
              dense
              disabled
              v-model="userId"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="5">
            <v-text-field
              label="계약주소"
              filled
              dense
              disabled
              v-model="selectedRow.scAddress"
            ></v-text-field>
          </v-col>
          <v-col>
            <v-dialog
              ref="dialogDateStr"
              v-model="modalDateStr"
              :return-value.sync="dateStr"
              persistent
              width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="dateStr"
                  label="처리 시작일시"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                />
              </template>
              <v-date-picker v-model="dateStr" scrollable>
                <v-spacer />
                <v-btn text color="primary" @click="modalDateStr = false"
                  >Cancel</v-btn
                >
                <v-btn text color="primary" @click="dateSet(dateStr, 'dateStr')"
                  >OK</v-btn
                >
              </v-date-picker>
            </v-dialog>
          </v-col>
          <v-col>
            <v-dialog
              ref="dialogDateEnd"
              v-model="modalDateEnd"
              :return-value.sync="dateEnd"
              persistent
              width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="dateEnd"
                  label="처리 종료일시"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                />
              </template>
              <v-date-picker v-model="dateEnd" scrollable>
                <v-spacer />
                <v-btn text color="primary" @click="modalDateEnd = false"
                  >Cancel</v-btn
                >
                <v-btn text color="primary" @click="dateSet(dateEnd, 'dateEnd')"
                  >OK</v-btn
                >
              </v-date-picker>
            </v-dialog>
          </v-col>
          <v-col>
            <v-btn
              class="ma-2"
              outlined
              color="indigo"
              value="SearchPopup"
              @click="searchPopup()"
              x-large
              >조회</v-btn
            >
          </v-col>
        </v-row>
      </v-container>

      <v-data-table
        slot="body"
        fixed-header
        :headers="popupTableHeaders"
        :items="transitionList"
        :page.sync="popupPage"
        :items-per-page="popupItemsPerPage"
        hide-default-footer
        :page-count="popupPageCount"
      >
        <template v-slot:item.index="{ item }">
          {{
            (popupPage - 1) * popupItemsPerPage +
              transitionList.indexOf(item) +
              1
          }}
        </template>
        <template
          v-for="header in popupTableHeaders.filter(header =>
            header.hasOwnProperty('formatter')
          )"
          v-slot:[`item.${header.value}`]="{ header, value }"
        >
          {{ header.formatter(value) }}
        </template>
      </v-data-table>
      <v-btn
        slot="footer"
        color="success"
        dark
        @click="showTModal = false"
        x-large
        >OK</v-btn
      >
      <div slot="footer" class="text-center pt-2">
        <v-pagination
          v-model="popupPage"
          :length="popupPageCount"
          @input="popupUpdatePagination"
          :total-visible="9"
        ></v-pagination>
      </div>
    </TModal>

    <!-- KAS 거래내역 조회 시 출력되는 Modal 창 -->
    <TModal v-if="KASTransitionModal" @close="KASTransitionModal = false">
      <h3 slot="header">KAS 거래내역 조회</h3>
      <v-container class="text-center" fluid slot="body">
        <v-row>
          <v-col>
            <v-text-field
              label="사용자 ID"
              filled
              dense
              disabled
              v-model="userId"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="5">
            <v-text-field
              label="계약주소"
              filled
              dense
              disabled
              v-model="selectedRow.scAddress"
            ></v-text-field>
          </v-col>
          <v-col>
            <v-dialog
              ref="dialogDateStr"
              v-model="modalDateStr"
              :return-value.sync="dateStr"
              persistent
              width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="dateStr"
                  label="처리 시작일시"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                />
              </template>
              <v-date-picker v-model="dateStr" scrollable>
                <v-spacer />
                <v-btn text color="primary" @click="modalDateStr = false"
                  >Cancel</v-btn
                >
                <v-btn text color="primary" @click="dateSet(dateStr, 'dateStr')"
                  >OK</v-btn
                >
              </v-date-picker>
            </v-dialog>
          </v-col>
          <v-col>
            <v-dialog
              ref="dialogDateEnd"
              v-model="modalDateEnd"
              :return-value.sync="dateEnd"
              persistent
              width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="dateEnd"
                  label="처리 종료일시"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                />
              </template>
              <v-date-picker v-model="dateEnd" scrollable>
                <v-spacer />
                <v-btn text color="primary" @click="modalDateEnd = false"
                  >Cancel</v-btn
                >
                <v-btn text color="primary" @click="dateSet(dateEnd, 'dateEnd')"
                  >OK</v-btn
                >
              </v-date-picker>
            </v-dialog>
          </v-col>
          <v-col>
            <v-btn
              class="ma-2"
              outlined
              color="indigo"
              @click="searchKASTransitionInPopup()"
              x-large
              >조회</v-btn
            >
          </v-col>
        </v-row>

        <v-btn
          slot="footer"
          color="success"
          dark
          @click="getPrevKASTransition()"
          x-large
          >prev</v-btn
        >
        <v-btn
          slot="footer"
          color="success"
          dark
          @click="getNextKASTransition()"
          x-large
          >next</v-btn
        >
      </v-container>
      <v-data-table
        slot="body"
        fixed-header
        :headers="popupKASTransitionTableHeaders"
        :items="KASTransitionList"
        hide-default-footer
        disable-pagination
      >
        <template
          v-for="header in popupKASTransitionTableHeaders.filter(header =>
            header.hasOwnProperty('formatter')
          )"
          v-slot:[`item.${header.value}`]="{ header, value }"
        >
          {{ header.formatter(value) }}
        </template>
      </v-data-table>
      <v-btn
        slot="footer"
        color="success"
        dark
        @click="KASTransitionModal = false"
        x-large
        >OK</v-btn
      >
    </TModal>

    <!-- 잔액비교 시 출력되는 Modal 창 -->
    <TModal v-if="showT2Modal" @close="showT2Modal = false">
      <h3 slot="header">포인트 보유량 확인</h3>
      <v-data-table
        slot="body"
        fixed-header
        :headers="popupKASTableHeaders"
        :items="rowDiffList"
        :page.sync="page"
        :items-per-page="itemsPerPage"
        hide-default-footer
        :page-count="pageCount"
      >
        <template
          v-for="header in popupKASTableHeaders.filter(header =>
            header.hasOwnProperty('formatter')
          )"
          v-slot:[`item.${header.value}`]="{ header, value }"
        >
          {{ header.formatter(value) }}
        </template>
      </v-data-table>
      <v-btn
        slot="footer"
        color="success"
        dark
        @click="showT2Modal = false"
        x-large
        >OK</v-btn
      >
    </TModal>
  </v-app>
</template>

<script>
import axios from "axios";
import Modal from "../components/Modal.vue";
import snackbar from "../components/Snackbar.vue";
import TModal from "../components/TableModal";

const baseUrl = process.env.BLOCKCHAIN_API_SERVER;
const d = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
const year = d.getFullYear(); // 년
const month = d.getMonth(); // 월
const day = d.getDate(); // 일

export default {
  name: "FT",
  components: {
    Modal,
    snackbar,
    TModal
  },
  data: function() {
    return {
      dateStr: new Date(year, month - 1, day).toISOString().substr(0, 10), //현재날짜 -1달
      dateEnd: new Date(d).toISOString().substr(0, 10), //현재날짜
      initDateStr: new Date(year, month - 1, day).toISOString().substr(0, 10),
      initDateEnd: new Date(d).toISOString().substr(0, 10),
      userId: "",
      scAddress: "",
      userAddress: "",
      FTList: [],
      page: 1,
      popupPage: 1,
      pageCount: 0,
      popupPageCount: 0,
      itemsPerPage: 5,
      popupItemsPerPage: 5,
      headers: [],
      showModal: false,
      showTModal: false,
      showT2Modal: false,
      tableHeaders: [],
      modalDateStr: false,
      modalDateEnd: false,
      transitionList: [],
      popupTableHeaders: [],
      rowDiffList: [],
      selectedRow: undefined,
      // KAS Transition Function
      cursor: undefined,
      KASTransitionModal: false,
      startDate: undefined,
      endDate: undefined,
      popupKASTransitionTableHeaders: [],
      KASTransitionList: [],
      KASTransitionPrevCursorList: []
    };
  },
  mounted() {
    this.headers = [
      { text: "No.", align: "center", sortable: false, value: "index" },
      { text: "계약명", align: "center", sortable: true, value: "contractName" },
      { text: "출금가능여부", align: "center", sortable: false, value: "ftContractType" },
      // 생성일 컬럼 삭제 (지갑 생성일이 아닌 최초 거래일자임)
      // { text: "생성일", align: "center", sortable: true, value: "createdAt", formatter: this.dateFormatter },
      { text: "포인트발행량", align: "center", sortable: false, value: "totalSupply", formatter: this.$numberFormatter },
      { text: "포인트사용량", align: "center", sortable: false, value: "totalUsedToken", formatter: this.$numberFormatter },
      { text: "잔여포인트", align: "center", sortable: false, value: "balance", formatter: this.$numberFormatter },
      { text: "거래내역", align: "center", sortable: false, value: "transitionFT" },
      { text: "KAS 거래내역", align: "center", sortable: false, value: "KAStransitionFT" },
      { text: "잔액비교", align: "center", sortable: false, value: "KASBalance" }
    ];
    this.popupTableHeaders = [
      { text: "No.", align: "center", sortable: false, value: "index" },
      { text: "거래일시", align: "center", sortable: false, value: "createdAt", formatter: this.$datetimeFormatter },
      { text: "거래구분", align: "center", sortable: false, value: "accountType" },
      { text: "적요", align: "center", sortable: false, value: "description" },
      { text: "거래포인트", align: "center", sortable: false, value: "tokenAmount", formatter: this.$numberFormatter },
      { text: "송신자ID", align: "center", sortable: false, value: "fromUserId" },
      { text: "송신자주소", align: "center", sortable: false, value: "fromAddress" },
      { text: "수신자ID", align: "center", sortable: false, value: "toUserId" },
      { text: "수신자주소", align: "center", sortable: false, value: "toAddress" }
    ];
    this.popupKASTableHeaders = [
      { text: "데이터소스", align: "center", sortable: true, value: "datasource" },
      { text: "balance", align: "center", sortable: false, value: "balance", formatter: this.$numberFormatter }
    ];
    this.$root.snackbar = this.$refs.snackbar;

    this.popupKASTransitionTableHeaders = [
      { text: "거래일시", align: "center", sortable: false, value: "transaction.timestamp", formatter: this.$unixDatetimeFormatter },
      { text: "거래포인트", align: "center", sortable: false, value: "formattedValue" },
      { text: "Transaction ID", align: "center", sortable: false, value: "transaction.transactionHash" },
      { text: "송신자 주소", align: "center", sortable: false, value: "from" },
      { text: "수신자 주소", align: "center", sortable: false, value: "to" }
    ];
  },
  methods: {
    getFT: function() {
      const getFTUri = "/admin/point/token/retrive/ledger";
      const self = this;

      let requestData = {
        currentNum: self.page - 1,
        pageSize: 5
      };

      let option = {};

      if (self.userId.length > 0) {
        option.userId = self.userId;
      }
      if (Object.keys(option).length > 0) {
        requestData.option = option;
      } else {
        this.showModal = !this.showModal;
        return;
      }
      axios
        .post(baseUrl + getFTUri, JSON.stringify(requestData), {
          headers: { "Content-Type": "application/json", Accept: "*" }
        })
        .then(function(response) {
          if (response.data.lists) {
            self.FTList = response.data.lists;
            self.itemsPerPage = response.data.pageSize;
            self.pageCount = Math.ceil(
              response.data.totalCount / self.itemsPerPage
            );
            if (response.data.lists.length > 0) {
              self.$root.snackbar.show({ message: "조회가 완료되었습니다" });
            }
          } else {
            self.FTList = [];
          }
        })
        .catch(function(error) {
          self.FTList = [];
          self.$root.snackbar.show({ message: error.response.data.message, color: "fail" });
        });
    },
    search: function() {
      const self = this;
      self.page = 1;
      self.dateStr = self.initDateStr;
      self.dateEnd = self.initDateEnd;
      self.getFT();
    },
    searchTransition: function(row) {
      const self = this;
      self.dateStr = self.initDateStr;
      self.dateEnd = self.initDateEnd;
      self.popupPage = 1;
      self.getTransitionFT(row);
    },
    searchKASTransition: function(row) {
      const self = this;
      self.dateStr = self.initDateStr;
      self.dateEnd = self.initDateEnd;
      // KAS 거래내역 조회 시 Prev Cursor List 를 초기화
      self.KASTransitionPrevCursorList = [];
      self.getKASTransitionFT(row);
      self.selectedRow = row;
    },
    searchKASTransitionInPopup: function() {
      this.cursor = undefined;
      this.KASTransitionPrevCursorList = [];
      this.getKASTransitionFT(this.selectedRow);
    },
    getNextKASTransition: function() {
      if (this.cursor == "") {
        alert("마지막 페이지 입니다.");
        return;
      }

      if (this.KASTransitionPrevCursorList.length == 0) {
        this.KASTransitionPrevCursorList = [undefined];
      }

      this.KASTransitionPrevCursorList.push(this.cursor);
      this.getKASTransitionFT(this.selectedRow);
    },
    getPrevKASTransition: function() {
      if (this.KASTransitionPrevCursorList.length == 0) {
        alert("첫 페이지 입니다.");
        return;
      }
      this.cursor = this.KASTransitionPrevCursorList.pop();
      console.log(this.cursor);
      this.getKASTransitionFT(this.selectedRow);
    },
    searchPopup: function() {
      const self = this;
      self.popupPage = 1;
      self.getTransitionFT(self.selectedRow);
    },
    updatePagination: function(pagination) {
      const self = this;
      self.page = pagination;
      self.getFT();
    },
    popupUpdatePagination: function(popupPagination) {
      const self = this;
      self.popupPage = popupPagination;
      self.getTransitionFT(self.selectedRow);
    },
    dateFormatter: function(date) {
      if (date.length > 0) {
        return date.substring(0, 10);
      } else {
        return "";
      }
    },
    getTransitionFT: function(row) {
      const self = this;
      const targetUri = "/admin/point/token/retrive/ledger/log";

      self.selectedRow = row;

      let requestData = {
        currentNum: self.popupPage - 1,
        pageSize: 5
      };

      let option = {};

      if (self.userId.length > 0) {
        option.userId = row.userId;
        option.scAddress = row.scAddress;
        option.userAddress = row.ownerAddress;
        option.startDate = self.startDate;
        option.endDate = self.endDate;
      }

      if (Object.keys(option).length > 0) {
        requestData.option = option;
      } else {
        this.showTModal = !this.showTModal;
        return;
      }

      axios
        .post(baseUrl + targetUri, JSON.stringify(requestData), {
          headers: { "Content-Type": "application/json", Accept: "*" }
        })
        .then(function(response) {
          if (response.data.lists) {
            const transitionList = [];
            self.transitionList = response.data.lists;
            self.popupItemsPerPage = response.data.pageSize;
            self.popupPageCount = Math.ceil(
              response.data.totalCount / self.popupItemsPerPage
            );
            self.showTModal = true;
          } else {
            self.transitionList = [];
          }
        })
        .catch(function(error) {
          console.log(error);
          self.$root.snackbar.show({
            message: error.response.data.message,
            color: "fail"
          });
        });
    },
    getKASTransitionFT: function(row) {
      const self = this;
      const targetUri = "/admin/history/transfer/account/kas";

      let requestData = {
        userId: row.userId,
        scAddress: row.scAddress,
        kind: "ft",
        fromDate: self.dateStr.replaceAll("-", ""),
        endDate: self.dateEnd.replaceAll("-", ""),
        fromOnly: false,
        toOnly: false,
        size: 5,
        cursor: self.cursor
      };

      axios
        .post(baseUrl + targetUri, JSON.stringify(requestData), {
          headers: { "Content-Type": "application/json", Accept: "*" }
        })
        .then(function(response) {
          if (response.data.items) {
            self.KASTransitionList = response.data.items;
            self.KASTransitionModal = true;
            self.cursor = response.data.cursor;
            if (response.data.cursor == "") {
              self.KASTransitionPrevCursorList.pop();
            }
          } else {
            self.KASTransitionList = [];
          }
        })
        .catch(function(error) {
          console.log(error);
          self.$root.snackbar.show({
            message: error.response.data.message,
            color: "fail"
          });
        });
    },
    dateSet(selDate, gubun) {
      var arr1 = this.dateStr.split("-");
      var arr2 = this.dateEnd.split("-");
      var diff = new Date(arr1[0], arr1[1], arr1[2]) - new Date(arr2[0], arr2[1], arr2[2]);
      var currDay = 24 * 60 * 60 * 1000; // 시 * 분 * 초 * 밀리세컨
      var currMonth = currDay * 30; // 월 만듬

      let startDate = "";
      let endDate = "";

      this.startDate = arr1[0].concat(arr1[1], arr1[2]);
      this.endDate = arr2[0].concat(arr2[1], arr2[2]);

      if (parseInt(diff / currMonth) < -3) {
        alert("3개월 이상 조회하실수 없습니다.");
        return;
      } else {
        if (gubun == "dateStr") {
          this.$refs.dialogDateStr.save(selDate);
        } else {
          this.$refs.dialogDateEnd.save(selDate);
        }
      }
    },
    getKAS(row) {
      const self = this;
      const getKASUri = "/admin/point/token/retrive/ledger/kas";

      let requestData = {
        userId: row.userId,
        scAddress: row.scAddress
      };

      axios
        .post(baseUrl + getKASUri, JSON.stringify(requestData), {
          headers: { "Content-Type": "application/json", Accept: "*" }
        })
        .then(response => {
          if (response.data) {
            const tempList = [];
            let dbData = Object.assign(row, { datasource: "DB" });
            let kasData = Object.assign(response.data, { datasource: "KAS" });
            tempList.push(row);
            tempList.push(response.data);
            self.rowDiffList = tempList;
            self.showT2Modal = true;
          } else {
            self.rowDiffList = [];
          }
        })
        .catch(error => {
          console.log(error);
          self.$root.snackbar.show({
            message: error.response.data.message,
            color: "fail"
          });
        });
    }
  },  
};
</script>

<style scoped>
label {
  margin: 0 auto;
}
input {
  margin-left: 10px;
}
div {
  padding: 10px;
}
.overflow {
  overflow: ellipsis;
}
.th {
  text-align: center;
}

.v-simple-table th {
  text-align: center;
}

#virtual-scroll-table {
  max-height: 400px;
  overflow: auto;
}
</style>

<template>
  <v-app id="smartContract">
    <div class="panel-heading">
      <h3 class="panel-title">계약 관리</h3>
    </div>
    <v-container fluid>
      <v-row>
        <v-col>
          <v-select
            label="계약 구분"
            outlined
            :items="searchOptions"
            item-text="name"
            item-value="value"
            v-model="contractType"
          ></v-select>
        </v-col>
        <v-col>
          <v-text-field
            label="계약명"
            v-model="contractAlias"
          ></v-text-field>
        </v-col>
        <v-col>
          <v-btn color="success" @click="search" x-large>조회</v-btn>
          <v-btn color="success" @click="addContractDialog = true" x-large
            >계약추가</v-btn
          >
        </v-col>
      </v-row>
    </v-container>

    <!-- search data table -->
    <div>
      <p align="right" style="color:gray;">
        해당 데이터는 KAS 에서 조회된 데이터입니다.
      </p>
    </div>
    <v-data-table
      fixed-header
      :headers="tableHeaders"
      :items="smartContractList"
      :page.sync="page"
      :items-per-page="itemsPerPage"
      hide-default-footer
      :page-count="pageCount"
    >
      <template v-slot:item.index="{ item }">
        {{ (page - 1) * itemsPerPage + smartContractList.indexOf(item) + 1 }}
      </template>
      <template
        v-for="header in tableHeaders.filter(header =>
          header.hasOwnProperty('formatter')
        )"
        v-slot:[`item.${header.value}`]="{ header, value }"
      >
        {{ header.formatter(value) }}
      </template>

      <template v-slot:item.add="{ item }">
        <v-btn
          v-show="item.type == 'FT'"
          color="primary"
          @click="openDialog(item, 'mintDialog')"
          >포인트 발행</v-btn
        >
      </template>
      <template v-slot:item.burn="{ item }">
        <v-btn
          v-show="item.type == 'FT'"
          color="error"
          @click="openDialog(item, 'burnDialog')"
          >포인트 소각</v-btn
        >
      </template>
    </v-data-table>
    <div class="text-center pt-2">
      <v-pagination
        v-model="page"
        :length="pageCount"
        @input="updatePagination"
        :total-visible="9"
      ></v-pagination>
    </div>
    <snackbar ref="snackbar" />

    <!-- 계약추가 Dialog -->
    <div>
      <v-row justify="center">
        <v-dialog v-model="addContractDialog" persistent max-width="600px">
          <v-card>
            <v-card-title>
              <span class="text-h5">계약 추가</span>
            </v-card-title>
            <v-card-text>
              <v-form ref="addContractForm" lazy-validation>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="계약명*"
                      v-model="addContractParams['alias']"
                      hint="알파벳, 숫자, '-' 만 입력가능, 첫 단어는 알파벳 소문자"
                      persistent-hint
                      required
                      :rules="aliasRule"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      label="symbol*"
                      v-model="addContractParams['symbol']"
                      hint="영어 대문자 3~4 개 입력"
                      persistent-hint
                      required
                      :rules="symbolRule"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-select
                      :items="contractTypeInfos"
                      item-text="name"
                      item-value="value"
                      label="계약 구분*"
                      v-model="addContractParams['contractType']"
                      required
                    ></v-select>
                  </v-col>
                  <v-col
                    v-if="addContractParams['contractType'] != 'NFT'"
                    cols="12"
                  >
                    <v-text-field
                      label="최초 발행 포인트 수량*"
                      v-model="addContractParams['initialsupply']"
                      hint="필수컬럼 : FT 생성 시 사용되는 최초 발행 포인트"
                      persistent-hint
                      required
                      :rules="pointRule"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="blue darken-1"
                text
                @click="addContractDialog = false"
              >
                Close
              </v-btn>
              <v-btn color="blue darken-1" text @click="addContract()">
                추가
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </div>
    <!-- 계약추가 Confirm Dialog -->
    <ConfirmDialog ref="confirmDialog" />
    <!-- 포인트발행 Dialog -->
    <div>
      <v-row justify="center">
        <v-dialog v-model="mintDialog" persistent max-width="600px">
          <v-card>
            <v-card-title>
              <span class="text-h5">포인트 발행</span>
            </v-card-title>
            <v-card-text>
              <v-form ref="mintForm" lazy-validation>
                <v-row>
                  <v-col cols="12">
                    <span
                      >발행대상 포인트:
                      {{ selectedRow ? selectedRow["name"] : "" }}</span
                    >
                  </v-col>
                  <v-col cols="12">
                    <span
                      >총 포인트 발행량:
                      {{
                        selectedRow
                          ? $numberFormatter(selectedRow["totalSupply"])
                          : ""
                      }}</span
                    >
                  </v-col>
                  <v-col cols="12">
                    <span
                      >관리자 보유 포인트량:
                      {{
                        selectedRow
                          ? $numberFormatter(selectedRow["balance"])
                          : ""
                      }}</span
                    >
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      label="포인트 발행량"
                      v-model="amountOfMint"
                      hint="필수컬럼 : 추가로 발행되는 포인트량"
                      persistent-hint
                      required
                      :rules="pointRule"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="mintDialog = false">
                Close
              </v-btn>
              <v-btn color="blue darken-1" text @click="mintToken()">
                발행
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </div>
    <!-- 포인트소각 Dialog -->
    <div>
      <v-row justify="center">
        <v-dialog v-model="burnDialog" persistent max-width="600px">
          <v-card>
            <v-card-title>
              <span class="text-h5">포인트 소각</span>
            </v-card-title>
            <v-card-text>
              <v-form ref="burnForm" lazy-validation>
                <v-row>
                  <v-col cols="12">
                    <span
                      >소각대상 포인트:
                      {{ selectedRow ? selectedRow["name"] : "" }}</span
                    >
                  </v-col>
                  <v-col cols="12">
                    <span
                      >총 포인트 발행량:
                      {{
                        selectedRow
                          ? $numberFormatter(selectedRow["totalSupply"])
                          : ""
                      }}</span
                    >
                  </v-col>
                  <v-col cols="12">
                    <span
                      >관리자 보유 포인트량:
                      {{
                        selectedRow
                          ? $numberFormatter(selectedRow["balance"])
                          : ""
                      }}</span
                    >
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      label="포인트 소각량"
                      v-model="amountOfBurn"
                      hint="필수컬럼 : 소각되는 포인트량"
                      persistent-hint
                      required
                      :rules="pointRule"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="burnDialog = false">
                Close
              </v-btn>
              <v-btn color="blue darken-1" text @click="burnToken()">
                소각
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </div>
  </v-app>
</template>

<script>
import axios from "axios";
import snackbar from "../components/Snackbar";
import TModal from "../components/TableModal";
import ConfirmDialog from "../components/ConfirmDialog";

const baseUrl = process.env.BLOCKCHAIN_API_SERVER;

export default {
  components: {
    snackbar,
    TModal,
    ConfirmDialog
  },
  name: "smartContract",
  data() {
    return {
      // 공통
      contractTypeInfos: [
        { name: "환급가능 포인트", value: "FT_Y" },
        { name: "환급불가 포인트", value: "FT_N" },
        { name: "NFT", value: "NFT" }
      ],
      // 계약 조회
      searchOptions: [],
      contractType: "all",
      contractAlias: "",
      smartContractList: [],
      page: 1,
      pageCount: 0,
      itemsPerPage: 5,
      tableHeaders: [],
      // KAS 조회 Modal
      showModal: false,
      rowDiffList: [],
      popupTableHeaders: [],
      // 계약 추가
      addContractDialog: false,
      pointRule: [
        v => /^[0-9]/.test(v) || "1 이상의 정수를 입력해주세요",
        v => !(v && v.length > 18) || "포인트는 18자리 이하의 정수입니다",
        v => Number(v) >= 1 || "1보다 큰 값을 입력해주세요"
      ],
      symbolRule: [
        v => 3 <= v.length <= 4 || "symbol 은 3~4 글자의 영문자 대문자입니다",
        v => /^[A-Z]/.test(v) || "symbol 은 영문자 대문자만 사용가능합니다"
      ],
      aliasRule: [
        v =>
          /^[a-z][\w]/.test(v) ||
          "첫 글자는 영문자 소문자만 입력할 수 있습니다",
        v =>
          /^[0-9a-zA-Z]([-_\.]?[0-9a-z])*/.test(v) ||
          "계약명은 영문자 소문자, 숫자, - 만 사용가능합니다"
      ],
      addContractParams: {
        alias: "",
        symbol: "",
        contractType: "FT_N",
        initialsupply: ""
      },
      mintDialog: false,
      burnDialog: false,
      selectedRow: undefined,
      amountOfMint: "",
      amountOfBurn: ""
    };
  },
  mounted() {
    this.searchOptions = [{ name: "전체", value: "all" }].concat(
      this.contractTypeInfos
    );
    this.tableHeaders = [
      { text: "No.", align: "center", sortable: false, value: "index" },
      { text: "구분", align: "center", sortable: true, value: "type" },
      { text: "주소", align: "center", sortable: false, value: "address" },
      { text: "계약명", align: "center", sortable: false, value: "name" },
      { text: "총 포인트 발행량", align: "center", sortable: false, value: "totalSupply", formatter: this.$numberFormatter },
      { text: "관리자 보유 포인트량", align: "center", sortable: false, value: "balance", formatter: this.$numberFormatter },
      { text: "symbol", align: "center", sortable: false, value: "symbol" },
      { text: "생성일", align: "center", sortable: true, value: "createdAt", formatter: this.$dateFormatter },      
      { text: "포인트 추가 발행", align: "center", sortable: false, value: "add" },
      { text: "포인트 소각", align: "center", sortable: false, value: "burn" }
    ];
    this.popupTableHeaders = [
      { text: "데이터소스", align: "center", sortable: true, value: "datasource" },
      { text: "주소", align: "center", sortable: false, value: "address" },
      { text: "계약명", align: "center", sortable: false, value: "name" },
      { text: "총 포인트 발행량", align: "center", sortable: false, value: "totalSupply", formatter: this.$numberFormatter },
      { text: "관리자 보유 포인트량", align: "center", sortable: false, value: "balance", formatter: this.$numberFormatter },
      { text: "symbol", align: "center", sortable: false, value: "symbol" }
    ];
    this.$root.snackbar = this.$refs.snackbar;
    this.$root.confirmDialog = this.$refs.confirmDialog;
    this.search();
  },
  methods: {
    popupGetKas: function() {
      this.showModal = true;
    },
    getSmartContract: function() {
      const targetUri = "/admin/contract/retrive";

      let requestData = {
        currentNum: this.page - 1,
        pageSize: 5
      };

      const contractOptions = this.contractType.split("_");
      let option = {};

      // contract type check
      // contractOpsions = ['NFT'] || ['FT', 'Y or N']
      if (contractOptions.length == 1) {
        if ("NFT" == contractOptions[0]) {
          option.type = contractOptions[0];
        }
      } else if (contractOptions.length == 2) {
        option.type = contractOptions[0];
        option.ftContractType = contractOptions[1];
      }

      // contract alias check
      if (this.contractAlias.length > 0) {
        option.alias = this.contractAlias;
      }

      // option check & add option in requestData
      if (Object.keys(option).length > 0) {
        requestData.option = option;
      }

      axios
        .post(baseUrl + targetUri, JSON.stringify(requestData), {
          headers: { "Content-Type": "application/json", Accept: "*" }
        })
        .then(response => {
          if (response.data.lists) {
            this.smartContractList = response.data.lists;
            this.itemsPerPage = response.data.pageSize;
            this.pageCount = Math.ceil( response.data.totalCount / this.itemsPerPage );

            this.$root.snackbar.show({ message: "조회가 완료되었습니다" });
          } else {
            this.smartContractList = [];
          }
        })
        .catch(error => {
          this.$root.snackbar.show({ message: error.response.data.message, color: "fail" });
        });
    },
    search: function() {
      this.page = 1;
      this.getSmartContract();
    },
    updatePagination: function(pagination) {
      this.page = pagination;
      this.getSmartContract();
    },    
    addContract: function() {
      const targetUri = "/admin/contract/deploy";

      const contractOptions = this.addContractParams["contractType"].split("_");
      let requestData = {
        alias: this.addContractParams["alias"],
        symbol: this.addContractParams["symbol"],
        // FT or NFT
        type: contractOptions[0],
        // 출금 가능: Y, 불가: N
        ftContractType: contractOptions[1]
      };

      if (requestData.type == "FT") {
        if (this.addContractParams["initialsupply"] == "") {
          // 필수데이터 initialsupply 누락
          this.$root.snackbar.show({ message: "필수데이터 최초 발행 포인트 수량이 누락되었습니다", color: "fail" });
          return;
        } else {
          requestData.initialsupply = this.addContractParams["initialsupply"];
        }
      }

      const validate = this.$refs.addContractForm.validate();
      if (validate) {
        // console.log(requestData);
      } else {
        this.$root.snackbar.show({ message: "입력하신 값을 확인해주세요", color: "fail" });
        return;
      }

      this.addContractDialog = false;
      // 생성된 계약은 삭제할 수 없으므로 Confirm 을 받는다.
      this.$root.confirmDialog
        .show({ message: "추가하신 계약은 삭제하실 수 없습니다. 계약을 추가하시겠습니까?" })
        .then(isConfirm => {
          if (isConfirm) {
            axios
              .post(baseUrl + targetUri, JSON.stringify(requestData), {
                headers: { "Content-Type": "application/json", Accept: "*" }
              })
              .then(response => {
                if (response.status == 200) {
                  // 추가요청 전송 후 params 초기화용
                  this.addContractParams = {
                    alias: "",
                    symbol: "",
                    contractType: "",
                    initialsupply: ""
                  };

                  alert("생성요청에 성공했습니다");
                  this.search();
                } else if (response.data.message) {
                  this.$root.snackbar.show({ message: response.data.message, color: "fail" });
                }
              })
              .catch(error => {
                this.$root.snackbar.show({ message: error.response.data.message, color: "fail" });
              });
          } else {
            this.$root.snackbar.show({ message: "생성요청을 취소합니다" });
          }
        });
    },
    openDialog: function(row, key) {
      this.selectedRow = row;
      this[key] = true;
    },
    mintToken: function() {
      const targetUri = "/admin/contract/mint";

      let requestData = {
        alias: this.selectedRow["alias"],
        amount: this.amountOfMint
      };

      const validate = this.$refs.mintForm.validate();
      if (validate) {
        // console.log(requestData);
      } else {
        this.$root.snackbar.show({ message: "입력하신 값을 확인해주세요.", color: "fail" });
        return;
      }

      if (
        this.amountOfMint + this.selectedRow["totalSupply"] >
        999999999999999999
      ) {
        this.$root.snackbar.show({ message: "총 포인트 발행량은 999,999,999,999,999,999 를 초과할 수 없습니다", color: "fail" });
        return;
      }

      this.mintDialog = false;
      this.$root.confirmDialog
        .show({ message: "포인트 추가발행을 진행합니다" })
        .then(isConfirm => {
          if (isConfirm) {
            axios
              .post(baseUrl + targetUri, JSON.stringify(requestData), {
                headers: { "Content-Type": "application/json", Accept: "*" }
              })
              .then(response => {
                if (response.status == 200) {
                  // 추가발행 후 params 초기화용
                  this.amountOfMint = 0;

                  alert("포인트 추가발행에 성공했습니다");
                  this.getSmartContract();
                } else if (response.data.message) {
                  this.$root.snackbar.show({ message: response.data.message, color: "fail" });
                }
              })
              .catch(error => {
                this.$root.snackbar.show({ message: error.response.data.message, color: "fail" });
              });
          } else {
            this.$root.snackbar.show({ message: "포인트 추가발행을 취소합니다" });
          }
        });
    },
    burnToken: function() {
      const targetUri = "/admin/contract/burn";

      let requestData = {
        alias: this.selectedRow["alias"],
        amount: this.amountOfBurn
      };

      const validate = this.$refs.burnForm.validate();
      if (validate) {
        // console.log(requestData);
      } else {
        this.$root.snackbar.show({ message: "입력하신 값을 확인해주세요.", color: "fail" });
        return;
      }

      if (this.amountOfBurn > this.selectedRow["balance"]) {
        this.$root.snackbar.show({ message: "포인트 소각량은 관리자 보유 포인트량을 초과할 수 없습니다", color: "fail" });
        return;
      }

      this.burnDialog = false;
      this.$root.confirmDialog
        .show({ message: "포인트 소각을 진행합니다" })
        .then(isConfirm => {
          if (isConfirm) {
            axios
              .post(baseUrl + targetUri, JSON.stringify(requestData), {
                headers: { "Content-Type": "application/json", Accept: "*" }
              })
              .then(response => {
                if (response.status == 200) {
                  // 소각 후 params 초기화용
                  this.amountOfBurn = 0;

                  alert("포인트 소각에 성공했습니다");
                  this.getSmartContract();
                } else if (response.data.message) {
                  this.$root.snackbar.show({ message: error.response.data.message, color: "fail" });
                }
              })
              .catch(error => {
                this.$root.snackbar.show({ message: error.response.data.message, color: "fail" });
              });
          } else {
            this.$root.snackbar.show({ message: "포인트 소각을 취소합니다" });
          }
        });
    }
  }
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
</style>

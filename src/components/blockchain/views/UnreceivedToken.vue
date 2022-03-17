<template>
  <v-app id="unreceivedToken">
    <div class="panel-heading">
      <h3 class="panel-title">미수령 포인트 조회</h3>
    </div>
    <v-container fluid>
      <v-row>
        <v-col>
          <v-text-field label="사용자 ID" v-model="userId"></v-text-field>
        </v-col>
        <v-col>
          <v-btn color="success" @click="search" x-large>조회</v-btn>
          <v-btn color="error" @click="openDialog('receiveDialog')" x-large
            >포인트 전달</v-btn
          >
        </v-col>
      </v-row>
    </v-container>

    <!-- search data table -->
    <v-data-table
      fixed-header
      :headers="tableHeaders"
      :items="unreceivedList"
      show-select
      :page.sync="page"
      :items-per-page="itemsPerPage"
      hide-default-footer
      :page-count="pageCount"
      v-model="selected"
    >
      <template
        v-for="header in tableHeaders.filter(header =>
          header.hasOwnProperty('formatter')
        )"
        v-slot:[`item.${header.value}`]="{ header, value }"
      >
        {{ header.formatter(value) }}
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

    <Modal v-if="searchRuleModal" @close="searchRuleModal = false">
      <h3 class="text-center" slot="header">검색조건을 입력해주세요.</h3>
      <p slot="body">
        <v-btn
          block
          color="success"
          dark
          @click="searchRuleModal = false"
          x-large
          >OK</v-btn
        >
      </p>
    </Modal>

    <!-- 포인트 전달 Dialog -->
    <div>
      <v-row justify="center">
        <v-dialog v-model="receiveDialog" persistent max-width="600px">
          <v-card>
            <v-card-title>
              <span class="text-h5">포인트 전달</span>
            </v-card-title>
            <v-card-text>
              <v-form ref="receiveForm" lazy-validation>
                <v-row>
                  <v-col cols="12">
                    <span>사용자 ID: {{ userId ? userId : "" }}</span>
                  </v-col>
                  <v-col cols="12">
                    <span
                      >선택된 {{ selected.length }} 건의 포인트를
                      전달합니다.</span
                    >
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="receiveDialog = false">
                Close
              </v-btn>
              <v-btn color="blue darken-1" text @click="receiveToken()">
                전달
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </div>
    <!-- 포인트 전달하기 Confirm Dialog -->
    <ConfirmDialog ref="confirmDialog" />
  </v-app>
</template>

<script>
import axios from "axios";
import snackbar from "../components/Snackbar";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";

const baseUrl = process.env.BLOCKCHAIN_API_SERVER;

export default {
  components: {
    snackbar,
    Modal,
    ConfirmDialog
  },
  name: "unreceivedToken",
  data() {
    return {
      // 공통
      contractTypeInfos: [
        { name: "환급가능 포인트", value: "FT_Y" },
        { name: "환급불가 포인트", value: "FT_N" }
      ],
      // 계약 조회
      searchOptions: [],
      contractType: "all",
      userId: "",
      unreceivedList: [],
      page: 1,
      pageCount: 0,
      itemsPerPage: 5,
      tableHeaders: [],
      // 계약 추가
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
          "계약 별칭은 영문자 소문자, 숫자, - 만 사용가능합니다"
      ],
      receiveDialog: false,
      selectedRow: undefined,
      searchRuleModal: false,
      selected: []
    };
  },
  mounted() {
    this.searchOptions = [{ name: "전체", value: "all" }].concat(this.contractTypeInfos);
    this.tableHeaders = [
      { text: "일시", align: "center", sortable: true, value: "createdAt", formatter: this.$datetimeFormatter },
      { text: "적요", align: "center", sortable: false, value: "description" },
      { text: "금액", align: "center", sortable: false, value: "tokenAmount", formatter: this.$numberFormatter },
      { text: "수수료", align: "center", sortable: false, value: "feesAmount", formatter: this.$numberFormatter }
    ];
    this.$root.snackbar = this.$refs.snackbar;
    this.$root.confirmDialog = this.$refs.confirmDialog;
  },
  methods: {
    getUnreceivedList: function() {
      const targetUri = "/admin/point/token/retrive/unreceivedlist";
      
      let requestData = {
        currentNum: this.page - 1,
        pageSize: 5
      };

      const contractOptions = this.contractType.split("_");
      let option = {};

      // contract alias check
      if (this.userId.length > 0) {
        option.userId = this.userId;
      } else {
        this.searchRuleModal = true;
        return;
      }

      requestData.option = option;

      axios
        .post(baseUrl + targetUri, JSON.stringify(requestData), {
          headers: { "Content-Type": "application/json", Accept: "*" }
        })
        .then(response => {
          if (response.data.lists) {
            this.unreceivedList = response.data.lists;
            this.itemsPerPage = response.data.pageSize;
            this.pageCount = Math.ceil(
              response.data.totalCount / this.itemsPerPage
            );

            this.$root.snackbar.show({ message: "조회가 완료되었습니다" });
          } else {
            this.unreceivedList = [];
          }
        })
        .catch(error => {
          this.unreceivedList = [];
          this.$root.snackbar.show({ message: error.response.data.message, color: "fail" });
        });
    },
    search: function() {
      this.page = 1;
      this.getUnreceivedList();
    },
    updatePagination: function(pagination) {
      this.page = pagination;
      this.getUnreceivedList();
    },
    openDialog: function(key) {
      this[key] = true;
    },
    receiveToken: function() {
      const targetUri = "/point/token/receive";

      let idList = [];
      this.selected.forEach(element => idList.push({ id: element.id }));

      this.receiveDialog = false;
      this.$root.confirmDialog
        .show({
          message: "미수령 포인트를 전달합니다"
        })
        .then(isConfirm => {
          if (isConfirm) {
            axios
              .post(baseUrl + targetUri, JSON.stringify(idList), {
                headers: { "Content-Type": "application/json", Accept: "*" }
              })
              .then(response => {
                if (response.status == 200) {
                  alert("미수령 포인트 전달을 완료했습니다");
                  this.getUnreceivedList();
                } else if (response.data.message) {
                  this.$root.snackbar.show({
                    message: response.data.message,
                    color: "fail"
                  });
                }
              })
              .catch(error => {
                this.$root.snackbar.show({
                  message: error.response.data.message,
                  color: "fail"
                });
                console.log(error.response);
              });
          } else {
            this.$root.snackbar.show({
              message: "미수령 포인트 전달을 취소합니다"
            });
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

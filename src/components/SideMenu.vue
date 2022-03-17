<template>
  <div id="sideMenu" style="float: left; height: 100%;">
    <v-navigation-drawer
      app
      clipped
      color="#e0e0e0"
      hide-overlay
      height="100%"
      mobile-breakpoint="100"
      expand-on-hover
    >
      <v-list>
        <v-list-item-group>
          <v-list-item
            v-for="(item, i) in getMenu"
            :key="i"
            :to="{ name: item.name }"
          >
            <v-list-item-content>
              <v-list-item-title v-text="item.title"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>
export default {
  props: ["selectedMenu"],
  data() {
    return {
      drawer: false,
      clipped: false,
      items: {
        payment: [
          {
            title: "결제 목록",
            name: "Payment"
          }
        ],
        blockchain: [
          {
            title: "계약 관리",
            name: "SmartContract"
          },
          {
            title: "Wallet 목록",
            name: "Wallet"
          },
          {
            title: "포인트 보유 현황",
            name: "FT"
          },
          {
            title: "미수령 포인트 조회",
            name: "UnreceivedToken"
          },
          {
            title: "NTF 소유현황",
            name: "NFT"
          },
          {
            title: "블록체인 이력조회",
            name: "TxHistory"
          }
        ],
        auth: [
          {
            title: "관리자 목록",
            name: "Join"
          },
          {
            title: "정산",
            name: "CalPayment"
          }
        ]
      }
    };
  },
  computed: {
    getMenu: function() {
      return this.items[this.selectedMenu];
    }
  }
};
</script>

<style></style>

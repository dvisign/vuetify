import Vue from 'vue'
import Router from 'vue-router'
import UserInfo from "../components/payment/UserInfo";
import Payment from "../components/payment/Payment";
import CalPayment from "../components/payment/CalPayment";
import Login from "../components/payment/Login";
import Join from "../components/payment/Join";
import contextRoot from "../../config/contextRoot";
import SmartContract from "../components/blockchain/views/SmartContract"
import Wallet from "../components/blockchain/views/Wallet"
import FT from "../components/blockchain/views/FT"
import UnreceivedToken from "../components/blockchain/views/UnreceivedToken"
import NFT from "../components/blockchain/views/NFT"
import TxHistory from "../components/blockchain/views/TxHistory"

Vue.use(Router)

// export default new Router({
const router = new Router({
  // base: "/",
  routes: [
    { 
      path: contextRoot+"/", 
      name: "Login", 
      component: Login 
    },
    { 
      path: contextRoot+"/join", 
      name: "Join", 
      component: Join 
    },
    { 
      path: contextRoot+"/paymentList", 
      name: "Payment", 
      component: Payment 
    },
    { 
      path: contextRoot+"/calPayment", 
      name: "CalPayment", 
      component: CalPayment 
    },
    { 
      path: "*", 
      redirect: contextRoot + "/" 
    },
    { 
      path: contextRoot + "/smartContract", 
      name: "SmartContract", 
      component: SmartContract 
    },    
    { 
      path: contextRoot + "/wallet",
      name: "Wallet",
      component: Wallet 
    },
    { 
      path: contextRoot + "/ft",
      name: "FT",
      component: FT 
    },
    { 
      path: contextRoot + "/unreceivedToken",
      name: "UnreceivedToken",
      component: UnreceivedToken 
    },
    { 
      path: contextRoot + "/nft",
      name: "NFT",
      component: NFT 
    },
    { 
      path: contextRoot + "/txHistory",
      name: "TxHistory",
      component: TxHistory 
    },
    { 
      path: `${contextRoot}/userInfo`,
      name: "UserInfo",
      component: UserInfo
    }
  ],
  mode: "history"
})

router.beforeEach ((to, from, next) => {
  if (to.fullPath == contextRoot + '/') {
    // route to login page
    next();
  } else {
    // route to other pages
    Vue.nextTick(() => router.app.$children[0].loginChk(to, from, next));    
  }
});
export default router;

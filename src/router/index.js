import Vue from 'vue'
import Router from 'vue-router'

import Login from '@/pages/Login';
import Main from '@/pages/Main';
import characters from '@/pages/Characters';
import PlayInfo from '@/pages/PlayInfo';
import Item from '@/pages/Item';
import payment from '@/pages/Payment';
import List from '@/pages/board/List';
import View from '@/pages/board/View';
import Write from '@/pages/board/Write';
import Inspection from '@/pages/Inspection';
import Statistics from '@/pages/Statistics';
import UserAuthority from '@/pages/UserAuthority';
import NotFound from '@/pages/NotFound';

import store from '@/store';
import contextRoot from '../../config/contextRoot';

Vue.use(Router);

const userAuth = (next) => {
  console.log(store.getters['userStore/GET_LOGIN'])
  next();
};

// export default new Router({
const router = new Router({
  // base: "/",
  routes: [
    { 
      path: '*', 
      component: NotFound,
    },
    { 
      path : `${contextRoot}/`, 
      name : 'Login', 
      component : Login
    },
    { 
      path : `${contextRoot}/main`, 
      name : 'Main', 
      component : Main
    },
    {
      path : `${contextRoot}/characters`,
      name : 'Characters',
      component : characters
    },
    {
      path : `${contextRoot}/playInfo`,
      name : 'PlayInfo',
      component : PlayInfo
    },
    {
      path : `${contextRoot}/item`,
      name : 'Item',
      component : Item
    },
    { 
      path : `${contextRoot}/payment`, 
      name : 'Payment', 
      component : payment
    },
    {
      path : `${contextRoot}/board/:boName/:page`,
      name : 'BoardList',
      component : List
    },
    {
      path : `${contextRoot}/board/:boName/view/:wrid`,
      name : 'BoardView',
      component : View
    },
    {
      path : `${contextRoot}/board/:boName/write`,
      name : 'BoardWrite',
      component : Write
    },
    {
      path : `${contextRoot}/inspection`,
      name : 'Inspection',
      component : Inspection
    },
    {
      path : `${contextRoot}/statistics`,
      name : 'Statistics',
      component : Statistics
    },
    {
      path : `${contextRoot}/userAuthority`,
      name : 'UserAuthority',
      component : UserAuthority
    }
  ],
  mode: 'history'
})

router.beforeEach ( async (to, from, next) => {
  await store.dispatch('userStore/ACTION_USERINFO')
  .then((res) => {
    if (!res.data.login) {
      localStorage.removeItem('access_token');
    }
    store.commit('userStore/MUTATE_UESER', res.data);
  })
  .catch((e) => {
    localStorage.removeItem('access_token');
    store.commit('userStore/MUTATE_LOGIN_ERROR', res.response.reason);
  });
  const login = store.getters['userStore/GET_LOGIN'];
  if (login) {
    if (to.fullPath == `${contextRoot}/`) {
      const pushName = from.name ? from.name : 'Payment';
      next({
        name : pushName
      });
    }
  } else {
    if (to.fullPath != `${contextRoot}/`) {
      next({
        name : "Login"
      })
    }
  }
  next();
});
export default router;

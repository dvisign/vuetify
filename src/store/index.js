// store.js
import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

import commonStore from '@/store/common';
import userStore from '@/store/user';

const store = new Vuex.Store({
  modules : {
    commonStore,
    userStore
  },
  plugins : [
    createPersistedState({
      paths : ['commonStore']
    })
  ]
});

export default store;
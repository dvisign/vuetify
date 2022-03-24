import { 
  loginRequest, 
  userRequest ,
  logoutRequest
} from '@/api/common/user';

const userStore = {
  namespaced: true,
  state : {
    loginError : '',
    logoutMsg : '',
    login : false,
    userInfo : null,
  },
  getters : {
    GET_LOGIN : state => state.login,
    GET_LOGIN_ERROR : state => state.loginError,
    GET_LOGOUT_MESSAGE : state => state.logoutMsg,
    GET_USER_INFO : state => state.userInfo
  },
  mutations : {
    MUTATE_UESER : (state, payload) => {
      state.login = payload.login;
      state.userInfo = payload.user;
      state.logoutMsg = '';
    },
    MUTATE_LOGIN_ERROR : (state, payload) => {
      state.loginError = payload;
      state.logoutMsg = '';
    },
    MUTATE_LOGOUT : (state, payload) => {
      state.login = false;
      state.userInfo = null;
      state.logoutMsg = payload.logoutMsg;
    }
  },
  actions : {
    ACTION_LOGIN : ({ commit }, payload) => {
      const { userId, userPw } = payload;
      const logins = loginRequest({
        url : '/user/login',
        method : 'post',
        params : {
          userId : userId,
          userPw : userPw
        }
      });
      logins.then((res) => {
        localStorage.setItem('access_token', res.data.token);
        commit('MUTATE_UESER', res.data);
      })
      .catch((e) => {
        localStorage.removeItem('access_token')
        commit('MUTATE_LOGIN_ERROR', e.response.data);
      })
    },
    ACTION_LOGIN_FALSE : ( {commit}, payload) => {
      commit('MUTATE_LOGIN_ERROR', '');
    },
    ACTION_USERINFO : () => {
      const access_token = localStorage.getItem('access_token') ? localStorage.getItem('access_token') : null;
      const config = {
        headers : {
          access_token
        }
      }
      const logins = userRequest({
        url : '/user',
        method : 'get',
        config 
      });
      return logins;
    },
    ACTION_LOGOUT : ({ commit }) => {
      logoutRequest({
        url : '/user/logout'
      })
      .then((res) => {
        localStorage.removeItem('access_token');
        commit('MUTATE_LOGOUT', res.data);
      })
    }
  }
};

export default userStore;
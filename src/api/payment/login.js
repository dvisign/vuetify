import request from '../../util/request_payment'

export function selectUserInfo(email, pwd) {
  return request({
    url: "/getUserInfo",
    method: "post",
    params: {
      'email': email
      ,'pwd': pwd
    }
  })
}
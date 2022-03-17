import request from '../../util/request_payment'

export function select(email, tel, pageOffset, listSize) {
  return request({
    url: "/getUserList",
    method: "post",
    params: {
      'email':email,
      'tel':tel,
      'pageOffset':pageOffset,
      'listSize':listSize
    }
  })
}

export function save(email, pwd, tel) {
  return request({
    url: "/mergeUser",
    method: "post",
    params: {
      'email':email,
      'pwd':pwd,
      'tel':tel
    }
  })
}
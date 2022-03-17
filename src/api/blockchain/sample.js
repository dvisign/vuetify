import request from '../../util/request_payment'

export function select() {
  return request({
    url: "/blockchain/getSampleList",
    method: "post",
    params: {
    }
  })
}
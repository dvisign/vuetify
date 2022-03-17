import request from "../../util/request_payment"

export function selectList(params) {
  return request({
    url: "/getCalPaymentList",
    method: "post",
    params: params
  })
}

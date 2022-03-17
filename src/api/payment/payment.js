import request from "../../util/request_payment"

export function select(param) {
  return request({
    url: "/getPaymentList",
    method: "post",
    params: param
  })
}

export function del(orderId, email, cont) {
  return request({
    url: "/cancelPayment",
    method: "post",
    params: {
      "orderId": orderId,
      "email": email,
      "cont": cont
    }
  })
}

export function selectDetail(orderId) {
  return request({
    url: "/getPaymentDetail",
    method: "post",
    params: {
      "orderId": orderId
    }
  })
}

export function getCreditStatus(orderId) {
  return request({
    url: "/getCreditStatus",
    method: "post",
    params: {
      "orderId": orderId
    }
  })
}
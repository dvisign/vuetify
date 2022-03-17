import request from '../../util/request_blockchain'

export function select(scAddress, contractKeyType, userKeyType, toUserId, alias, toAddress, amount) {
  return request({
    url: "/blockchain/point/token/charge",
    method: "post",
    params: {
	  "scAddress":scAddress, 
	  "contractKeyType":contractKeyType, 
	  "userKeyType":userKeyType, 
	  "toUserId":toUserId, 
	  "alias":alias, 
	  "toAddress":toAddress, 
	  "amount":amount
    }
  })
}
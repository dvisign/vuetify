import request from "@/util/request_payment"

export function serverCall(url, params, method) {
	if(!method) method = "post"
	return request({ url: url
                   , data: params
//                   , params: params
	               , method: method
  })
}

export function selectCode(cdGroup, cdKey, cdVal, cdDesc, allCheck) {
	return request({
	    url: "/getCodeList",
	    method: "post",
	    params: {
	      "cdGroup":cdGroup,
	      "cdKey":cdKey,      
	      "cdVal":cdVal,
	      "cdDesc":cdDesc,
	      "allCheck":allCheck,
	    }
	  })
}

//export async function excelDown(paramUrl, fileName, param) {
export function excelDown(paramUrl, fileName, param) {
	return request({
		method: 'POST',
		url: paramUrl,
//		    url: '/getExcellData',
		responseType: 'blob',
		headers: {
			"Content-Type": "application/json"
		}
		, params: param
//		{
//		        title: "테스트파일",
//		        sellTitle: "셀1,셀2,셀3",
//		        endTime: endTimeVal       
//		    } 
	}).then(response => {
			const url = window.URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type'] }));
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', fileName + '.xlsx');
			document.body.appendChild(link);
			link.click();
		})
}

//export function selectUserInfo(email, pwd) {
//  return request({
//        method: 'GET',
//        url: '/getUserInfo',                 
//        responseType: 'blob' // 가장 중요함
//    })    
//    .then(response =>{        
//        const url = window.URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type'] }));
//        const link = document.createElement('a');
//        link.href = url;
//        link.setAttribute('download', 'test.xlsx');
//        document.body.appendChild(link);
//        link.click();
//    })  
//}

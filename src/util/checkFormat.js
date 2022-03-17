export function checkDateFormat(date) {
  if(date === ''){
    return null
  }
  let split = date.split("-")
  return new Date(split[0],split[1]-1,split[2])
}

export function checkPhoneNumberFormat(phoneNumber) {
  let phonePattern = /[0-9]{3}-[0-9]{3}-[0-9]{4}/
  return phonePattern.test(phoneNumber)
}

export function checkEmailFormat(email) {
  let emailPattern = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/
  return emailPattern.test(email)
}

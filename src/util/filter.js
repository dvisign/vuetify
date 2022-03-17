export function SimpleDateFormat(timeString) {
  let date = new Date(timeString)
  let year = date.getFullYear()
  let month = date.getMonth()+1
  let day = date.getDate()
  return `${year}-${month}-${day}`
}

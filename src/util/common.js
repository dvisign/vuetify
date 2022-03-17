export default {
  install (Vue) {
    Vue.prototype.$dateFormatter = common.dateFormatter;
    Vue.prototype.$datetimeFormatter = common.datetimeFormatter;
    Vue.prototype.$unixDatetimeFormatter = common.unixDatetimeFormatter;
    Vue.prototype.$numberFormatter = common.numberFormatter;    
  }
}

export const common = {
    dateFormatter: (date) => {
      const anyDate = new Date(date);
      if (anyDate) {
        const yyyy = anyDate.getFullYear();
        const mm = String(anyDate.getMonth() + 1).padStart(2, '0');
        const dd = String(anyDate.getDate()).padStart(2, '0');
        return yyyy + '-' + mm + '-' + dd;
      } else {
        return '';
      }
    },
    datetimeFormatter: (date) => {
      const anyDate = new Date(date);
      if (anyDate) {
        const yyyy = anyDate.getFullYear();
        const MM = String(anyDate.getMonth() + 1).padStart(2, '0');
        const dd = String(anyDate.getDate()).padStart(2, '0');
        const HH = String(anyDate.getHours()).padStart(2, '0');
        const mm = String(anyDate.getMinutes()).padStart(2, '0');
        const ss = String(anyDate.getSeconds()).padStart(2, '0');
        return yyyy + '-' + MM + '-' + dd + ' ' + HH + ':' + mm + ':' + ss;
      } else {
        return '';
      }
    },
    unixDatetimeFormatter: (unixTimestamp) => {
      const anyDate = new Date(unixTimestamp * 1000);
      if (anyDate) {
        const yyyy = anyDate.getFullYear();
        const MM = String(anyDate.getMonth() + 1).padStart(2, '0');
        const dd = String(anyDate.getDate()).padStart(2, '0');
        const HH = String(anyDate.getHours()).padStart(2, '0');
        const mm = String(anyDate.getMinutes()).padStart(2, '0');
        const ss = String(anyDate.getSeconds()).padStart(2, '0');
        return yyyy + '-' + MM + '-' + dd + ' ' + HH + ':' + mm + ':' + ss;
      } else {
        return '';
      }
    },
    numberFormatter: (number) => {
      const formattedNumber = new Intl.NumberFormat('ko-KR').format(number);
      return formattedNumber;
    }
}
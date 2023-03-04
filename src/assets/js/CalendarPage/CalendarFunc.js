const calendarFunc = {
    recordTypeList: [
        {
          hexCode: "&#9800;",
          id: "Aries",
          elementType: "Fire"
        },
        {
          hexCode: "&#9801;",
          id: "Taurus",
          elementType: "Earth"
        },
        {
          hexCode: "&#9802;",
          id: "Gemini",
          elementType: "Air"
        },
        {
          hexCode: "&#9803;",
          id: "Cancer",
          elementType: "Water"
        },
        {
          hexCode: "&#9804;",
          id: "Leo",
          elementType: "Fire"
        },
        {
          hexCode: "&#9805;",
          id: "Virgo",
          elementType: "Earth"
        },
        {
          hexCode: "&#9806;",
          id: "Libra",
          elementType: "Air"
        },
        {
          hexCode: "	&#9807;",
          id: "Scorpio",
          elementType: "Water"
        },
        {
          hexCode: "&#9808;",
          id: "Sagittarius",
          elementType: "Air"
        },
        {
          hexCode: "&#9809;",
          id: "Capricorn",
          elementType: "Earth"
        },
        {
          hexCode: "&#9810;",
          id: "Aquarius",
          elementType: "Air"
        },
        {
          hexCode: "&#9811;",
          id: "Pisces",
          elementType: "Water"
        }
      ],

      // 依hexCode回傳實際名稱
      getZodiacName(hexCode){
        let index = calendarFunc.recordTypeList.findIndex(item => item.hexCode == hexCode);
        return calendarFunc.recordTypeList[index].id
      },

      // 產生時間戳記 YYYYMMDDHHmm
      generateTimeStamp(){
        let today = new Date();
        let timeStamp = today.getFullYear() + ("0" + (today.getMonth() + 1)).slice(-2) + ("0" + today.getDate()).slice(-2) + ("0" + today.getHours()).slice(-2) + ("0" + today.getMinutes()).slice(-2)
        return timeStamp
      }
}

export default calendarFunc
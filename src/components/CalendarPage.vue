<template>
  <div class="calendar-page p-3">
    <h2>{{ monthName }} {{ year }}</h2>
    <div class="btn-group" role="group">
      <button class="btn btn-primary" @click="setMonth('prev')">前一月</button>
      <button class="btn btn-primary ms-1" @click="setMonth('current')">當月</button>
      <button class="btn btn-primary ms-1" @click="setMonth('next')">後一月</button>
    </div>
    <div class="btn-group ms-3" role="group">
      <button class="btn btn-info" @click="exportRecord">匯出</button>
      <input type="file" class="d-none" id="importData" @change="importRecord">
      <label class="btn btn-info ms-1" for="importData">匯入</label>
      <button class="btn btn-info ms-1" @click="generateReport">產生報表</button>
    </div>
    <table class="table table-bordered">
      <thead>
        <tr>
          <th v-for="day in daysOfWeek" :key="day">{{ day }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(week, index) in weeks" :key="index">
          <td v-for="day in week" :key="day.date" @click="selectDay(day)" class="cell-width indicator">
            <div class="date">
              {{ day.date }}
              <div class="text-break fs-4" v-html="showIndicators(day)">
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="form-check d-flex align-items-center">
      <input value="deleteMode" v-model="selectedData" id="deleteMode" class="form-check-input" type="radio">
      <label class="form-check-label fs-5 ms-2" for="deleteMode">
        刪除模式
      </label>
    </div>
    <div class="form-check d-flex align-items-center" v-for="(item, index) in TypeList" :key="index">
      <input :value="item.hexCode" v-model="selectedData" :id="item.id" class="form-check-input" type="radio">
      <label class="form-check-label fs-3 ms-2" :for="item.id"><span v-html="item.hexCode"></span> <span
          class="fs-5">{{item.id}} ({{item.elementType}}) </span>
      </label>
    </div>

    <!-- Delete Modal -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="exampleModalLabel">刪除現存資料</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-if="!editReocrd || editReocrd.length == 0">暫無資料</div>
            <div v-else class="form-check d-flex align-items-center" v-for="(item, index) in editReocrd" :key="index">
              <input class="form-check-input mt-0" type="checkbox" :value="index" :id="'edit' + index"
                v-model="deleteList">
              <label class="form-check-label fs-3 ms-3" :for="'edit' + index" v-html="item"></label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" @click="saveEdited"
              :disabled="!editReocrd || editReocrd.length == 0">儲存</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
  import dayjs from 'dayjs'
  import { Modal } from 'bootstrap'
  import calendarFunc from '@/assets/js/CalendarPage/CalendarFunc';
  export default {
    name: 'CalendarPage',
    props: {},
    components: {},
    data() {
      return {
        // Keep track of the current date and the selected date
        today: dayjs(),
        selectedDate: null,
        year: null,
        month: null,
        daysInMonth: null,
        firstDayOfMonth: null,
        daysOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        weeks: null,
        currentRecord: {},
        selectedData: "",
        // 可選類別清單
        TypeList: calendarFunc.recordTypeList,
        // bootstrap modal
        deleteModal: null,
        editDate: null,
        editReocrd: null,
        deleteList: []
      };
    },
    computed: {
      // Get the name of the current month
      monthName() {
        return dayjs().month(this.month).format('MMMM');
      },
    },
    methods: {
      // 選擇日期
      selectDay(day) {
        if (!this.selectedData) {
          alert("未選擇紀錄標籤")
          return
        }

        if (this.selectedData == 'deleteMode') {
          // 打開刪除面板
          this.openDeletePanel(day.date)
          return
        }

        if (!(day.date in this.currentRecord.record)) {
          this.currentRecord.record[day.date] = []
        }

        this.currentRecord.record[day.date].push(this.selectedData)
        this.updateDays()
      },
      isSelected(day) {
        return this.selectedDate && this.selectedDate.isSame(this.year, 'year') && this.selectedDate.isSame(this.month, 'month') && this.selectedDate.isSame(day.date, 'day');
      },
      setMonth(action) {
        if (action == 'current') {
          let currentMonth = new Date().getMonth()
          this.today = this.today.set('month', currentMonth)
        } else {
          let iBackward = action == 'prev' ? -1 : 1
          this.today = this.today.add(iBackward, 'month')
        }

        this.updateDays()
      },

      /**
       * 原生鬼東西, 產生周
       */
      getNewWeeks() {
        const weeks = [[]];
        let currentWeek = 0;

        // Add empty cells for the days before the first day of the month
        for (let i = 0; i < this.firstDayOfMonth; i++) {
          weeks[currentWeek].push({});
        }

        // Add each day of the month to the weeks array
        for (let i = 1; i <= this.daysInMonth; i++) {
          // Create a new row for each week
          if (weeks[currentWeek].length === 7) {
            currentWeek++;
            weeks.push([]);
          }
          weeks[currentWeek].push({
            // Keep track of the date and whether it is today's date
            date: i,
            isToday: dayjs().isSame(this.year, 'year') && dayjs().isSame(this.month, 'month') && dayjs().isSame(i, 'day'),
          });
        }
        return weeks;
      },

      /**
       * 更新日期物件
       */
      updateDays() {
        this.year = this.today.year()
        this.month = this.today.month()
        this.daysInMonth = dayjs(`${this.year}-${this.month}`).daysInMonth();
        this.firstDayOfMonth = dayjs(`${this.year}-${this.month}-1`).day()
        this.weeks = this.getNewWeeks()
      },

      // 回傳各日現存資料
      showIndicators(day) {
        let indicatorData = ''
        if (this.currentRecord.record[day.date]) {
          indicatorData = this.currentRecord.record[day.date].toString()
        }
        return indicatorData
      },

      // 初始化內部資料
      initCurrentRecord() {
        this.currentRecord = {
          primaryKey: `${this.year}-${this.month + 1}`,
          record: {}
        }
      },

      // update LocalStorage
      updateLocalStorage() {
        let keyName = `${this.year}-${this.month + 1}`
        let value = JSON.stringify(this.currentRecord)
        localStorage.setItem(keyName, value)
      },

      // get LocalStorage data
      getLocalStorage() {
        let keyName = `${this.year}-${this.month + 1}`
        let value = localStorage.getItem(keyName)
        value ? this.currentRecord = JSON.parse(value) : this.updateLocalStorage()
      },

      // 匯出
      exportRecord() {
        let stamp = calendarFunc.generateTimeStamp()
        let getLocaldata = (JSON.stringify(localStorage))
        this.convertToText(getLocaldata, `Backup${stamp}.json`)
      },
      // 匯入資料
      importRecord(e) {
        let files = e.target.files
        if (files.length === 0) {
          return
        }
        const file = files[0]
        let reader = new FileReader();
        reader.onload = (data) => {
          let content = data.target.result
          // fileReader會多解一次字串
          let convertContent = JSON.parse(content)
          convertContent = JSON.parse(convertContent)
          // 回寫localStorage
          for (const [key, value] of Object.entries(convertContent)) {
            localStorage.setItem(key, value)
          }
          // 更新vue資料
          this.getLocalStorage()
        }
        reader.onerror = (e) => alert(e.target.error.name);
        reader.readAsText(file);
      },

      // 產生報表檔案
      generateReport() {
        let reportText = this.packageDate()
        let stamp = calendarFunc.generateTimeStamp()
        this.convertToText(reportText, `Report${stamp}.txt`, false)
      },
      // 產生報表檔案: 資料打包
      packageDate() {
        let report = ''
        for (const [key, value] of Object.entries(localStorage)) {
          let parseData = JSON.parse(value)
          for (const [r_key, r_value] of Object.entries(parseData.record)) {
            let convertName = r_value.map((element) => {
              return calendarFunc.getZodiacName(element)
            })
            // Example: 2023-3-13, Aries, Aries \n 2023-3-14, Cancer, Cancer
            let exportValue = convertName.join(",")
            let concatData = `${parseData.primaryKey}-${r_key},${exportValue}\r`
            report += concatData
          }
        }
        // remove last \n
        report = report.replace(/\n$/, "")
        return report
      },

      // convert input text data to plain/txt file and download
      convertToText(text, fileName, toJson = true) {
        let a = document.createElement("a")
        document.body.appendChild(a)
        a.style = "display: none"
        let json = text
        if (toJson) {
          text = JSON.stringify(text)
        }
        let blob = new Blob([text], { type: "octet/stream" })
        let url = window.URL.createObjectURL(blob)
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url)
      },

      // initiate modal
      initModal() {
        this.deleteModal = new Modal(document.getElementById('deleteModal'), {})
      },
      // open delete panel
      openDeletePanel(date) {
        this.editDate = date
        this.editReocrd = this.currentRecord.record[date]
        this.deleteModal.show()
      },
      // 儲存編輯結果
      saveEdited() {
        let filteredList = []
        filteredList = this.editReocrd.filter((element, el_index) => {
          // 比較已選索引值
          if (this.deleteList.indexOf(el_index) == -1) {
            return element
          }
        })
        this.deleteList = []
        this.currentRecord.record[this.editDate] = filteredList
        this.deleteModal.hide()

      }
    },
    mounted() {
      this.updateDays()
      this.initCurrentRecord()
      this.getLocalStorage()
      this.initModal()
    },
    watch: {
      today: {
        handler: function () {
          // 初始化
          this.initCurrentRecord()
          // 獲取&更新現有資料
          this.getLocalStorage()
        },
        deep: true
      },
      currentRecord: {
        handler: function () {
          this.updateLocalStorage()
        },
        deep: true
      }
    }

  }
</script>

<style scoped>

</style>
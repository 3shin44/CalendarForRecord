<template>
  <div class="calendar-page p-3">
    <h2>{{ monthName }} {{ year }}</h2>
    <div class="btn-group" role="group">
      <button class="btn btn-primary" @click="setMonth('prev')">PREV</button>
      <button class="btn btn-primary ms-1" @click="setMonth('next')">NEXT</button>
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

    <div class="form-check d-flex align-items-center" >
      <input value="deleteMode" v-model="selectedData" id="deleteMode"
      class="form-check-input" type="radio">
      <label class="form-check-label fs-5 ms-2" for="deleteMode">
        刪除模式
      </label>
    </div>
    <div class="form-check d-flex align-items-center" v-for="(item, index) in TypeList" :key="index">
      <input :value="item.typeName" v-model="selectedData" :id="item.id"
      class="form-check-input" type="radio">
      <label class="form-check-label fs-3 ms-2" :for="item.id" v-html="item.typeName">
      </label>
    </div>

  </div>
</template>

<script>
  import dayjs from 'dayjs'

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
        TypeList: [
          {
            typeName: "&#x264E;",
            id: "type1"
          },
          {
            typeName: "&#x264F;",
            id: "type2"
          },
          {
            typeName: "&#x2650;",
            id: "type3"
          },
          {
            typeName: "&#x2651;",
            id: "type4"
          },
          {
            typeName: "&#x2652;",
            id: "type5"
          },
          {
            typeName: "&#x2653;",
            id: "type6"
          }

        ]
      };
    },
    computed: {
      // Get the name of the current month
      monthName() {
        return dayjs().month(this.month).format('MMMM');
      },
    },
    methods: {
      selectDay(day) {
        if(!this.selectedData){
          alert("No data is selected")
          return
        }

        if(this.selectedData == 'deleteMode'){
          // 刪除模式函式
          this.openEditPanel(day.date)
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
        let iBackward = action == 'prev' ? -1 : 1
        this.today = this.today.add(iBackward, 'month')
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

      openEditPanel(date){
        console.log(date);
      }
    },
    mounted() {
      this.updateDays()
      this.initCurrentRecord()
      this.getLocalStorage()
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
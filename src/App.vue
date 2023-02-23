<template>
  <CalendarPage />
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import CalendarPage from './components/CalendarPage.vue'

export default {
  name: 'App',
  components: {
    HelloWorld, CalendarPage
  }
}
</script>

<style lang="scss">
  @import "@/assets/scss";
</style>

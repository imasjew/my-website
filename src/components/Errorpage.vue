<template>
  <div>
    您没有登录！<br>
    {{time}}秒后自动跳转到<span class="login-page-btn" @click="goLoggin()">登录页</span>
  </div>
</template>

<script>
export default {
  name: 'errorpage',
  data() {
    return {
      time: 5,
      timer: ''
    }
  },
  methods: {
    setTime: function() {
      this.time--;
    },
    goLoggin() {
      clearInterval(this.timer);
      this.$router.push('/login');
    }
  },
  mounted() {
    this.timer = setInterval(() => {
      this.setTime();
      if (this.time < 0) {
        clearInterval(this.timer);
        this.goLoggin()
      }
    }, 1000);
  },
}
</script>

<style>
.login-page-btn {
  color: blue;
  cursor: pointer;
}
</style>

<template>
  <div class="page-wrapper">
    <div class="title">Dashboard</div>
    <el-button @click="checkAuth()" class="check-btn">校验登录状态</el-button>
  </div>
</template>

<script>
import httpService from "@/service/http.service";
import accountService from "@/service/account.service";

export default {
  name: "dashboard",
  created() {
    this.checkAuth();
  },
  methods: {
    checkAuth() {
      httpService.auth().then(
        (res) => {
          this.showSuccess(res.message);
          // this.result = res.message;
        },
        (err) => {
          console.log('err', err)
          this.showReject(err.data.message);
          this.$router.push("/errorpage");
          accountService.logout();
        }
      );
    },
    showSuccess(title, msg) {
      this.$notify({
        title: title,
        message: msg,
        type: "success",
      });
    },
    showReject(title, msg) {
      this.$notify.info({
        title: title,
        message: msg,
      });
    },
  },
};
</script>

<style lang="less">
.page-wrapper {
  position: relative;
  width: 100%;
  .title {
    position: absolute;
    top: -24px;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    line-height: 100px;
    height: 100px;
    font-size: 58px;
    font-weight: 600;
  }
  .check-btn {
    margin-top: 40px;
  }
}
</style>

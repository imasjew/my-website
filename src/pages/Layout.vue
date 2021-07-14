<template>
  <el-container class="layout-wrapper">
    <el-header>
      <el-menu
        :default-active="activeIndex"
        class="menu-color"
        mode="horizontal"
        @select="handleSelect"
      >
        <el-menu-item index="dashboard">首页</el-menu-item>
        <el-menu-item index="shopping">购物</el-menu-item>
        <el-menu-item index="music">音乐</el-menu-item>
        <el-menu-item index="game">游戏</el-menu-item>
        <el-submenu index="options" class="options">
          <template slot="title">个人中心</template>
          <el-menu-item index="options" disabled>资料设置</el-menu-item>
          <el-menu-item index="logout">注销</el-menu-item>
        </el-submenu>
      </el-menu>
    </el-header>
    <el-container>
      <router-view />
    </el-container>
  </el-container>
</template>

<script>
import accountService from "@/service/account.service";
export default {
  name: "layout",
  data() {
    return {
      activeIndex: "",
      Routes: ["dashboard", "shopping", "music", "game"],
    };
  },
  created() {
    // 查询当前路径隶属根路由，解决添加二级子路由时导航栏无选中状态bug
    const rootRoute = this.checkSameRoutes();
    this.activeIndex = rootRoute;
  },
  methods: {
    handleSelect(key) {
      if (key === "logout") {
        accountService.logout();
        this.$router.push("/login");
        return;
      }
      // 避免已在该标签下时，额外跳转，丢失子路由
      const adress = "home/" + key;
      if (this.$route.fullPath.indexOf(adress) >= 0) {
        return;
      }
      this.$router.push("/home/" + key);
    },
    checkSameRoutes() {
      const routesLen = this.Routes.length;
      for (let i = 0; i < routesLen; i++) {
        if (this.$route.fullPath.indexOf(this.Routes[i]) >= 0) {
          return this.Routes[i];
        }
      }
    },
  },
};
</script>

<style lang="less" scoped>
.layout-wrapper {
  height: 100%;
  .el-header {
    padding: 0;
  }
  .menu-color {
    background-color: gray;
  }
  .options {
    float: right;
  }
}
</style>

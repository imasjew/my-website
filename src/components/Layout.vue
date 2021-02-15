<template>
  <div>
    <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
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
    <!-- <span class="log-out" href="javascript:void(0)">注销</span> -->
    <router-view />
  </div>
</template>

<script>
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
    handleSelect: function (key) {
      if (key === "logout") {
        localStorage.removeItem("username");
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
    checkSameRoutes: function () {
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
.log-out {
  position: absolute;
  top: 27px;
  right: 16px;
  color: blue;
  font-size: 14px;
  cursor: pointer;
}
.options {
  float: right;
}
</style>

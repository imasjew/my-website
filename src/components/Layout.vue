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
    <router-view/>
  </div>
</template>

<script>
export default {
  name: "layout",
  data() {
    return {
      activeIndex: "1",
    };
  },
  created() {
    this.activeIndex = this.$route.name;
  },
  methods: {
    handleSelect: function (key, keyPath) {
      if (key === 'logout') {
        localStorage.removeItem('username')
        this.$router.push('/login');
        return;
      }
      this.$router.push(key);
    },
    // selectPage: function (index) {
    //   switch (index) {
    //     case '1':
    //       return 'dashboard';
    //     case '2':
    //       return 'shopping';
    //     case '3':
    //       return 'game';
    //     default:
    //       return '';
    //   }
    // }
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

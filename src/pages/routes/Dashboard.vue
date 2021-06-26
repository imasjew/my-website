<template>
  <div class="page-wrapper">
    <div class="title">
      Dashboard
    </div>

  </div>
</template>

<script>
export default {
  name: "dashboard",
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
}
</style>

<template>
  <div>
    music
    <button @click="goToPage('musiclist')">list</button>
    <button @click="goToPage('song')">song</button>
    <button @click="openDrawer()">drawer</button>
    <div class="song-controller">footer</div>
    <router-view />
  </div>
</template>

<script>
export default {
  name: "music",
  data() {
    return {
      activeIndex: "",
      drawer: false,
    };
  },
  methods: {
    goToPage(key) {
      this.$router.push("/home/music/" + key);
    },
    openDrawer: function () {
      this.drawer = true;
    },
  },
};
</script>

<style lang="less">
.song-controller{
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 30px;
  border: 5px solid black;
  box-sizing: border-box;
}
</style>

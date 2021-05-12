<template>
  <div>
    music
    <audio src=""></audio>
    <button @click="goToPage('musiclist')">list</button>
    <button @click="goToPage('song')">song</button>
    <button @click="triggerController()">controller</button>
    <router-view />
    <div class="song-controller" v-show="showController">
      <musicplayer></musicplayer>
    </div>
  </div>
</template>

<script>
import musicplayer from "@/components/MusicPlayer.vue";
import Bus from "@/eventBus.js";
export default {
  name: "music",
  components: { musicplayer },
  data() {
    return {
      currentSong: null,
      songList: [],
      activeIndex: "",
      showController: true,
    };
  },
  created() {
    Bus.$on("getSong", (songInfo) => {
      this.getSong(songInfo);
    });
    Bus.$on("switchSong", (type) => {
      this.switchSong(type);
    });
  },
  destroyed() {
    Bus.$off();
  },
  methods: {
    goToPage(key) {
      this.$router.push("/home/music/" + key);
    },
    triggerController: function () {
      this.showController = !this.showController;
    },
    switchSong: function (type) {
      console.log(type);
    }
  },
};
</script>

<style lang="less">
.song-controller {
  position: fixed;
  bottom: 0;
  width: 100%;
  box-sizing: border-box;
}
</style>

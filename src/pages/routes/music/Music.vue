<template>
  <div>
    <!-- <button @click="goToPage('musiclist')">list</button>
    <button @click="goToPage('musiclyric')">song</button>
    <button @click="triggerController()">controller</button> -->
    <router-view />
    <div class="song-controller" v-show="showController">
      <musicplayer></musicplayer>
    </div>
  </div>
</template>

<script>
import httpService from "@/service/http.service";
import musicplayer from "@/components/MusicPlayer.vue";
import Bus from "@/eventBus.js";
export default {
  name: "music",
  components: { musicplayer },
  data() {
    return {
      showController: true,
    };
  },
  created() {
    this.setBusListener();
    window.addEventListener(
      "popstate",
      () => {
        this.setBusListener();
      },
      false
    );
  },
  destroyed() {
    document.body.removeEventListener("popstate", this.setBusListener, false);
    Bus.$off();
  },
  methods: {
    setBusListener() {
      Bus.$on("addSongDetail", (songId) => {
        this.addSongDetail(songId);
      });
      Bus.$on("goToLyric", (songId) => {
        this.goToLyric(songId);
      });
      Bus.$on("goToMusicList", (songTitle) => {
        this.goToMusicList(songTitle);
      });
    },
    addSongDetail(songId) {
      httpService.getFullSongDetail(songId).then(
        (res) => {
          const songDetail = this.formatSongDetail(res);
          Bus.$emit("playerAddSong", songDetail);
        },
        (err) => {
          console.log("getSongDetail获取失败", err);
        }
      );
    },
    formatSongDetail(originInfo) {
      const songBasicInfo = originInfo[0].songs[0];
      const songUrl = originInfo[1].data[0].url;
      const song = {
        title: songBasicInfo.name,
        duration: songBasicInfo.dt / 1000,
        author: songBasicInfo.ar[0].name,
        albumName: songBasicInfo.al.name,
        id: songBasicInfo.id,
        albumPicture: songBasicInfo.al.picUrl,
        url: songUrl,
      };
      return song;
    },

    goToPage(key) {
      this.$router.push("/home/music/" + key);
    },
    triggerController() {
      this.showController = !this.showController;
    },
    goToLyric(songId) {
      this.$router.push({
        path: "/home/music/musiclyric",
        query: { id: songId },
      });
    },
    goToMusicList(title) {
      this.$router.push({
        path: "/home/music/musiclist",
        query: { name: title },
      });
    },
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

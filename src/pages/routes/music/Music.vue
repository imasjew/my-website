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
      Bus.$on("getSongUrl", (payload) => {
        this.getSongUrl(payload.songInfo, payload.onlyUpdate);
      });
      Bus.$on("goToLyric", (songId) => {
        this.goToLyric(songId);
      });
      Bus.$on("goToMusicList", (songTitle) => {
        this.goToMusicList(songTitle);
      });

    },
    getSongUrl(songInfo, onlyUpdate) {
      httpService.getSongUrl(songInfo.id).then((res) => {
        const song = {
          ...songInfo,
          title: songInfo.title,
          url: res.data[0].url,
        };
        // onlyUpdate代表songUrl过期，仅需替换为重新获取的返回即可
        if (onlyUpdate) {
          Bus.$emit("setReloadSong", song);
        } else {
          Bus.$emit("playerAddSong", song);
        }
      });
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
        query: { name: title }
      })
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

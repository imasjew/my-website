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
      Bus.$on("getSong", (payload) => {
        this.getSong(payload.songInfo, payload.needCheck);
      });
      Bus.$on("goToLyric", (songId) => {
        this.goToLyric(songId);
      });
    },
    getSong(songInfo, needCheck) {
      httpService.getSongUrl(songInfo.id).then((res) => {
        const song = {
          ...songInfo,
          title: songInfo.title,
          url: res.data[0].url,
        };
        // index传null代表播放器url过期请求重新获取，无需设置列表项
        // 也不用返回到常规添加检查流程，直接在列表内替换即可
        if (needCheck) {
          Bus.$emit("playerAddSong", song);
        } else {
          Bus.$emit("setReloadSong", song);
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

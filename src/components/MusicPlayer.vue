<template>
  <div id="music-player-wrapper" @click.stop>
    <div class="controller-wrapper">
      <playlist
        ref="playlist"
        :songList="songList"
        :currentIndex="currentIndex"
        @remove="removeListSong($event)"
        @play="playListSong($event)"
        v-show="showList"
      ></playlist>
      <div class="controll-btn">
        <i class="el-icon-download backward" @click="switchSong(1)"></i>
        <i
          :class="[playButtonType, 'play-btn']"
          @click="isPlaying ? pauseSong() : playSong()"
        ></i>
        <i class="el-icon-download afterward" @click="switchSong(2)"></i>
      </div>
      <div class="album-picture">
        <img :src="albumPicture" alt="" @error="getReloadSong()" />
        <div class="img-mask"></div>
      </div>
      <div class="main-info">
        <div class="song-title-wrapper">
          <span class="song-title" @click="goToLyric()">{{ title }}</span>
        </div>
        <div class="song-process-wrapper">
          <audio
            ref="player"
            :src="url"
            controls="controls"
            @canplay="audioLoaded()"
            @error="getReloadSong()"
            @ended="songLoop()"
            class="original-audio"
            v-show="false"
          ></audio>
          <div class="process-container">
            <Slider
              :barLength="500"
              :barWeight="8"
              :verticalMode="false"
              :currentPosition="processHandlePosition"
              :forbidden="duration == 0"
              :autoPlay="true"
              :isReady="songReady"
              @setPosition="setProcess($event)"
              @dragMouseDown="dragProcessMouseDown()"
              @dragMouseMove="dragProcessMouseMove($event)"
              @dragMouseUp="dragProcessMouseUp()"
            ></Slider>
          </div>
          <div class="process-duration">
            {{ currentTime | formateDate }} / {{ duration | formateDate }}
          </div>
        </div>
      </div>
      <div class="right-controller">
        <div class="icon-wrapper">
          <img
            class="volume-icon"
            @click="toggleVolumeController($event)"
            :src="volumeOn ? volumeOnIcon : volumeOffIcon"
            alt=""
          />
          <div v-if="showVolumeController" class="volume-controller-container">
            <Slider
              :barLength="130"
              :barWeight="6"
              :verticalMode="true"
              :currentPosition="volumeHandlePosition"
              :forbidden="false"
              :autoPlay="false"
              :isReady="true"
              @setPosition="setVolume($event)"
              @dragMouseMove="dragVolumeMouseMove($event)"
            ></Slider>
          </div>
        </div>
        <div class="icon-wrapper">
          <div v-if="loopMode == 1" class="loop-icon-num">1</div>
          <i
            :class="['loop-mode-icon', loopModeIcon]"
            @click="switchLoopMode()"
          ></i>
        </div>
        <div class="icon-wrapper">
          <i
            :class="[
              'show-list-icon',
              showList ? 'el-icon-s-fold' : 'el-icon-s-unfold',
            ]"
            @click="toggleList()"
          ></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import playlist from "@/components/PlayList.vue";
import Slider from "@/components/Slider.vue";
import httpService from "@/service/http.service";
import Bus from "@/eventBus.js";
export default {
  name: "musicplayer",
  components: { playlist, Slider },
  data() {
    return {
      audio: "", // 音频资源
      currentIndex: 0, // 当前播放编号
      songList: [], // 歌单
      songReady: false, // 歌曲加载状态
      isPlaying: false, // 播放状态
      loopMode: 0, // 列表循环模式
      showList: false, // 列表显示开关
      currentTime: 0, // 当前进度
      duration: 0, // 歌曲总时长
      processChecker: null, // 走条计时器
      volumeOn: true, // 音量开关
      showVolumeController: false, // 显示音量滑块
      currentVolume: 100, // 当前音量
      maxVolume: 100, // 最大音量
      volumeOnIcon: "/static/icon/volume-on.png", // 音量开图标
      volumeOffIcon: "/static/icon/volume-off.png", // 音量关图标
    };
  },
  mounted() {
    this.audio = this.$refs.player;
    this.getStorageInfo();
    this.getStorageSettings();
  },
  created() {
    Bus.$on("playerAddSong", (song) => {
      this.addSong(song);
    });
    Bus.$on("skipByLyric", (process) => {
      this.setProcessByLyric(process);
    });
  },
  destroyed() {
    clearInterval(this.processChecker);
    Bus.$off();
  },
  computed: {
    title() {
      if (this.songList.length === 0) {
        return "";
      }
      return this.songList[this.currentIndex].title || "";
    },
    url() {
      if (this.songList.length === 0) {
        return "";
      }
      return this.songList[this.currentIndex].url || "";
    },
    albumPicture() {
      if (this.songList.length === 0) {
        return "";
      }
      return this.songList[this.currentIndex].albumPicture || "";
    },
    playState() {
      const { songReady, isPlaying } = this;
      return {
        songReady,
        isPlaying,
      };
    },
    playButtonType() {
      return this.isPlaying ? "el-icon-video-pause" : "el-icon-video-play";
    },
    processHandlePosition() {
      if (this.duration === 0) {
        return 0;
      } else {
        return (this.currentTime / this.duration) * 100;
      }
    },
    loopModeIcon() {
      let result;
      switch (this.loopMode) {
        case 0:
          result = "el-icon-refresh";
        case 1:
          result = "el-icon-refresh-left";
        default:
          result = "el-icon-refresh";
      }
      return result;
    },
    volumeHandlePosition() {
      return (this.currentVolume / this.maxVolume) * 100;
    },
  },
  watch: {
    currentIndex(index) {
      localStorage.setItem("currentIndex", index);
    },
    currentVolume(volume) {
      const volumeRate = volume / this.maxVolume;
      localStorage.setItem("volumeRate", volume / this.maxVolume);
      this.audio.volume = volumeRate;
    },
    songList: {
      handler(list) {
        localStorage.setItem("playList", JSON.stringify(list));
      },
      deep: true,
    },
    loopMode(mode) {
      localStorage.setItem("loopMode", mode);
    },
    playState() {
      if (this.songReady && this.isPlaying) {
        setTimeout(() => {
          this.audio.play();
          Bus.$emit("setPlayState", true);
        }, 10);
      } else {
        Bus.$emit("setPlayState", false);
      }
    },
  },
  methods: {
    getStorageInfo() {
      const storageList = localStorage.getItem("playList");
      if (storageList !== null) {
        this.songList = JSON.parse(storageList);
        this.currentIndex = Number(localStorage.getItem("currentIndex"));
      } else {
        localStorage.setItem("currentIndex", 0);
      }
    },
    getStorageSettings() {
      const storageVolumeRate = localStorage.getItem("volumeRate");
      if (storageVolumeRate) {
        this.currentVolume = storageVolumeRate * this.maxVolume;
      } else {
        localStorage.setItem("volumeRate", this.currentVolume / this.maxVolume);
      }
      const storageLoopMode = Number(localStorage.getItem("loopMode"));
      if (storageLoopMode) {
        this.loopMode = storageLoopMode;
      } else {
        localStorage.setItem("loopMode", this.loopMode);
      }
    },
    audioLoaded() {
      this.songReady = true;
      this.checkCurrentProcess();
    },
    getReloadSong() {
      this.songReady = false;
      // 歌单为空时触发，强行获取id会报错
      if (this.songList.length === 0) {
        return;
      }
      const songId = this.songList[this.currentIndex].id;
      Bus.$emit("addSongDetail", songId);
    },
    addSong(song) {
      if (this.songList.length !== 0) {
        this.checkDuplicate(song);
      } else {
        this.songList.push(song);
        this.currentIndex = this.songList.length - 1;
      }
      this.playSong();
    },
    checkDuplicate(song) {
      const listLength = this.songList.length;
      for (let i = 0; i <= listLength; i++) {
        if (song.id === this.songList[i].id) {
          // 代替push，才能让computed监听到数组变化
          this.$set(this.songList, i, song);
          this.currentIndex = i;
          i = listLength;
          return;
        }
        if (i === listLength - 1) {
          this.songList.push(song);
          this.currentIndex = this.songList.length - 1;
          return;
        }
      }
    },
    playSong() {
      this.isPlaying = false;
      if (this.songList.length === 0) {
        return;
      }
      clearInterval(this.processChecker);
      this.isPlaying = true;
      this.processChecker = setInterval(() => {
        this.checkCurrentProcess();
      }, 200);
      if (this.$route.name === "musiclyric") {
        Bus.$emit("goToLyric", this.songList[this.currentIndex].id);
      }
    },
    pauseSong() {
      this.isPlaying = false;
      this.audio.pause();
      clearInterval(this.processChecker);
    },
    checkCurrentProcess() {
      this.duration = this.audio.duration;
      this.currentTime = this.audio.currentTime;
      Bus.$emit("checkLyricProcess", this.currentTime);
    },
    switchSong(type) {
      if (type === 1) {
        if (this.currentIndex === 0) {
          this.currentIndex = this.songList.length - 1;
        } else {
          this.currentIndex--;
        }
      }
      if (type === 2) {
        if (this.currentIndex === this.songList.length - 1) {
          this.currentIndex = 0;
        } else {
          this.currentIndex++;
        }
      }
      if (this.isPlaying) {
        this.playSong();
      } else {
        this.currentTime = 0;
      }
    },
    switchLoopMode() {
      if (this.loopMode < 1) {
        this.loopMode++;
      } else {
        this.loopMode = 0;
      }
    },
    songLoop() {
      if (this.loopMode === 0) {
        this.switchSong(2);
      } else {
        this.playSong();
      }
    },
    toggleList() {
      this.showList = !this.showList;
    },
    removeListSong(index) {
      if (this.currentIndex === index) {
        return;
      }
      if (this.currentIndex > index) {
        this.currentIndex--;
      }
      this.songList.splice(index, 1);
    },
    playListSong(index) {
      this.currentIndex = index;
      this.playSong();
    },

    // 进度条控制组件
    setProcess(barRate) {
      this.currentTime = this.duration * barRate;
      this.audio.currentTime = this.currentTime;
    },
    dragProcessMouseDown() {
      clearInterval(this.processChecker);
    },
    dragProcessMouseMove(barRate) {
      this.currentTime = barRate * this.duration;
    },
    dragProcessMouseUp() {
      this.audio.currentTime = this.currentTime;
      // 有空研究下为啥设了延时才能走，是否和媒体加载有关？
      this.processChecker = setInterval(() => {
        this.checkCurrentProcess();
      }, 200);
    },
    // 点击歌词跳转进度
    setProcessByLyric(process) {
      if (this.isPlaying) {
        this.audio.currentTime = process;
      }
    },
    // 音量控制组件
    setVolume(barRate) {
      this.currentVolume = this.maxVolume * barRate;
      this.volumeOn = barRate !== 0;
    },
    dragVolumeMouseMove(barRate) {
      this.setVolume(barRate);
    },
    //

    toggleVolumeController(e) {
      // 避免点击控制条时触发
      if (e.srcElement.className !== "volume-icon") {
        return;
      }
      this.showVolumeController = !this.showVolumeController;
      if (this.showVolumeController) {
        document.body.addEventListener(
          "click",
          this.removeVolumeController,
          false
        );
      }
    },
    removeVolumeController() {
      this.showVolumeController = false;
      document.body.removeEventListener(
        "click",
        this.removeVolumeController,
        false
      );
    },
    goToLyric() {
      Bus.$emit("goToLyric", this.songList[this.currentIndex].id);
      setTimeout(() => {
        if (this.isPlaying) {
          Bus.$emit("setPlayState", true);
        }
      }, 10);
    },
  },
};
</script>

<style lang="less">
#music-player-wrapper {
  position: relative;
  width: 100%;
  text-align: center;
  border-top: 1px solid black;
  box-shadow: 0 0 4px black;
  background-color: rgba(0, 0, 0, 0.75);
  user-select: none;
}
.controller-wrapper {
  position: relative;
  width: 900px;
  margin: auto;
  cursor: default;
  .controll-btn {
    position: relative;
    font-size: 26px;
    line-height: 50px;
    color: #bbb;
    display: inline-block;
    i {
      cursor: pointer;
    }
    i:hover {
      color: white;
      text-shadow: 0 0 4px white;
    }
    .play-btn {
      font-size: 40px;
      line-height: 36px;
      color: #ddd;
    }
    .backward {
      line-height: 36px;
      transform: rotate(90deg);
    }
    .afterward {
      line-height: 36px;
      transform: rotate(-90deg);
    }
    i {
      vertical-align: middle;
    }
  }
  .album-picture {
    position: relative;
    margin: 4px 8px;
    width: 50px;
    height: 50px;
    line-height: 50px;
    background-color: black;
    border: 1px solid black;
    border-radius: 6px;
    box-shadow: 0 0 1px black;
    vertical-align: middle;
    overflow: hidden;
    display: inline-block;
    img {
      position: absolute;
      max-width: 100%;
      max-height: 100%;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      margin: auto;
    }
    .img-mask {
      width: 0;
      height: 0;
      border-top: 50px solid white;
      border-right: 50px solid transparent;
      opacity: 0.15;
    }
  }
  .main-info {
    position: relative;
    margin: 4px;
    width: 600px;
    height: 50px;
    text-align: left;
    vertical-align: middle;
    display: inline-block;
    .song-title-wrapper {
      position: relative;
      width: auto;
      height: 30px;
      line-height: 30px;
      font-size: 14px;
      color: #e8e8e8;
      text-align: left;
      .song-title {
        cursor: pointer !important;
      }
    }
    .song-process-wrapper {
      position: relative;
      width: 600px;
      height: 16px;
      display: inline-block;
      .original-audio {
        position: absolute;
        top: -100px;
      }
      .process-container {
        position: relative;
        top: -4px;
        display: inline-block;
      }
      .process-duration {
        position: relative;
        top: -4px;
        margin-left: 12px;
        font-size: 12px;
        font-weight: 500;
        line-height: 12px;
        color: #999;
        display: inline-block;
      }
    }
  }
  .right-controller {
    position: relative;
    display: inline-block;
    .icon-wrapper {
      position: relative;
      margin: auto 0 auto 8px;
      display: inline-block;
      cursor: pointer;
      .volume-icon {
        position: relative;
        vertical-align: middle;
        width: 20px;
      }
      .volume-controller-container {
        position: absolute;
        padding-top: 16px;
        padding-bottom: 0px;
        left: -6px;
        top: -180px;
        width: 30px;
        height: 145px;
        background-color: rgba(0, 0, 0, 0.6);
        cursor: default;
      }
      .loop-mode-icon {
        position: relative;
        vertical-align: middle;
        font-size: 20px;
        color: #bbb;
        display: inline-block;
      }
      .loop-icon-num {
        position: absolute;
        color: #bbb;
        left: 7px;
        top: 4px;
        font-size: 6px;
        font-weight: 500;
      }
      .show-list-icon {
        position: relative;
        vertical-align: middle;
        font-size: 20px;
        color: #bbb;
        display: inline-block;
      }
    }
  }
}
</style>

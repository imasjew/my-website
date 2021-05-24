<template>
  <div id="wrapper">
    <div class="controller-wrapper">
      <playerlist
        ref="playerlist"
        :songList="songList"
        :currentIndex="currentIndex"
        :showList="showList"
        @remove="removeListSong($event)"
        @play="playListSong($event)"
      ></playerlist>
      <div class="controll-btn">
        <i class="el-icon-download backward" @click="switchSong(1)"></i>
        <i
          :class="[playButtonType, 'play-btn']"
          @click="isPlaying ? pauseSong() : playSong()"
        ></i>
        <i class="el-icon-download afterward" @click="switchSong(2)"></i>
      </div>
      <div class="album-pic">
        <img :src="albumPic" alt="" />
        <div class="img-mask"></div>
      </div>
      <div class="main-info">
        <div class="song-title">{{ title }}</div>
        <div class="song-process-wrapper">
          <audio
            ref="player"
            :src="url"
            controls="controls"
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
              @setPosition="setProcess($event)"
              @dragMouseDown="dragProcessMouseDown()"
              @dragMouseMove="dragProcessMouseMove($event)"
              @dragMouseUp="dragProcessMouseUp()"
            ></Slider>
          </div>
          <div class="process-duration" @click="test()">
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
            <!-- <div class="volume-controller-bar">
              <div class="volume-controller-current"></div>
              <div class="volume-controller-handle"></div>
            </div> -->
            <Slider
              :barLength="130"
              :barWeight="6"
              :verticalMode="true"
              :currentPosition="volumeHandlePosition"
              :forbidden="false"
              :autoPlay="false"
              @setPosition="setVolume($event)"
              @dragMouseMove="dragVolumeMouseMove($event)"
            ></Slider>
          </div>
        </div>
        <div class="icon-wrapper">
          <div v-if="!loopList" class="loop-icon-num">1</div>
          <i
            :class="[
              'loop-mode-icon',
              loopList ? 'el-icon-refresh' : 'el-icon-refresh-left',
            ]"
            @click="toggleLoopMode()"
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
import playerlist from "@/components/PlayerList.vue";
import Slider from "@/components/Slider.vue";
import httpService from "@/service/http.service";
import Bus from "@/eventBus.js";
export default {
  name: "musicplayer",
  components: { playerlist, Slider },
  data() {
    return {
      audio: "", // 音频资源
      currentIndex: 0, // 当前播放编号
      albumPic: null, // 专辑封面
      songList: [], // 歌单
      isPlaying: false, // 播放状态
      loopList: true, // 列表循环开罐
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
  },
  created() {
    Bus.$on("playSong", (song) => {
      this.addSong(song);
    });
  },
  destroyed() {
    Bus.$off();
  },
  computed: {
    title: function () {
      if (this.songList.length === 0) {
        return "";
      }
      return this.songList[this.currentIndex].title || "";
    },
    url: function () {
      if (this.songList.length === 0) {
        return "";
      }
      return this.songList[this.currentIndex].url || "";
    },
    playButtonType: function () {
      return this.isPlaying ? "el-icon-video-pause" : "el-icon-video-play";
    },
    processHandlePosition: function () {
      if (this.duration === 0) {
        return 0;
      } else {
        return (this.currentTime / this.duration) * 100;
      }
    },
    volumeHandlePosition: function () {
      return (this.currentVolume / this.maxVolume) * 100;
    },
  },
  methods: {
    addSong: function (song) {
      if (!song.url) {
        this.pauseSong();
      }
      if (this.songList.length !== 0) {
        this.checkDuplicate(song);
      } else {
        this.songList.push(song);
        this.currentIndex = this.songList.length - 1;
      }
      this.playSong();
    },
    checkDuplicate: function (song) {
      const listLength = this.songList.length;
      for (let i = 0; i <= listLength; i++) {
        if (song.id === this.songList[i].id) {
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
    playSong: function () {
      clearInterval(this.processChecker);
      const song = this.songList[this.currentIndex];
      httpService.getAlbumInfo(song.id).then(
        (res) => {
          this.albumPic = res.songs[0].al.picUrl;
        },
        (err) => {}
      );
      // 哪怕加一毫秒都能播放，直接播放就不行？
      this.isPlaying = true;
      setTimeout(() => {
        this.audio.play();
      }, 100);
      this.processChecker = setInterval(() => {
        this.checkCurrentProcess();
      }, 200);
    },
    pauseSong: function () {
      this.isPlaying = false;
      this.audio.pause();
      clearInterval(this.processChecker);
    },
    checkCurrentProcess: function () {
      this.duration = this.audio.duration;
      this.currentTime = this.audio.currentTime;
    },
    switchSong: function (type) {
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
      this.playSong();
    },
    toggleLoopMode() {
      this.loopList = !this.loopList;
    },
    songLoop() {
      if (this.loopList) {
        this.switchSong(2);
      } else {
        this.playSong();
      }
    },
    toggleList: function () {
      this.showList = !this.showList;
    },
    removeListSong: function (index) {
      console.log(index, this.currentIndex);
      if (this.currentIndex === index) {
        return;
      }
      if (this.currentIndex > index) {
        this.currentIndex--;
      }
      this.songList.splice(index, 1);
    },
    playListSong: function (index) {
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
      this.processChecker = setInterval(() => {
        this.checkCurrentProcess();
      }, 200);
    },
    // 音量控制组件
    setVolume(barRate) {
      this.currentVolume = this.maxVolume * barRate;
      this.audio.volume = barRate;
        this.volumeOn = barRate !== 0;
    },
    dragVolumeMouseMove(barRate) {
      this.setVolume(barRate);
    },
    toggleVolumeController(e) {
      console.log('e', e.srcElement.className)
      if (e.srcElement.className !== "volume-icon") {
        return;
      }
      this.showVolumeController = !this.showVolumeController;
    },
  },
};
</script>

<style lang="less">
#wrapper {
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
  .album-pic {
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
    .song-title {
      position: relative;
      width: auto;
      height: 30px;
      line-height: 30px;
      font-size: 14px;
      color: #e8e8e8;
      text-align: left;
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

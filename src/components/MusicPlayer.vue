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
        <i :class="[playButtonType, 'play-btn']"></i>
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
            <div
              class="process-bar"
              @mousedown="goToTime($event)"
              :style="{ width: processBarWidth + 'px' }"
            >
              <div
                class="process-current"
                :style="{ width: processHandlePosition + '%' }"
              ></div>
              <div
                class="process-handle"
                :style="{ left: processHandlePosition + '%' }"
                @mousedown="dragToTime($event)"
              ></div>
            </div>
          </div>
          <div class="process-duration" @click="test()">
            {{ currentTime | formateDate }} / {{ duration | formateDate }}
          </div>
        </div>
      </div>
      <div class="right-controller">
        <div class="icon-wrapper" @click="toggleVolumeController()">
          <img
            class="volume-icon"
            :src="volumeOn ? volumeOnIcon : volumeOffIcon"
            alt=""
          />
          <div v-if="showVolumeController" class="volume-controller-container">
            <div class="volume-controller-bar">
              <div class="volume-controller-current"></div>
              <div class="volume-controller-handle"></div>
            </div>
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
import httpService from "@/service/http.service";
import Bus from "@/eventBus.js";
export default {
  name: "musicplayer",
  components: { playerlist },
  data() {
    return {
      audio: "",
      currentIndex: 0,
      albumPic: null,
      songList: [],
      isPlaying: false,
      loopList: true,
      showList: true,
      currentTime: 0,
      duration: 0,
      processChecker: null,
      processBarWidth: 500,
      volumeOn: true,
      showVolumeController: false,
      volumeOnIcon: "/static/icon/volume-on.png",
      volumeOffIcon: "/static/icon/volume-off.png",
    };
  },
  mounted() {
    this.audio = this.$refs.player;
    this.audio.volume = 0.1;
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
  },
  methods: {
    test: function () {
      console.log(this.audio.duration);
      console.log(this.audio.currentTime);
      console.log(this.audio.volume);
    },
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
    checkCurrentProcess: function () {
      this.duration = this.audio.duration;
      this.currentTime = this.audio.currentTime;
    },
    pauseSong: function () {
      this.isPlaying = false;
      this.audio.pause();
      clearInterval(this.processChecker);
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
    goToTime: function (e) {
      console.log(e);
      if (this.duration === 0) {
        return;
      }
      if (e.srcElement.className === "process-handle") {
        return;
      }
      const processRate = (e.layerX) / this.processBarWidth;
      this.currentTime = this.duration * processRate;
      this.audio.currentTime = this.currentTime;
    },
    dragToTime: function (e) {
      e.preventDefault();
      clearInterval(this.processChecker);
      let originHandleX = e.target.offsetLeft + 8; // border = 4px;
      const mousedownX = e.clientX;
      document.onmousemove = (e) => {
        let offset = e.clientX - mousedownX;
        let position = originHandleX + offset;
        console.log('111')
        if (position <= 0) {
          position = 0;
          console.log('---',position )
        }
        if (position >= this.processBarWidth) {
          position = this.processBarWidth;
        }
        this.currentTime = (position / this.processBarWidth) * this.duration;
      };
      document.onmouseup = (e) => {
        document.onmousemove = null;
        document.onmouseup = null;
        this.audio.currentTime = this.currentTime;
        this.processChecker = setInterval(() => {
          this.checkCurrentProcess();
        }, 200);
      };
    },
    toggleVolumeController() {
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
        .process-bar {
          position: relative;
          margin: 4px 0;
          height: 8px;
          background-color: #151515;
          border-radius: 4px;
          box-shadow: 0 1px 1px #444, 0 2px 2px black inset;
          .process-current {
            position: relative;
            height: 8px;
            border-radius: 4px;
            box-shadow: 0 1px 1px #f55 inset, 0 2px 2px #111;
            background-color: #c22;
          }
          .process-handle {
            position: absolute;
            margin-left: -8px;
            left: 0;
            top: -4px;
            width: 8px;
            height: 8px;
            border: 4px solid white;
            background-color: #c22;
            border-radius: 8px;
            box-shadow: 0 2px 2px #111;
          }
          .process-handle:hover {
            background-color: #c33;
            box-shadow: 0 0 6px white;
          }
        }
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
        left: -6px;
        top: -169px;
        width: 30px;
        height: 150px;
        background-color: rgba(0, 0, 0, 0.6);
        .volume-controller-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          margin: auto;
          width: 6px;
          height: 130px;
          background-color: black;
          border-radius: 4px;
          .volume-controller-current {
          }
          .volume-controller-handle {
            position: absolute;
            left: -3px;
            bottom: 0;
            width: 6px;
            height: 6px;
            background-color: #c22;
            border: 3px solid white;
            border-radius: 8px;
          }
          .volume-controller-handle:hover {
            background-color: #c33;
            box-shadow: 0 0 6px white;
          }
        }
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

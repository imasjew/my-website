<template>
  <div class="lyric-page-wrapper">
    <!-- <div>{{ currentSentenceIndex }}</div> -->
    <div class="title-wrapper">
      {{ songTitle }}
    </div>
    <div class="vocal-wrapper" v-if="!instrumental">
      <div class="lyric-wrapper">
        <div v-for="(sentence, index) in lyric" :key="index">
          <span
            :class="[
              { 'highlight-sentence': index == currentSentenceIndex },
              { 'empty-sentence': sentence.lyric === '' },
              'lyric',
            ]"
            @click="skipByLyric(sentence.time)"
            >{{ sentence.lyric }}</span
          >
        </div>
      </div>
    </div>
    <!-- 用v-if的话，会因为加载次序问题无法获取其style报错 -->
    <div class="instrumental-wrapper" v-show="instrumental">
      <div class="album-title">器乐作品，请欣赏</div>
      <div class="album-picture-wrapper">
        <img
          :src="albumPicture"
          alt=""
          ref="albumPicture"
          class="album-picture album-picture-animation"
        />
      </div>
    </div>
    <div class="backward-button">
      <i class="el-icon-back" @click="goToMusicList()"></i>
    </div>
  </div>
</template>

<script>
import httpService from "@/service/http.service";
import Bus from "@/eventBus.js";
export default {
  name: "musiclyric",
  data() {
    return {
      songTitle: "",
      lyric: [], // 歌词
      albumPicture: "", // 专辑封面
      instrumental: false, // 器乐曲目标识，分辨显示歌词还是专辑封面
      currentSentenceIndex: null, // 当前高亮歌词index
    };
  },
  created() {
    Bus.$on("checkLyricProcess", (process) => {
      this.checkLyricProcess(process);
    });
    Bus.$on("setPlayState", (state) => {
      setTimeout(() => {
        this.setPlayState(state);
      }, 200);
    });
  },
  mounted() {
    this.getPageInfo();
  },
  watch: {
    $route() {
      this.getPageInfo();
    },
  },
  computed: {
    albumPictureDom() {
      return this.$refs.albumPicture;
    },
  },
  methods: {
    getPageInfo() {
      const songId = this.$route.query.id;
      this.getSongDetail(songId);
      this.getLyric(songId);
    },
    getSongDetail(songId) {
      httpService.getSongDetail(songId).then(
        (res) => {
          this.songTitle = res.songs[0].name;
          this.albumPicture = res.songs[0].al.picUrl;
        },
        () => {
          console.log("歌曲信息加载失败");
        }
      );
    },
    getLyric(songId) {
      httpService.getLyric(songId).then(
        (res) => {
          if (res.lrc) {
            const originLyric = res.lrc.lyric;
            this.lyric = this.dealLyric(originLyric);
            this.instrumental = false;
          } else {
            this.lyric = [{ time: 0, lyric: "纯音乐，请欣赏" }];
            this.instrumental = true;
            // 切歌重置唱片角度，但不知道为何必须延时，而且时间短了还有可能失败
            this.albumPictureDom.classList.remove("album-picture-animation");
            setTimeout(() => {
              this.albumPictureDom.classList.add("album-picture-animation");
            }, 100);
          }
        },
        (err) => {
          console.log("请求失败", err);
        }
      );
    },
    dealLyric(originLyric) {
      // 歌词分句
      let lyricArray = originLyric.split("\n");
      lyricArray.pop();
      let dealedLyricArray = [];
      // 每一句再通过"]"拆成时间+歌词
      for (let i in lyricArray) {
        lyricArray[i] = lyricArray[i].substring(1, lyricArray[i].length);
        lyricArray[i] = lyricArray[i].split("]");
        // 如果歌词中出现"]"造成多余拆分，合并之
        const nowArray = lyricArray[i];
        if (nowArray.length > 2) {
          while (nowArray.length > 2) {
            nowArray[1] = nowArray[1].concat(nowArray[2]);
            nowArray.splice(2, 1);
          }
        }
        dealedLyricArray.push({
          time: this.lyricTimeFormat(lyricArray[i][0]),
          lyric: lyricArray[i][1],
        });
      }
      return dealedLyricArray;
    },
    lyricTimeFormat(originTime) {
      const splitedTime = originTime.split(/[:]/);
      const dealedTime = parseFloat(
        splitedTime[0] * 60 + parseFloat(splitedTime[1])
      );
      return dealedTime;
    },
    checkLyricProcess(process) {
      const maxLength = this.lyric.length;
      if (maxLength <= 1) {
        return;
      }
      if (process >= this.lyric[maxLength - 1].time) {
        this.currentSentenceIndex = maxLength - 1;
        return;
      }
      for (let i = 0; i <= maxLength - 1; i++) {
        if (process > this.lyric[i].time && process < this.lyric[i + 1].time) {
          this.currentSentenceIndex = i;
          return;
        }
      }
    },
    skipByLyric(time) {
      Bus.$emit("skipByLyric", time);
    },
    setPlayState(state) {
      if (state) {
        this.albumPictureDom.style.animationPlayState = "running";
      } else {
        this.albumPictureDom.style.animationPlayState = "paused";
      }
    },
    goToMusicList() {
      Bus.$emit("goToMusicList", this.songTitle);
    }
  },
};
</script>

<style lang="less">
.lyric-page-wrapper {
  position: relative;
  .title-wrapper {
    padding: 48px 0 32px 0;
    font-size: 24px;
    color: #303133;
  }
  .lyric-wrapper {
    padding-bottom: 88px;
    .lyric {
      // white-space: pre-line;
      position: relative;
      font-size: 16px;
      color: #303133;
      line-height: 32px;
      display: inline-block;
      cursor: pointer;
      user-select: none;
    }
    .highlight-sentence {
      position: relative;
      padding: 0 6px;
      font-size: 20px;
      border-radius: 8px;
      box-shadow: 1px 1px 8px black;
      display: inline-block;
    }
    .empty-sentence {
      height: 32px;
      line-height: 32px;
      box-shadow: none;
      display: inline-block;
    }
  }
  .album-title {
    margin-bottom: 48px;
  }
  .album-picture-wrapper {
    position: relative;
    margin: auto;
    width: 500px;
    height: 500px;
    border: 3px solid #111;
    border-radius: 250px;
    background-color: #222;
    background-image: linear-gradient(-45deg, black, #3c3c3c, black);
    box-shadow: 0 0 20px black;
    .album-picture {
      position: relative;
      margin: auto;
      margin-top: 75px;
      width: 350px;
      height: 350px;
      border: 4px solid #1b1b1b;
      border-radius: 175px;
      box-sizing: border-box;
      user-select: none;
    }
    .album-picture-animation {
      animation-name: revolve;
      animation-duration: 21s;
      animation-iteration-count: infinite;
      animation-timing-function: linear;
      animation-play-state: paused;
    }
  }
  .backward-button {
    position: absolute;
    left: 24px;
    top: 48px;
    i {
      font-size: 24px;
      color: #909399;
    }
    i:hover {
      color: #303133;
      text-shadow: 0 0 4px gray;
    }

  }
}

@keyframes revolve {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

<template>
  <div>
    <!-- <div>{{ currentSentenceIndex }}</div> -->
    <div class="title-wrapper">
      {{ songTitle }}
    </div>
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
    <div class="album-picture-wrapper" v-show="lyric.length <= 1">
      <img :src="albumPicture" alt="" ref="albumpic" class="album-picture" />
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
      currentSentenceIndex: null, // 当前高亮歌词index
    };
  },
  created() {
    Bus.$on("checkLyricProcess", (process) => {
      this.checkLyricProcess(process);
    });
    Bus.$on("setPlayState", (state) => {
      this.setPlayState(state);
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

  methods: {
    getPageInfo() {
      const songId = this.$route.query.id;
      this.getSongDetail(songId);
      this.getLyric(songId);
    },
    getSongDetail(songId) {
      httpService.getSongInfo(songId).then(
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
          } else {
            this.lyric = [{ time: 0, lyric: "纯音乐，请欣赏" }];
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
        this.$refs.albumpic.style.animationPlayState = 'running';
      } else {
        this.$refs.albumpic.style.animationPlayState = 'paused';

      }
    }
  },
};
</script>

<style lang="less">
.title-wrapper {
  padding: 48px 0 32px 0;
  font-size: 24px;
}
.lyric-wrapper {
  padding-bottom: 80px;
  .lyric {
    // white-space: pre-line;
    position: relative;
    font-size: 16px;
    line-height: 32px;
    display: inline-block;
    cursor: pointer;
    user-select: none;
  }
  .highlight-sentence {
    position: relative;
    padding: 0 6px;
    font-size: 20px;
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
    animation-name: revolve;
    animation-duration: 21s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
    animation-play-state: paused;
  }
}
@keyframes revolve {
  from {transform: rotate(0deg)}
  to {transform: rotate(360deg)}
}
</style>

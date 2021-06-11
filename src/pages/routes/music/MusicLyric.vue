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
            { 'empty-sentence': sentence.lyric === ''},
            'lyric',
          ]"
          @click="skipByLyric(sentence.time)"
          >{{ sentence.lyric }}</span
        >
      </div>
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
      currentSentenceIndex: null, // 当前高亮歌词index
    };
  },
  created() {
    Bus.$on("checkLyricProcess", (process) => {
      this.checkLyricProcess(process);
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

  destroyed() {
    // Bus.$off();
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
          console.log("res", res.songs[0].name);
          this.songTitle = res.songs[0].name;
        },
        () => {
          console.log("图片没找到");
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
      if (maxLength === 1) {
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
      Bus.$emit('skipByLyric', time)
    }
  },
};
</script>

<style lang="less">
.title-wrapper {
  padding: 16px;
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
    display: block;
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
</style>

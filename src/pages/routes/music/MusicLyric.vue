<template>
  <div>
    <!-- <div>{{ currentSentenceIndex }}</div> -->
    <div class="lyric-wrapper">
      <div
        :class="[
          { 'highlight-sentence': index == currentSentenceIndex },
          'lyric',
        ]"
        v-for="(sentence, index) in lyric"
        :key="index"
      >
        {{ sentence.lyric }}
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
    this.getLyric();
  },
  watch: {
    $route() {
      this.getLyric();
    },
  },

  destroyed() {
    // Bus.$off();
  },
  methods: {
    getLyric() {
      const songId = this.$route.query.id;
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
  },
};
</script>

<style lang="less">
.lyric-wrapper {
  padding-bottom: 80px;
  .lyric {
    // white-space: pre-line;
    line-height: 32px;
  }
  .highlight-sentence {
    color: red;
  }
}
</style>

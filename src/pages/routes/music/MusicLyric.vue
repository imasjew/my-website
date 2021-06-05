<template>
  <div>
    <div></div>
    <div class="lyric" v-for="(sentence, index) in lyric" :key="index">
      {{ sentence[1] }}
    </div>
  </div>
</template>


<script>
import httpService from "@/service/http.service";
export default {
  name: "musiclyric",
  data() {
    return {
      lyric: [], // 歌词
    };
  },
  mounted() {
    this.getLyric()
  },
  watch: {
    $route() {
      this.getLyric();
    }
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
            const nonLyric = ['0', '纯音乐请欣赏']
            this.lyric = [nonLyric];
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
      }
      return lyricArray;
    },
  },
};
</script>

<style lang="less">
.lyric {
  // white-space: pre-line;
  line-height: 32px;
}
</style>

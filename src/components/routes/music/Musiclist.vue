<template>
  <div>
    <el-table :data="tableData" stripe style="width: 100%">
      <el-table-column type="index" width="60"> </el-table-column>
      <el-table-column width="70">
        <template slot-scope="scope">
          <i
            :class="
              scope.$index == playingIndex
                ? 'el-icon-video-pause'
                : 'el-icon-video-play'
            "
            @click="songPlay(scope.$index)"
          ></i>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="歌曲标题"> </el-table-column>
      <el-table-column label="时长" width="100">
        <template slot-scope="scope">
          {{scope.row.duration|formateDate}}
        </template>
      </el-table-column>
      <el-table-column prop="author" label="作者"> </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: "musiclist",
  data() {
    return {
      playingIndex: null,
      tableData: [
        {
          duration: 666,
          name: "烧脑赋格 BWV1088",
          author: "巴赫",
        },
        {
          duration: 280,
          name: "砸钢琴幻想曲 No.33 Op.5",
          author: "李斯特",
        },
        {
          duration: 141,
          name: "某艺术歌曲 No.99 Op.0",
          author: "舒伯特",
        },
        {
          duration: 123,
          name: "土味情歌-学狗叫",
          author: "王大锤",
          isPlaying: true,
        },
      ],
    };
  },
  methods: {
    songPlay: function (i) {
      if (this.playingIndex !== i) {
        this.playingIndex = i;
      } else {
        this.playingIndex = null;
      }
    },
  },
};
</script>

<style lang="less">
.el-table td {
  padding: 4px 0;
}
</style>

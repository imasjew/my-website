<template>
  <div>
    <div class="search-wrapper">
      <el-input
        placeholder="请输入内容"
        v-model="input"
        clearable
        @keydown.enter.native="searchList()"
      >
        <el-button
          slot="append"
          icon="el-icon-search"
          @click="searchList()"
        ></el-button>
      </el-input>
    </div>
    <div class="song-list-wrapper">
      <el-table
        :data="tableData"
        stripe
        style="width: 100%"
        class="wrapper-color"
      >
        <el-table-column type="index" width="50"> </el-table-column>
        <el-table-column width="40">
          <template slot-scope="scope">
            <i
              :class="[
                'el-icon-video-play',
                { playing: scope.$index == currentIndex },
              ]"
              @click="addSong(scope.$index, scope.row.id, false)"
            ></i>
          </template>
        </el-table-column>
        <el-table-column
          prop="title"
          label="歌曲标题"
          width="350"
          :show-overflow-tooltip="true"
        >
          <template slot-scope="scope">
            <span
              class="song-title"
              @click="addSong(scope.$index, scope.row.id, true)"
              >{{ scope.row.title }}</span
            >
          </template>
        </el-table-column>

        <el-table-column
          prop="author"
          label="作者"
          width="150"
          :show-overflow-tooltip="true"
        >
        </el-table-column>
        <el-table-column
          prop="albumName"
          label="专辑"
          :show-overflow-tooltip="true"
        >
        </el-table-column>
        <el-table-column label="时长" width="70">
          <template slot-scope="scope">
            {{ scope.row.duration | formateDate }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>


<script>
import httpService from "@/service/http.service";
import Bus from "@/eventBus.js";
export default {
  name: "musiclist",
  data() {
    return {
      input: "",
      currentIndex: null,
      tableData: [],
    };
  },
  created() {
    if (this.$route.query.name) {
      this.input = this.$route.query.name;
      this.searchList();
    }
  },
  methods: {
    searchList() {
      if (this.input === "") {
        return;
      }
      this.$router.push("?name=" + this.input);
      httpService.getSongList(this.input).then(
        (res) => {
          const songs = res.result.songs;
          if (songs) {
            this.formatSongList(songs);
          }
        },
        (err) => {
          console.log("songList请求失败", err);
        }
      );
    },
    formatSongList(songs) {
      const length = songs.length > 24 ? 24 : songs.length;
      this.tableData = [];
      for (let i = 0; i < length; i++) {
        let song = {};
        song.id = songs[i].id;
        song.title = songs[i].name;
        song.duration = songs[i].duration / 1000;
        song.author = songs[i].artists[0].name;
        song.albumName = songs[i].album.name;
        this.tableData.push(song);
      }
    },
    addSong(index, songId, goToLyric) {
      httpService.checkSong(songId).then(
        () => {
          this.currentIndex = index;
          Bus.$emit('addSongDetail', songId);
          if(goToLyric) {
            Bus.$emit("goToLyric", songId);
          }
        },
        (err) => {
          this.showAlert(err.response.data.message);
        }
      );
    },
    showAlert(msg) {
      this.$message({
        message: msg,
      });
    },
  },
};
</script>

<style lang="less">
.search-wrapper {
  margin: 32px;
  .el-input {
    width: 400px;
  }
}
.song-list-wrapper {
  width: 900px;
  margin: 0 auto;
  padding-bottom: 80px;
  .song-title {
    cursor: pointer;
  }
  .song-title:hover {
    color: black;
  }
  .el-table td {
    padding: 4px 0;
    .el-icon-video-play {
      font-size: 20px;
      line-height: 28px;
      color: #999;
      cursor: pointer;
    }
    .el-icon-video-play:hover {
      color: #555;
      text-shadow: 0 0 1px #555;
    }
    .playing {
      color: #c44;
      text-shadow: 0 0 1px #c44;
    }
    .playing:hover {
      color: #c44;
      text-shadow: 0 0 1px #c44;
    }
  }
  .el-table::before {
    height: 0; // 去除底部白线，会遮盖底部组件
  }
}
</style>

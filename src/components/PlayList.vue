<template>
  <div class="song-list">
    <div class="song-list-title">歌曲列表({{ songList.length }})</div>
    <ul class="song-list-table">
      <li
        v-for="(song, index) in songList"
        :key="song.url"
        @click="playSong($event, index)"
        class="song-info"
      >
        <td class="playing-status">
          <div class="playing-icon" v-if="index == currentIndex"></div>
        </td>
        <td class="song-title">{{ song.title }}</td>
        <td class="song-author">{{ song.author }}</td>
        <td>
          <i
            class="el-icon-delete"
            @click="remove(index)"
            v-if="index !== currentIndex"
          ></i>
        </td>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: "playlist",
  props: ["songList", "currentIndex"],
  data() {
    return {
      isPlaying: false,
    };
  },
  watch: {
    songList(list) {
      localStorage.setItem("playList", JSON.stringify(list));
    },
  },
  methods: {
    remove(index) {
      this.$emit("remove", index);
    },
    playSong(e, index) {
      if (e.srcElement.className === "el-icon-delete") {
        return;
      }
      this.$emit("play", index);
    },
  },
};
</script>

<style lang="less">
.song-list {
  position: absolute;
  left: 0;
  top: -241px;
  width: 900px;
  height: 240px;
  margin: auto;
  color: #ddd;
  background-color: rgba(51, 51, 51, 0.95);
  border-radius: 8px 8px 0 0;
  box-shadow: 0 0 4px #333;
  .song-list-title {
    height: 24px;
    line-height: 24px;
    background-color: #222;
    border-radius: 8px 8px 0 0;
  }
  .song-list-table {
    padding: 0;
    .song-info {
      position: relative;
      list-style: none;
      text-align: left;
      cursor: pointer;
      .playing-status {
        position: relative;
        width: 50px;
        .playing-icon {
          position: relative;
          left: 24px;
          top: 1px;
          width: 0;
          height: 0;
          border-top: 6px solid transparent;
          border-left: 10px solid #a22;
          border-bottom: 6px solid transparent;
        }
      }
      .song-title {
        position: relative;
        width: 560px;
        max-width: 560px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .song-author {
        width: 240px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .el-icon-delete {
        display: none;
      }
    }
    .song-info:hover {
      background-color: #444;
      .el-icon-delete {
        display: inline-block;
      }
    }
  }
}
</style>

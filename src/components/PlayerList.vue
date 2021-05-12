<template>
  <div class="song-list" v-if="showList">
    <div class="song-list-title">歌曲列表({{ songList.length }})</div>
    <ul class="song-list-table">
      <li
        v-for="(song, index) in songList"
        :key="song.url"
        @click="playSong(index)"
        class="song-info"
      >
        <td class="playing-status">
          <div class="playing-icon" v-if="index == currentIndex"></div>
        </td>
        <td class="song-title">{{ song.title }}</td>
        <td class="song-author">{{ song.author }}</td>
        <!-- <td>{{ song.albumId }}</td> -->
        <td>
          <i
            class="el-icon-delete delete-btn"
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
  name: "playerlist",
  props: ["songList", "currentIndex", "showList"],
  data() {
    return {
      isPlaying: false,
    };
  },
  created() {},
  methods: {
    remove: function (index) {
      this.$emit("remove", index);
    },
    playSong: function (index) {
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
  color: #DDD;
  background-color: #333;
  border-radius: 4px 4px 0 0;
  .song-list-title {
    background-color: #222;
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
      .delete-btn {
        display: none;
      }
    }
    .song-info:hover {
      background-color: #444;
      .delete-btn {
        display: inline-block;
      }
    }
  }
}
</style>

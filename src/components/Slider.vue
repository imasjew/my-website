<template>
  <div
    class="bar-container"
    @mousedown="clickPosition($event)"
    :style="{ width: barLength + 'px' }"
  >
    <div
      class="bar-current"
      :style="{ width: currentPosition + '%' }"
    ></div>
    <div
      class="bar-handle"
      :style="{ left: currentPosition + '%' }"
      @mousedown="dragPosition($event)"
    ></div>
  </div>
</template>
<script>
export default {
  name: "Slider",
  props: ["barDirection", "barLength", "barWidth", "currentPosition", "forbidden"],
  data: function () {
    return {
      isPlaying: false,
    };
  },
  created() {},
  computed: {
  },
  methods: {
    clickPosition: function (e) {
      if (this.forbidden === true) {
        return;
      }
      if (e.srcElement.className === "bar-handle") {
        return;
      }
      const barRate = (e.layerX) / this.barLength;
      this.$emit('setPosition', barRate)
    },
    dragPosition: function (e) {
      e.preventDefault();
      if (this.forbidden === true) {
        return;
      }
      this.$emit('dragMouseDown');
      let originHandleX = e.target.offsetLeft + this.barWidth * 2; // border = 4px;
      const mousedownX = e.clientX;
      document.onmousemove = (e) => {
        let offset = e.clientX - mousedownX;
        let position = originHandleX + offset;
        if (position <= 0) {
          position = 0;
        }
        if (position >= this.barLength) {
          position = this.barLength;
        }
        const barRate = position / this.barLength
        this.$emit('dragMouseMove', barRate);
      };
      document.onmouseup = (e) => {
        document.onmousemove = null;
        document.onmouseup = null;
        this.$emit('dragMouseUp');
      };
    },
  },
};
</script>

<style lang="less">
.bar-container {
  position: relative;
  margin: 4px 0;
  height: 8px;
  background-color: #151515;
  border-radius: 4px;
  box-shadow: 0 1px 1px #444, 0 2px 2px black inset;
  .bar-current {
    position: relative;
    height: 8px;
    border-radius: 4px;
    box-shadow: 0 1px 1px #f55 inset, 0 2px 2px #111;
    background-color: #c22;
  }
  .bar-handle {
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
  .bar-handle:hover {
    background-color: #c33;
    box-shadow: 0 0 6px white;
  }
}
</style>

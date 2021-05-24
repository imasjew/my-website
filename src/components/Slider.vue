<template>
  <div
    class="bar-container"
    :style="barContainerSize"
    @mousedown="clickPosition($event)"
  >
    <div class="bar-current" :style="barCurrentStyle"></div>
    <div
      class="bar-handle"
      :style="barHandleStyle"
      @mousedown="dragPosition($event)"
    ></div>
  </div>
</template>
<script>
export default {
  name: "Slider",
  props: [
    "verticalMode",
    "barLength",
    "barWeight",
    "currentPosition",
    "forbidden",
  ],
  data: function () {
    return {
      isPlaying: false,
    };
  },
  computed: {
    barContainerSize() {
      if (this.verticalMode) {
        return {
          'width': this.barWeight + "px",
          'height': this.barLength + "px",
        };
      } else {
        return {
          'width': this.barLength + "px",
          'height': this.barWeight + "px",
        };
      }
    },
    barHandleStyle() {
      let position;
      if (this.verticalMode) {
        position = {
          'bottom': this.currentPosition + "%",
          'left': -this.barWeight / 2 + "px",
          "margin-bottom": -this.barWeight + "px",
        };
      } else {
        position = {
          'left': this.currentPosition + "%",
          'top': -this.barWeight / 2 + "px",
          "margin-left": -this.barWeight + "px",
        };
      }
      return {
        'width': this.barWeight + "px",
        'height': this.barWeight + "px",
        "border-radius": this.barWeight + "px",
        'border': this.barWeight / 2 + "px solid white",
        ...position,
      };
    },
    barCurrentStyle() {
      let style;
      if (this.verticalMode) {
        style = {
          'width': this.barWeight + 'px',
          'height': this.currentPosition + '%',
          'box-shadow': 'none'
        }
      } else {
        style = {
          'height': this.barWeight + 'px',
          'width': this.currentPosition + '%'
        }
      }
      return {
        'border-radius': this.barWeight / 2 + 'px',
        ...style
      };
    }
  },
  methods: {
    clickPosition: function (e) {
      if (this.forbidden === true) {
        return;
      }
      if (e.srcElement.className === "bar-handle") {
        return;
      }
      const layerPosition = this.verticalMode ? this.barLength - e.layerY : e.layerX;
      const barRate = layerPosition / this.barLength;
      this.$emit("setPosition", barRate);
    },
    dragPosition: function (e) {
      e.preventDefault();
      if (this.forbidden === true) {
        return;
      }
      this.$emit("dragMouseDown");
      const mousedownPosition = this.verticalMode ?  - e.clientY : e.clientX; // 鼠标初始绝对定位, 竖向为从下向上递增，所以取负减少后续重复判断
      const offsetPosition = this.verticalMode ? - e.target.offsetTop : e.target.offsetLeft; // 滑块基础相对位置
      // 修正了自身体积后的滑块位置, 竖向从下向上递增，所以需额外补偿一份容器全长否
      const originHandlePosition = this.verticalMode ? offsetPosition - this.barWeight + this.barLength : offsetPosition + this.barWeight;
      document.onmousemove = (e) => {
        const newClientPosition = this.verticalMode ? - e.clientY : e.clientX; // 鼠标新定位
        let offset = newClientPosition - mousedownPosition; // 鼠标新老定位相减计算移动距离
        let position = originHandlePosition + offset; // 滑块获得同样的移动距离
        // 滑块移动边界限制
        if (position <= 0) {
          position = 0;
        }
        if (position >= this.barLength) {
          position = this.barLength;
        }
        const barRate = position / this.barLength;
        this.$emit("dragMouseMove", barRate);
      };
      document.onmouseup = (e) => {
        document.onmousemove = null;
        document.onmouseup = null;
        this.$emit("dragMouseUp");
      };
    },
  },
};
</script>

<style lang="less">
.bar-container {
  position: relative;
  margin: auto auto;
  background-color: #151515;
  border-radius: 4px;
  box-shadow: 0 1px 1px #444, 0 2px 2px black inset;
  .bar-current {
    position: absolute;
    bottom: 0;
    box-shadow: 0 1px 1px #f55 inset, 0 2px 2px #111;
    background-color: #c22;
    pointer-events: none;
  }
  .bar-handle {
    position: absolute;
    background-color: #c22;
    box-shadow: 0 2px 2px #111;
  }
  .bar-handle:hover {
    background-color: #c33;
    box-shadow: 0 0 6px white;
  }
}
</style>

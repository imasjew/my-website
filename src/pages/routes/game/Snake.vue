<template>
  <div ref="snake">
    <!-- 我是蛇~~~
    {{ direction }} -->
  </div>
</template>

<script>
export default {
  name: "snake",
  props: ["direction", "scale", "speed"],
  data() {
    return {
      body: [
        { x: 5, y: 3 },
        { x: 4, y: 3 },
        { x: 3, y: 3 },
      ], // 蛇身位置数组
      alive: true, // 当前存活状态
      movingInterval: "", // 自动爬行
      currentDirection: 39, // 记录上一帧方向，用于屏蔽180度转向
    };
  },
  beforeDestroy() {
    clearInterval(this.movingInterval)
    // this.deleteSnake();
  },
  methods: {
    createSnake: function () {
      this.alive = true;
      this.resetBody();
      this.renderBody();
      this.autoMove();
    },
    resetBody: function () {
      this.body = [
        { x: 5, y: 3 },
        { x: 4, y: 3 },
        { x: 3, y: 3 },
      ];
    },
    renderBody: function () {
      const snakeWrapper = this.$refs.snake;
      // 清理上次的蛇
      this.removeBody(snakeWrapper);
      // 依次根据body数组中节点位置乘以尺寸系数渲染蛇身，设置颜色
      for (let i = 0; i < this.body.length; i++) {
        const snake = document.createElement("div");
        const snakeStyle = snake.style;
        snakeStyle.position = "absolute";
        snakeStyle.width = this.scale + "px";
        snakeStyle.height = this.scale + "px";
        snakeStyle.left = this.body[i].x * this.scale + "px";
        snakeStyle.top = this.body[i].y * this.scale + "px";
        snakeStyle.backgroundColor = "#494";
        // 头部使用深色
        if (i == 0) {
          snakeStyle.backgroundColor = "#171";
        }
        snakeWrapper.appendChild(snake);
      }
    },
    autoMove: function () {
      clearInterval(this.movingInterval);
      const _this = this;
      this.movingInterval = setInterval(() => {
        this.move();
      }, 1000/this.speed);
    },
    checkDirection() {
      if (Math.abs(this.direction - this.currentDirection) !== 2) {
        this.currentDirection = this.direction;
      }
    },
    move: function () {
      this.checkDirection();
      var max = this.body.length - 1;
      var tailData = this.body[max];
      for (let i = max; i > 0; i--) {
        this.body[i] = this.body[i - 1];
      }
      var x = this.body[0].x;
      var y = this.body[0].y;
      switch (this.currentDirection) {
        case 38:
          y--;
          break;
        case 40:
          y++;
          break;
        case 37:
          x--;
          break;
        case 39:
          x++;
          break;
        default:
          break;
      }

      this.body.shift();
      var headData = { x: x, y: y };
      this.body.unshift(headData);
      // 检测当前状态是否死亡和增长
      this.$emit("move", this.body);
      this.checkBodyCrash();
      if (!this.alive) {
        clearInterval(this.movingInterval);
        return;
      }
      if (this.growFlag) {
        this.body.push(tailData);
        this.growFlag = false;
      }
      this.renderBody();
    },
    checkBodyCrash: function () {
      const tailIndex = this.body.length - 1;
      const hx = this.body[0].x;
      const hy = this.body[0].y;

      for (let i = 1; i <= tailIndex; i++) {
        if (hx === this.body[i].x && hy === this.body[i].y) {
          this.alive = false;
          this.$emit("crashBody");
          return
        }
      }
    },
    removeBody: function (snakeWrapper) {
      // 清理上次的蛇
      while (snakeWrapper.hasChildNodes()) {
        snakeWrapper.removeChild(snakeWrapper.lastChild);
      }
    },
    deleteSnake() {
      const snakeWrapper = this.$refs.snake;
      this.removeBody(snakeWrapper)
      clearInterval(this.movingInterval);
    },
    grow: function () {
      this.growFlag = true;
    },
    cheatGrow: function () {
      this.body.push(this.body[this.body.length - 1]);
    },
    cheatCut: function () {
      if (this.body.length >= 2) {
        this.body.pop();
      }
    }
  },
};
</script>

<style>
</style>

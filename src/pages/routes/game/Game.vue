<template>
  <div class="page-wrapper">
    <div class="game-wrapper" ref="gameWrapper">
      <div class="speed-zone" ref="speedZone"></div>
      <div class="game-zone" ref="gameZone">
        <snake
          ref="snake"
          :direction="direction"
          :scale="scale"
          :speed="snakeSpeed"
          @move="checkSnakeStatus($event)"
          @crashBody="snakeCrashBody()"
        ></snake>
        <food
          ref="food"
          :scale="scale"
          :mapSize="mapSize"
          @checkFoodOnSnake="checkFoodOnSnake($event)"
        ></food>
        <div class="mask" v-if="!isGamming" @click="startGame()">
          <div v-html="maskWord" class="mask-word"></div>
        </div>
      </div>
      <div class="info-zone" ref="infoZone">
        <!-- <button @click="test()">test</button> -->
        <div class="info-item">
          <div>TIME:</div>
          <div>{{ time }}</div>
        </div>
        <div class="info-item">
          <div>SCORE:</div>
          <div>{{ score }}</div>
        </div>
        <div class="info-item">
          <div>
            <div>SPEED</div>
            <input v-model="snakeSpeed" type="number" max="20" min="1" /><span
              class="speed-info"
            >
              steps/s</span
            >
          </div>

          <div>MAP SIZE</div>
          <div>
            <input
              v-model="mapSize[0]"
              type="number"
              max="60"
              min="15"
            />&times;<input
              v-model="mapSize[1]"
              type="number"
              max="60"
              min="15"
            />
          </div>
          <button @click="resetGame()" id="restart-btn">RESTART</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import snake from "./Snake";
import food from "./Food";
export default {
  components: { snake, food },
  name: "game",
  data() {
    var validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入密码"));
      } else {
        // 放正则
        callback();
      }
    };
    return {
      mapSize: [25, 25], // 地图范围
      scale: 20, // 游戏图像尺寸
      snakeSpeed: 9, // 蛇移动速度
      infoWidth: 120, // 信息栏宽度
      isGamming: false, //游戏状态
      maskWord: "CLICK or press ENTER to start!", // 蒙版提示
      direction: 39, // 默认蛇的运行向右
      snake, // snake组件通讯
      food, // food组件通讯
      time: 0, // 游戏时间
      timeInterval: "", // 游戏时间计时器
      score: 0, // 游戏得分
      restartBtn: "", // 重置按钮，用于点击后自动失焦避免按回车时触发
    };
  },
  mounted() {
    this.renderMap();
    this.snake = this.$refs.snake;
    this.food = this.$refs.food;
    this.resetBtn = document.getElementById("restart-btn");
    const _this = this;
    document.onkeydown = function (e) {
      // 回车键
      if (e.keyCode === 13 && !_this.isGamming) {
        _this.startGame();
      }
      // 方向键
      if (e.keyCode >= 37 && e.keyCode <= 40) {
        _this.direction = e.keyCode;
        e.preventDefault && e.preventDefault(); // 避免大地图方向键翻滚页面
      }
      // 作弊 加长 =键
      if (e.keyCode === 187) {
        _this.snake.cheatGrow();
      }
      if (e.keyCode === 189) {
        _this.snake.cheatCut();
      }
    };
  },
  beforeDestroy() {
    document.onkeydown = null;
    clearInterval(this.timeInterval);
  },
  methods: {
    renderMap() {
      const gameWrapper = this.$refs.gameWrapper;
      const gameZone = this.$refs.gameZone;
      const infoZone = this.$refs.infoZone.style;
      gameZone.style.width = this.mapSize[0] * this.scale + "px";
      gameZone.style.height = this.mapSize[1] * this.scale + "px";
      gameWrapper.style.width =
        this.mapSize[0] * this.scale + this.infoWidth + 10 + "px";
      gameWrapper.style.height = this.mapSize[1] * this.scale + 10 + "px";
    },
    // 大地图下缩小比例以免溢出页面
    checkMapSize() {
      if (this.mapSize[1] >= 45) {
        this.scale = 16;
      } else {
        this.scale = 20;
      }
      this.renderMap();
    },
    startGame() {
      this.checkMapSize();
      this.isGamming = true;
      this.score = 0;
      this.direction = 39;
      this.snake.currentDirection = 39; // 防止死亡时direction为左情况重开游戏初始化方向被snake.checkDirection()过滤

      this.snake.createSnake();
      this.food.createFood();
      this.time = 0;
      const _this = this;
      this.timeInterval = setInterval(() => {
        _this.time++;
      }, 1000);
    },
    resetGame() {
      this.checkMapSize();
      this.isGamming = false;
      this.maskWord = "CLICK or press ENTER to start!";
      this.food.resetMapPlace();
      this.food.removeFood();
      this.snake.deleteSnake();
      clearInterval(this.timeInterval);
      this.time = 0;
      this.score = 0;
      document.getElementById("restart-btn").blur(); // 点击按钮后按钮获得焦点，此时按回车会误触发reset
    },
    checkSnakeStatus(snakeBody) {
      this.checkSnakeAlive(snakeBody);
      this.checkFood(snakeBody);
    },
    checkSnakeAlive(snakeBody) {
      var x = snakeBody[0].x;
      var y = snakeBody[0].y;
      if (
        x > this.mapSize[0] - 1 ||
        x < 0 ||
        y > this.mapSize[1] - 1 ||
        y < 0
      ) {
        this.snake.alive = false;
        this.alertWord("Don't crash the wall!");
        // this.dead();
      }
    },
    checkFood(snakeBody) {
      var sx = snakeBody[0].x;
      var sy = snakeBody[0].y;
      var fx = this.food.position[0];
      var fy = this.food.position[1];
      if (sx === fx && sy === fy) {
        this.snake.grow();
        this.food.createFood();
        this.score++;
      }
    },
    checkFoodOnSnake(food) {
      const fx = food[0];
      const fy = food[1];
      const snakeBody = this.snake.body;
      const snakeLength = snakeBody.length;
      for (let i = 0; i <= snakeLength - 1; i++) {
        if (fx === snakeBody[i].x && fy === snakeBody[i].y) {
          this.food.onSnake = true;
          return;
        }
      }
    },
    snakeCrashBody() {
      this.alertWord("Don’t crash yourself!");
    },
    alertWord(info) {
      clearInterval(this.timeInterval);
      this.isGamming = false;
      this.maskWord =
        "You Dead! " + info + "<br>CLICK or press ENTER to restart!";
    },
    test() {
      const that = this;
      setInterval(() => {
        that.food.createFood();
      }, 100);
    },
  },
};
</script>

<style lang="less" >
.page-wrapper {
  position: relative;
  width: 100%;
}
.game-wrapper {
  position: absolute;
  margin: auto;
  // width: 630px;
  // height: 510px;
  top: -24px;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  box-sizing: content-box;
  font-size: 0; // 解决子元素空隙
  .game-zone {
    position: relative;
    float: left;
    width: 500px;
    height: 500px;
    border: 5px solid black;
    background-color: #555;
    font-size: 24px;
    .mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      text-align: center;
      color: #ccd;

      font-weight: 900;
      background-color: rgba(10, 10, 100, 0.6);
      box-sizing: border-box;
      cursor: default;
      .mask-word {
        position: relative;
        top: 50%;
        transform: translateY(-50%);
        line-height: 26px;
        font-size: 26px;
      }
    }
  }
  .info-zone {
    position: relative;
    float: right;
    width: 120px;
    height: 100%;
    font-size: 22px;
    font-weight: 800;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    .speed-info {
      font-size: 16px;
      font-weight: 600;
    }
    button {
      width: 100px;
      height: 24px;
    }
  }
}
</style>

<template>
  <div id="wrapper">
    <div id="food" ref="food"></div>
    <div id="effect" ref="effect"></div>
  </div>
</template>

<script>
export default {
  name: "food",
  props: ["mapSize", "scale"],
  data() {
    return {
      mapPlace: [],
      renderPlace: [],
      position: [],
      onSnake: false,
      i: 0,
    };
  },
  mounted() {
    this.resetMapPlace();
  },
  methods: {
    resetMapPlace: function () {
      this.mapPlace = [];
      this.renderPlace = [];
      const placeLength = this.mapSize[0] * this.mapSize[1];
      for (let i = 0; i < placeLength; i++) {
        this.mapPlace.push(i);
      }
    },
    showEffect(type) {
      const effectWrapper = this.$refs.effect;
      const source = this.$refs.food.lastChild.cloneNode();
      source.className = type + '-effect';
      effectWrapper.appendChild(source);
      setTimeout(() => {
        effectWrapper.removeChild(effectWrapper.lastChild);
      }, 550);
    },
    createFood: function () {

      if (this.renderPlace.length > 0) {
        this.showEffect('remove');
      }
      this.renderPlace = this.mapPlace;
      do {
        this.onSnake = false;
        this.generatePosition();
        this.$emit("checkFoodOnSnake", this.position);
      } while (this.onSnake);

      this.renderFood();
    },
    generatePosition: function () {
      const randomIndex = Math.floor(Math.random() * this.renderPlace.length);
      const randomPlace = this.renderPlace[randomIndex];
      let x, y;
      const originPlace = Math.floor(randomPlace / this.mapSize[0]);
      if (originPlace > 0) {
        x = randomPlace % this.mapSize[0];
        y = originPlace;
      } else {
        x = randomPlace;
        y = 0;
      }
      this.position = [x, y];
      this.renderPlace.splice(randomIndex, 1);
    },
    renderFood: function () {
      this.removeFood();
      const foodWrapper = this.$refs.food;
      const food = document.createElement("div");
      const foodStyle = food.style;
      foodStyle.position = "absolute";
      foodStyle.width = this.scale + "px";
      foodStyle.height = this.scale + "px";
      foodStyle.left = this.position[0] * this.scale + "px";
      foodStyle.top = this.position[1] * this.scale + "px";
      foodStyle.backgroundColor = "gold";
      foodStyle.borderRadius = "2px";
      foodWrapper.appendChild(food);
      this.showEffect('create');
    },
    removeFood: function () {
      const foodWrapper = this.$refs.food;
      while (foodWrapper.hasChildNodes()) {
        foodWrapper.removeChild(foodWrapper.lastChild);
      }
    },
  },
};
</script>

<style lang="less">

.remove-effect {
  animation: remove-animation .6s ease 0s;
}
@keyframes remove-animation {
  0% {
    transform: scale(1);
  }
  100% {
    background-color: green;
    transform: scale(.2);
    opacity: 0;
  }
}

.create-effect {
  animation: create-animation .6s ease 0s;
}
@keyframes create-animation {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(2.3);
    opacity: 0;
  }
}
</style>

<template>
  <div>
    shopping
    <div style="color: red">inner</div>
    <div @click="add()">button</div>
  </div>
</template>

<script>
export default {
  name: 'shopping',
  data() {
    return {
      red: 'red blue',
    }
  },
  computed: {
  },
  methods: {
    add() {
      let ar = [];
      for(var i=0; i < 5; i++) {
        console.log(i);
        ar.push(i);
      }
      console.log(ar);
    },
  }
}
</script>

<style>
.red {
  color: red;
}
.blue {
  background-color: blue;
}
</style>

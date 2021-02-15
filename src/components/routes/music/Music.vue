<template>
  <div>
    music
    <button @click="goToPage('musiclist')">list</button>
    <button @click="goToPage('song')">song</button>
    <router-view/>
  </div>

</template>

<script>
export default {
  name: "music",
  data() {
    return {
      activeIndex: "",
    };
  },
  methods: {
    goToPage(key) {
      this.$router.push('/home/music/' + key);
    }
  }
};
</script>

<style>
</style>

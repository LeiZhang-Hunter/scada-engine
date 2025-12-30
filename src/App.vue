<template>
	<div class="app">
		<ScadaCanvas />
	</div>
</template>

<script setup lang="ts">
import ScadaCanvas from './components/ScadaCanvas.vue'
</script>

<style scoped>
.app {
	width: 100%;
	height: 100%;
	overflow: hidden;
	margin: 0;
	padding: 0;
}
</style>

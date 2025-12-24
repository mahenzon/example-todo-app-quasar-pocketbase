<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title> Todo App </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="flex flex-center">
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
defineOptions({
  name: 'AuthLayout',
})
</script>

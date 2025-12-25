<template>
  <q-dialog v-model="isOpen">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">{{ t('lists.newList') }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input
          dense
          v-model="title"
          autofocus
          :label="t('lists.listTitle')"
          autocomplete="off"
          @keyup.enter="handleCreate"
        />
        <q-checkbox v-model="isPublic" :label="t('lists.makePublic')" />
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat :label="t('actions.cancel')" v-close-popup />
        <q-btn flat :label="t('actions.create')" @click="handleCreate" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const isOpen = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  create: [data: { title: string; isPublic: boolean }]
}>()

const title = ref('')
const isPublic = ref(false)

// Reset form when dialog closes
watch(isOpen, (newValue) => {
  if (!newValue) {
    title.value = ''
    isPublic.value = false
  }
})

const handleCreate = () => {
  if (!title.value) return
  emit('create', { title: title.value, isPublic: isPublic.value })
}

defineOptions({
  name: 'AddListDialog',
})
</script>

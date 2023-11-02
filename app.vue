<template>
  <main class="container">
    <!-- Malleable-->
    <MalleableComponent />
    <!-- Form to change the app state-->
    <form @submit.prevent="requestChanges">
      <input v-model="prompt" type="text" placeholder="Make everything better.">
      <button :aria-busy="status === 'pending'" type="submit">Request changes</button>
    </form>
  </main>
</template>

<script lang="ts" setup>
import '@picocss/pico'

const malleables = reactive<Record<string, string>>({
  query: `
{
  products(first: 5, channel: "default-channel") {
    edges {
      node {
        id
        name
        media (sortBy: { field: ID, direction: ASC }) {
          url
        }
        metadata {
          key
          value
        }
        rating
        pricing {
          priceRange {
            start {
              gross {
                currency
                amount
              }
            }
            stop {
              gross {
                currency
                amount
              }
            }
          }
        }
      }
    }
  }
}
  `,
  template: `
  <div class="container">
    <ul>
      <li v-for="edge in data.data.products.edges" :key="edge.node.id">
        {{ edge.node.name }}
      </li>
    </ul>
  </div>
  `
})

const MalleableComponent = defineComponent({
  async setup () {
    const { data } = await useFetch('https://demo.saleor.io/graphql/', {
      method: 'POST',
      body: {
        query: toRef(malleables, 'query')
      }
    })
    return () => h({
      data: () => ({ data }),
      template: malleables.template
    })
  }
})

const prompt = ref('')
const status = ref<'idle' | 'pending'>('idle')
async function requestChanges() {
  status.value = 'pending'
  const data = await $fetch('/api/completion', {
    method: 'POST',
    body: {
      malleables: malleables,
      prompt: prompt.value
    }
  })
  for (const key in data.malleables) {
    malleables[key] = data.malleables[key]
  }
  status.value = 'idle'
  prompt.value = ''
}
</script>

<style>

</style>
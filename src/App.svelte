<script>
  import ScreenshotEditor from './lib/ScreenshotEditor.svelte'
  import Header from './lib/Header.svelte'
</script>

<main>
  <Header />
  <ScreenshotEditor />
</main>

<style>
  main {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
  }
</style>

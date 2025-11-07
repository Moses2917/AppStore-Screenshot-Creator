<script>
  import { theme } from './lib/stores'
  import ScreenshotEditor from './lib/ScreenshotEditor.svelte'
  import Header from './lib/Header.svelte'
  import ThemeToggle from './lib/ThemeToggle.svelte'
  import Tutorial from './lib/Tutorial.svelte'
</script>

<div class="app" class:light={$theme === 'light'}>
  <ThemeToggle />
  <Tutorial />

  <main>
    <Header />
    <ScreenshotEditor />
  </main>
</div>

<style>
  .app {
    min-height: 100vh;
    transition: background-color 0.3s, color 0.3s;
  }

  main {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
  }
</style>

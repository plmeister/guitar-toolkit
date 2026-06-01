<script>
  import "../app.css";
  import { resolve } from "$app/paths";
</script>

<nav>
  <a href={resolve("/")}>Home</a>
</nav>

<main class="app">
  <slot />
</main>

<style>
  .app {
    min-height: 100vh;
    background: var(--bg);
  }
  nav {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    border-bottom: 1px solid #333;
  }

  main {
    padding: 1rem;
  }
</style>

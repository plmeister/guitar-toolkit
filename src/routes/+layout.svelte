<script>
  import { resolve } from "$app/paths";
</script>

<nav>
  <a href={resolve("/")}>Home</a>
</nav>

<main>
  <slot />
</main>

<style>
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

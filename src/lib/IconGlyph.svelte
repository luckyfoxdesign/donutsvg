<script>
  export let name;
  export let size = 20;

  const paths = {
    add: "M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z",
    copy: "M16 1H4c-1.1 0-2 .9-2 2v12h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z",
    delete: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5-1-1h-5l-1 1H5v2h14V4z",
    save: "M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zM12 19c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zM6 8V5h9v3H6z",
  };

  $: path = paths[name] || paths.add;
</script>

<svg
  class="icon-glyph"
  aria-hidden="true"
  focusable="false"
  width={size}
  height={size}
  viewBox="0 0 24 24"
>
  <path d={path} />
</svg>

<style>
  .icon-glyph {
    display: inline-block;
    flex: 0 0 auto;
    fill: currentColor;
    vertical-align: middle;
  }
</style>

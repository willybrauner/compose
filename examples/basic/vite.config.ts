import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true
  },
  plugins: [
    {
      name: "rewrite-middleware",
      configureServer(serve) {
        serve.middlewares.use((req, res, next) => {
          for (let p of ["about", "contact"]) {
            if (req.url.startsWith(`/${p}`)) req.url = `/${p}.html`
          }
          next()
        })
      },
    },
  ],
});

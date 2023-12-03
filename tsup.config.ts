import { defineConfig } from "tsup"
import { spawn } from "child_process"

export default defineConfig({
  entry: { compose: "src/index.ts" },
  splitting: true,
  clean: true,
  dts: true,
  format: ["esm"],
  name: "compose",
  minify: true,
  async onSuccess() {
    const process = spawn("npx", ["size-limit"], { shell: true })
    process.stdout.on("data", (data) => console.log(data.toString()))
  },
})

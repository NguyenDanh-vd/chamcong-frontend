import { register } from "ts-node";
import { pathToFileURL } from "url";

register({
  transpileOnly: true,
  compilerOptions: {
    module: "ESNext",
    moduleResolution: "Node",
  },
});

// Import next.config.ts
const config = await import(pathToFileURL("./next.config.ts").href);

export default config.default;

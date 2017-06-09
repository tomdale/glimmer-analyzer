import { ResolverConfiguration } from "@glimmer/resolver";

let config: ResolverConfiguration = {
  "types": {
    "application": { "definitiveCollection": "main" },
    "component": { "definitiveCollection": "components" },
    "renderer": { "definitiveCollection": "main" },
    "service": { "definitiveCollection": "services" },
    "template": { "definitiveCollection": "components" },
    "util": { "definitiveCollection": "utils" }
  },
  "collections": {
    "main": {
      "types": ["application", "renderer"]
    },
    "components": {
      "group": "ui",
      "types": ["component", "template"],
      "defaultType": "component",
      "privateCollections": ["utils"]
    },
    "utils": {
      "unresolvable": true
    }
  }
};

export default config;
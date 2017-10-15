import { ResolverConfiguration } from '@glimmer/resolver';
import DEFAULT_MODULE_CONFIGURATION from '@glimmer/application-pipeline/dist/lib/broccoli/default-module-configuration';
import { Config } from './load-config-factory';

export default function buildResolverConfig(config: Config, pkgName: string): ResolverConfiguration {
  let moduleConfig = config.moduleConfiguration || DEFAULT_MODULE_CONFIGURATION;

  let rootName = config.modulePrefix || pkgName;
  let name = pkgName || rootName;

  return {
    app: { name, rootName },
    types: moduleConfig.types,
    collections: moduleConfig.collections
  };
}
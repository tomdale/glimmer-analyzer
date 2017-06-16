import Resolver from '@glimmer/resolver';
import Project, { ResolutionMap } from './project';
import {
  discoverTemplateDependencies,
  discoverRecursiveTemplateDependencies,
  TemplateDependencies as InternalTemplateDependencies
} from './handlebars-analyzer';
import { pathFromSpecifier } from './utils';

class Analyzer {
  project: Project;

  constructor(projectDir: string) {
    this.project = new Project(projectDir);
  }

  dependenciesForTemplate(componentName: string) {
    let dependencies = discoverTemplateDependencies(componentName, this.project);
    return transformSetsToArrays(dependencies);
  }

  recursiveDependenciesForTemplate(componentName: string) {
    let dependencies = discoverRecursiveTemplateDependencies(componentName, this.project);
    return transformSetsToArrays(dependencies);
  }

  resolutionMapForEntryPoint(templateName: string, map?: ResolutionMap) {
    let dependencies = discoverRecursiveTemplateDependencies(templateName, this.project);
    let components = new Set([dependencies.path, ...dependencies.components]);
    let helpers = dependencies.helpers;

    return filterResolutionMap(map || this.project.map, specifier => {
      let [type, path] = specifier.split(':');

      switch (type) {
        case 'component':
        case 'template':
          return components.has(path);
        case 'helper':
          return helpers.has(path);
      }

      return false;
    });
  }
}

export interface TemplateDependencies {
  path: string;
  hasComponentHelper: boolean;
  components: string[];
  helpers: string[];
}

function filterResolutionMap(map: ResolutionMap, filter: (specifier: string) => boolean): ResolutionMap {
  let filteredMap: ResolutionMap = {};

  for (let specifier of Object.keys(map)) {
    if (filter(specifier)) {
      filteredMap[specifier] = map[specifier];
    }
  }

  return filteredMap;
}

function transformSetsToArrays(dependencies: InternalTemplateDependencies): TemplateDependencies {
  let { path, hasComponentHelper, components, helpers } = dependencies;

  return {
    path,
    hasComponentHelper,
    components: Array.from(components),
    helpers: Array.from(helpers)
  }
}

export default Analyzer;

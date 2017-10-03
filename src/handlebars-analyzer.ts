import Resolver from '@glimmer/resolver';
import { AST, preprocess, traverse } from '@glimmer/syntax';
import Project, { Template} from "./project";
import { pathFromSpecifier } from "./utils";

export interface TemplateDependencies {
  path: string;
  hasComponentHelper: boolean;
  components: Set<string>;
  helpers: Set<string>;
}

export function discoverTemplateDependencies(templateName: string, project: Project): TemplateDependencies {
  let resolver = project.resolver;
  let template = project.templateFor(templateName);

  let ast = preprocess(template.string);
  let components = new Set<string>();
  let helpers = new Set<string>();
  let hasComponentHelper = false;

  traverse(ast, {
    MustacheCommentStatement(node) {
      if (isImportComment(node)) {
        extractComponentsFromComment(node.value)
          .map(c => resolver.identify(`template:${c}`, template.specifier))
          .filter(Boolean)
          .map(specifier => pathFromSpecifier(specifier))
          .forEach(path => components.add(path));
      }
    },

    MustacheStatement(node) {
      if (isComponentHelper(node)) {
        hasComponentHelper = true;
      } else {
        let specifier = resolver.identify(specifierForHelper(node), template.specifier);

        if (specifier) {
          helpers.add(pathFromSpecifier(specifier));
        }
      }
    },

    SubExpression(node) {
      if (isComponentHelper(node)) {
        hasComponentHelper = true;
      } else {
        let specifier = resolver.identify(specifierForHelper(node), template.specifier);

        if (specifier) {
          helpers.add(pathFromSpecifier(specifier));
        }
      }
    },

    ElementNode(node) {
      let { tag } = node;
      let specifier = resolver.identify(`template:${tag}`, template.specifier);

      if (specifier) {
        components.add(pathFromSpecifier(specifier));
      }
    }
  });

  let path = pathFromSpecifier(template.specifier);

  return {
    path,
    hasComponentHelper,
    components,
    helpers
  };
}

function specifierForHelper({ path }: AST.MustacheStatement | AST.SubExpression) {
  return `helper:${path.original}`;
}

function isComponentHelper({ path }: AST.MustacheStatement | AST.SubExpression) {
  return path.type === 'PathExpression'
    && path.parts.length === 1
    && path.parts[0] === 'component';
}

function extractComponentsFromComment(comment: string) {
  return comment.trim().substr(7).split(' ');
}

function isImportComment({ value }: AST.MustacheCommentStatement) {
  return value.trim().substr(0, 7) === 'import ';
}

export function discoverRecursiveTemplateDependencies(templateName: string, project: Project): TemplateDependencies {
  let resolver = project.resolver;
  let entryPoint = project.templateFor(templateName);
  let entryPointPath = pathFromSpecifier(entryPoint.specifier);

  let components = new Set([entryPointPath]);
  let helpers = new Set<string>();
  let queue = [entryPointPath];
  let hasComponentHelper = false;

  let current;
  while (current = queue.pop()) {
    let dependencies = discoverTemplateDependencies(current, project);
    hasComponentHelper = hasComponentHelper || dependencies.hasComponentHelper;

    for (let component of dependencies.components) {
      if (!components.has(component)) {
        components.add(component);
        queue.push(component);
      }
    }

    for (let helper of dependencies.helpers) {
      helpers.add(helper);
    }
  }

  components.delete(entryPointPath);

  return {
    path: entryPointPath,
    hasComponentHelper,
    components,
    helpers
  };
}

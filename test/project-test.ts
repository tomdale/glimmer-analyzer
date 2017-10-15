import path = require('path');
import { expect } from 'chai';
import Project from '../src/project';

function fixture(fixturePath: string) {
  return path.join(__dirname, 'fixtures', fixturePath);
}

describe('Project', function() {

  describe('with default configuration', function() {
    let project: Project;

    before(function() {
      project = new Project(fixture('basic-app'));
    });

    it('discovers the package.json', function() {
      expect(project.pkg).to.deep.equal({
        name: 'basic-app',
        version: '1.0.0'
      });
    });

    it('builds a resolution map for the project', function() {
      expect(project.map).to.deep.equal({
        "component:/basic-app/components/my-app": "src/ui/components/my-app/component.ts",
        "component:/basic-app/components/my-app/page-banner": "src/ui/components/my-app/page-banner/component.ts",
        "component:/basic-app/components/my-app/page-banner/titleize": "src/ui/components/my-app/page-banner/titleize.ts",
        "component:/basic-app/components/text-editor": "src/ui/components/text-editor.ts",
        "helper:/basic-app/components/eq": "src/ui/components/eq/helper.ts",
        "helper:/basic-app/components/if": "src/ui/components/if/helper.ts",
        "helper:/basic-app/components/moment": "src/ui/components/moment/helper.ts",
        "template:/basic-app/components/ferret-launcher": "src/ui/components/ferret-launcher/template.hbs",
        "template:/basic-app/components/my-app": "src/ui/components/my-app/template.hbs",
        "template:/basic-app/components/my-app/page-banner": "src/ui/components/my-app/page-banner/template.hbs",
        "template:/basic-app/components/my-app/page-banner/user-avatar": "src/ui/components/my-app/page-banner/user-avatar/template.hbs",
        "template:/basic-app/components/text-editor": "src/ui/components/text-editor.hbs",
        "template:/basic-app/components/with-component-helper": "src/ui/components/with-component-helper/template.hbs"
      });
    });

    it('returns a specifier for a relative path', () => {
      let specifier = project.specifierForPath('src/ui/components/my-app/page-banner/user-avatar/template.hbs');
      expect(specifier).to.equal('template:/basic-app/components/my-app/page-banner/user-avatar');
    });

    it('returns a relative path for a specifier', () => {
      let path = project.pathForSpecifier('template:/basic-app/components/my-app');
      expect(path).to.equal('src/ui/components/my-app/template.hbs');
    });
  });

  describe('with custom config', function() {
    let project: Project;

    before(() => {
      project = new Project(fixture('app-with-config'));
    });

    it('discovers and uses environment-specific configuration', () => {
      expect(project.environment).to.equal('development', 'environment should be development by default');
      expect(project.config).to.deep.equal({
        environment: 'development',
        modulePrefix: 'APP_WITH_CONFIG'
      });

      project = new Project(fixture('app-with-config'), {
        environment: 'production'
      });

      expect(project.environment).to.equal('production');
      expect(project.config).to.deep.equal({
        environment: 'production',
        modulePrefix: 'APP_WITH_CONFIG'
      });
    });

    it('builds a resolution map for the project using a custom module prefix', function() {
      expect(project.map).to.deep.equal({
        "template:/APP_WITH_CONFIG/components/text-editor": "src/ui/components/text-editor.hbs",
      });
    });
  });

  it('discovers environment-specific configuration at a custom path', function() {
    let project = new Project(fixture('app-with-custom-config'), {
      paths: {
        config: 'my-config'
      }
    });

    expect(project.config).to.deep.equal({
      environment: 'development',
      modulePrefix: 'APP_WITH_CUSTOM_CONFIG'
    });
  });

});
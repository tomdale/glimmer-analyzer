import Analyzer from '../src';
import path = require('path');
import { expect } from 'chai';

function fixture(fixturePath: string) {
  return path.join(__dirname, 'fixtures', fixturePath);
}

describe('Recursive template dependency analysis', function() {
  it('discovers recursive dependencies', function() {
    let analyzer = new Analyzer(fixture('basic-app'));
    let analysis = analyzer.recursiveDependenciesForTemplate('my-app');

    expect(analysis).to.deep.equal({
      path: '/basic-app/components/my-app',
      hasComponentHelper: false,
      components: [
        '/basic-app/components/my-app/page-banner',
        '/basic-app/components/text-editor',
        '/basic-app/components/my-app/page-banner/user-avatar',
        '/basic-app/components/ferret-launcher'
      ],
      helpers: [
        '/basic-app/components/if',
        '/basic-app/components/moment'
      ]
    });
  });

  it('can generate a filtered resolution map', function() {
    let analyzer = new Analyzer(fixture('basic-app'));
    let map = analyzer.resolutionMapForEntryPoint('my-app');

    expect(map).to.deep.equal({
      'component:/basic-app/components/my-app': 'ui/components/my-app/component.ts',
      'template:/basic-app/components/my-app': 'ui/components/my-app/template.hbs',
      'component:/basic-app/components/my-app/page-banner': 'ui/components/my-app/page-banner/component.ts',
      'template:/basic-app/components/my-app/page-banner': 'ui/components/my-app/page-banner/template.hbs',
      'template:/basic-app/components/ferret-launcher': 'ui/components/ferret-launcher/template.hbs',
      'template:/basic-app/components/my-app/page-banner/user-avatar': 'ui/components/my-app/page-banner/user-avatar/template.hbs',
      'template:/basic-app/components/text-editor': 'ui/components/text-editor.hbs',
      'component:/basic-app/components/text-editor': 'ui/components/text-editor.ts',
      'helper:/basic-app/components/if': 'ui/components/if/helper.ts',
      'helper:/basic-app/components/moment': 'ui/components/moment/helper.ts',
    });
  });
});

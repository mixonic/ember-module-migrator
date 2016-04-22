var assert = require('power-assert');
var assertDiff = require('assert-diff');
var fixturify = require('fixturify');
var fse = require('fs-extra');
var Migrator = require('../../lib');

describe('classic engine', function() {
  describe('fileInfoFor', function() {
    var engine;

    beforeEach(function() {
      engine = new Migrator({
        projectRoot: '.'
      });
    });

    it('returns an object', function() {
      var file = engine.fileInfoFor('app/components/foo-bar.js');

      assert(file);
    });

    describe('file info properties', function() {
      function confirm(path, expected) {
        it(path + ' has the expected properties', function() {
          var file = engine.fileInfoFor(path);

          var keys = Object.keys(expected);
          for (var i = 0; i < keys.length; i++) {
            var key = keys[i];

            assert(file[key] === expected[key]);
          }
        });
      }

      confirm('app/components/foo-bar.js', {type: 'component', name: 'foo-bar', collection: 'globals', collectionGroup: 'ui'});
      confirm('app/components/foo-bar/component.js', {type: 'component', name: 'foo-bar', collection: 'globals', collectionGroup: 'ui' });
      confirm('app/templates/components/foo-bar.hbs', {type: 'template', name: 'foo-bar', collection: 'globals', collectionGroup: 'ui'});
      confirm('app/components/foo-bar/template.hbs', {type: 'template', name: 'foo-bar', collection: 'globals', collectionGroup: 'ui'});
      confirm('app/routes/foo-bar.js', {type: 'route', name: 'foo-bar', collection: 'routes', collectionGroup: 'ui'});
      confirm('app/routes/foo-bar/baz/index.js', {type: 'route', name: 'foo-bar/baz/index', collection: 'routes', collectionGroup: 'ui'});
      confirm('app/templates/foo-bar.hbs', {type: 'template', name: 'foo-bar', collection: 'routes', collectionGroup: 'ui'});
      confirm('app/templates/foo-bar/baz/index.hbs', {type: 'template', name: 'foo-bar/baz/index', collection: 'routes', collectionGroup: 'ui'});
      confirm('app/adapters/application.js', {type: 'adapter', name: 'application', collection: 'models', collectionGroup: 'data' });
      confirm('app/app.js', {type: 'main', name: 'main', collection: 'main', collectionGroup: ''});
      confirm('app/index.md', { name: 'index', collection: 'main', collectionGroup: 'init' });
      confirm('app/styles/app.css', { type: 'style', name: 'app', collection: 'styles', collectionGroup: 'ui' });
      confirm('app/styles/components/badges.css', { type: 'style', name: 'components/badges', collection: 'styles', collectionGroup: 'ui' });
      confirm('app/mixins/foo/bar.js', { type: 'util', name: 'foo/bar', collection: 'utils' });

    });

    describe('file info destinations', function() {
      var mappings = {
        'app/components/foo-bar.js': 'src/ui/globals/foo-bar/component.js',
        'app/components/qux-derp/component.js': 'src/ui/globals/qux-derp/component.js',
        'app/templates/components/foo-bar.hbs': 'src/ui/globals/foo-bar/template.hbs',
        'app/components/qux-derp/template.hbs': 'src/ui/globals/qux-derp/template.hbs',
        'app/routes/post/index.js': 'src/ui/routes/post/index/route.js',
        'app/templates/post/index.hbs': 'src/ui/routes/post/index/template.hbs',
        'app/routes/foo/bar/baz.js': 'src/ui/routes/foo/bar/baz/route.js',
        'app/templates/foo/bar/baz.hbs': 'src/ui/routes/foo/bar/baz/template.hbs',
        'app/adapters/post.js': 'src/data/models/post/adapter.js',
        'app/serializers/post.js': 'src/data/models/post/serializer.js',
        'app/controllers/foo/bar/baz.js': 'src/ui/routes/foo/bar/baz/controller.js',
        'app/templates/posts/post/index.hbs': 'src/ui/routes/posts/post/index/template.hbs',
        'app/app.js': 'src/main.js',
        'app/router.js': 'src/init/router.js',
        'app/index.html': 'src/init/index.html',
        'app/styles/app.css': 'src/ui/styles/app.css',
        'app/styles/components/badges.css': 'src/ui/styles/components/badges.css',
        'app/mirage/config.js': 'src/mirage/config.js',
        'app/mirage/factories/foo.js': 'src/mirage/factories/foo.js',
        'app/mixins/foo/bar.js': 'src/utils/mixins/foo/bar.js',
        'app/initializers/foo.js': 'src/init/initializers/foo.js',
        'app/instance-initializers/bar.js': 'src/init/instance-initializers/bar.js'
      };

      function confirm(src, expected) {
        it('should map ' + src + ' to ' + expected, function() {
          var file = engine.fileInfoFor(src);

          assert(file.destRelativePath === expected);
        });
      }

      for (var src in mappings) {
        var expected = mappings[src];
        confirm(src, expected);
      }
    });
  });

  describe('processFiles', function() {
    var tmpPath = 'tmp/process-files';

    beforeEach(function() {
      fse.mkdirsSync(tmpPath);
    });

    afterEach(function() {
      fse.removeSync(tmpPath);
    });

    it('should be able to migrate a file structure', function() {
      var input = require('../fixtures/classic-acceptance/input');
      var expected = require('../fixtures/classic-acceptance/output');

      fixturify.writeSync(tmpPath, input);

      var engine = new Migrator({
        projectRoot: tmpPath
      });

      return engine.processFiles()
        .then(function() {
          var actual = fixturify.readSync(tmpPath);

          assertDiff.deepEqual(actual, expected);
        });
    });
  });
});

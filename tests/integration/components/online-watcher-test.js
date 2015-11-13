import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('online-watcher', 'Integration | Component | online watcher', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(0);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{online-watcher}}`);

  //assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#online-watcher}}
      template block text
    {{/online-watcher}}
  `);

  //assert.equal(this.$().text().trim(), 'template block text');
});

import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('search-form', 'Integration | Component | search form', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(0);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{search-form}}`);

  //assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#search-form}}
      template block text
    {{/search-form}}
  `);

  //assert.equal(this.$().text().trim(), 'template block text');
});

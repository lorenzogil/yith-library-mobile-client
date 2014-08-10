import Ember from 'ember';

export default Ember.ArrayController.extend({
    tagsSortProperties: ['name:asc'],
    sortedTags: Ember.computed.sort('content', 'tagsSortProperties'),
    actions: {
        selectTag: function (tagName) {
            this.transitionToRoute('secrets', {queryParams: {tag: tagName}});
        },

        cancel: function () {
            this.transitionToRoute('secrets');
        }
    }
});

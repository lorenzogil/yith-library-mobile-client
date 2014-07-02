import Ember from 'ember';

export default Ember.Handlebars.makeBoundHelper(function (tagName, selectedTag) {
    return (tagName === selectedTag ? '*' : '');
});

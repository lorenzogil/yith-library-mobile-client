import Ember from 'ember';

export default Ember.Helper.helper(function (params) {
    let tagName = params[0],
        selectedTag = params[1];
    return (tagName === selectedTag ? '*' : '');
});

import Ember from 'ember';

export default Ember.Helper.extend({
    compute (params) {
	let tagName = params[0],
            selectedTag = params[1];
	return (tagName === selectedTag ? '*' : '');
    }
});

import Ember from 'ember';

export default Ember.Handlebars.makeBoundHelper(function () {
    var versionStatus = [
        '<section role="status" class="onviewport">',
//        '<p><small>v' + YithLibraryMobileClient.get('version') + '</small></p>',
        '</section>'
    ];
    return new Ember.Handlebars.SafeString(versionStatus.join(''));
});

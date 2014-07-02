export default DS.Model.extend({
    email: DS.attr('string'),
    firstName: DS.attr('string'),
    lastName: DS.attr('string'),
    screenName: DS.attr('string'),

    fullName: function () {
        var firstName = this.get('firstName'),
            lastName = this.get('lastName'),
            parts = [];

        if (firstName) {
            parts.push(firstName);
        }
        if (lastName) {
            parts.push(lastName);
        }
        return parts.join(' ');
    }.property('firstName', 'lastName'),

    displayName: function () {
        var screenName = this.get('screenName'),
            fullName = '';

        if (screenName) {
            return screenName;
        } else {
            fullName = this.get('fullName');
            if (fullName) {
                return fullName;
            } else {
                return this.get('email');
            }
        }
    }.property('screenName', 'fullName', 'email')

});

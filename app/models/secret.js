import DS from "ember-data";

export default DS.Model.extend({
    service: DS.attr('string'),
    account: DS.attr('string'),
    secret: DS.attr('string'),
    notes: DS.attr('string'),
    tags: DS.attr('string'),

    matches: function (tag, query) {
        var tagMatch = (tag === ''),
            queryMatch = (query === ''),
            tags = '';
        if (!tagMatch) {
            tags = this.get('tags');
            if (tags) {
                tagMatch = tags.indexOf(tag) !== -1;
            }
        }
        if (!queryMatch) {
            query = query.toLowerCase();
            queryMatch = (
                (this.get('service').toLowerCase().indexOf(query) !== -1) ||
                (this.get('account').toLowerCase().indexOf(query) !== -1)
            );
        }
        return tagMatch && queryMatch;
    }
});

export default DS.Model.extend({
    service: DS.attr('string'),
    account: DS.attr('string'),
    secret: DS.attr('string'),
    notes: DS.attr('string'),
    tags: DS.attr('string'),

    matches: function (tag, query) {
        var tagMatch = (tag === null),
            queryMatch = (query === ''),
            tags = '';
        if (tag !== null) {
            tags = this.get('tags');
            if (tags) {
                tagMatch = tags.indexOf(tag) !== -1;
            }
        }
        if (query !== '') {
            queryMatch = (
                (this.get('service').indexOf(query) !== -1) ||
                (this.get('account').indexOf(query) !== -1)
            );
        }
        return tagMatch && queryMatch;
    }
});

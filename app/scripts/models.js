'use strict';

App.Secret = DS.Model.extend({
    service: DS.attr('string'),
    account: DS.attr('string'),
    notes: DS.attr('notes'),
    tags: DS.attr('tags')
});


App.Secret.FIXTURES = [
    {
        id: 1,
        service: 'ebay.es',
        account: 'lorenzogilsanchez',
        notes: '',
        tags: ''
    },
    {
        id: 2,
        service: 'iberia.com',
        account: '123456789',
        notes: 'this is a custom note',
        tags: 'travel'
    },
    {
        id: 3,
        service: 'amazon.com',
        account: 'lorenzo.gil.sanchez@examle.com',
        notes: '',
        tags: ''
    },
    {
        id: 4,
        service: 'dropbox.com',
        account: 'lorenzogil@example.com',
        notes: 'this password is saved in cleartext in their server',
        tags: 'cloud'
    }
];

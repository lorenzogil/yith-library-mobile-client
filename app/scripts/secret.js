'use strict';

App.Secret = DS.Model.extend({
    service: DS.attr('string'),
    account: DS.attr('string')
});


App.Secret.FIXTURES = [
    {
        id: 1,
        service: 'amazon.com',
        account: 'lorenzo.gil.sanchez@examle.com'
    },
    {
        id: 2,
        service: 'dropbox.com',
        account: 'lorenzogil@example.com'
    },
    {
        id: 3,
        service: 'ebay.es',
        account: 'lorenzogilsanchez'
    },
    {
        id: 4,
        service: 'iberia.com',
        account: '123456789'
    }
];

'use strict';

App.Secret = DS.Model.extend({
    service: DS.attr('string'),
    account: DS.attr('string')
});


App.Secret.FIXTURES = [
    {
        id: 1,
        service: 'ebay.es',
        account: 'lorenzogilsanchez'
    },
    {
        id: 2,
        service: 'iberia.com',
        account: '123456789'
    },
    {
        id: 3,
        service: 'amazon.com',
        account: 'lorenzo.gil.sanchez@examle.com'
    },
    {
        id: 4,
        service: 'dropbox.com',
        account: 'lorenzogil@example.com'
    }
];

'use strict';

App.Secret = DS.Model.extend({
    service: DS.attr('string'),
    account: DS.attr('string'),
    secret: DS.attr('string'),
    notes: DS.attr('notes'),
    tags: DS.attr('tags')
});


App.Secret.FIXTURES = [
    // master password for this fixtures is 'secret'
    {
        id: 1,
        service: 'ebay.es',
        account: 'lorenzogilsanchez',
        secret: '{"iv":"f+Ee2fY1eJYrWP71Ed6trw==","v":1,"iter":1000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"mI+1CApbcsw=","ct":"5bfUL8dk6DYCZ/H2CGY="}',
        notes: '',
        tags: 'money'
    },
    {
        id: 2,
        service: 'iberia.com',
        account: '123456789',
        secret: '{"iv":"f+Ee2fY1eJYrWP71Ed6trw==","v":1,"iter":1000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"mI+1CApbcsw=","ct":"5bfUL8dk6DYCZ/H2CGY="}',
        notes: 'this is a custom note',
        tags: 'travel'
    },
    {
        id: 3,
        service: 'amazon.com',
        account: 'lorenzo.gil.sanchez@examle.com',
        secret: '{"iv":"f+Ee2fY1eJYrWP71Ed6trw==","v":1,"iter":1000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"mI+1CApbcsw=","ct":"5bfUL8dk6DYCZ/H2CGY="}',
        notes: '',
        tags: 'money'
    },
    {
        id: 4,
        service: 'dropbox.com',
        account: 'lorenzogil@example.com',
        secret: '{"iv":"f+Ee2fY1eJYrWP71Ed6trw==","v":1,"iter":1000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"mI+1CApbcsw=","ct":"5bfUL8dk6DYCZ/H2CGY="}',
        notes: 'this password is saved in cleartext in their server',
        tags: 'work education'
    }
];


App.Tag = DS.Model.extend({
    name: DS.attr('string'),
    count: DS.attr('number')
});


App.Tag.FIXTURES = [
    {
        id: 1,
        name: 'education',
        count: 1,
    },
    {
        id: 2,
        name: 'money',
        count: 2,
    },
    {
        id: 3,
        name: 'travel',
        count: 1,
    },
    {
        id: 4,
        name: 'work',
        count: 1,
    }
];

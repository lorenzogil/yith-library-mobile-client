import SyncManager from '../utils/syncmanager';

export default {
    name: 'syncManager',

    initialize: function (container, application) {
        application.register('syncmanager:main', SyncManager);

        application.inject('controller', 'syncManager', 'syncmanager:main');
        application.inject('syncmanager', 'store', 'store:main');
    }
};

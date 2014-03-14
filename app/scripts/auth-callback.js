'use strict';

var container = window.opener.App.__container__,
    loginController = container.lookup('controller:login'),
    oauth = loginController.get('oauth');

oauth.onRedirect(window.location.hash);
window.close();

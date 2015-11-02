import { moduleFor, test } from 'ember-qunit';

moduleFor('controller:first-time', 'Unit | Controller | first-time');

test('The initial value for step is 0', function(assert) {
    var ctrl = this.subject();
    assert.expect(11);

    assert.equal(ctrl.get('step'), 0, 'The step property should be 0 initially');
    assert.equal(ctrl.get('showInstructions'), true, 'The showInstructions property is true when step is 0');
    assert.equal(ctrl.get('isConnectingToServer'), false, 'The isConnectingToServer property is false when step is 0');
    assert.equal(ctrl.get('isServerConnected'), false, 'The isServerConnected property is false when step is 0');
    assert.equal(ctrl.get('isGettingAccountInformation'), false, 'The isGettingAccountInformation property is false when step is 0');
    assert.equal(ctrl.get('isAccountInformationRetrieved'), false, 'The isAccountInformationRetrieved property is false when step is 0');
    assert.equal(ctrl.get('accountDisabled'), 'true', 'The accountDisabled property is "true" when step is 0');
    assert.equal(ctrl.get('isGettingSecrets'), false, 'The isGettingSecrets property is false when step is 0');
    assert.equal(ctrl.get('areSecretsRetrieved'), false, 'The areSecretsRetrieved property is false when step is 0');
    assert.equal(ctrl.get('secretsDisabled'), 'true', 'The secretsDisabled property is "true" when step is 0');
    assert.equal(ctrl.get('isFinished'), false, 'The isFinished property is false when step is 0');
});

test('When step is 1 the server is being connected', function(assert) {
    var ctrl = this.subject();
    assert.expect(11);

    ctrl.incrementProperty('step');

    assert.equal(ctrl.get('step'), 1, 'The step property should be 1 after incrementing it once');
    assert.equal(ctrl.get('showInstructions'), false, 'The showInstructions property is false when step is 1');
    assert.equal(ctrl.get('isConnectingToServer'), true, 'The isConnectingToServer property is true when step is 1');
    assert.equal(ctrl.get('isServerConnected'), false, 'The isServerConnected property is false when step is 1');
    assert.equal(ctrl.get('isGettingAccountInformation'), false, 'The isGettingAccountInformation property is false when step is 1');
    assert.equal(ctrl.get('isAccountInformationRetrieved'), false, 'The isAccountInformationRetrieved property is false when step is 1');
    assert.equal(ctrl.get('accountDisabled'), 'true', 'The accountDisabled property is "true" when step is 1');
    assert.equal(ctrl.get('isGettingSecrets'), false, 'The isGettingSecrets property is false when step is 1');
    assert.equal(ctrl.get('areSecretsRetrieved'), false, 'The areSecretsRetrieved property is false when step is 1');
    assert.equal(ctrl.get('secretsDisabled'), 'true', 'The secretsDisabled property is "true" when step is 1');
    assert.equal(ctrl.get('isFinished'), false, 'The isFinished property is false when step is 1');
});

test('When step is 2 the account information is being retrieved', function(assert) {
    var ctrl = this.subject();
    assert.expect(11);

    ctrl.incrementProperty('step');
    ctrl.incrementProperty('step');

    assert.equal(ctrl.get('step'), 2, 'The step property should be 2 after incrementing it twice');
    assert.equal(ctrl.get('showInstructions'), false, 'The showInstructions property is false when step is 2');
    assert.equal(ctrl.get('isConnectingToServer'), false, 'The isConnectingToServer property is false when step is 2');
    assert.equal(ctrl.get('isServerConnected'), true, 'The isServerConnected property is true when step is 2');
    assert.equal(ctrl.get('isGettingAccountInformation'), true, 'The isGettingAccountInformation property is true when step is 2');
    assert.equal(ctrl.get('isAccountInformationRetrieved'), false, 'The isAccountInformationRetrieved property is false when step is 2');
    assert.equal(ctrl.get('accountDisabled'), 'false', 'The accountDisabled property is "false" when step is 2');
    assert.equal(ctrl.get('isGettingSecrets'), false, 'The isGettingSecrets property is false when step is 2');
    assert.equal(ctrl.get('areSecretsRetrieved'), false, 'The areSecretsRetrieved property is false when step is 2');
    assert.equal(ctrl.get('secretsDisabled'), 'true', 'The secretsDisabled property is "true" when step is 2');
    assert.equal(ctrl.get('isFinished'), false, 'The isFinished property is false when step is 2');
});

test('When step is 3 the secrets are being retrieved', function(assert) {
    var ctrl = this.subject();
    assert.expect(11);

    ctrl.incrementProperty('step');
    ctrl.incrementProperty('step');
    ctrl.incrementProperty('step');

    assert.equal(ctrl.get('step'), 3, 'The step property should be 3 after incrementing it three times');
    assert.equal(ctrl.get('showInstructions'), false, 'The showInstructions property is false when step is 3');
    assert.equal(ctrl.get('isConnectingToServer'), false, 'The isConnectingToServer property is false when step is 3');
    assert.equal(ctrl.get('isServerConnected'), true, 'The isServerConnected property is true when step is 3');
    assert.equal(ctrl.get('isGettingAccountInformation'), false, 'The isGettingAccountInformation property is false when step is 3');
    assert.equal(ctrl.get('isAccountInformationRetrieved'), true, 'The isAccountInformationRetrieved property is true when step is 3');
    assert.equal(ctrl.get('accountDisabled'), 'false', 'The accountDisabled property is "false" when step is 3');
    assert.equal(ctrl.get('isGettingSecrets'), true, 'The isGettingSecrets property is true when step is 3');
    assert.equal(ctrl.get('areSecretsRetrieved'), false, 'The areSecretsRetrieved property is false when step is 3');
    assert.equal(ctrl.get('secretsDisabled'), 'false', 'The secretsDisabled property is "false" when step is 3');
    assert.equal(ctrl.get('isFinished'), false, 'The isFinished property is false when step is 3');
});

test('When step is 4 everything is done', function(assert) {
    var ctrl = this.subject();
    assert.expect(11);

    ctrl.incrementProperty('step');
    ctrl.incrementProperty('step');
    ctrl.incrementProperty('step');
    ctrl.incrementProperty('step');

    assert.equal(ctrl.get('step'), 4, 'The step property should be 4 after incrementing it four times');
    assert.equal(ctrl.get('showInstructions'), false, 'The showInstructions property is false when step is 4');
    assert.equal(ctrl.get('isConnectingToServer'), false, 'The isConnectingToServer property is false when step is 4');
    assert.equal(ctrl.get('isServerConnected'), true, 'The isServerConnected property is true when step is 4');
    assert.equal(ctrl.get('isGettingAccountInformation'), false, 'The isGettingAccountInformation property is false when step is 4');
    assert.equal(ctrl.get('isAccountInformationRetrieved'), true, 'The isAccountInformationRetrieved property is true when step is 4');
    assert.equal(ctrl.get('accountDisabled'), 'false', 'The accountDisabled property is "false" when step is 4');
    assert.equal(ctrl.get('isGettingSecrets'), false, 'The isGettingSecrets property is false when step is 4');
    assert.equal(ctrl.get('areSecretsRetrieved'), true, 'The areSecretsRetrieved property is true when step is 4');
    assert.equal(ctrl.get('secretsDisabled'), 'false', 'The secretsDisabled property is "false" when step is 4');
    assert.equal(ctrl.get('isFinished'), true, 'The isFinished property is true when step is 4');
});

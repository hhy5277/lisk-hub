import thunk from 'redux-thunk';
import { step } from 'mocha-steps';
import { expect } from 'chai';
import { mount } from 'enzyme';
import { stub, match, spy } from 'sinon';

import * as peers from '../../src/utils/api/peers';
import * as accountAPI from '../../src/utils/api/account';
import * as delegateAPI from '../../src/utils/api/delegate';
import * as liskServiceApi from '../../src/utils/api/liskService';
import { prepareStore, renderWithRouter } from '../utils/applicationInit';
import accountReducer from '../../src/store/reducers/account';
import transactionReducer from '../../src/store/reducers/transaction';
import transactionsReducer from '../../src/store/reducers/transactions';
import peersReducer from '../../src/store/reducers/peers';
import loadingReducer from '../../src/store/reducers/loading';
import searchReducer from '../../src/store/reducers/search';
import loginMiddleware from '../../src/store/middlewares/login';
import accountMiddleware from '../../src/store/middlewares/account';
import peerMiddleware from '../../src/store/middlewares/peers';
import { accountLoggedIn } from '../../src/actions/account';
import { accountsRetrieved } from '../../src/actions/savedAccounts';
import { activePeerSet } from '../../src/actions/peers';
import networks from './../../src/constants/networks';
import txTypes from './../../src/constants/transactionTypes';
import getNetwork from './../../src/utils/getNetwork';
import Wallet from '../../src/components/transactionDashboard';
import accounts from '../constants/accounts';
import GenericStepDefinition from '../utils/genericStepDefinition';
import txFilters from './../../src/constants/transactionFilters';
import routes from './../../src/constants/routes';

let walletTransactionsProps;

class Helper extends GenericStepDefinition {
  checkSelectedFilter(filter) {
    const expectedClass = '_active';

    const activeFilter = this.wrapper.find('.transaction-filter-item').filterWhere((item) => {
      const className = item.prop('className');
      return className.includes(expectedClass);
    });

    expect(activeFilter.text().toLowerCase()).to.equal(filter);
  }

  checkConfirmRequest(account) {
    const address = accounts[account].address;
    this.haveLengthOf('.confirm-request-step', 1);
    this.haveTextOf('.copy-title', `lisk://wallet?recipient=${address}&amount=1`);
    expect(this.wrapper.find('QRCode')
      .filterWhere(item => item.prop('value') === `lisk://wallet?recipient=${address}&amount=1`))
      .to.have.lengthOf(1);
  }

  clickOnTransaction() {
    this.wrapper.find('.transactions-row').first().simulate('click');
    expect(walletTransactionsProps.history.push).to.have.been.calledWith(`${routes.wallet.path}?id=123456`);
  }
}

describe('@integration: Wallet', () => {
  let store;
  let wrapper;
  let requestToActivePeerStub;
  let accountAPIStub;
  let delegateAPIStub;
  let localStorageStub;
  let getTransactionsStub;
  let liskServiceStub;
  let helper;

  const successMessage = 'Transaction is being processed and will be confirmed. It may take up to 15 minutes to be secured in the blockchain.';
  const errorMessage = 'An error occurred while creating the transaction.';

  const generateTransactions = (n) => {
    const transactionExample = { senderId: 'sample_address', receiverId: 'some_address', type: txTypes.send, id: '123456' };
    const transactions = new Array(n);
    transactions.fill(transactionExample);
    return transactions;
  };

  const setupStep = (accountType, options = { isLocked: false, withPublicKey: true }) => {
    store = prepareStore({
      account: accountReducer,
      transaction: transactionReducer,
      transactions: transactionsReducer,
      peers: peersReducer,
      loading: loadingReducer,
      search: searchReducer,
    }, [
      thunk,
      accountMiddleware,
      loginMiddleware,
      peerMiddleware,
    ]);

    const passphrase = options.isLocked ? undefined : accounts[accountType].passphrase;
    const account = {
      ...accounts[accountType],
      delegate: {},
      multisignatures: [],
      u_multisignatures: [],
      unconfirmedBalance: '0',
      passphrase,
    };

    if (!options.withPublicKey) {
      delete account.serverPublicKey;
    }

    accountAPIStub.withArgs(match.any).returnsPromise().resolves({ ...account });
    store.dispatch(activePeerSet({ network: getNetwork(networks.mainnet.code) }));
    accountAPIStub.withArgs(match.any).returnsPromise()
      .resolves({
        ...account,
      });
    delegateAPIStub.withArgs(match.any).returnsPromise()
      .resolves({ delegate: { ...accounts['delegate candidate'] } });

    const targetSavedAccountsInLocalStorage = [{
      publicKey: accounts['without initialization'].publicKey,
      network: 1,
      balance: 0,
    }];

    localStorageStub.withArgs('accounts').returns(JSON.stringify(targetSavedAccountsInLocalStorage));

    store.dispatch(accountsRetrieved());
    store.dispatch(accountLoggedIn(account));

    const history = {
      location: {
        search: '',
        pathname: '',
      },
      push: spy(),
    };

    wrapper = mount(renderWithRouter(Wallet, store, { history }));

    walletTransactionsProps = wrapper.find('WalletTransactions').props();
    walletTransactionsProps.history.push = spy();

    helper = new Helper(wrapper, store);
  };

  beforeEach(() => {
    accountAPIStub = stub(accountAPI, 'getAccount');
    delegateAPIStub = stub(delegateAPI, 'getDelegate');
    localStorageStub = stub(localStorage, 'getItem');
    liskServiceStub = stub(liskServiceApi, 'getPriceTicker');
    liskServiceStub.withArgs(match.any).returnsPromise().resolves({ tickers: {} });
  });

  afterEach(() => {
    accountAPIStub.restore();
    delegateAPIStub.restore();
    localStorageStub.restore();
    liskServiceStub.restore();
  });

  describe('Send', () => {
    beforeEach(() => {
      requestToActivePeerStub = stub(peers, 'requestToActivePeer');

      requestToActivePeerStub.withArgs(match.any, 'transactions', match({
        recipientId: '537318935439898807L',
        amount: 1e8,
        secret: match.any,
        secondSecret: match.any,
      }))
        .returnsPromise().resolves({ transactionId: 'Some ID' });

      requestToActivePeerStub.withArgs(match.any, 'transactions', match({ limit: 25, senderId: match.defined, recipientId: match.defined }))
        .returnsPromise().resolves({ transactions: generateTransactions(25), count: 1000 });

      // incoming transaction result
      const transactions = generateTransactions(15);
      transactions.push({ senderId: 'sample_address', receiverId: 'some_address', type: txTypes.vote });

      requestToActivePeerStub.withArgs(match.any, 'transactions', match({ recipientId: accounts.genesis.address, senderId: undefined }))
        .returnsPromise().resolves({ transactions, count: 1000 });

      // outgoing transaction result
      requestToActivePeerStub.withArgs(match.any, 'transactions', match({ senderId: accounts.genesis.address, recipientId: undefined }))
        .returnsPromise().resolves({ transactions: generateTransactions(5), count: 1000 });
    });

    afterEach(() => {
      requestToActivePeerStub.restore();
    });

    describe('Scenario: should not allow to send when not enough funds', () => {
      step('Given I\'m on "wallet" as "empty account"', () => setupStep('empty account'));
      step('And I fill in "1" to "amount" field', () => helper.fillInputField('1', 'amount'));
      step('And I fill in "537318935439898807L" to "recipient" field', () => helper.fillInputField('537318935439898807L', 'recipient'));
      step('Then I should see "Not enough LSK" error message', () => {
        expect(wrapper.find('Input').at(1).html()).to.contain('Not enough LSK');
      });
      step('And "send next button" should be disabled', () => {
        expect(wrapper.find('.send-next-button button').filterWhere(item => item.prop('disabled') === true)).to.have.lengthOf(1);
      });
    });

    describe('Scenario: should give and error message when sending fails', () => {
      step('Given I\'m on "wallet" as "genesis" account', () => setupStep('genesis'));
      step('And I fill in "1" to "amount" field', () => helper.fillInputField('1', 'amount'));
      step('And I fill in "537318935439898807L" to "recipient" field', () => helper.fillInputField('537318935439898807L', 'recipient'));
      step('And I click "send next button"', () => helper.clickOnElement('button.send-next-button'));


      step('When I click "send button"', () => {
        requestToActivePeerStub.withArgs(match.any, 'transactions', match.any).returnsPromise().rejects({});
        helper.clickOnElement('.send-button button');
      });
      step(`Then I should see text ${errorMessage} in "result box message" element`, () => helper.haveTextOf('.result-box-message', errorMessage));
    });

    describe('Scenario: should allow to send LSK from unlocked account', () => {
      step('Given I\'m on "wallet" as "genesis" account', () => setupStep('genesis'));
      step('And I fill in "1" to "amount" field', () => { helper.fillInputField('1', 'amount'); });
      step('And I fill in "537318935439898807L" to "recipient" field', () => { helper.fillInputField('537318935439898807L', 'recipient'); });
      step('And I click "send next button"', () => { helper.clickOnElement('button.send-next-button'); });
      step('When I click "send button"', () => helper.clickOnElement('button.send-button button'));
      step(`Then I should see text ${successMessage} in "result box message" element`, () => helper.haveTextOf('.result-box-message', successMessage));
    });

    describe('Scenario: should allow to send LSK from locked account', () => {
      const { passphrase } = accounts.genesis;
      step('Given I\'m on "wallet" as "genesis" account', () => setupStep('genesis', { isLocked: true, withPublicKey: true }));
      step('And I fill in "1" to "amount" field', () => { helper.fillInputField('1', 'amount'); });
      step('And I fill in "537318935439898807L" to "recipient" field', () => { helper.fillInputField('537318935439898807L', 'recipient'); });
      step('And I click "send next button"', () => helper.clickOnElement('button.send-next-button'));
      step('And I fill in passphrase of "genesis" to "passphrase" field', () => { helper.fillInputField(passphrase, 'passphrase'); });
      step('When I click "next button"', () => helper.clickOnElement('.first-passphrase-next button'));
      step('When I click "send button"', () => helper.clickOnElement('.send-button button'));
      step(`Then I should see text ${successMessage} in "result box message" element`, () => helper.haveTextOf('.result-box-message', successMessage));
    });

    describe('Scenario: should allow to send LSK from unlocked account with 2nd passphrase', () => {
      const { secondPassphrase } = accounts['second passphrase account'];
      step('Given I\'m on "wallet" as "second passphrase account"', () => setupStep('second passphrase account'));
      step('And I fill in "1" to "amount" field', () => { helper.fillInputField('1', 'amount'); });
      step('And I fill in "537318935439898807L" to "recipient" field', () => { helper.fillInputField('537318935439898807L', 'recipient'); });
      step('And I click "send next button"', () => helper.clickOnElement('button.send-next-button'));
      step('And I fill in second passphrase of "second passphrase account" to "second passphrase" field', () => { helper.fillInputField(secondPassphrase, 'second-passphrase'); });
      step('When I click "next button"', () => helper.clickOnElement('.second-passphrase-next button'));
      step('When I click "send button"', () => helper.clickOnElement('.send-button button'));
      step(`Then I should see text ${successMessage} in "result box message" element`, () => helper.haveTextOf('.result-box-message', successMessage));
    });

    describe('Scenario: should allow to send LSK from locked account with 2nd passphrase', () => {
      const { secondPassphrase, passphrase } = accounts['second passphrase account'];
      step('Given I\'m on "wallet" as "second passphrase account"', () => setupStep('second passphrase account', { isLocked: true, withPublicKey: true }));
      step('And I fill in "1" to "amount" field', () => { helper.fillInputField('1', 'amount'); });
      step('And I fill in "537318935439898807L" to "recipient" field', () => { helper.fillInputField('537318935439898807L', 'recipient'); });
      step('And I click "send next button"', () => helper.clickOnElement('button.send-next-button'));
      step('And I fill in passphrase of "second passphrase account" to "passphrase" field', () => { helper.fillInputField(passphrase, 'passphrase'); });
      step('When I click "next button"', () => helper.clickOnElement('.first-passphrase-next button'));
      step('And I fill in second passphrase of "second passphrase account" to "second passphrase" field', () => { helper.fillInputField(secondPassphrase, 'second-passphrase'); });
      step('When I click "next button"', () => helper.clickOnElement('.second-passphrase-next button'));
      step('When I click "send button"', () => helper.clickOnElement('.send-button button'));
      step(`Then I should see text ${successMessage} in "result box message" element`, () => helper.haveTextOf('.result-box-message', successMessage));
    });

    describe('Scenario: should show account initialisation option if no public key and balance is greater than 0', () => {
      step('Given I\'m on "wallet" as "genesis" account and need initialization', () => setupStep('genesis', { isLocked: false, withPublicKey: false }));
      step('Then I should see the account init option', () => helper.haveTextOf('header h2', 'Initialize Lisk ID'));
      step('When I click "account init button"', () => helper.clickOnElement('.account-init-button button'));
      step('Then I should be on the confirm page', () => helper.haveTextOf('header h2', 'Initialize Lisk ID'));
      step('When I click "send button"', () => helper.clickOnElement('button.send-button button'));
      step(`Then I should see text ${successMessage} in "result box message" element`, () => helper.haveTextOf('.result-box-message', successMessage));
    });

    describe('Scenario: should display the request LSK component when clicking on the tab', () => {
      step('Given I\'m on "wallet" as "genesis" account', () => setupStep('genesis'));
      step('When I click "request tab"', () => { helper.clickOnElement('.request-tab'); });
      step('Then I should see the QR code', () => helper.haveLengthOf('.request-qr-code', 1));
      step('When I click "send tab"', () => { helper.clickOnElement('.send-tab'); });
      step('Then I should not see the QR code anymore', () => helper.haveLengthOf('.request-qr-code', 0));
    });

    describe('Scenario: should request specific amount', () => {
      step('Given I\'m on "wallet" as "genesis" account', () => setupStep('genesis'));
      step('When I click "request tab"', () => { helper.clickOnElement('.request-tab'); });
      step('Then I should see the QR code', () => helper.haveLengthOf('.request-qr-code', 1));
      step('When I click "specify request"', () => { helper.clickOnElement('.specify-request'); });
      step('And I fill in "1" to "amount" field', () => { helper.fillInputField('1', 'amount'); });
      step('When I click "confirm request"', () => { helper.clickOnElement('.confirm-request'); });
      step('Then I should be on the confirm page with correct links and QR code', () => helper.checkConfirmRequest('genesis'));
    });

    describe('Scenario: should not show account initialisation option if public key and balance is greater than 0', () => {
      step('Given I\'m on "wallet" as "genesis" account and already initialized ', () => setupStep('genesis'));
      step('Then I should not see the account init option', () => helper.haveTextOf('header h2', 'Transfer'));
    });

    describe('Scenario: should not show account initialisation option if no public key and balance equals 0', () => {
      step('Given I\'m on "wallet" as "genesis" account without need for initialized', () => setupStep('empty account', { isLocked: false, withPublicKey: false }));
      step('Then I should not see the account init option', () => helper.haveTextOf('header h2', 'Transfer'));
    });

    describe('Scenario: should close account initialisation option when discarded', () => {
      step('Given I\'m on "wallet" as "genesis" account and need initialization', () => setupStep('genesis', { isLocked: false, withPublicKey: false }));
      step('When I click "account init discard button"', () => helper.clickOnElement('.account-init-discard-button'));
      step('Then I should see the empty send form', () => {
        helper.haveInputValueOf('.recipient input', '');
        helper.haveInputValueOf('.amount input', '');
      });
    });
  });

  describe('Transactions', () => {
    beforeEach(() => {
      getTransactionsStub = stub(accountAPI, 'transactions');

      getTransactionsStub.withArgs({
        activePeer: match.any,
        address: accounts.genesis.address,
        limit: 25,
        offset: match.any,
        filter: txFilters.all,
      }).returnsPromise().resolves({ transactions: generateTransactions(25), count: 1000 });

      getTransactionsStub.withArgs({
        activePeer: match.any,
        address: accounts.genesis.address,
        limit: 25,
      }).returnsPromise().resolves({ transactions: generateTransactions(25), count: 1000 });


      // NOTE: transactionsFilterSet does not use offset
      getTransactionsStub.withArgs({
        activePeer: match.any,
        address: accounts.genesis.address,
        limit: 25,
        filter: txFilters.outgoing,
      }).returnsPromise().resolves({ transactions: generateTransactions(20), count: 1000 });

      getTransactionsStub.withArgs({
        activePeer: match.any,
        address: accounts.genesis.address,
        limit: 25,
        filter: txFilters.incoming,
      }).returnsPromise().resolves({ transactions: generateTransactions(5), count: 1000 });

      getTransactionsStub.withArgs({
        activePeer: match.any,
        address: accounts.genesis.address,
        limit: 25,
        filter: txFilters.all,
      }).returnsPromise().resolves({ transactions: generateTransactions(25), count: 1000 });
    });

    afterEach(() => {
      getTransactionsStub.restore();
    });

    describe('Scenario: should allow to view transactions', () => {
      step('Given I\'m on "wallet" as "genesis" account', () => setupStep('genesis'));
      step('Then I should see 50 rows', () => helper.shouldSeeCountInstancesOf(50, 'TransactionRow'));
      step('When I scroll to the bottom of "transactions box"', () => { wrapper.find('Waypoint').props().onEnter(); });
      step('Then I should see 75 rows', () => { wrapper.update(); helper.shouldSeeCountInstancesOf(75, 'TransactionRow'); });
      step('When I click on a transaction row, I should be redirected to transactoinDetails step', () => helper.clickOnTransaction());
    });

    describe.skip('Scenario: should allow to filter transactions', () => {
      step('Given I\'m on "wallet" as "genesis" account', () => setupStep('genesis'));
      step('Then the "All" filter should be selected by default', () => helper.checkSelectedFilter('all'));
      step('When I click on the "Outgoing" filter', () => helper.clickOnElement('.filter-out'));
      step('Then I expect to see the results for "Outgoing"', () => helper.shouldSeeCountInstancesOf(20, 'TransactionRow'));
      step('When I click on the "Incoming" filter', () => helper.clickOnElement('.filter-in'));
      step('Then I expect to see the results for "Incoming"', () => helper.shouldSeeCountInstancesOf(5, 'TransactionRow'));
      step('When I click again on the "All" filter', () => helper.clickOnElement('.filter-all'));
      step('Then I expect to see the results for "All"', () => helper.shouldSeeCountInstancesOf(25, 'TransactionRow'));
    });
  });
});

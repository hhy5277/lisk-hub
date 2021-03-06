module.exports = {
  modulePaths: ['src/components'],
  testMatch: [
    '<rootDir>/app/src/**/*.test.js',
    '<rootDir>/src/**/*.test.js',
    '<rootDir>/test/integration/*.test.js',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/test/integration/wallet.test.js',
    'src/components/dashboard/currencyGraph.test.js', // This should be unskipped in issue #1499
    'src/components/errorBoundary/index.test.js',
    'src/components/feedbackForm/*.test.js',
    'src/components/login/*.test.js',
    'src/components/newsFeed/index.test.js', // This component doesn't meet the setted tresholds for mocha but in jest
    'src/components/passphraseCreation/index.test.js',
    'src/components/register/register.test.js',
    'src/components/transactions/votedDelegates.test.js',
    'src/components/voteUrlProcessor/index.test.js',
    'src/store/reducers/liskService.test.js',
    'src/store/middlewares/socket.test.js',
    'src/store/middlewares/peers.test.js',
    'src/components/votingListViewV2/*',
    'src/components/votingV2/*',
    'src/components/registerV2/registerV2.test.js',
    'src/components/headerV2/headerV2.test.js',
  ],
  verbose: false,
  cache: false,
  moduleFileExtensions: ['js'],
  moduleDirectories: ['node_modules'],
  moduleNameMapper: {
    '^.+\\.css$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
  },
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage/jest',
  collectCoverageFrom: process.env.NO_COV ? [] : [
    'src/**/*.js',
    'app/src/**/*.js',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'app/src/ipc.js',
    'app/src/ledger.js',
    'src/actions/liskService.js',
    'src/actions/transactions.js',
    'src/components/account/stories.js',
    'src/components/accountInitialization/index.js',
    'src/components/backgroundMaker/index.js',
    'src/components/dashboard/currencyGraph.js', // This should be unskipped in issue #1499
    'src/components/wallet/balanceChart.js', // This should be unskipped in issue #1499
    'src/utils/balanceChart.js', // This should be unskipped in issue #1499
    'src/components/dialog/stories.js',
    'src/components/errorBoundary/index.js',
    'src/components/feedbackForm/',
    'src/components/formattedNumber/stories.js',
    'src/components/newsFeed/index.js', // This component doesn't meet the setted tresholds for mocha but in jest
    'src/components/newsFeed/news.js',
    'src/components/passphrase/create/create.js',
    'src/components/passphraseCreation/index.js',
    'src/components/passphraseSteps/index.js', // FollowUp #1515
    'src/components/receive/index.js',
    'src/components/register/register.js',
    'src/components/register/register.js',
    'src/components/request/index.js',
    'src/components/request/index.js',
    'src/components/request/specifyRequest.js',
    'src/components/resultBox/index.js',
    'src/components/searchBar/index.js', // Passing in mocha but not in Jest
    'src/components/send/steps/form/stories.js',
    'src/components/spinner/stories.js',
    'src/components/toaster/stories.js',
    'src/components/toolbox/transitionWrapper/index.js',
    'src/components/transactionDashboard/index.js',
    'src/components/transactions/transactions.js',
    'src/components/transactions/votedDelegates.js',
    'src/components/transferTabs/index.js',
    'src/components/voteUrlProcessor/index.js',
    'src/constants/',
    'src/i18n-scanner.js',
    'src/main.js',
    'src/store/middlewares/login.js',
    'src/store/reducers/liskService.js',
    'src/tests.js',
    'src/utils/api/ledger.js',
    'src/utils/api/lsk/liskService.js',
    'src/utils/api/btc/',
    'src/utils/applyDeviceClass.js',
    'src/utils/ledger.js',
    'src/utils/proxyLogin.js',
    'src/components/transactions/delegateStatistics.js',
    'src/components/followedAccounts/index.js',
    'src/components/registerDelegate/registerDelegate.js',
    'src/components/registerDelegate/steps/choose/choose.js',
    'src/components/registerDelegate/steps/confirm/index.js',
    'src/components/registerDelegate/steps/confirm/confirm.js',
    'src/components/passphrase/confirm/index.js',
    'src/components/transactions/explorerTransactions/explorerTransactions.js',
    'src/components/transactions/transactionsOverview.js',
    'src/components/voting/voting.js',
    'src/components/delegateSidebar/index.js',
    'src/components/confirmVotes/confirmVotes.js',
    'src/components/votesPreview/index.js',
    'src/components/votingListView/votingListView.js',
    'src/components/votingListView/votingHeader.js',
    'src/components/votingListView/listLabels.js',
    'src/components/votingListView/voteList.js',
    'src/components/singleTransaction/index.js',
    'src/components/passphrase/create/movableShape.js',
    'src/components/passphrase/create/shapes.js',
    'src/components/passphrase/create/index.js',
    'src/components/toolbox/dropdown/toolBoxDropdown.js',
    'src/components/extensions/extensions.js',
    'src/utils/extensions.js',
    'src/store/reducers/extensions.js',
    'src/actions/extensions.js',
    'src/utils/liskHubExtensions.js',
    'src/components/extensionPoint/extensionPoint.js',
    'src/components/hwWallet/hwWallet.js',
    'app/src/utils.js',
    'app/src/hwManager.js',
    'app/src/trezor.js',
    'src/utils/api/lsk/account.js',
    'src/utils/api/hwWallet.js',
    'src/utils/loading.js',
    'src/store/middlewares/peers.js',
    'src/store/middlewares/socket.js',
    'src/components/hwWallet/ledgerLoginHOC.js',
    'src/utils/platform.js',
    'src/components/hwWallet/ledgerLogin.js',
    'src/components/hwWallet/trezorLogin.js',
    'src/components/loginV2/loginV2.js',
    'src/utils/hwWallet.js',
    'src/components/votingListViewV2/*',
    'src/components/votingV2/*',
    'src/components/headerV2/headerV2.js',
    'src/components/registerV2/registerV2.js',
  ],
  coverageThreshold: process.env.NO_COV ? {} : {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    'app/src/**/*.js': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    'src/**/*.js': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    'src/store/**/*.js': {
      statements: 90,
    },
  },
  setupFiles: [
    '<rootDir>/config/setupJest.js',
    'jest-canvas-mock',
  ],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testURL: 'http://localhost',
  globals: {
    PRODUCTION: true,
    TEST: true,
    VERSION: '',
  },
  coverageReporters: process.env.ON_JENKINS ? [
    'text',
    'lcov',
    'cobertura',
  ] : [
    'html',
    'json',
  ],
  reporters: [
    'default',
    ['jest-junit', { suiteName: 'jest tests', outputDirectory: '<rootDir>/coverage/jest' }],
  ],
  setupTestFrameworkScriptFile: 'jest-enzyme',
  testEnvironment: 'enzyme',
};

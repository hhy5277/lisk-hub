import actionTypes from '../../constants/actions';
import txFilter from '../../constants/transactionFilters';
/**
 *
 * @param {Array} state
 * @param {Object} action
 */
const initialState = {
  pending: [],
  confirmed: [],
  count: null,
  customFilters: {
    dateFrom: '',
    dateTo: '',
    amountFrom: '',
    amountTo: '',
    message: '',
  },
};
const transactions = (state = initialState, action) => { // eslint-disable-line complexity
  switch (action.type) {
    case actionTypes.cleanTransactions:
      return initialState;
    case actionTypes.transactionAdded:
      return { ...state, pending: [action.data, ...state.pending] };
    case actionTypes.transactionFailed:
      return { ...state, failed: { errorMessage: action.data.errorMessage } };
    case actionTypes.transactionFailedClear:
      return { ...state, failed: undefined };
    case actionTypes.transactionsFailed:
      return {
        ...state, // Filter any failed transaction from pending
        pending: state.pending.filter(pendingTransaction =>
          action.data.failed.filter(transaction =>
            transaction.id === pendingTransaction.id).length === 0),
      };
    case actionTypes.transactionsLoaded:
      return {
        ...state,
        confirmed: [
          ...state.confirmed,
          ...action.data.confirmed,
        ],
        count: action.data.count,
      };
    case actionTypes.transactionsUpdated:
      return {
        ...state, // Filter any newly confirmed transaction from pending
        pending: state.pending.filter(pendingTransaction =>
          action.data.confirmed.filter(transaction =>
            transaction.id === pendingTransaction.id).length === 0),
        // Add any newly confirmed transaction to confirmed
        confirmed: [
          ...action.data.confirmed,
          ...state.confirmed.filter(confirmedTransaction =>
            action.data.confirmed.filter(transaction =>
              transaction.id === confirmedTransaction.id).length === 0),
        ],
        count: action.data.count,
      };
    case actionTypes.transactionsFiltered:
      return {
        ...state,
        confirmed: action.data.confirmed,
        count: action.data.count,
        filter: action.data.filter,
        customFilters: action.data.customFilters,
      };
    case actionTypes.transactionsLoadFinish:
      return {
        ...state,
        confirmed: action.data.confirmed,
        count: action.data.count,
        account: {
          address: action.data.address,
          balance: action.data.balance,
          delegate: action.data.delegate,
        },
        filter: txFilter.all,
      };
    case 'extensinonTest':
      return { ...state, test: new Date().toLocaleTimeString() };
    case (actionTypes.accountSwitched):
      return { pending: [], confirmed: [], count: 0 };
    default:
      return state;
  }
};

export default transactions;

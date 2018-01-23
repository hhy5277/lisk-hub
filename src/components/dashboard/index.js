import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { translate } from 'react-i18next';
import grid from 'flexboxgrid/dist/flexboxgrid.css';
import React from 'react';
import { transactionsAddressSet } from '../../actions/transactions';
import { FontIcon } from '../fontIcon';
import Box from '../box';
import TransactionList from './../transactions/transactionList';
import Send from '../send';
import CurrencyGraph from './currencyGraph';
import styles from './styles.css';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.props.transactionsAddressSet({ address: this.props.accountAddress });
  }

  render() {
    const { transactions, t } = this.props;
    return <div className={`${grid.row} ${styles.wrapper}`}>
      <div className={`${grid['col-md-8']} ${grid['col-xs-12']}`}>
        <Box className={`${styles.graph}`}>
          <CurrencyGraph />
        </Box>
        <Box className={`${styles.latestActivity}`}>
          <header>
            <h2 className={styles.title}>
              {t('Latest activity')}
              <Link to='/main/transactions' className={styles.seeAllLink}>
                {t('See all transactions')}
                <FontIcon value='arrow-right'/>
              </Link>
            </h2>
          </header>
          <TransactionList {...{ transactions, t }} loadMore={() => {}}/>
        </Box>
      </div>
      <div className={`${grid['col-md-4']} ${styles.sendWrapper}`}>
        <Send/>
      </div>
    </div>;
  }
}

const mapStateToProps = state => ({
  transactions: [...state.transactions.pending, ...state.transactions.confirmed].slice(0, 3),
  accountAddress: state.account.address,
});

const mapDispatchToProps = dispatch => ({
  transactionsAddressSet: data => dispatch(transactionsAddressSet(data)),
});


export default connect(mapStateToProps, mapDispatchToProps)(translate()(Dashboard));

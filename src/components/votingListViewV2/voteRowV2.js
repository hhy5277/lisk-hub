import React from 'react';
import grid from 'flexboxgrid/dist/flexboxgrid.css';
import styles from './votingListViewV2.css';

class VoteRowV2 extends React.Component {
  shouldComponentUpdate({ data }) {
    const oldData = this.props.data;
    return (!oldData && !!data) ||
      (!!oldData && !data) ||
      ((!!oldData && !!data) &&
      (oldData.unconfirmed !== data.unconfirmed));
  }

  render() {
    const { data, className, username } = this.props;
    const voteType = data.unconfirmed ? styles.upVoteRow : styles.downVoteRow;

    return (<ul className={`delegate-row selected-row ${styles.row} ${grid.row} ${className} ${voteType}`}>
      <li className={`${grid['col-md-1']} ${grid['col-xs-2']}`}>{data.rank}</li>
      <li className={`${grid['col-md-3']} ${grid['col-xs-5']} ${styles.username}`}>{username}</li>
      <li className={`${grid['col-md-4']}`}>{data.address}</li>
      <li className={`${grid['col-md-6']} ${grid['col-xs-3']} ${styles.productivity}`}>{data.productivity} %</li>
    </ul>
    );
  }
}

export default VoteRowV2;

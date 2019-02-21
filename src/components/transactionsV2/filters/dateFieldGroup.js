import React from 'react';
import moment from 'moment';
import { translate } from 'react-i18next';
import { InputV2 } from '../../toolbox/inputsV2';
import styles from './filters.css';

class DateFieldGroup extends React.Component {
  constructor(props) {
    super();

    this.state = {
      fields: {
        dateTo: {
          error: false,
          value: '',
        },
        dateFrom: {
          error: false,
          value: '',
        },
      },
      feedback: '',
    };

    this.dateFormat = props.t('DD.MM.YY');

    this.handleFieldChange = this.handleFieldChange.bind(this);
  }

  validateDates(fieldsObj) {
    const { t } = this.props;
    let feedback = '';
    const fields = Object.keys(fieldsObj).reduce((acc, field) => {
      const { value } = fieldsObj[field];
      const date = moment(value, this.dateFormat);
      let error = false;

      if (value !== '' && !date.isValid()) {
        feedback = t(`Date must be in ${this.dateFormat} format`);
        error = true;
      } else if (
        (field === 'dateFrom' && date > moment(fieldsObj.dateTo.value, this.dateFormat))
        || (field === 'dateTo' && date < moment(fieldsObj.dateFrom.value, this.dateFormat))
      ) {
        feedback = t('Invalid Dates');
        error = true;
      }

      return {
        ...acc,
        [field]: {
          ...fieldsObj[field],
          error,
        },
      };
    }, {});

    this.props.updateCustomFilters(fields);
    this.setState({ fields, feedback });
  }

  handleFieldChange({ target }) {
    const { fields } = this.state;
    const value = target.value.replace(/\D/g, '').split('').reduce((acc, digit, idx) => {
      const dashCounter = acc.split('.').length;
      const shouldAddSeparator = idx !== 0 && idx % 2 === 0;
      const separator = '.';
      return (shouldAddSeparator && dashCounter < 3)
        ? `${acc}${separator}${digit}`
        : `${acc}${digit}`;
    }, '').substring(0, 8);

    this.validateDates({
      ...fields,
      [target.name]: { ...[target.name], value },
    });
  }

  render() {
    const { handleKeyPress, t } = this.props;
    const { fields } = this.state;

    return (
      <div className={styles.fieldGroup}>
        <span className={styles.fieldLabel}>{t('Date')}</span>
        <div className={styles.fieldRow}>
          <InputV2
            autoComplete={'off'}
            onChange={this.handleFieldChange}
            name='dateFrom'
            value={fields.dateFrom.value}
            placeholder={this.dateFormat}
            onKeyDown={handleKeyPress}
            className={`${styles.input} ${fields.dateFrom.error ? 'error' : ''}`} />
          <span>-</span>
          <InputV2
            autoComplete={'off'}
            onChange={this.handleFieldChange}
            name='dateTo'
            value={fields.dateTo.value}
            placeholder={this.dateFormat}
            onKeyDown={handleKeyPress}
            className={`${styles.input} ${fields.dateTo.error ? 'error' : ''}`} />
        </div>
        <span className={`${styles.feedback} ${this.state.feedback ? styles.show : ''}`}>
          {this.state.feedback}
        </span>
      </div>
    );
  }
}

export default translate()(DateFieldGroup);

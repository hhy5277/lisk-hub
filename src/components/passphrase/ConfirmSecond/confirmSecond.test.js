import React from 'react';
import { expect } from 'chai';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import { spy, useFakeTimers } from 'sinon';
import configureStore from 'redux-mock-store';
import ConfirmSecond from './confirmSecond';
import i18n from '../../../i18n';
import accounts from '../../../../test/constants/accounts';


describe('SecondPassphrase: Confirmation', () => {
  const account = {
    passphrase: accounts.delegate.passphrase,
    info: {
      LSK: {},
    },
  };
  const props = {
    t: key => key,
    hidden: false,
    finalCallback: spy(),
    account,
  };
  const fakeStore = configureStore();
  const store = fakeStore({
    account,
    secondPassphraseStep: {},
  });
  let wrapper;
  let clock;

  const options = {
    context: { i18n, store },
    childContextTypes: {
      i18n: PropTypes.object.isRequired,
      store: PropTypes.object.isRequired,
    },
  };
  beforeEach(() => {
    clock = useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'Date', 'setInterval'],
    });
  });

  afterEach(() => {
    clock.restore();
  });

  it('should hide the component when hidden is equal to true', () => {
    wrapper = mount(<ConfirmSecond {...props} hidden={true} />, options);
    const className = wrapper.find('section').props().className;
    expect(className).to.include('hidden');
  });

  it('shows confirmation step when user is login', () => {
    wrapper = mount(<ConfirmSecond {...props} />, options);
    clock.tick(501);
    wrapper.update();
    const className = wrapper.find('h2').at(0).props().className;
    expect(className).to.include('slideIn');
  });

  it('should show pending mode when SliderCheckbox is checked', () => {
    wrapper = mount(<ConfirmSecond {...props} />, options);
    wrapper.find('SliderCheckbox').at(0).find('input[type="checkbox"]')
      .simulate('change', { target: { checked: true } });
    clock.tick(501);
    wrapper.update();
    const className = wrapper.find('#pendingContainer').props().className;
    expect(className).to.include('slideIn');
    expect(props.finalCallback).to.have.been.calledWith();
  });

  it('should show the final Step when secondPublicKey is set', () => {
    wrapper = mount(<ConfirmSecond {...props} />, options);
    wrapper.find('SliderCheckbox').at(0).find('input[type="checkbox"]')
      .simulate('change', { target: { checked: true } });
    clock.tick(501);
    wrapper.update();
    expect(props.finalCallback).to.have.been.calledWith();
    wrapper.setProps({
      account: {
        passphrase: accounts['second passphrase account'].passphrase,
        info: {
          LSK: {
            secondPublicKey: accounts['second passphrase account'].publicKey,
          },
        },
      },
    });
    clock.tick(501);
    wrapper.update();
    const className = wrapper.find('.doneContainer').props().className;
    expect(className).to.include('slideIn');
  });

  it('should show the fail Step when secondPassphraseStep is set to fail', () => {
    wrapper = mount(<ConfirmSecond {...props} />, options);
    wrapper.find('SliderCheckbox').at(0).find('input[type="checkbox"]')
      .simulate('change', { target: { checked: true } });
    clock.tick(501);
    wrapper.update();
    expect(props.finalCallback).to.have.been.calledWith();
    wrapper.setProps({
      step: 'second-passphrase-register-failure',
      secondPassphraseRegisteredFailureReset: spy(),
    });
    clock.tick(501);
    wrapper.update();
    expect(wrapper.find('.failContainer .resultHeader')).to.have.text('Transaction failed');
  });

  it('should be able to re-try on secondPassphraseStep fail', () => {
    wrapper = mount(<ConfirmSecond {...props} />, options);
    wrapper.find('SliderCheckbox').at(0).find('input[type="checkbox"]')
      .simulate('change', { target: { checked: true } });
    clock.tick(501);
    wrapper.update();

    const secondPassphraseRegisteredFailureReset = spy();
    const history = {
      goBack: spy(),
    };
    wrapper.setProps({
      step: 'second-passphrase-register-failure',
      secondPassphraseRegisteredFailureReset,
      history,
    });
    clock.tick(501);
    wrapper.update();

    expect(wrapper.find('button.try-again')).to.not.be.disabled();
    wrapper.find('button.try-again').simulate('click');

    clock.tick(501);
    wrapper.update();
    expect(history.goBack).to.have.been.calledWith();
    expect(secondPassphraseRegisteredFailureReset).to.have.been.calledWith();
  });

  it('should call props.secondPassphraseRegisteredFailureReset on unount', () => {
    const secondPassphraseRegisteredFailureReset = spy();
    wrapper = mount(<ConfirmSecond {...{
      ...props,
      secondPassphraseRegisteredFailureReset,
    }} />, options);
    wrapper.unmount();
    expect(secondPassphraseRegisteredFailureReset).to.have.been.calledWith();
  });
});

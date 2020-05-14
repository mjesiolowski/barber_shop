import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { HomePage } from './HomePage';
import { getTest } from '../../selectors';

export default connect(
  createStructuredSelector({ test: getTest }),
)(HomePage);

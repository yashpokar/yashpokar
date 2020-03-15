import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import Root from './Root';

import './assets/sass/app.scss';

const store = createStore(state => state, {});

ReactDOM.render(
	<Root store={store} />,
	document.getElementById('root')
);

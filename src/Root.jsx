import React, { Suspense, lazy } from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

const HomeScreen = lazy(() => import('./screens/HomeScreen'));

const Root = ({ store }) => (
	<Provider store={store}>
		<Router>
			<Switch>
				<Suspense fallback={<div>Loading...</div>}>
					<Route path="/" component={HomeScreen} extact />
				</Suspense>
			</Switch>
		</Router>
	</Provider>
);

Root.propTypes = {
	store: PropTypes.object.isRequired
}

export default Root;

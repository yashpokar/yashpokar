import React from 'react';
import PropTypes from 'prop-types';

const SocialLink = ({ icon, url }) => (
	<li className="sidebar__footer__item">
		<a
			href={url}
			className="sidebar__footer__item__link"
			target="_blank"
			rel="noopener noreferrer"
		>
			<i className={ `fa fa-${icon}` }></i>
		</a>
	</li>
);

SocialLink.propTypes = {
	icon: PropTypes.string.isRequired,
	url: PropTypes.string.isRequired
};

export default SocialLink;

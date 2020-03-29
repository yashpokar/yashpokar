import React from 'react';
import PropType from 'prop-types';

const Recommendation = ({ content, author, headline, address }) => {
    return (
        <div className="recommendations__item pointer">
            <div className="recommendations__item__content">
                {content}
			</div>

            <div className="recommendations__item__author">
                {author}

                <div className="recommendations__item__author__headline">
                    {headline},<br />
                    {address}
                </div>
            </div>
        </div>
    );
}

Recommendation.propTypes = {
    content: PropType.string.isRequired,
    author: PropType.string.isRequired,
    headline: PropType.string.isRequired,
    address: PropType.string.isRequired
};

export default Recommendation;

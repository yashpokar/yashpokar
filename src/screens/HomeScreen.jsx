import React, { useEffect } from 'react';
import SocialLink from './../components/home/SocialLink';
import Recommendation from "./../components/home/Recommendation";
import recommendations from "./../constants/home/recommendations";
import ReactGa from 'react-ga';

export default () => {

	useEffect(() => {
		ReactGa.initialize('UA-162186498-1');
		ReactGa.pageview('/');
	}, []);

	return (
		<div className="container">
			<div className="sidebar">
				<div className="sidebar__intro">
					<img
						src="https://yashpokar-dot-com.s3.us-east-2.amazonaws.com/B612_20191226_164531_202+(1).jpg"
						alt="Yash Pokar"
						className="sidebar__intro__image"
					/>

					<h2 className="sidebar__intro__name">
						Yash Pokar
					</h2>

					<div className="sidebar__intro__designation">
						Full Stack Developer
					</div>

					<div className="sidebar__intro__location">
						Banglore, Karnataka (IN)
					</div>

					<div className="sidebar__intro__email-address">
						hello@yashpokar.com
					</div>

					<div className="sidebar__intro__contact">
						(+91) 940-956-7085
					</div>
				</div>

				<ul className="sidebar__footer">
					<SocialLink icon="github" url="https://github.com/yashpokar" />
					<SocialLink icon="twitter" url="https://twitter.com/yashpokar" />
					<SocialLink icon="instagram" url="https://instagram.com/yashpokar" />
					<SocialLink icon="linkedin" url="https://linkedin.com/in/yashpokar" />
				</ul>
			</div>

			<main className="content">
				<div className="fullwidth minhight-screenfit flex text-center">
					<div id="home-page-wrapper">
						<div className="recommendations flex flex-column align-items-center">
							{
								recommendations.map(recommendation => (
									<Recommendation
										author={recommendation.author.name}
										headline={recommendation.author.headline}
										address={recommendation.author.address}
										content={recommendation.content}
									/>
								))
							}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}

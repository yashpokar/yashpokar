import React from 'react';
import SocialLink from './../components/home/SocialLink';

export default () => {
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
				<div className="fullwidth hight-screenfit flex justify-center align-items-center">

				</div>
			</main>
		</div>
	);
}

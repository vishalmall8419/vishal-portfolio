import {
  FaGithub,
  FaLinkedin,
  FaInstagram,
  FaEnvelope,
} from "react-icons/fa";

import "./SocialDock.css";
import usePublicData from "../../hooks/usePublicData";
import { publicApi, normalizeUrl } from "../../lib/publicApi";

const FALLBACK_LINKS = {
  github: "https://github.com/vishalmall8419",
  linkedin: "https://www.linkedin.com/in/vishal-mall-536506302/",
  instagram: "#",
  email: "vishal.mall02@outlook.com",
};

function SocialDock() {
  const { data: settings } = usePublicData(() => publicApi.settings(), []);
  const social = settings?.socialLinks || {};
  const email = settings?.email || FALLBACK_LINKS.email;

  const socialLinks = [
    { icon: <FaGithub />, link: normalizeUrl(social.github) || FALLBACK_LINKS.github },
    { icon: <FaLinkedin />, link: normalizeUrl(social.linkedin) || FALLBACK_LINKS.linkedin },
    { icon: <FaInstagram />, link: social.instagram ? normalizeUrl(social.instagram) : FALLBACK_LINKS.instagram },
    { icon: <FaEnvelope />, link: `mailto:${email}` },
  ];

  return (
    <div className="vm-social-dock">
      {socialLinks.map((item, index) => (
        <a
          key={index}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {item.icon}
        </a>
      ))}
    </div>
  );
}

export default SocialDock;

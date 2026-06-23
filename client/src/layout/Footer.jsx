import { Link } from "react-router-dom";
import { Github, Linkedin, Twitter, Youtube } from "lucide-react";

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

// ---------------------------------------------------------------------------
// Footer link data — centralised so adding/removing a link is a one-line edit
// ---------------------------------------------------------------------------
const questHubLinks = [
  { label: "About", path: "/about" },
  { label: "Profile", path: "/profile" },
  { label: "Community", path: "/community" },
  { label: "Help Center", path: "/help-center" },
];

const trainingLinks = [
  { label: "Workspace", path: "/workspace" },
  { label: "My Learning", path: "/my-learning" },
  { label: "Upload PDF", path: "/uploadpdf" },
];

const skillTreeLinks = [
  { label: "All Courses", path: "/workspace" },
  { label: "Python", path: "/course/5/detail" },
  { label: "HTML", path: "/course/1/detail" },
  { label: "CSS", path: "/course/2/detail" },
  { label: "JavaScript", path: "/course/9/detail" },
  { label: "React", path: "/course/3/detail" },
];

const toolsLinks = [
  { label: "React", path: "/course/3/detail" },
  { label: "Machine Learning", path: "/course/8/detail" },
  { label: "GitHub Copilot", path: "/workspace" },
  { label: "Generative AI", path: "/course/7/detail" },
];

const socialLinks = [
  { icon: <Github size={16} />, label: "GitHub", href: "#" },
  { icon: <Linkedin size={16} />, label: "LinkedIn", href: "#" },
  { icon: <Twitter size={16} />, label: "Twitter / X", href: "#" },
  { icon: <Youtube size={16} />, label: "YouTube", href: "#" },
  { icon: <DiscordIcon />, label: "Discord", href: "#" },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
const FooterSection = ({ title, links }) => (
  <div>
    <h3 className="font-jersey tracking-wider text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 text-yellow-700">
      {title}
    </h3>
    <ul className="space-y-1.5 sm:space-y-2">
      {links.map((link) => (
        <li key={link.label}>
          <Link
            to={link.path}
            className="text-xs sm:text-sm text-gray-600 hover:text-yellow-700 transition-colors"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------
const Footer = () => {
  return (
    <footer className="bg-[#0A0A0B] border-t border-zinc-800 pt-8 sm:pt-12 md:pt-16 pb-8 sm:pb-10 md:pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Link columns */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <FooterSection title="QUEST HUB" links={questHubLinks} />
          <FooterSection title="TRAINING" links={trainingLinks} />
          <FooterSection title="SKILL TREE" links={skillTreeLinks} />
          <FooterSection title="TOOLS & GEAR" links={toolsLinks} />
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-4 sm:pt-6 border-t border-zinc-800 gap-4">
          {/* Copyright */}
          <p className="text-xs sm:text-sm text-zinc-500 text-center md:text-left">
            © {new Date().getFullYear()} EduQuest. All rights reserved.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            {socialLinks.map(({ icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="text-zinc-500 hover:text-orange-400 transition-colors"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { GitHubLogoIcon, TwitterLogoIcon } from '@radix-ui/react-icons';

const Footer = () => {
  return (
    <footer className="fixed bottom-0 w-full bg-white border-t border-gray-200 py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-sm text-gray-600">
          © {new Date().getFullYear()} R2 Gallery. All rights reserved.
        </div>
        <div className="flex space-x-4">
          <a
            href="https://github.com/simongino/r2-gallery"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <GitHubLogoIcon className="w-5 h-5" />
          </a>
          <a
            href="https://twitter.com/simonginoqaq"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <TwitterLogoIcon className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
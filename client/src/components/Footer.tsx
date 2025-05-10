import React from "react";
import { FaTwitter, FaGithub, FaDiscord, FaTelegram } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="bg-card border-t border-muted/20 mt-12">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6">
            <a href="#" className="text-muted-foreground hover:text-foreground">
              <FaTwitter />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              <FaGithub />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              <FaDiscord />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              <FaTelegram />
            </a>
          </div>
          <div className="mt-8 md:mt-0">
            <p className="text-center md:text-right text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} BitcoinHub. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

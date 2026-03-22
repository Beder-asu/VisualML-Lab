import { Github, Linkedin, Mail } from 'lucide-react';

export function Footer() {
    return (
        <footer className="w-full bg-white border-t border-gray-200 py-6 mt-auto shrink-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} Mohamed Ahmed Beder. All rights reserved.
                </div>
                
                <div className="flex items-center gap-6">
                    <a 
                        href="https://github.com/Beder-asu" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm font-medium"
                        aria-label="GitHub Profile"
                    >
                        <Github className="w-4 h-4" />
                        <span>Beder-asu</span>
                    </a>
                    
                    <a 
                        href="https://linkedin.com/in/mobeder88" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-[#0a66c2] transition-colors flex items-center gap-2 text-sm font-medium"
                        aria-label="LinkedIn Profile"
                    >
                        <Linkedin className="w-4 h-4" />
                        <span>LinkedIn</span>
                    </a>
                    
                    <a 
                        href="mailto:mobeder88@gmail.com" 
                        className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 text-sm font-medium"
                        aria-label="Email Contact"
                    >
                        <Mail className="w-4 h-4" />
                        <span>Email</span>
                    </a>
                </div>
            </div>
        </footer>
    );
}

import { Link } from 'react-router-dom';
import { Target, Globe, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-surfaceHover mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-bold text-2xl tracking-tighter">
              <Target className="text-primary" />
              <span className="text-gradient">Golf</span>Charity
            </Link>
            <p className="text-gray-400 text-sm">
              The premier platform for golfers to compete globally while making a localized impact.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-gray-400 hover:text-white transition"><Globe size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition"><Mail size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition"><Phone size={20} /></a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/#how-it-works" className="hover:text-primary transition">How it Works</Link></li>
              <li><Link to="/#pricing" className="hover:text-primary transition">Pricing</Link></li>
              <li><Link to="/charities" className="hover:text-primary transition">Our Partners</Link></li>
              <li><Link to="/draws" className="hover:text-primary transition">Past Draws</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-primary transition">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition">Contact</a></li>
              <li><a href="#" className="hover:text-primary transition">Press</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-primary transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-primary transition">Licenses</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-surfaceHover mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Golf Charity Inc. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="cursor-pointer hover:text-white">Built with Supabase & React</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import Image from "next/image";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Image
                src="/logo.png"
                alt="Edulinks"
                width={36}
                height={36}
                className="rounded-lg"
              />
              <h3 className="text-white text-lg font-bold">
                Edulinks Learning Center
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Empowering students with quality education and holistic development.
              Building future leaders through innovative learning.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/programs" className="text-gray-400 hover:text-white transition-colors">
                  Programs
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-gray-400 hover:text-white transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/announcements" className="text-gray-400 hover:text-white transition-colors">
                  Announcements
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="text-gray-400 hover:text-white transition-colors">
                  Testimonials
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/apply" className="text-gray-400 hover:text-white transition-colors">
                  Enroll Now
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <FiMapPin className="flex-shrink-0 mt-0.5 text-blue-400" size={16} />
                <span className="text-gray-400">Deca Homes, Tunghaan, Minglanilla, Philippines, 6046</span>
              </li>
              <li className="flex items-center space-x-3">
                <FiPhone className="flex-shrink-0 text-blue-400" size={16} />
                <span className="text-gray-400">0910 769 4124</span>
              </li>
              <li className="flex items-center space-x-3">
                <FiMail className="flex-shrink-0 text-blue-400" size={16} />
                <span className="text-gray-400">edulinks.ph@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-8 text-center text-sm text-gray-500">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-3">
            <Link href="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link>
            <span className="text-gray-700">|</span>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
          <p>
            &copy; {new Date().getFullYear()} Edulinks Learning Center. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

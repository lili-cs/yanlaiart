import Link from "next/link";
import NewsletterSignup from "@/components/newsletter/NewsletterSignup";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Yan Lai Art
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Drawing, painting, and ceramic art courses for all levels.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Quick Links</h4>
            <ul className="mt-2 space-y-2">
              <li>
                <Link href="/courses" className="text-sm text-gray-600 hover:text-gray-900">
                  Courses
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-sm text-gray-600 hover:text-gray-900">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Contact</h4>
            <ul className="mt-2 space-y-2 text-sm text-gray-600">
              <li>info@yanlaiart.com</li>
              <li>(555) 123-4567</li>
              <li>Pennington, NJ 08534</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Event Notifications</h4>
            <p className="mt-2 text-sm text-gray-600">
              Subscribe to get notified about upcoming courses and events.
            </p>
            <div className="mt-3">
              <NewsletterSignup variant="compact" />
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Yan Lai Art. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

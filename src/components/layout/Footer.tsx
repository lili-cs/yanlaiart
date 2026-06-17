import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Yan Lai Art <span className="text-sm font-normal text-gray-500">燕来艺术</span>
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
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Contact</h4>
            <ul className="mt-2 space-y-2 text-sm text-gray-600">
              <li>info@yanlaiart.com</li>
              <li>(555) 123-4567</li>
              <li>123 Art Street, Creative District</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Yan Lai Art 燕来艺术. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

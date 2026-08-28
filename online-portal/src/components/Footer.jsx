import React from "react";
import { Mail, MapPin, Facebook, Twitter, Instagram, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  const quickLinks = [
    { label: "About Us", path: "/" },
    { label: "Stall Availability", path: "/stallmap" },
    { label: "Exhibitor Guidelines", path: "/reserve" },
    { label: "Privacy Policy", path: "/" },
  ];

  return (
    <footer className="bg-[#0f172a] text-gray-400 px-[10%] pt-20 pb-6 font-sans">
      
      {/* Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-16">

        {/* Column 1 */}
        <div>
          <h3 className="text-white text-2xl font-extrabold mb-5 tracking-widest">
            BOOKFAIR
          </h3>
          <p className="text-sm leading-7 italic">
            "CIBF 2026" is the premier literary event in Sri Lanka,
            connecting world-class publishers with passionate readers.
            Join us for an unforgettable experience.
          </p>
        </div>

        {/* Column 2 */}
        <div>
          <h4 className="text-white text-base font-semibold mb-6 tracking-wide">
            QUICK LINKS
          </h4>
          <ul className="text-sm space-y-3">
            {quickLinks.map((item, index) => (
              <li
                key={index}
                onClick={() => navigate(item.path)}
                className="cursor-pointer transition-all duration-300 hover:text-orange-500 hover:pl-1"
              >
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3 */}
        <div>
          <h4 className="text-white text-base font-semibold mb-6 tracking-wide">
            EXHIBITION HOURS
          </h4>
          <ul className="text-sm space-y-4">
            <li>
              <span className="block font-bold">Mon - Thursday:</span>
              08:00 am - 09:00 pm
            </li>
            <li>
              <span className="block font-bold">Friday:</span>
              03:00 pm - 09:00 pm
            </li>
            <li>
              <span className="block font-bold">Sat - Sunday:</span>
              08:00 am - 10:00 pm
            </li>
          </ul>
        </div>

        {/* Column 4 */}
        <div>
          <h4 className="text-white text-base font-semibold mb-6 tracking-wide">
            CONTACT
          </h4>

          <div className="space-y-4 text-sm">
            <p className="flex items-center gap-2">
              <Mail size={16} />
              info@cibf2026.lk
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={16} />
              BMICH, Colombo, Sri Lanka
            </p>
          </div>

          <h4 className="text-white text-base font-semibold mt-8 mb-4 tracking-wide">
            NEWS LETTER
          </h4>

          <div className="flex bg-[#222222] rounded overflow-hidden p-1">
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-transparent outline-none text-white px-3 py-2 flex-1 text-sm"
            />
            <button className="bg-orange-500 hover:bg-orange-600 transition duration-300 text-white px-4 flex items-center justify-center">
              <Send size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Section */}
      <div className="border-t border-[#222222] pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
        <p>© Copyright 2026 CIBF. All Rights Reserved.</p>

        <div className="flex gap-5 mt-4 md:mt-0">
          <Facebook className="cursor-pointer hover:text-orange-500 transition" size={18} />
          <Instagram className="cursor-pointer hover:text-orange-500 transition" size={18} />
          <Twitter className="cursor-pointer hover:text-orange-500 transition" size={18} />
        </div>
      </div>

    </footer>
  );
};

export default Footer;

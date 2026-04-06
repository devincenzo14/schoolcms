import dbConnect from "@/lib/db";
import AboutMember from "@/models/AboutMember";
import SiteSettings from "@/models/SiteSettings";
import { IAboutMember } from "@/types";
import Image from "next/image";
import { FiMapPin, FiPhone, FiMail, FiTarget, FiEye, FiHeart } from "react-icons/fi";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  await dbConnect();
  const [members, settingsRaw] = await Promise.all([
    AboutMember.find().sort({ type: 1, order: 1 }).lean(),
    SiteSettings.find({ key: { $in: ["mission", "vision", "coreValues"] } }).lean(),
  ]);
  const data: IAboutMember[] = JSON.parse(JSON.stringify(members));
  const settings: Record<string, string> = {};
  for (const s of settingsRaw) {
    settings[s.key] = s.value;
  }

  const teachers = data.filter((m) => m.type === "teacher");
  const founders = data.filter((m) => m.type === "founder");
  const hasMvc = settings.mission || settings.vision || settings.coreValues;

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 text-white py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Image
            src="/logo.png"
            alt="Edulinks Learning Center"
            width={80}
            height={80}
            className="mx-auto mb-6 rounded-2xl shadow-lg"
          />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Edulinks Learning Center
          </h1>
          <p className="text-blue-100 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed mb-8">
            Cebu&apos;s leading provider of quality, customized &amp; caring education:
            <br className="hidden sm:block" />
            <span className="font-semibold text-white">
              Complete Basic Education &amp; Academic Enrichment Programs
            </span>
          </p>

          {/* Contact Info */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm">
            <div className="flex items-center gap-2">
              <FiMapPin className="text-blue-200 flex-shrink-0" size={16} />
              <span className="text-blue-100">Deca Homes, Tunghaan, Minglanilla, Philippines, 6046</span>
            </div>
            <div className="flex items-center gap-2">
              <FiPhone className="text-blue-200 flex-shrink-0" size={16} />
              <span className="text-blue-100">0910 769 4124</span>
            </div>
            <div className="flex items-center gap-2">
              <FiMail className="text-blue-200 flex-shrink-0" size={16} />
              <span className="text-blue-100">edulinks.ph@gmail.com</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision & Core Values */}
      {hasMvc && (
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Our Foundation
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base">
                The principles that guide everything we do.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {settings.mission && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-100">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                    <FiTarget className="text-white" size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Our Mission</h3>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{settings.mission}</p>
                </div>
              )}
              {settings.vision && (
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-6 border border-emerald-100">
                  <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-4">
                    <FiEye className="text-white" size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Our Vision</h3>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{settings.vision}</p>
                </div>
              )}
              {settings.coreValues && (
                <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 rounded-2xl p-6 border border-rose-100">
                  <div className="w-12 h-12 bg-rose-600 rounded-xl flex items-center justify-center mb-4">
                    <FiHeart className="text-white" size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Core Values</h3>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{settings.coreValues}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Founders Section */}
      {founders.length > 0 && (
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Our Founders
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base">
                The visionaries behind Edulinks Learning Center.
              </p>
            </div>

            <div className={`grid gap-6 ${founders.length === 1 ? "max-w-sm mx-auto" : founders.length === 2 ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
              {founders.map((member) => (
                <div
                  key={member._id}
                  className="bg-gradient-to-br from-amber-50 to-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-amber-100"
                >
                  {member.imageUrl ? (
                    <div className="relative w-full h-56">
                      <Image
                        src={member.imageUrl}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-56 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                      <span className="text-6xl font-bold text-amber-400">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="p-5 text-center">
                    <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
                    <p className="text-amber-600 text-sm font-medium mt-0.5">
                      {member.role}
                    </p>
                    {member.bio && (
                      <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                        {member.bio}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Teachers Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Our Teachers
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base">
              Dedicated educators committed to nurturing every child&apos;s potential.
            </p>
          </div>

          {teachers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {teachers.map((member) => (
                <div
                  key={member._id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {member.imageUrl ? (
                    <div className="relative w-full h-52">
                      <Image
                        src={member.imageUrl}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-52 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                      <span className="text-5xl font-bold text-blue-300">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="p-5 text-center">
                    <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
                    <p className="text-blue-600 text-sm font-medium mt-0.5">
                      {member.role}
                    </p>
                    {member.bio && (
                      <p className="text-gray-500 text-sm mt-2 line-clamp-3 leading-relaxed">
                        {member.bio}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">Teacher information coming soon.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

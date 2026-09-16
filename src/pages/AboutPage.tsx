import React from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  Compass,
  Target,
  ShieldCheck,
  Heart,
  Zap,
  Eye,
  MapPin,
  CheckCircle2,
  Users,
  Award,
  Linkedin,
  Twitter,
  Globe,
  Sparkles,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { teamMembers } = useAdmin();
  const activeTeamMembers = teamMembers.filter((t) => t.status !== 'archived');
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Header Banner */}
      <div className="max-w-3xl space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#087F5B] flex items-center gap-1.5">
          <Compass className="w-4 h-4" />
          <span>Our Story & Purpose</span>
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-[#0B1F33] tracking-tight">
          Bridging Nigerian Ambition to Global Opportunity
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          NaijaBridge was founded with a singular conviction: Nigeria’s greatest asset is not its oil or minerals, but the boundless energy, intellect, and creativity of its young people.
        </p>
      </div>

      {/* Mission & Vision Split Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-8 border border-[#E4E1D8] shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#087F5B]/10 text-[#087F5B] flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#087F5B]">Our Mission</span>
          <h2 className="text-2xl font-bold font-display text-[#0B1F33]">
            To dismantle the barriers between talent and economic mobility.
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            We exist to provide every ambitious Nigerian student, graduate, freelancer, and small business owner with verified opportunities, practical digital tools, actionable application mentorship, and a trusted community that helps them step forward.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-[#E4E1D8] shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center">
            <Eye className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">Our Vision</span>
          <h2 className="text-2xl font-bold font-display text-[#0B1F33]">
            A Nigeria where location does not dictate economic destiny.
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            We envision a vibrant future where a developer in Kano, a designer in Aba, or a researcher in Ibadan can effortlessly compete, earn, and build on the world stage without having to battle scams, predatory middlemen, or artificial gatekeepers.
          </p>
        </div>
      </div>

      {/* Why NaijaBridge Exists */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E4E1D8] shadow-xs space-y-6">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-[#087F5B] mb-1 block">
            The Problem We Solve
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#0B1F33]">
            Why NaijaBridge Exists
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="space-y-2 p-5 rounded-2xl bg-[#F8F7F2] border border-[#E4E1D8]">
            <h4 className="font-bold text-sm text-[#0B1F33]">The Opportunity Divide</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every year, hundreds of thousands of Nigerian tertiary graduates enter the job market. Despite great work ethic and drive, many lack access to legitimate global pipelines or the digital portfolio skills required by modern remote employers.
            </p>
          </div>

          <div className="space-y-2 p-5 rounded-2xl bg-[#F8F7F2] border border-[#E4E1D8]">
            <h4 className="font-bold text-sm text-[#0B1F33]">Scams & Disinformation</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              The digital space is plagued by fake job adverts, advance-fee recruitment scams, and predatory training institutes that drain desperate job seekers of their savings. NaijaBridge stands as a trusted, verified beacon.
            </p>
          </div>

          <div className="space-y-2 p-5 rounded-2xl bg-[#F8F7F2] border border-[#E4E1D8]">
            <h4 className="font-bold text-sm text-[#0B1F33]">The Preparation Gap</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Finding a link is only step one. Most applicants lose out because of poorly formatted CVs that fail applicant tracking software (ATS) or unstructured scholarship essays. We guide them through preparation to final submission.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="space-y-6">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-[#087F5B] mb-1 block">
            Guiding Principles
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#0B1F33]">
            Our Core Values
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E4E1D8] shadow-xs space-y-2">
            <ShieldCheck className="w-6 h-6 text-[#087F5B]" />
            <h4 className="font-bold text-base text-[#0B1F33]">Trust & Verification</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              We vet before we publish. We respect our members' time and safety above vanity traffic metrics.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E4E1D8] shadow-xs space-y-2">
            <Users className="w-6 h-6 text-[#0F766E]" />
            <h4 className="font-bold text-base text-[#0B1F33]">Radical Inclusivity</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Serving youth in Maiduguri, Calabar, Lagos, and Sokoto equally. Low-bandwidth access is treated as a first-class feature.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E4E1D8] shadow-xs space-y-2">
            <Zap className="w-6 h-6 text-[#D99A28]" />
            <h4 className="font-bold text-base text-[#0B1F33]">Practical Impact</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              No empty motivational slogans. We measure success by real applications sent, jobs secured, and skills deployed.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E4E1D8] shadow-xs space-y-2">
            <Heart className="w-6 h-6 text-rose-600" />
            <h4 className="font-bold text-base text-[#0B1F33]">African Ingenuity</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Believing in the resilience and world-class potential of Nigerian youth, solving local problems with global standards.
            </p>
          </div>
        </div>
      </section>

      {/* Leadership & Advisory (Clearly Marked Editable Placeholders) */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E4E1D8] shadow-xs space-y-6">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-[#087F5B] mb-1 block">
            Team & Governance
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#0B1F33]">
            Founding & Advisory Team
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Profiles for organizational founders, advisory board members, and community stewards.
          </p>
        </div>

        {activeTeamMembers.length === 0 ? (
          <div className="bg-[#F8F7F2] rounded-2xl p-10 border border-dashed border-[#E4E1D8] text-center space-y-2">
            <h3 className="text-base font-bold text-[#0B1F33]">No team members have been published yet.</h3>
            <p className="text-xs text-stone-500">
              Profiles published via the admin dashboard will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
            {activeTeamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-[#F8F7F2] p-5 rounded-2xl border border-[#E4E1D8] flex flex-col justify-between space-y-3 hover:shadow-xs transition-shadow"
              >
                <div>
                  {member.photoUrl && member.photoUrl.trim() !== '' ? (
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="w-14 h-14 rounded-2xl object-cover mb-3 border border-[#E4E1D8]"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-[#0B1F33] text-white flex items-center justify-center font-bold text-base mb-3">
                      {member.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                  )}
                  <h4 className="font-bold text-sm text-[#0B1F33]">{member.name}</h4>
                  <p className="text-xs font-semibold text-[#087F5B] mt-0.5">{member.role}</p>
                  {member.bio && (
                    <p className="text-[11px] text-stone-600 mt-2 leading-relaxed">{member.bio}</p>
                  )}
                </div>

                <div className="pt-3 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500">
                  <span className="italic">{member.editableNote || 'Leadership & Advisory'}</span>
                  <div className="flex items-center gap-2">
                    {member.twitter && (
                      <a
                        href={member.twitter.startsWith('http') ? member.twitter : `https://twitter.com/${member.twitter.replace('@', '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-stone-400 hover:text-[#0B1F33] transition-colors"
                        aria-label="Twitter Profile"
                      >
                        <Twitter className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {member.linkedin ? (
                      <a
                        href={member.linkedin.startsWith('http') ? member.linkedin : `https://linkedin.com/in/${member.linkedin}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-stone-400 hover:text-[#087F5B] transition-colors"
                        aria-label="LinkedIn Profile"
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <Linkedin className="w-3.5 h-3.5 text-stone-300" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Phased Strategic Roadmap */}
      <section className="bg-[#0B1F33] text-white rounded-3xl p-8 sm:p-12 space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#087F5B]">
            Strategic Vision
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
            Phased Implementation Roadmap
          </h2>
          <p className="text-xs sm:text-sm text-white/80">
            How NaijaBridge scales from a remote-first platform into nationwide digital infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Phase 1 */}
          <div className="bg-white/10 p-6 rounded-2xl border border-white/10 space-y-3">
            <span className="px-2.5 py-0.5 rounded-full bg-[#087F5B] text-white text-[10px] font-bold">
              Phase 1 • Current
            </span>
            <h4 className="font-bold text-lg text-white">Digital Platform & Remote Hubs</h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Launch web directory, WhatsApp community circles, free CV review clinics, weekly virtual masterclasses, and practical career guidance.
            </p>
          </div>

          {/* Phase 2 */}
          <div className="bg-white/10 p-6 rounded-2xl border border-white/10 space-y-3">
            <span className="px-2.5 py-0.5 rounded-full bg-[#0F766E] text-white text-[10px] font-bold">
              Phase 2 • 2026/27
            </span>
            <h4 className="font-bold text-lg text-white">Campus Ambassador Network</h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Establish student chapters across 30+ Nigerian federal and state universities, providing localized peer clinics and sponsored internet data stipends.
            </p>
          </div>

          {/* Phase 3 */}
          <div className="bg-white/10 p-6 rounded-2xl border border-white/10 space-y-3">
            <span className="px-2.5 py-0.5 rounded-full bg-[#D99A28] text-[#0B1F33] text-[10px] font-bold">
              Phase 3 • Future
            </span>
            <h4 className="font-bold text-lg text-white">Physical Digital Hubs</h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Construct solar-powered community co-working study spaces with high-speed satellite broadband in under-served geopolitical zones across Nigeria.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

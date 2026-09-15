import React from 'react';
import { ServiceItem } from '../types';
import {
  Clock,
  Target,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface ServiceCardProps {
  service: ServiceItem;
  onRequest: (service: ServiceItem) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onRequest }) => {
  return (
    <div className="bg-white rounded-3xl border border-[#E4E1D8] p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between hover:border-[#087F5B]/50 relative">
      {service.popular && (
        <span className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-[#087F5B] text-white text-xs font-semibold shadow-xs">
          Popular
        </span>
      )}

      <div>
        {/* Price & Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
              service.isFree
                ? 'bg-[#087F5B]/10 text-[#087F5B]'
                : 'bg-[#D99A28]/15 text-[#885A09]'
            }`}
          >
            {service.badge || (service.isFree ? 'Free Community Service' : 'SME Support')}
          </span>

          <div className="text-right">
            <span className="text-lg font-bold font-display text-[#0B1F33]">
              {service.isFree ? 'Free' : `₦${service.priceNaira.toLocaleString()}`}
            </span>
          </div>
        </div>

        {/* Title & Tagline */}
        <h3 className="text-xl font-bold font-display text-[#0B1F33] mb-1">
          {service.title}
        </h3>
        <p className="text-xs font-medium text-[#0F766E] mb-3">{service.tagline}</p>

        <p className="text-xs text-stone-600 leading-relaxed mb-5">
          {service.description}
        </p>

        {/* Deliverable details */}
        <div className="space-y-3 bg-[#F8F7F2] p-4 rounded-2xl border border-[#E4E1D8]/80 text-xs mb-6">
          <div className="flex items-start gap-2 text-stone-700">
            <Target className="w-4 h-4 text-[#087F5B] shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-900 font-semibold block">Who it is for:</strong>
              <span>{service.targetAudience}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-stone-700">
            <CheckCircle className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-900 font-semibold block">Expected outcome:</strong>
              <span>{service.expectedOutcome}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-stone-700 pt-1 border-t border-stone-200/60">
            <Clock className="w-3.5 h-3.5 text-[#D99A28] shrink-0" />
            <span>
              <strong className="text-stone-900 font-semibold">Delivery Time:</strong>{' '}
              {service.deliveryTime}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => onRequest(service)}
        className="w-full py-3 px-4 rounded-xl bg-[#0B1F33] hover:bg-[#087F5B] text-white text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
      >
        <span>Request Support</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

'use client';

import React from 'react';
import { Institution } from '@/types';
import { Check, Sparkles, Building, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

interface SaaSPlanManagerProps {
  currentTenant: Institution;
  onUpdatePlan: (plan: 'starter' | 'pro' | 'enterprise') => void;
}

export const SaaSPlanManager: React.FC<SaaSPlanManagerProps> = ({
  currentTenant,
  onUpdatePlan,
}) => {
  const plans = [
    {
      id: 'starter' as const,
      name: 'Department Starter',
      price: '$490',
      period: '/month',
      description: 'Ideal for single departments or specialized research institutes.',
      features: [
        'Up to 25 Managed Resources',
        'Basic Booking & Conflict Detection',
        'Single-Tier Approval Routing',
        'Standard Email Notifications',
        '5,000 FlowAI Agent Queries/mo',
      ],
      popular: false,
    },
    {
      id: 'pro' as const,
      name: 'Campus Pro',
      price: '$1,490',
      period: '/month',
      description: 'Full campus operational coverage with autonomous AI multi-agent orchestration.',
      features: [
        'Up to 150 Managed Resources',
        'Multi-Agent FlowAI Action Deck',
        'Multi-Tier Approval Workflows',
        'QR Code Door Check-in Verification',
        'Live Telemetry & Utilization Analytics',
        '50,000 FlowAI Agent Queries/mo',
      ],
      popular: true,
    },
    {
      id: 'enterprise' as const,
      name: 'University Enterprise',
      price: 'Custom',
      period: '',
      description: 'Multi-campus university systems with ERP & Active Directory integration.',
      features: [
        'Unlimited Resources & Buildings',
        'Subdomain Multi-Tenant Isolation',
        'ACID PostgreSQL Exclusion Locks',
        'ERP & Outlook / Google Calendar 2-Way Sync',
        'Dedicated SLA & On-Premises Option',
        'Unlimited Autonomous Agent Invocations',
      ],
      popular: false,
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs font-semibold text-foreground">
          <Building className="w-3.5 h-3.5 text-blue-500" />
          <span>Multi-Tenant Institutional SaaS</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          SaaS Tiers & Campus Capacity
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Currently managing <strong className="text-foreground">{currentTenant.name}</strong> on the{' '}
          <span className="uppercase font-mono text-emerald-500 font-semibold">{currentTenant.planTier}</span> tier.
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
        {plans.map((p) => {
          const isCurrent = currentTenant.planTier === p.id;

          return (
            <div
              key={p.id}
              className={`rounded-2xl border p-6 flex flex-col justify-between space-y-6 transition-all shadow-sm relative ${
                p.popular
                  ? 'border-emerald-500/60 bg-card shadow-emerald-500/5 ring-1 ring-emerald-500/20'
                  : 'border-border bg-card/60 hover:bg-card'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                  Most Popular for Colleges
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-base text-foreground">{p.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-mono text-foreground">{p.price}</span>
                  <span className="text-xs text-muted-foreground">{p.period}</span>
                </div>

                <div className="space-y-2 pt-2 border-t border-border/80 text-xs">
                  {p.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onUpdatePlan(p.id)}
                disabled={isCurrent}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  isCurrent
                    ? 'bg-muted text-muted-foreground border border-border cursor-default'
                    : p.popular
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md'
                    : 'bg-foreground hover:opacity-90 text-background'
                }`}
              >
                {isCurrent ? (
                  <span>Current Active Plan</span>
                ) : (
                  <>
                    <span>Switch to {p.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

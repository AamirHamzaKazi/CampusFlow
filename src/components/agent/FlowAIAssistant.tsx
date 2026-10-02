'use client';

import React, { useState } from 'react';
import { Resource, Booking, AgentStep, ConflictReport } from '@/types';
import { mockResources, mockBookings, checkSlotConflict } from '@/lib/mock-data';
import { 
  Sparkles, 
  Send, 
  Bot, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Clock, 
  MapPin, 
  Users, 
  ShieldAlert,
  Calendar,
  Layers,
  Cpu,
  CornerDownLeft
} from 'lucide-react';

interface FlowAIAssistantProps {
  onBookingConfirmed: (newBooking: Partial<Booking>) => void;
  onNavigateToMatrix: () => void;
}

export const FlowAIAssistant: React.FC<FlowAIAssistantProps> = ({
  onBookingConfirmed,
  onNavigateToMatrix,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);
  const [resultRecommendation, setResultRecommendation] = useState<{
    resource: Resource;
    date: string;
    startTime: string;
    endTime: string;
    attendees: number;
    purpose: string;
    conflictReport: ConflictReport;
  } | null>(null);

  const samplePrompts = [
    "I need a computer lab for 50 students today from 2 PM to 4 PM with a projector",
    "Find an auditorium for 300 people today from 10 AM to 1 PM for annual keynote",
    "Book an AI GPU lab for 35 students today from 3:30 PM to 5:30 PM",
    "Find a quiet 8-person study pod in the library for 2 hours this afternoon",
  ];

  const handleRunAgentPipeline = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsProcessing(true);
    setAgentSteps([]);
    setResultRecommendation(null);

    // Step 1: Orchestrator Agent
    const step1: AgentStep = {
      id: 'step-1',
      agentName: 'Orchestrator',
      status: 'running',
      title: 'Intent Parsing & Requirement Extraction',
      details: 'Analyzing natural language query and extracting entities...',
      timestamp: new Date().toLocaleTimeString(),
    };
    setAgentSteps([step1]);

    await new Promise(r => setTimeout(r, 600));

    // Determine target resource based on query
    let targetRes = mockResources[0]; // Turing Lab 1
    let startTime = '14:00';
    let endTime = '16:00';
    let attendeeCount = 50;
    let purpose = queryText;

    if (queryText.toLowerCase().includes('auditorium') || queryText.toLowerCase().includes('keynote') || queryText.toLowerCase().includes('300')) {
      targetRes = mockResources[2]; // Newton Auditorium
      startTime = '10:00';
      endTime = '13:00';
      attendeeCount = 300;
    } else if (queryText.toLowerCase().includes('ai') || queryText.toLowerCase().includes('gpu') || queryText.toLowerCase().includes('lovelace')) {
      targetRes = mockResources[1]; // Ada Lovelace AI Lab
      startTime = '15:30';
      endTime = '17:30';
      attendeeCount = 35;
    } else if (queryText.toLowerCase().includes('study') || queryText.toLowerCase().includes('pod') || queryText.toLowerCase().includes('quiet')) {
      targetRes = mockResources[7]; // Study Pod Alpha
      startTime = '14:00';
      endTime = '16:00';
      attendeeCount = 6;
    }

    setAgentSteps(prev => [
      {
        ...prev[0],
        status: 'completed',
        details: `Extracted: Type: ${targetRes.type} | Target Capacity: ${attendeeCount} | Time: ${startTime} - ${endTime} | Equipment: Projector, AC`,
      },
      {
        id: 'step-2',
        agentName: 'Availability Agent',
        status: 'running',
        title: 'Querying Campus Resource Registry',
        details: `Scanning ${mockResources.length} physical facilities matching criteria...`,
        timestamp: new Date().toLocaleTimeString(),
      }
    ]);

    await new Promise(r => setTimeout(r, 700));

    setAgentSteps(prev => [
      prev[0],
      {
        ...prev[1],
        status: 'completed',
        details: `Identified top candidate: ${targetRes.name} (${targetRes.building}, Floor: ${targetRes.floor}, Cap: ${targetRes.capacity}).`,
      },
      {
        id: 'step-3',
        agentName: 'Conflict Agent',
        status: 'running',
        title: 'Deterministic Conflict & Maintenance Inspection',
        details: 'Checking for overlapping reservations and scheduled downtime...',
        timestamp: new Date().toLocaleTimeString(),
      }
    ]);

    await new Promise(r => setTimeout(r, 800));

    // Check conflict
    const today = '2026-10-02';
    const conflict = checkSlotConflict(targetRes.id, today, startTime, endTime, mockBookings);

    setAgentSteps(prev => [
      prev[0],
      prev[1],
      {
        ...prev[2],
        status: conflict.detected ? 'warning' : 'completed',
        details: conflict.detected
          ? `Conflict Detected: ${conflict.message}`
          : 'Zero conflicts detected. Slot is completely free with valid operating hours.',
      },
      {
        id: 'step-4',
        agentName: 'Recommendation Agent',
        status: 'completed',
        title: 'Optimized Action Formulation',
        details: conflict.detected
          ? 'Formulated 3 proactive conflict mitigation paths and alternative matching spaces.'
          : 'Prepared 1-click reservation proposal with institutional approval routing.',
        timestamp: new Date().toLocaleTimeString(),
      }
    ]);

    setResultRecommendation({
      resource: targetRes,
      date: today,
      startTime,
      endTime,
      attendees: attendeeCount,
      purpose,
      conflictReport: conflict,
    });

    setIsProcessing(false);
  };

  const handleConfirmAction = (chosenResource: Resource, cDate: string, cStart: string, cEnd: string) => {
    onBookingConfirmed({
      resourceId: chosenResource.id,
      resourceName: chosenResource.name,
      resourceType: chosenResource.type,
      title: resultRecommendation?.purpose || 'Scheduled via FlowAI',
      organizerName: 'Aamir Kazi',
      organizerRole: 'student',
      organizerEmail: 'aamir@campusflow.io',
      department: 'Computer Science',
      date: cDate,
      startTime: cStart,
      endTime: cEnd,
      attendeeCount: resultRecommendation?.attendees || 30,
      purpose: resultRecommendation?.purpose || 'Collaborative Academic Session',
      status: chosenResource.requiresApproval ? 'pending_approval' : 'confirmed',
      requiresApproval: chosenResource.requiresApproval,
      priorityScore: 8,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner: FlowAI Concept */}
      <div className="rounded-2xl border border-border bg-gradient-to-b from-card to-background p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-48 h-48 text-emerald-500" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-muted text-foreground text-xs font-semibold">
            <Bot className="w-3.5 h-3.5" />
            <span>Autonomous Multi-Agent Scheduling Deck</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Describe what you need in plain English.
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            CampusFlow coordinates specialized agents (Orchestrator, Availability, Conflict, and Recommendation) to resolve schedules, avoid overlaps, and route institutional approvals instantly.
          </p>

          {/* Omni Input Bar */}
          <div className="pt-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRunAgentPipeline(prompt);
              }}
              className="relative flex items-center"
            >
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'I need a computer lab for 50 students today 2-4 PM with a projector'..."
                className="w-full rounded-xl border border-border bg-background px-4 py-3.5 pr-28 text-sm text-foreground placeholder:text-muted-foreground/60 shadow-inner focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50"
              />
              <div className="absolute right-2 flex items-center gap-1.5">
                <button
                  type="submit"
                  disabled={isProcessing || !prompt.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-all shadow-xs"
                >
                  {isProcessing ? (
                    <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Execute</span>
                      <CornerDownLeft className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Quick Starter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-muted-foreground">Try asking:</span>
            {samplePrompts.map((sp, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(sp);
                  handleRunAgentPipeline(sp);
                }}
                className="text-[11px] px-2.5 py-1 rounded-md border border-border bg-card/60 text-muted-foreground hover:text-foreground hover:bg-accent transition-all text-left"
              >
                "{sp}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Multi-Agent Reasoning Trace Deck */}
      {agentSteps.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Multi-Agent Reasoning Execution Trace
              </span>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">
              {agentSteps.filter(s => s.status === 'completed' || s.status === 'warning').length} / {agentSteps.length} Steps Completed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {agentSteps.map((step) => {
              const statusColors = {
                pending: 'border-border bg-muted/20 text-muted-foreground',
                running: 'border-blue-500/30 bg-blue-50 text-blue-800 animate-pulse',
                completed: 'border-emerald-500/30 bg-emerald-500/5 text-foreground',
                warning: 'border-amber-500/30 bg-amber-500/5 text-foreground',
              };

              const badgeColors = {
                pending: 'bg-muted text-muted-foreground',
                running: 'bg-blue-500 text-white animate-spin',
                completed: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
                warning: 'bg-amber-50 text-amber-800 border border-amber-200',
              };

              return (
                <div
                  key={step.id}
                  className={`p-3.5 rounded-lg border text-xs space-y-1.5 transition-all ${statusColors[step.status]}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${badgeColors[step.status]}`}>
                        {step.agentName}
                      </span>
                      <span>{step.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">{step.timestamp}</span>
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    {step.details}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Result Recommendation & Conflict Mitigation Card */}
      {resultRecommendation && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {resultRecommendation.conflictReport.detected ? (
            /* CONFLICT DETECTED - PROACTIVE RESOLUTION CARD */
            <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-5 space-y-4 shadow-sm">
              <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-800 border border-amber-200 mt-0.5">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-amber-900">Schedule Conflict Proactively Prevented</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono">
                      Zero Double-Booking Guarantee
                    </span>
                  </div>
                  <p className="text-xs text-amber-900/80 mt-1">
                    {resultRecommendation.conflictReport.message}
                  </p>
                </div>
              </div>

              {/* Suggested Alternatives List */}
              <div className="space-y-2 pt-2 border-t border-amber-500/20">
                <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Proactive Alternatives Suggested by Recommendation Agent:</span>
                  <span className="text-[11px] text-muted-foreground font-normal">Select 1 to lock instantly</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {resultRecommendation.conflictReport.alternatives.map((alt, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg border border-border bg-card/90 hover:border-emerald-500/50 hover:bg-card transition-all flex flex-col justify-between space-y-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {alt.matchScore}% Match
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">{alt.date}</span>
                        </div>
                        <div className="font-semibold text-xs text-foreground">{alt.resourceName}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{alt.startTime} - {alt.endTime}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground/80">{alt.reason}</p>
                      </div>

                      <button
                        onClick={() => {
                          const matchingRes = mockResources.find(r => r.id === alt.resourceId) || resultRecommendation.resource;
                          handleConfirmAction(matchingRes, alt.date, alt.startTime, alt.endTime);
                        }}
                        className="w-full mt-2 py-1.5 rounded-md bg-foreground text-background text-[11px] font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-1"
                      >
                        <span>Select Alternative</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* NO CONFLICT - DIRECT 1-CLICK CONFIRMATION CARD */
            <div className="rounded-xl border border-emerald-300 bg-emerald-50/60 p-5 space-y-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-emerald-900">Perfect Resource Slot Available</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono">
                        Validated by ACID Engine
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      No schedule conflicts or maintenance windows found for {resultRecommendation.resource.name}.
                    </p>
                  </div>
                </div>

                <button
                  onClick={onNavigateToMatrix}
                  className="text-xs text-emerald-800 hover:underline flex items-center gap-1"
                >
                  <span>View on Calendar Matrix</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Resource Summary & Action Strip */}
              <div className="p-4 rounded-lg border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-sm text-foreground">{resultRecommendation.resource.name}</div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {resultRecommendation.resource.building}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {resultRecommendation.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {resultRecommendation.startTime} - {resultRecommendation.endTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {resultRecommendation.attendees} seats requested
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleConfirmAction(
                      resultRecommendation.resource,
                      resultRecommendation.date,
                      resultRecommendation.startTime,
                      resultRecommendation.endTime
                    )}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {resultRecommendation.resource.requiresApproval
                        ? 'Lock Slot & Route for Approval'
                        : 'Confirm Instant Reservation'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

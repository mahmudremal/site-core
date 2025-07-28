import React from 'react';
import {
  HeartPulse, Stethoscope, Syringe, AlertCircle, ShieldPlus,
  PhoneCall, Hospital, LucideUserCheck, BriefcaseMedical
} from 'lucide-react';
import { NavMenu } from '@banglee/core';
import { Link } from 'react-router-dom';

export default function HealthHome() {
  return (
    <div className="xpo_font-sans xpo_bg-white xpo_text-gray-800">
      <NavMenu />

      {/* Hero Section */}
      <section className="xpo_px-10 xpo_py-24 xpo_bg-gray-50">
        <div className="xpo_container xpo_m-auto xpo_flex xpo_flex-col-reverse md:xpo_flex-row xpo_items-center xpo_justify-between">
            <div className="xpo_max-w-xl">
            <h1 className="xpo_text-5xl xpo_font-bold xpo_mb-6">MoonLitKit</h1>
            <p className="xpo_text-lg xpo_text-gray-600 xpo_mb-6">
                A wearable AI-powered health monitoring system designed to detect and act on cardiac events, sugar levels, sleep patterns, and more — with doctor support and instant emergency response.
            </p>
            <div className="xpo_flex xpo_gap-4">
                <Link to={`/healths/`} className="xpo_px-6 xpo_py-3 xpo_rounded-xl xpo_bg-primary-600 xpo_text-white xpo_font-semibold hover:xpo_bg-primary-700 xpo_transition">
                Get Started
                </Link>
                <button className="xpo_px-6 xpo_py-3 xpo_rounded-xl xpo_border xpo_border-gray-300 hover:xpo_border-primary-600 xpo_transition">
                Learn More
                </button>
            </div>
            </div>
            <img src="/image/generate?text=500x400&width=500&height=500&bgColor=ccc&textColor=ffffff&format=svg" className="xpo_rounded-2xl xpo_shadow-xl" />
        </div>
      </section>

      {/* Features Section */}
      <section className="xpo_px-10 xpo_py-24">
        <div className="xpo_container xpo_m-auto">
            <h2 className="xpo_text-4xl xpo_font-bold xpo_text-center xpo_mb-16">Why MoonLitKit?</h2>
            <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-3 xpo_gap-12">
            <FeatureCard icon={<HeartPulse />} title="24/7 Cardiac Monitoring" desc="Always-on pulse and rhythm tracking to detect abnormalities early." />
            <FeatureCard icon={<Stethoscope />} title="AI-Driven Analytics" desc="Smart algorithms trained on real medical cases to forecast risks." />
            <FeatureCard icon={<Syringe />} title="Diabetes & Sugar Monitoring" desc="Monitor blood sugar and insulin patterns seamlessly." />
            <FeatureCard icon={<AlertCircle />} title="Auto Emergency Response" desc="Predict and call ambulance in potential health crises." />
            <FeatureCard icon={<ShieldPlus />} title="Remote Doctor Connectivity" desc="Connects data directly to assigned doctors, enabling remote treatment." />
            <FeatureCard icon={<BriefcaseMedical />} title="Medicine Scheduling & Purchase" desc="Tracks medication and automates reorders or alerts caregivers." />
            </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="xpo_bg-gray-100 xpo_px-10 xpo_py-24">
        <div className="xpo_container xpo_m-auto">
            <h2 className="xpo_text-4xl xpo_font-bold xpo_text-center xpo_mb-16">How It Works</h2>
            <div className="xpo_grid md:xpo_grid-cols-4 xpo_gap-8 xpo_text-center">
            <StepCard step="1" icon={<LucideUserCheck />} title="Wear the Device" desc="Ring or bracelet monitors data 24/7." />
            <StepCard step="2" icon={<Stethoscope />} title="Data Collection" desc="Heart, sugar, sleep, and temp captured securely." />
            <StepCard step="3" icon={<ShieldPlus />} title="AI Analysis" desc="Smart engine detects anomalies instantly." />
            <StepCard step="4" icon={<PhoneCall />} title="Doctor & Emergency" desc="If critical, a doctor is alerted or ambulance is called." />
            </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="xpo_px-10 xpo_py-24">
        <div className="xpo_container xpo_m-auto">
            <h2 className="xpo_text-4xl xpo_font-bold xpo_text-center xpo_mb-16">What Patients Say</h2>
            <div className="xpo_grid md:xpo_grid-cols-3 xpo_gap-8">
            {["Saved my father's life!", "My sugar is always in control now", "I sleep better knowing MoonLitKit monitors me"].map((text, i) => (
                <TestimonialCard key={i} text={text} name={`Patient ${i + 1}`} />
            ))}
            </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="xpo_bg-gray-50 xpo_px-10 xpo_py-24">
        <div className="xpo_container xpo_m-auto">
            <h2 className="xpo_text-4xl xpo_font-bold xpo_text-center xpo_mb-16">Choose Your Plan</h2>
            <div className="xpo_grid md:xpo_grid-cols-3 xpo_gap-8">
            {[
                { tier: "Basic", price: "Free", features: ["Live Tracking", "AI Alerts", "Doctor View (Read-only)"] },
                { tier: "Pro", price: "$29/mo", features: ["Doctor Integration", "Medicine Auto-purchase", "Emergency Trigger"] },
                { tier: "Enterprise", price: "Contact Us", features: ["API", "Hospital Integration", "Multiple Patient Support"] }
            ].map((plan, idx) => (
                <PricingCard key={idx} {...plan} />
            ))}
            </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="xpo_px-10 xpo_py-24">
        <div className="xpo_container xpo_m-auto">
            <h2 className="xpo_text-4xl xpo_font-bold xpo_text-center xpo_mb-16">FAQs</h2>
            <div className="xpo_max-w-3xl xpo_mx-auto xpo_space-y-6">
            <FAQItem q="Is MoonLitKit suitable for elderly users?" a="Yes, it's designed with simplicity and full automation for elderly patients." />
            <FAQItem q="Does it work without a phone?" a="The device stores data offline and syncs with cloud when in range." />
            <FAQItem q="Can I assign my own doctor?" a="Yes, you can link your own doctor with Pro or Enterprise plan." />
            </div>
        </div>
      </section>

      {/* CTA */}
      <section className="xpo_bg-primary-700 xpo_text-white xpo_text-center xpo_py-20">
        <div className="xpo_container xpo_m-auto">
            <h2 className="xpo_text-4xl xpo_font-bold xpo_mb-6">Start your journey toward safer health today</h2>
            <button className="xpo_bg-white xpo_text-primary-700 xpo_px-6 xpo_py-3 xpo_rounded-xl xpo_font-semibold hover:xpo_bg-gray-100 xpo_transition">
            Sign Up Now
            </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="xpo_bg-gray-900 xpo_text-gray-400 xpo_text-sm xpo_py-6 xpo_text-center">
        &copy; {new Date().getFullYear()} MoonLitKit. All Rights Reserved.
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="xpo_bg-white xpo_p-6 xpo_rounded-xl xpo_shadow-sm hover:xpo_shadow-md xpo_transition">
      <div className="xpo_mb-4">{React.cloneElement(icon, { className: "xpo_w-8 xpo_h-8 xpo_text-primary-600" })}</div>
      <h3 className="xpo_text-xl xpo_font-semibold xpo_mb-2">{title}</h3>
      <p className="xpo_text-gray-600 xpo_text-sm">{desc}</p>
    </div>
  );
}

function StepCard({ step, icon, title, desc }) {
  return (
    <div className="xpo_flex xpo_flex-col xpo_items-center">
      <div className="xpo_mb-4">{React.cloneElement(icon, { className: "xpo_w-10 xpo_h-10 xpo_text-primary-600" })}</div>
      <h4 className="xpo_font-semibold xpo_text-lg">{step}. {title}</h4>
      <p className="xpo_text-sm xpo_text-gray-600">{desc}</p>
    </div>
  );
}

function TestimonialCard({ text, name }) {
  return (
    <div className="xpo_bg-white xpo_p-6 xpo_rounded-xl xpo_shadow-md">
      <p className="xpo_italic xpo_mb-4">“{text}”</p>
      <div className="xpo_text-sm xpo_font-semibold xpo_text-gray-700">— {name}</div>
    </div>
  );
}

function PricingCard({ tier, price, features }) {
  return (
    <div className="xpo_bg-white xpo_rounded-xl xpo_p-8 xpo_shadow-md xpo_text-center">
      <h3 className="xpo_text-2xl xpo_font-bold xpo_mb-4">{tier}</h3>
      <div className="xpo_text-3xl xpo_font-semibold xpo_text-primary-600 xpo_mb-6">{price}</div>
      <ul className="xpo_space-y-2 xpo_text-sm xpo_mb-6">
        {features.map((f, i) => <li key={i}>✓ {f}</li>)}
      </ul>
      <button className="xpo_bg-primary-600 xpo_text-white xpo_px-6 xpo_py-3 xpo_rounded-xl hover:xpo_bg-primary-700 xpo_transition">Choose</button>
    </div>
  );
}

function FAQItem({ q, a }) {
  return (
    <div>
      <h4 className="xpo_font-semibold xpo_text-lg">{q}</h4>
      <p className="xpo_text-sm xpo_text-gray-600">{a}</p>
    </div>
  );
}

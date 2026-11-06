"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ArrowUpRight, ChevronDown } from "lucide-react"

interface DeskItem {
  label: string
  name: string
  email: string
  avatar: string
}

const desks: DeskItem[] = [
  {
    label: "Underwriting & Credit Desk",
    name: "Raj Sekhar Aluri",
    email: "underwriting@vmffinance.com",
    avatar: "/assets/director-raj-sekhar-aluri.jpg"
  },
  {
    label: "SME & Working Capital Desk",
    name: "Siva Krishna Kolli",
    email: "credit@vmffinance.com",
    avatar: "/assets/director-siva-krishna-kolli.jpg"
  },
  {
    label: "Institutional & DSA Alliances",
    name: "Srinivasa Rao Palla",
    email: "alliances@vmffinance.com",
    avatar: "/assets/director-srinivasa-rao-palla.jpg"
  },
  {
    label: "Compliance & RBI Grievance",
    name: "S. Meenakshi Sundaram",
    email: "compliance@vmffinance.com",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
  }
]

export default function Contact11() {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    enquiryType: "",
    message: "",
    consent: true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Contact 11 Form Submitted:", formData)
  }

  return (
    <section className="w-full bg-white px-4 py-16 dark:bg-neutral-950 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="mx-auto grid w-full max-w-[1400px] items-start gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left Column: Team Desks */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="font-sans text-4xl font-extrabold leading-[1.15] tracking-tight text-[#05244F] dark:text-white sm:text-5xl">
            <span className="block">Reach the right desk,</span>
            <span className="block italic text-[#2D7B39]">first time.</span>
          </h2>

          <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2">
            {desks.map((desk) => (
              <div key={desk.label}>
                <h3 className="font-sans text-sm font-semibold italic text-neutral-500 dark:text-neutral-400">
                  {desk.label}
                </h3>
                <div className="mt-4 flex items-center gap-3">
                  <img
                    src={desk.avatar}
                    alt={desk.name}
                    className="h-11 w-11 rounded-full border border-neutral-200 bg-neutral-100 object-cover dark:border-neutral-800 dark:bg-neutral-800"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {desk.name}
                    </p>
                    <a
                      href={`mailto:${desk.email}`}
                      className="group mt-0.5 inline-flex max-w-full cursor-pointer items-center gap-1 text-sm text-neutral-600 transition-colors hover:text-[#2D7B39] dark:text-neutral-400 dark:hover:text-white"
                    >
                      <span className="truncate">{desk.email}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-x-8 gap-y-10 border-t border-neutral-200 pt-10 dark:border-neutral-800 sm:grid-cols-2">
            <div>
              <h3 className="font-sans text-sm font-semibold italic text-neutral-500 dark:text-neutral-400">
                Find us
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                5th Floor, Plot No 43, The Park View,<br />
                Behind Preston Prime Mall, Lumbini Avenue,<br />
                Gachibowli, Hyderabad – 500032
              </p>
            </div>
            <div>
              <h3 className="font-sans text-sm font-semibold italic text-neutral-500 dark:text-neutral-400">
                Talk to us
              </h3>
              <a
                href="tel:+914023351234"
                className="mt-4 inline-block cursor-pointer text-sm font-medium text-[#05244F] transition-colors hover:text-[#2D7B39] dark:text-neutral-300 dark:hover:text-white"
              >
                +91 40 2335 1234
              </a>
              <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                9:30 AM – 6:30 PM, Mon to Fri IST
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Inquiry Form Card */}
        <motion.form
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          onSubmit={handleSubmit}
          className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900 sm:p-8 lg:p-10 shadow-sm"
        >
          <h3 className="font-sans text-3xl font-extrabold leading-[1.18] tracking-tight text-[#05244F] dark:text-white sm:text-4xl">
            <span className="block">Or fill in the form:</span>
            <span className="block italic text-[#2D7B39]">we'll reach out.</span>
          </h3>

          <div className="mt-8 grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="c11-name" className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Full name
                </label>
                <input
                  id="c11-name"
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. Ramesh Kumar"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-[#05244F] focus:outline-none focus:ring-2 focus:ring-[#05244F]/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="c11-email" className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Work Email
                </label>
                <input
                  id="c11-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-[#05244F] focus:outline-none focus:ring-2 focus:ring-[#05244F]/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="c11-company" className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Company
                </label>
                <input
                  id="c11-company"
                  type="text"
                  autoComplete="organization"
                  placeholder="e.g. Apex Industries Pvt Ltd"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-[#05244F] focus:outline-none focus:ring-2 focus:ring-[#05244F]/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="c11-type" className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Type of enquiry
                </label>
                <div className="relative">
                  <select
                    id="c11-type"
                    required
                    value={formData.enquiryType}
                    onChange={(e) => setFormData({ ...formData, enquiryType: e.target.value })}
                    className="w-full cursor-pointer appearance-none rounded-xl border border-neutral-300 bg-white px-4 py-3 pr-10 text-sm text-neutral-900 transition-colors focus:border-[#05244F] focus:outline-none focus:ring-2 focus:ring-[#05244F]/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                  >
                    <option value="" disabled>Please select financing product</option>
                    <option value="Invoice Financing">Invoice Financing (Unpaid Corporate Invoices)</option>
                    <option value="Purchase Order Financing">Purchase Order (PO) Financing</option>
                    <option value="Working Capital Loans">Working Capital & Operational Credit</option>
                    <option value="Channel Partner / DSA">Channel Partner / DSA Collaboration</option>
                    <option value="Regulatory / General Inquiry">Regulatory / General Inquiry</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="c11-message" className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Message
              </label>
              <textarea
                id="c11-message"
                rows={5}
                placeholder="Tell us about your business, funding requirements, order billing volume, and timeline..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full resize-none rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-[#05244F] focus:outline-none focus:ring-2 focus:ring-[#05244F]/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2.5">
              <input
                id="c11-consent"
                type="checkbox"
                required
                checked={formData.consent}
                onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded accent-[#2D7B39]"
              />
              <label htmlFor="c11-consent" className="cursor-pointer text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                I authorize VMF Finance Limited to contact me in accordance with RBI Fair Practices and agree to the{" "}
                <a href="/policies.html" className="cursor-pointer underline underline-offset-2 transition-colors hover:text-[#05244F] dark:hover:text-white">
                  Privacy Policy
                </a>.
              </label>
            </div>
            <button
              type="submit"
              className="w-full cursor-pointer rounded-full bg-[#05244F] px-8 py-3.5 text-sm font-medium text-white transition-all hover:bg-[#2D7B39] sm:w-auto"
            >
              Send message
            </button>
          </div>
        </motion.form>
      </div>
    </section>
  )
}


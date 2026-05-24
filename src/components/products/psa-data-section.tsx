"use client"

import { useState } from "react"
import { ShieldCheck, ExternalLink } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { PsaCert, PsaPopulation } from "@/features/products/types"

// Main integer grades shown in two rows
const MAIN_GRADE_ROWS = [
  [
    { label: "10",   key: "Grade10"  },
    { label: "9",    key: "Grade9"   },
    { label: "8",    key: "Grade8"   },
    { label: "7",    key: "Grade7"   },
    { label: "6",    key: "Grade6"   },
    { label: "5",    key: "Grade5"   },
  ],
  [
    { label: "4",    key: "Grade4"   },
    { label: "3",    key: "Grade3"   },
    { label: "2",    key: "Grade2"   },
    { label: "1.5",  key: "Grade1_5" },
    { label: "1",    key: "Grade1"   },
    { label: "Auth", key: "Auth"     },
  ],
] as const

const HALF_GRADES = [
  { label: "8.5", key: "Grade8_5" },
  { label: "7.5", key: "Grade7_5" },
  { label: "6.5", key: "Grade6_5" },
  { label: "5.5", key: "Grade5_5" },
  { label: "4.5", key: "Grade4_5" },
  { label: "3.5", key: "Grade3_5" },
  { label: "2.5", key: "Grade2_5" },
] as const

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  )
}

interface Props {
  psaCert: PsaCert
  inline?: boolean
}

export function PsaDataSection({ psaCert, inline = false }: Props) {
  const [open, setOpen] = useState(false)

  const grade = psaCert.cardGrade ?? psaCert.gradeDescription ?? "—"
  const popData = psaCert.psaPopulation as PsaPopulation | null

  const hasHalfGrades =
    popData !== null &&
    HALF_GRADES.some(({ key }) => (popData?.PSAPop[key as keyof PsaPopulation["PSAPop"]] ?? 0) > 0)

  const certFields: { label: string; value: string }[] = [
    psaCert.year        && { label: "Year",        value: psaCert.year },
    psaCert.brand       && { label: "Brand",        value: psaCert.brand },
    psaCert.psaCategory && { label: "Category",     value: psaCert.psaCategory },
    psaCert.cardNumber  && { label: "Card #",        value: `#${psaCert.cardNumber}` },
    psaCert.subject     && { label: "Subject",       value: psaCert.subject },
    psaCert.variety     && { label: "Variety",       value: psaCert.variety },
                           { label: "Grade",         value: grade },
                           { label: "Cert #",        value: psaCert.certNumber },
                           { label: "Spec #",        value: psaCert.specNumber },
    psaCert.labelType   && { label: "Label Type",    value: psaCert.labelType },
    psaCert.isPsaDna    && { label: "PSA DNA",       value: "Yes" },
    psaCert.isDualCert  && { label: "Dual Cert",     value: "Yes" },
    psaCert.reverseBarCode && { label: "Reverse Barcode", value: "Yes" },
  ].filter(Boolean) as { label: string; value: string }[]

  const fullDetails = (
    <>
      <div className="border-b border-border pb-5">
        <SectionLabel>Card Details</SectionLabel>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2.5 text-sm sm:grid-cols-3">
          {certFields.map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
              <p className="mt-0.5 font-medium">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-5">
        <SectionLabel>Total PSA Population</SectionLabel>

        {!popData && (
          <p className="text-sm text-muted-foreground">
            Population data not yet loaded. An admin can refresh it from the product edit page.
          </p>
        )}

        {popData && (
          <div className="space-y-3">
            <div className="space-y-px">
              {MAIN_GRADE_ROWS.map((row, i) => (
                <div key={i} className="grid grid-cols-6 border border-border text-center text-sm">
                  {row.map(({ label, key }) => (
                    <div key={key} className="border-r border-border px-1 py-2.5 last:border-r-0">
                      <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</div>
                      <div className="mt-1 font-semibold">{popData.PSAPop[key as keyof PsaPopulation["PSAPop"]]}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {hasHalfGrades && (
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Half Grades</p>
                <div className="grid grid-cols-7 border border-border text-center text-sm">
                  {HALF_GRADES.map(({ label, key }) => (
                    <div key={key} className="border-r border-border px-1 py-2.5 last:border-r-0">
                      <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</div>
                      <div className="mt-1 font-semibold">{popData.PSAPop[key as keyof PsaPopulation["PSAPop"]] ?? 0}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "Pop (this grade)",  value: psaCert.totalPopulation.toLocaleString() },
                { label: "Pop (all grades)",  value: popData.PSAPop.Total.toLocaleString() },
                { label: "Pop higher",        value: psaCert.populationHigher.toLocaleString() },
                { label: "Pop w/ qualifier",  value: psaCert.totalPopulationWithQualifier.toLocaleString() },
              ].map(({ label, value }) => (
                <div key={label} className="border border-border p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
                  <p className="mt-1 font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )

  const dialogContent = (
    <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader>
        <div className="flex items-center justify-between gap-2">
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            PSA Card Insights
          </DialogTitle>
          <a
            href={`https://www.psacard.com/cert/${psaCert.certNumber}/psa`}
            target="_blank"
            rel="noopener noreferrer"
            className="mr-8 flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-3 w-3" />
            View on PSA
          </a>
        </div>
      </DialogHeader>
      {fullDetails}
    </DialogContent>
  )

  return (
    <div className="border-2 border-foreground p-4">
      {/* Header row */}
      <div className="mb-3 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wide text-primary">PSA Certified</span>
        </div>
        {/* Mobile: always show dialog trigger */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="text-sm font-semibold underline underline-offset-2 hover:no-underline sm:hidden">
            See all data →
          </DialogTrigger>
          {dialogContent}
        </Dialog>
      </div>

      {/* Stats row */}
      <div className="flex items-end gap-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Grade</p>
          <p className="mt-1 text-sm font-semibold">{grade}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Cert #</p>
          <p className="mt-1 text-sm font-semibold">{psaCert.certNumber}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Pop</p>
          <p className="mt-1 text-sm font-semibold">{psaCert.totalPopulation.toLocaleString()}</p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <a
            href={`https://www.psacard.com/cert/${psaCert.certNumber}/psa`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            PSA
          </a>
          {/* Desktop: hide trigger when inline mode is active */}
          {!inline && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger className="hidden text-sm font-semibold underline underline-offset-2 hover:no-underline sm:inline">
                See all data →
              </DialogTrigger>
              {dialogContent}
            </Dialog>
          )}
        </div>
      </div>

      {/* Inline full details — desktop only, when no description */}
      {inline && (
        <div className="mt-5 hidden border-t border-border pt-5 sm:block">
          {fullDetails}
        </div>
      )}
    </div>
  )
}

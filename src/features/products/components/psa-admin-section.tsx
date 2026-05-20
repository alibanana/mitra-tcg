"use client"

import { useState, useTransition } from "react"
import { ShieldCheck, RefreshCw, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { refreshPsaPopulationAction } from "@/features/products/actions"
import type { PsaCert, PsaPopulation } from "@/features/products/types"

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

interface Props {
  psaCert: PsaCert
}

export function PsaAdminSection({ psaCert }: Props) {
  const [isPending, startTransition] = useTransition()
  const [popData, setPopData] = useState<PsaPopulation | null>(
    psaCert.psaPopulation as PsaPopulation | null,
  )
  const [populatedAt, setPopulatedAt] = useState<Date | null>(
    psaCert.psaPopPopulatedAt ? new Date(psaCert.psaPopPopulatedAt) : null,
  )

  function handleRefresh() {
    startTransition(async () => {
      const result = await refreshPsaPopulationAction(psaCert.id)
      if ("error" in result) {
        toast.error(result.error)
      } else {
        toast.success("PSA population data refreshed")
        setPopulatedAt(new Date(result.updatedAt))
        // Reload to get fresh popData from DB — simplest approach for a server-driven page
        window.location.reload()
      }
    })
  }

  const grade = psaCert.cardGrade ?? psaCert.gradeDescription ?? "—"

  const certFields: { label: string; value: string }[] = [
    psaCert.year        && { label: "Year",           value: psaCert.year },
    psaCert.brand       && { label: "Brand",          value: psaCert.brand },
    psaCert.psaCategory && { label: "Category",       value: psaCert.psaCategory },
    psaCert.cardNumber  && { label: "Card #",          value: `#${psaCert.cardNumber}` },
    psaCert.subject     && { label: "Subject",         value: psaCert.subject },
    psaCert.variety     && { label: "Variety",         value: psaCert.variety },
                           { label: "Grade",           value: grade },
                           { label: "Cert #",          value: psaCert.certNumber },
                           { label: "Spec ID",         value: String(psaCert.specId) },
                           { label: "Spec #",          value: psaCert.specNumber },
    psaCert.labelType   && { label: "Label Type",      value: psaCert.labelType },
    psaCert.isPsaDna    && { label: "PSA DNA",         value: "Yes" },
    psaCert.isDualCert  && { label: "Dual Cert",       value: "Yes" },
    psaCert.reverseBarCode && { label: "Reverse Barcode", value: "Yes" },
                           { label: "Pop (this grade)", value: psaCert.totalPopulation.toLocaleString() },
                           { label: "Pop higher",       value: psaCert.populationHigher.toLocaleString() },
                           { label: "Pop w/ qualifier", value: psaCert.totalPopulationWithQualifier.toLocaleString() },
  ].filter(Boolean) as { label: string; value: string }[]

  const hasHalfGrades =
    popData !== null &&
    HALF_GRADES.some(({ key }) => (popData?.PSAPop[key as keyof PsaPopulation["PSAPop"]] ?? 0) > 0)

  return (
    <div className="border-2 border-foreground p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold uppercase tracking-wide">PSA Certification</h2>
        </div>
        <a
          href={`https://www.psacard.com/cert/${psaCert.certNumber}/psa`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="h-3 w-3" />
          View on PSA
        </a>
      </div>

      {/* Cert Details */}
      <div className="mb-6">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Card Details
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
          {certFields.map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {label}
              </p>
              <p className="mt-0.5 font-medium">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Population Data */}
      <div className="border-t border-foreground/10 pt-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              PSA Population Data
            </p>
            {populatedAt && (
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                Last refreshed: {populatedAt.toLocaleString()}
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isPending}
            className="flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3 w-3 ${isPending ? "animate-spin" : ""}`} />
            {isPending ? "Refreshing…" : "Refresh from PSA"}
          </Button>
        </div>

        {!popData && (
          <p className="text-sm text-muted-foreground">
            No population data stored yet. Click &ldquo;Refresh from PSA&rdquo; to fetch it.
          </p>
        )}

        {popData && (
          <div className="space-y-3">
            <div className="space-y-px">
              {MAIN_GRADE_ROWS.map((row, i) => (
                <div
                  key={i}
                  className="grid grid-cols-6 border border-border text-center text-sm"
                >
                  {row.map(({ label, key }) => (
                    <div
                      key={key}
                      className="border-r border-border px-1 py-2.5 last:border-r-0"
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        {label}
                      </div>
                      <div className="mt-1 font-semibold">
                        {popData.PSAPop[key as keyof PsaPopulation["PSAPop"]]}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {hasHalfGrades && (
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Half Grades
                </p>
                <div className="grid grid-cols-7 border border-border text-center text-sm">
                  {HALF_GRADES.map(({ label, key }) => (
                    <div
                      key={key}
                      className="border-r border-border px-1 py-2.5 last:border-r-0"
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        {label}
                      </div>
                      <div className="mt-1 font-semibold">
                        {popData.PSAPop[key as keyof PsaPopulation["PSAPop"]] ?? 0}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "Pop (all grades)", value: popData.PSAPop.Total.toLocaleString() },
                { label: "Auth",             value: popData.PSAPop.Auth.toLocaleString() },
              ].map(({ label, value }) => (
                <div key={label} className="border border-border p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1 font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pencil } from "lucide-react"

interface Column {
  header: string
  key: string
  render?:
    | "published"
    | "read"
    | "editLink"
    | "technologies"
    | "date"
    | "message"
  linkPrefix?: string
  hideOnMobile?: boolean
}

interface DataTableProps {
  columns: Column[]
  data: Record<string, unknown>[]
  emptyMessage?: string
}

function getNestedValue(row: Record<string, unknown>, key: string): unknown {
  if (!key.includes(".")) return row[key]
  const [first, ...rest] = key.split(".")
  let current = row[first]
  for (const k of rest) {
    current = (current as Record<string, unknown>)?.[k]
  }
  return current
}

function CellContent({ col, row }: { col: Column; row: Record<string, unknown> }) {
  const value = getNestedValue(row, col.key)

  switch (col.render) {
    case "published":
      return (
        <Badge
          variant={value ? "default" : "secondary"}
          className={value ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400" : ""}
        >
          {value ? "Published" : "Draft"}
        </Badge>
      )
    case "read":
      return (
        <Badge variant={value ? "secondary" : "default"}>
          {value ? "Read" : "New"}
        </Badge>
      )
    case "editLink":
      if (col.linkPrefix && row.id) {
        return (
          <Link
            href={`${col.linkPrefix}${row.id as string}/edit`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Link>
        )
      }
      return null
    case "technologies": {
      const techs = (value as string[]) ?? []
      return (
        <div className="flex flex-wrap gap-1">
          {techs.slice(0, 3).map((t) => (
            <Badge key={t} variant="outline" className="text-xs">
              {t}
            </Badge>
          ))}
          {techs.length > 3 && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              +{techs.length - 3}
            </Badge>
          )}
        </div>
      )
    }
    case "date":
      return (
        <>
          {value
            ? new Date(value as string).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "—"}
        </>
      )
    case "message":
      return (
        <span className="block max-w-xs truncate text-muted-foreground">
          {String(value ?? "")}
        </span>
      )
    default:
      return <span className="whitespace-normal">{String(value ?? "—")}</span>
  }
}

export function DataTable({
  columns,
  data,
  emptyMessage = "No data found",
}: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={`text-xs font-semibold uppercase tracking-wider text-muted-foreground${col.hideOnMobile ? " hidden md:table-cell" : ""}`}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, i) => (
              <TableRow key={i} className="transition-colors hover:bg-muted/30">
                {columns.map((col) => (
                  <TableCell key={col.key} className={`text-sm${col.hideOnMobile ? " hidden md:table-cell" : ""}`}>
                    <CellContent col={col} row={row} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

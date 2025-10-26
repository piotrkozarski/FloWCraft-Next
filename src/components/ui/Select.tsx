import { Fragment } from "react"
import { Listbox, Transition } from "@headlessui/react"
import { Check, ChevronDown } from "lucide-react"

export type Option<T extends string = string> = { label: string; value: T; disabled?: boolean }

interface SelectProps<T extends string = string> {
  value: T
  onChange: (v: T) => void
  options: Option<T>[]
  className?: string
  buttonClassName?: string
  panelClassName?: string
}

export default function Select<T extends string>({
  value, onChange, options, className = "", buttonClassName = "", panelClassName = ""
}: SelectProps<T>) {
  const selected = options.find(o => o.value === value) ?? options[0]

  return (
    <div className={`relative ${className}`}>
      <Listbox value={value} onChange={onChange}>
        <Listbox.Button
          className={`w-full inline-flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm 
            bg-[var(--surface)] border border-[var(--border)] text-[var(--text)]
            focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]
            ${buttonClassName}`}
        >
          <span>{selected?.label ?? selected?.value}</span>
          <ChevronDown className="h-4 w-4 opacity-80" />
        </Listbox.Button>

        <Transition as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="opacity-0 -translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-75"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 -translate-y-1"
        >
          <Listbox.Options
            className={`absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md shadow-lg ring-1 ring-[var(--border)]
              bg-[var(--panel)] text-[var(--text)] ${panelClassName}`}
          >
            {options.map(opt => (
              <Listbox.Option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className={({ active, disabled }) =>
                  `cursor-pointer select-none px-3 py-2 text-sm
                   ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                   ${active ? "bg-[var(--accent)]/20" : ""}`
                }
              >
                {({ selected }) => (
                  <div className="flex items-center justify-between">
                    <span>{opt.label}</span>
                    {selected && <Check className="h-4 w-4 opacity-90" />}
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </Listbox>
    </div>
  )
}



interface FilterChipsProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}

function FilterChips({ options, value, onChange }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              active
                ? "bg-primary-soft text-primary-rest"
                : "border border-border bg-surface text-secondary hover:text-on-surface"
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export default FilterChips

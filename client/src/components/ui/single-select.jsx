import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState, useCallback } from "react"
import { Command as CommandPrimitive, useCommandState } from "cmdk"
import { X, ChevronsUpDown } from "lucide-react"
import { Command, CommandGroup, CommandItem, CommandList } from "../ui/command.jsx"
import { cn } from "../../lib/utils"

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

function transToGroupOption(options, groupBy) {
  const grouped = {}
  options.forEach(opt => {
    const key = groupBy ? opt[groupBy] || "" : ""
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(opt)
  })
  return grouped
}

const CommandEmpty = forwardRef(({ className, ...props }, forwardedRef) => {
  const render = useCommandState(s => s.filtered.count === 0)
  if (!render) return null
  return <div ref={forwardedRef} className={cn("py-6 text-center text-sm", className)} cmdk-empty="" role="presentation" {...props} />
})
CommandEmpty.displayName = "CommandEmpty"

export const SingleSelector = forwardRef(({
  value,
  onChange,
  placeholder,
  defaultOptions = [],
  options: arrayOptions,
  delay,
  onSearch,
  onSearchSync,
  loadingIndicator,
  emptyIndicator,
  disabled,
  groupBy,
  className,
  selectFirstItem = true,
  creatable = false,
  triggerSearchOnFocus = false,
  commandProps = {},
  inputProps = {},
}, ref) => {
  const inputRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [onScrollbar, setOnScrollbar] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selected, setSelected] = useState(value)
  const [options, setOptions] = useState(transToGroupOption(defaultOptions, groupBy))
  const [inputValue, setInputValue] = useState("")
  const [commandValue, setCommandValue] = useState("")
  const [showAllOptions, setShowAllOptions] = useState(true)
  const debouncedSearchTerm = useDebounce(inputValue, delay)

  useImperativeHandle(ref, () => ({
    selectedValue: selected,
    input: inputRef.current,
    focus: () => inputRef.current?.focus(),
    reset: () => setSelected(undefined),
  }), [selected])

  const handleClickOutside = event => {
    if (!inputRef.current || open === false) return
    if (inputRef.current && !inputRef.current.contains(event.target)) {
      setOpen(false)
      inputRef.current.blur()
    }
  }

  const handleUnselect = useCallback(() => {
    setSelected(undefined)
    onChange && onChange(undefined)
    setInputValue("")
    if (arrayOptions) setOptions(transToGroupOption(arrayOptions, groupBy))
  }, [arrayOptions, groupBy, onChange])

  useEffect(() => {
    if (open && arrayOptions && !inputValue) {
      setOptions(transToGroupOption([...arrayOptions], groupBy))
    }
  }, [open, arrayOptions, groupBy, inputValue])

  useEffect(() => {
    open
      ? (document.addEventListener("mousedown", handleClickOutside),
         document.addEventListener("touchend", handleClickOutside))
      : (document.removeEventListener("mousedown", handleClickOutside),
         document.removeEventListener("touchend", handleClickOutside))

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchend", handleClickOutside)
    }
  }, [open])

  useEffect(() => value !== undefined && setSelected(value), [value])

  useEffect(() => {
    if (!arrayOptions || onSearch) return
    const newOpts = transToGroupOption(arrayOptions, groupBy)
    if (JSON.stringify(newOpts) !== JSON.stringify(options)) setOptions(newOpts)
  }, [arrayOptions, groupBy, onSearch, options])

  useEffect(() => {
    if (!onSearchSync || !open) return

    const doSearchSync = () => {
      const res = onSearchSync(debouncedSearchTerm)
      setOptions(transToGroupOption(res || [], groupBy))
    }

    if ((triggerSearchOnFocus && open) || debouncedSearchTerm) doSearchSync()
  }, [debouncedSearchTerm, groupBy, onSearchSync, open, triggerSearchOnFocus])

  useEffect(() => {
    if (!onSearch || !open) return

    const doSearch = async () => {
      setIsLoading(true)
      const res = await onSearch(debouncedSearchTerm)
      setOptions(transToGroupOption(res || [], groupBy))
      setIsLoading(false)
    }

    if (triggerSearchOnFocus || debouncedSearchTerm) void doSearch()
  }, [debouncedSearchTerm, groupBy, onSearch, open, triggerSearchOnFocus])

  const CreatableItem = () => {
    if (!creatable) return null
    const exists = Object.values(options).flat().some(opt =>
      opt.value === inputValue || opt.label === inputValue ||
      (selected && (selected.value === inputValue || selected.label === inputValue))
    )
    if (exists) return null

    return (
      <CommandItem
        value={inputValue}
        className="cursor-pointer"
        onMouseDown={e => e.preventDefault()}
        onSelect={value => {
          const newOption = { value, label: value }
          setSelected(newOption)
          onChange && onChange(newOption)
          setInputValue("")
          setOpen(false)
        }}
      >
        {`Create "${inputValue}"`}
      </CommandItem>
    )
  }

  const EmptyItem = useCallback(() => {
    if (!emptyIndicator) return null
    if (onSearch && !creatable && Object.keys(options).length === 0) {
      return <CommandItem value="-" disabled>{emptyIndicator}</CommandItem>
    }
    return <CommandEmpty>{emptyIndicator}</CommandEmpty>
  }, [creatable, emptyIndicator, onSearch, options])

  const commandFilter = useCallback(() => {
    if (commandProps.filter) return commandProps.filter
    if (creatable) {
      return (value, search) =>
        value.toLowerCase().includes(search.toLowerCase()) ? 1 : -1
    }
    return undefined
  }, [creatable, commandProps.filter])

  return (
    <Command
      ref={ref}
      {...commandProps}
      value={commandValue}
      className={cn("h-auto overflow-visible bg-transparent", commandProps.className)}
      shouldFilter={false}
      filter={commandFilter()}
    >
      <div
        className={cn("flex items-center justify-between rounded-md ...", className)}
        onClick={() => {
          if (disabled) return
          setOpen(true)
          setShowAllOptions(true)
          setInputValue("")
          setCommandValue(Math.random().toString())
          if (arrayOptions) setOptions(transToGroupOption(arrayOptions, groupBy))
          inputRef.current?.focus()
          if (triggerSearchOnFocus) {
            if (onSearch) onSearch("")
            else if (onSearchSync) {
              const res = onSearchSync("")
              setOptions(transToGroupOption(res || [], groupBy))
            }
          }
        }}
      >
        {selected ? (
          <div className="flex flex-1 items-center">
            {selected.label}
            {!disabled && (
              <button type="button" className="ml-2" onClick={e => {
                e.stopPropagation()
                handleUnselect()
              }}>
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <CommandPrimitive.Input
            {...inputProps}
            ref={inputRef}
            value={inputValue}
            disabled={disabled}
            onValueChange={v => {
              setInputValue(v)
              setShowAllOptions(v.length === 0)
              inputProps.onValueChange && inputProps.onValueChange(v)
            }}
            onBlur={e => {
              if (!onScrollbar) setOpen(false)
              inputProps.onBlur && inputProps.onBlur(e)
            }}
            onFocus={e => {
              setOpen(true)
              if (arrayOptions) setOptions(transToGroupOption(arrayOptions, groupBy))
              if (triggerSearchOnFocus) {
                if (onSearch) onSearch("")
                else if (onSearchSync) {
                  const res = onSearchSync("")
                  setOptions(transToGroupOption(res || [], groupBy))
                }
              }
              inputProps.onFocus && inputProps.onFocus(e)
            }}
            placeholder={placeholder}
            className={cn("flex-1 bg-transparent outline-none placeholder:text-muted-foreground", inputProps.className)}
          />
        )}
        <ChevronsUpDown className="h-4 w-4 opacity-50" />
      </div>

      {open && (
        <div className="relative">
          <CommandList
            className="absolute top-1 z-10 w-full rounded-md border bg-popover shadow-md animate-in"
            onMouseLeave={() => setOnScrollbar(false)}
            onMouseEnter={() => setOnScrollbar(true)}
            onMouseUp={() => inputRef.current?.focus()}
          >
            {isLoading ? loadingIndicator : (
              <>
                {EmptyItem()}
                {CreatableItem()}
                {!selectFirstItem && <CommandItem value="-" className="hidden" />}
                {Object.entries(options).map(([key, items]) => (
                  <CommandGroup key={key} heading={key} className="h-full overflow-auto">
                    {items.filter(opt =>
                      showAllOptions || opt.label.toLowerCase().includes(inputValue.toLowerCase())
                    ).map(option => (
                      <CommandItem
                        key={option.value}
                        value={option.label}
                        disabled={option.disable}
                        onMouseDown={e => e.preventDefault()}
                        onSelect={() => {
                          setInputValue("")
                          setSelected(option)
                          onChange && onChange(option)
                          setOpen(false)
                        }}
                        className={cn("cursor-pointer", option.disable && "cursor-default text-muted-foreground")}
                      >
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </>
            )}
          </CommandList>
        </div>
      )}
    </Command>
  )
})
SingleSelector.displayName = "SingleSelector"

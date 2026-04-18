import * as React from "react";
import type { SelectOption, SetState } from "@/types";
import { CheckIcon, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";import styles from "./InputSelect.module.css";import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

export interface InputSelectProvided {
  options: SelectOption[];
  onValueChange?: (v: string) => void;
  placeholder: string;
  clearable: boolean;
  disabled: boolean;
  selectedValue: string;
  setSelectedValue: SetState<string>;
  isPopoverOpen: boolean;
  setIsPopoverOpen: SetState<boolean>;
  onOptionSelect: (v: string) => void;
  onClearAllOptions: () => void;
}

export const InputSelect: React.FC<{
  options: SelectOption[];
  value?: string;
  onValueChange?: (v: string) => void;
  placeholder?: string;
  clearable?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: (v: InputSelectProvided) => React.ReactNode;
}> = ({
  options,
  value = "",
  onValueChange,
  placeholder = "Select...",
  clearable = false,
  disabled = false,
  className,
  children,
  ...restProps
}) => {
  const [selectedValue, setSelectedValue] = React.useState<string>(value);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  const onOptionSelect = (option: string) => {
    setSelectedValue(option);
    onValueChange?.(option);
    setIsPopoverOpen(false);
  };

  const onClearAllOptions = () => {
    setSelectedValue("");
    onValueChange?.("");
    setIsPopoverOpen(false);
  };

  React.useEffect(() => {
    if (isPopoverOpen && value !== selectedValue) {
      setSelectedValue(value);
    }
  }, [isPopoverOpen]);

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        {children({
          options,
          onValueChange,
          placeholder,
          clearable,
          disabled,
          selectedValue,
          setSelectedValue,
          isPopoverOpen,
          setIsPopoverOpen,
          onOptionSelect,
          onClearAllOptions,
        })}
      </PopoverTrigger>
      <PopoverContent
        className={cn(styles.inputSelectContent, className)}
        align="start"
        onEscapeKeyDown={() => setIsPopoverOpen(false)}
        {...restProps}
      >
        <Command>
          <CommandInput placeholder="Search..." className={styles.inputSelectSearchInput} />
          <CommandList className={styles.inputSelectList}>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup className={styles.inputSelectGroup}>
              {options.map((option) => {
                const isSelected = selectedValue === option.value;
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => onOptionSelect(option.value)}
                    className={cn(
                      styles.inputSelectItem,
                      isSelected && styles.inputSelectItemSelected
                    )}
                  >
                    <div className={styles.inputSelectCheckIcon}>
                      {isSelected && <CheckIcon className="w-4 h-4" />}
                    </div>
                    {option.icon && (
                      <option.icon className="w-4 h-4 mr-2 text-muted-foreground" />
                    )}
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <div className={styles.inputSelectFooter}>
                {selectedValue && clearable && (
                  <>
                    <CommandItem
                      onSelect={onClearAllOptions}
                      className={styles.inputSelectFooterButton}
                    >
                      Clear
                    </CommandItem>
                    <Separator
                      orientation="vertical"
                      className={styles.inputSelectSeparator}
                    />
                  </>
                )}
                <CommandItem
                  onSelect={() => setIsPopoverOpen(false)}
                  className={styles.inputSelectFooterButton}
                >
                  Close
                </CommandItem>
              </div>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
InputSelect.displayName = "InputSelect";

export const InputSelectTrigger = React.forwardRef<
  HTMLButtonElement,
  InputSelectProvided & {
    className?: string;
    children?: (v: SelectOption) => React.ReactNode;
    style?: React.CSSProperties;
  }
>(
  (
    {
      options,
      // onValueChange,
      placeholder,
      clearable,
      disabled,
      selectedValue,
      // setSelectedValue,
      // isPopoverOpen,
      setIsPopoverOpen,
      // onOptionSelect,
      onClearAllOptions,
      className,
      style,
      children,
    },
    ref,
  ) => {
    const onTogglePopover = () => {
      setIsPopoverOpen((prev) => !prev);
    };

    return (
      <Button
        ref={ref}
        onClick={onTogglePopover}
        variant="outline"
        type="button"
        disabled={disabled}
        className={cn(
          styles.inputSelectTrigger,
          "hover:bg-transparent",
          disabled && "[&_svg]:pointer-events-none",
          className,
        )}
        style={style}
      >
        {selectedValue ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-wrap items-center px-2">
              {[selectedValue].map((value, index) => {
                const option = options.find((o) => o.value === value);

                if (!option) {
                  return <div key={`${index}-${value}`}></div>;
                }

                if (children) {
                  return (
                    <div key={`${index}-${value}`}>{children(option)}</div>
                  );
                }

                return (
                  <div
                    key={`${index}-${value}`}
                    className={cn("text-foreground")}
                  >
                    {option?.icon && (
                      <option.icon className="mr-1 h-3.5 w-3.5" />
                    )}
                    {option?.label}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between">
              {selectedValue && clearable && (
                <>
                  <X
                    className={cn(
                      "mx-1 h-4 cursor-pointer text-muted-foreground",
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearAllOptions();
                    }}
                  />
                  <Separator
                    orientation="vertical"
                    className="flex h-full min-h-6"
                  />
                </>
              )}
              <ChevronDown className="h-4 mx-1 cursor-pointer text-muted-foreground" />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full mx-auto">
            <span className="mx-3 text-sm text-muted-foreground">
              {placeholder}
            </span>
            <ChevronDown className="h-4 mx-1 cursor-pointer text-muted-foreground" />
          </div>
        )}
      </Button>
    );
  },
);
InputSelectTrigger.displayName = "InputSelectTrigger";

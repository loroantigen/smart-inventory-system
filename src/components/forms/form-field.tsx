import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "password" | "number" | "date" | "textarea" | "select";
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  options?: { value: string; label: string }[];
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function FormField({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  options,
  error,
  required,
  disabled,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {type === "textarea" ? (
        <Textarea
          id={name}
          name={name}
          placeholder={placeholder}
          value={value as string}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={cn(error && "border-red-500 focus-visible:ring-red-500")}
        />
      ) : type === "select" && options ? (
        <Select
          value={value as string}
          onValueChange={onChange}
          disabled={disabled}
        >
          <SelectTrigger className={cn(error && "border-red-500 focus-visible:ring-red-500")}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={cn(error && "border-red-500 focus-visible:ring-red-500")}
        />
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
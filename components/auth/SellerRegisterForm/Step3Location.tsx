"use client";

import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sellerStep3Schema, type SellerStep3Input } from "@/lib/validations/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Building, Hash, Search, ChevronDown, Check, Globe } from "lucide-react";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

countries.registerLocale(enLocale);

// Convert country code to flag emoji (e.g., "US" → "🇺🇸")
function getFlagEmoji(code: string) {
  return code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

interface CountryOption {
  code: string;
  name: string;
  flag: string;
}

// ── Searchable Country Dropdown ─────────────────────────────────

function CountrySelect({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (val: string) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const countryList = useMemo<CountryOption[]>(() => {
    const namesObj = countries.getNames("en", { select: "official" });
    return Object.entries(namesObj)
      .map(([code, name]) => ({ code, name, flag: getFlagEmoji(code) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return countryList;
    const q = search.toLowerCase();
    return countryList.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [countryList, search]);

  const selected = countryList.find((c) => c.code === value);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Focus search when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  // Scroll selected into view when opened
  useEffect(() => {
    if (open && value && listRef.current) {
      const el = listRef.current.querySelector(`[data-code="${value}"]`);
      if (el) el.scrollIntoView({ block: "center" });
    }
  }, [open, value]);

  const handleSelect = useCallback(
    (code: string) => {
      onChange(code);
      setOpen(false);
      setSearch("");
    },
    [onChange]
  );

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2.5 px-3 py-2.5 border rounded-lg text-sm text-left transition-all duration-150 bg-white ${
          open
            ? "border-gray-400 ring-2 ring-gray-200"
            : error
            ? "border-red-400"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        {selected ? (
          <>
            <span className="text-xl leading-none">{selected.flag}</span>
            <span className="flex-1 truncate text-gray-900">{selected.name}</span>
          </>
        ) : (
          <>
            <Globe className="w-5 h-5 text-gray-400" />
            <span className="flex-1 text-gray-400">Select your country</span>
          </>
        )}
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Search */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country..."
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setOpen(false);
                    setSearch("");
                  }
                  if (e.key === "Enter" && filtered.length === 1) {
                    e.preventDefault();
                    handleSelect(filtered[0].code);
                  }
                }}
              />
            </div>
          </div>

          {/* Country list */}
          <div ref={listRef} className="max-h-56 overflow-y-auto overscroll-contain">
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-gray-400">
                No countries found
              </div>
            ) : (
              filtered.map((c) => {
                const isSelected = c.code === value;
                return (
                  <button
                    key={c.code}
                    type="button"
                    data-code={c.code}
                    onClick={() => handleSelect(c.code)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors ${
                      isSelected
                        ? "bg-[#E53935]/5 text-[#E53935] font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-lg leading-none">{c.flag}</span>
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="text-[11px] text-gray-400 font-mono shrink-0">
                      {c.code}
                    </span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#E53935] shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Step3 Form ─────────────────────────────────────────────

interface Step3Props {
  initialData: Partial<SellerStep3Input>;
  onNext: (data: SellerStep3Input) => void;
  onBack: () => void;
}

export default function Step3Location({ initialData, onNext, onBack }: Step3Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SellerStep3Input>({
    resolver: zodResolver(sellerStep3Schema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      {/* Country */}
      <div className="space-y-1.5">
        <Label htmlFor="s3-country">
          Country <span className="text-red-500">*</span>
        </Label>
        <Controller
          name="country"
          control={control}
          render={({ field }) => (
            <CountrySelect
              value={field.value ?? ""}
              onChange={field.onChange}
              error={errors.country?.message}
            />
          )}
        />
        {errors.country && (
          <p className="text-red-500 text-xs">{errors.country.message}</p>
        )}
      </div>

      {/* Street Address */}
      <div className="space-y-1.5">
        <Label htmlFor="s3-street">
          Street Address <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            id="s3-street"
            placeholder="123 Main St, Suite 100"
            className="pl-10"
            {...register("street")}
          />
        </div>
        {errors.street && (
          <p className="text-red-500 text-xs">{errors.street.message}</p>
        )}
      </div>

      {/* City + State */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="s3-city">
            City <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input
              id="s3-city"
              placeholder="New York"
              className="pl-10"
              {...register("city")}
            />
          </div>
          {errors.city && (
            <p className="text-red-500 text-xs">{errors.city.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="s3-state">
            State / Province <span className="text-red-500">*</span>
          </Label>
          <Input id="s3-state" placeholder="NY" {...register("state")} />
          {errors.state && (
            <p className="text-red-500 text-xs">{errors.state.message}</p>
          )}
        </div>
      </div>

      {/* Postal Code */}
      <div className="space-y-1.5">
        <Label htmlFor="s3-postalCode">
          Postal / ZIP Code <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            id="s3-postalCode"
            placeholder="10001"
            className="pl-10"
            {...register("postalCode")}
          />
        </div>
        {errors.postalCode && (
          <p className="text-red-500 text-xs">{errors.postalCode.message}</p>
        )}
      </div>

      {/* Info note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
        <strong>Why we need this:</strong> Your business address is used for tax
        purposes and to calculate shipping rates. It is never displayed publicly.
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          type="submit"
          className="flex-1 py-2.5 bg-[#E53935] text-white rounded-lg font-semibold text-sm hover:bg-[#C62828] transition-colors"
        >
          Continue →
        </button>
      </div>
    </form>
  );
}

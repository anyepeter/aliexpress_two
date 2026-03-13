"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sellerStep3Schema, type SellerStep3Input } from "@/lib/validations/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Building, Hash } from "lucide-react";

interface Step3Props {
  initialData: Partial<SellerStep3Input>;
  onNext: (data: SellerStep3Input) => void;
  onBack: () => void;
}

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "CN", name: "China" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "SG", name: "Singapore" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "ZA", name: "South Africa" },
  { code: "NG", name: "Nigeria" },
  { code: "EG", name: "Egypt" },
  { code: "TR", name: "Turkey" },
  { code: "PK", name: "Pakistan" },
  { code: "BD", name: "Bangladesh" },
];

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
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger id="s3-country">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

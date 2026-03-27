"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Mail, Briefcase, Building2, Users } from "lucide-react";
import { BasicInfoData } from "../types";

const schema = z.object({
  firstName: z.string().min(1, "First name is required").max(255),
  lastName: z.string().min(1, "Last name is required").max(255),
  email: z.string().email("Enter a valid email address"),
  role: z.string().min(1, "Role is required"),
  department: z.string().min(1, "Department is required"),
  type: z.enum(["Freelancer", "Contractor"]),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  defaultValues: BasicInfoData;
  onNext: (data: BasicInfoData) => void;
}

const departmentOptions = [
  "Engineering",
  "Design",
  "Product",
  "Marketing",
  "Sales",
  "Finance",
  "HR",
  "Operations",
  "Legal",
  "Other",
];

export function Step1BasicInfo({ defaultValues, onNext }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const selectedType = watch("type");
  const selectedDept = watch("department");

  return (
    <form
      id="step1-form"
      onSubmit={handleSubmit(onNext)}
      className="space-y-5"
    >
      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">First Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="firstName"
              placeholder="John"
              className="pl-9"
              {...register("firstName")}
            />
          </div>
          {errors.firstName && (
            <p className="text-xs text-red-500">{errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lastName">Last Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="lastName"
              placeholder="Doe"
              className="pl-9"
              {...register("lastName")}
            />
          </div>
          {errors.lastName && (
            <p className="text-xs text-red-500">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="john.doe@company.com"
            className="pl-9"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Role */}
      <div className="space-y-1.5">
        <Label htmlFor="role">Job Title / Role</Label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="role"
            placeholder="e.g. Senior Engineer"
            className="pl-9"
            {...register("role")}
          />
        </div>
        {errors.role && (
          <p className="text-xs text-red-500">{errors.role.message}</p>
        )}
      </div>

      {/* Department + Type row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Department</Label>
          <Select
            value={selectedDept}
            onValueChange={(v) => setValue("department", v)}
          >
            <SelectTrigger id="department">
              <Building2 className="h-4 w-4 mr-2 text-gray-400" />
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departmentOptions.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.department && (
            <p className="text-xs text-red-500">{errors.department.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Employment Type</Label>
          <Select
            value={selectedType}
            onValueChange={(v) => setValue("type", v as "Freelancer" | "Contractor")}
          >
            <SelectTrigger id="type">
              <Users className="h-4 w-4 mr-2 text-gray-400" />
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Freelancer">Freelancer</SelectItem>
              <SelectItem value="Contractor">Contractor</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-xs text-red-500">{errors.type.message}</p>
          )}
        </div>
      </div>

      {/* Footer button rendered by parent via form id */}
    </form>
  );
}

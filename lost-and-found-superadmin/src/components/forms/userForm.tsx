// components/forms/UserForm.tsx
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserFormValues,
  type UpdateUserFormValues,
} from "@/schema/user.schema";
import { useGetColleges } from "@/hooks/useColleges";
import { Building2, Eye, EyeOff, Mail, User as UserIcon } from "lucide-react";
import type { User } from "@/types/user.types";
import { Checkbox } from "@/components/ui/checkbox";

interface UserFormProps {
  initialData?: User | null;
  onSubmit: (
    data: CreateUserFormValues | UpdateUserFormValues,
  ) => Promise<void>;
  isCreateMode?: boolean; // true for create, false for edit
}

export function UserForm({
  initialData,
  onSubmit,
  isCreateMode = !initialData,
}: UserFormProps) {
  const {
    data: collegesData,
    isLoading: collegesLoading,
    error: collegesError,
  } = useGetColleges({
    page: 1,
    limit: 100,
    isActive: true,
  });

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const collegesList = collegesData?.data ?? [];

  console.log("initialData", initialData);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
    watch,
    clearErrors,
  } = useForm<CreateUserFormValues | UpdateUserFormValues>({
    resolver: zodResolver(isCreateMode ? createUserSchema : updateUserSchema),
    defaultValues: isCreateMode
      ? {
          name: "",
          email: "",
          password: "",
          collegeId: "",
          isActive: true,
        }
      : {
          name: "",
          email: "",
          collegeId: "",
          isActive: true,
        },
  });

  const selectedCollegeId = watch("collegeId");
  const watchedIsActive = watch("isActive");

  // Initialize form with initial data for edit mode
  useEffect(() => {
    if (initialData && !isCreateMode) {
      reset({
        name: initialData.name,
        email: initialData.email,
        collegeId: initialData.collegeId?._id || "",
        isActive: initialData.isActive,
        avatar: initialData.avatar,
        chatPrivacy: initialData.chatPrivacy,
        notificationPreferences: initialData.notificationPreferences,
      });
      setIsActive(initialData.isActive);
    }
  }, [initialData, reset, isCreateMode]);

  // Update local state when form value changes
  useEffect(() => {
    if (watchedIsActive !== undefined) {
      setIsActive(watchedIsActive as boolean);
    }
  }, [watchedIsActive]);

  const handleCollegeChange = (value: string) => {
    setValue("collegeId", value);
    clearErrors("collegeId");
  };

  const handleActiveChange = (checked: boolean) => {
    setValue("isActive", checked);
    setIsActive(checked);
  };

  const getCollegeName = (collegeId: string) => {
    const college = collegesList.find((c) => c._id === collegeId);
    return college ? college.name : "Unknown College";
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* College Selection */}
      <Field orientation="vertical" className="gap-0 space-y-1">
        <FieldGroup className="gap-0 space-y-1">
          <FieldLabel
            htmlFor="collegeId"
            className={`flex items-center gap-2 text-sm font-medium ${
              errors.collegeId ? "text-red-500" : "text-foreground"
            }`}
          >
            <Building2
              className={`h-4 w-4 ${
                errors.collegeId ? "text-red-500" : "text-muted-foreground"
              }`}
            />
            College
          </FieldLabel>

          <Select
            value={selectedCollegeId}
            onValueChange={handleCollegeChange}
            disabled={collegesLoading || isSubmitting || !isCreateMode} // Disable college change in edit mode
          >
            <SelectTrigger size="lg" className="w-full py-2">
              <SelectValue
                placeholder={
                  initialData ? (
                    <div className="flex items-center gap-2">
                      {initialData.collegeId?.logo?.url && (
                        <img
                          src={initialData.collegeId?.logo?.url}
                          alt={initialData.collegeId?.name}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      )}
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">
                          {initialData.collegeId?.name}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {initialData.collegeId?.domain}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {collegesLoading
                        ? "Loading Colleges..."
                        : "Select college"}
                    </>
                  )
                }
              />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                {collegesLoading ? (
                  <div className="text-muted-foreground p-2 text-center text-sm">
                    Loading colleges...
                  </div>
                ) : collegesError ? (
                  <div className="p-2 text-center text-sm text-red-500">
                    Failed to load colleges
                  </div>
                ) : collegesList.length > 0 ? (
                  collegesList.map((college) => (
                    <SelectItem key={college._id} value={college._id}>
                      <div className="flex items-center gap-2">
                        {college.logo?.url && (
                          <img
                            src={college.logo.url}
                            alt={college.name}
                            className="h-6 w-6 rounded-full object-cover"
                          />
                        )}
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-medium">
                            {college.name}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {college.domain}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="text-muted-foreground p-2 text-center text-sm">
                    No colleges available
                  </div>
                )}
              </SelectGroup>
            </SelectContent>
          </Select>

          {!isCreateMode && selectedCollegeId && (
            <p className="text-muted-foreground mt-1 text-xs">
              College: {getCollegeName(selectedCollegeId)}
            </p>
          )}
        </FieldGroup>
        {errors.collegeId && (
          <FieldError className="flex items-center justify-end text-xs text-red-500">
            {errors.collegeId.message}
          </FieldError>
        )}
      </Field>

      {/* Name Field */}
      <Field orientation="vertical" className="gap-0 space-y-1">
        <FieldGroup className="gap-0 space-y-1">
          <FieldLabel
            htmlFor="name"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <UserIcon className="text-muted-foreground h-4 w-4" />
            Full Name
          </FieldLabel>
          <Input
            id="name"
            placeholder="John Doe"
            {...register("name")}
            aria-invalid={!!errors.name}
            disabled={isSubmitting}
          />
        </FieldGroup>
        {errors.name && (
          <FieldError className="flex items-center justify-end text-xs text-red-500">
            {errors.name.message}
          </FieldError>
        )}
      </Field>

      {/* Email Field */}
      <Field orientation="vertical" className="gap-0 space-y-1">
        <FieldGroup className="gap-0 space-y-1">
          <FieldLabel
            htmlFor="email"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <Mail className="text-muted-foreground h-4 w-4" />
            Email Address
          </FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="john@college.edu.np"
            {...register("email")}
            aria-invalid={!!errors.email}
            disabled={isSubmitting}
          />
        </FieldGroup>
        {errors.email && (
          <FieldError className="flex items-center justify-end text-xs text-red-500">
            {errors.email.message}
          </FieldError>
        )}
      </Field>

      {/* Password Field - Only for Create Mode */}
      {isCreateMode && (
        <Field orientation="vertical" className="gap-0 space-y-1">
          <FieldGroup className="gap-0 space-y-1">
            <FieldLabel htmlFor="password" className="text-sm font-medium">
              Password
            </FieldLabel>
            <div className="relative flex items-center">
              <Input
                id="password"
                type={isPasswordVisible ? "text" : "password"}
                placeholder="••••••••"
                className="h-10 pr-10"
                {...register("password")}
                aria-invalid={!!(errors as any).password}
                disabled={isSubmitting}
              />
              <Button
                variant="ghost"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                type="button"
                className="absolute right-1 cursor-pointer p-0 hover:bg-transparent"
                size="icon"
              >
                {isPasswordVisible ? (
                  <EyeOff className="text-muted-foreground h-5 w-5" />
                ) : (
                  <Eye className="text-muted-foreground h-5 w-5" />
                )}
              </Button>
            </div>
          </FieldGroup>
          {(errors as any).password && (
            <FieldError className="flex items-center justify-end text-xs text-red-500">
              {(errors as any).password.message}
            </FieldError>
          )}
        </Field>
      )}

      {/* Active Status Checkbox - Only for Edit Mode */}
      {!isCreateMode && (
        <Field orientation="vertical" className="gap-0 space-y-1">
          <FieldGroup className="gap-0 space-y-1">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={isActive}
                onCheckedChange={handleActiveChange}
                disabled={isSubmitting}
              />
              <label
                htmlFor="isActive"
                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Account Active
              </label>
            </div>
            <p className="text-muted-foreground text-xs">
              {isActive
                ? "User can log in and use the system"
                : "User cannot log in or access the system"}
            </p>
          </FieldGroup>
        </Field>
      )}

      {/* Hidden fields for edit mode */}
      {!isCreateMode && <input type="hidden" {...register("isActive")} />}

      {/* Submit Button */}
      <Button type="submit" className="mt-4 w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {isCreateMode ? "Creating..." : "Updating..."}
          </>
        ) : (
          <>{isCreateMode ? `Create User` : `Update User`}</>
        )}
      </Button>

      {/* Help text for admin creation */}
      {isCreateMode && (
        <p className="text-muted-foreground mt-2 text-center text-xs">
          Note: Users are created as students first. After creation, use the
          "Add to Admins" button to promote them to college admin.
        </p>
      )}
    </form>
  );
}

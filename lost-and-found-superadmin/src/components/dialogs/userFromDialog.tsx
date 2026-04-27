import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { User } from "@/types/user.types";
import { UserForm } from "../forms/userForm";
import type {
  CreateUserFormValues,
  UpdateUserFormValues,
} from "@/schema/user.schema";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSubmit: (
    data: CreateUserFormValues | UpdateUserFormValues,
  ) => Promise<void>;
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
}: UserFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{user ? `Edit User}` : `Add User`}</DialogTitle>
          <DialogDescription>
            {user
              ? `Update the User details below.`
              : `Fill in the details to add a new User.`}
          </DialogDescription>
        </DialogHeader>
        <UserForm initialData={user} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
}

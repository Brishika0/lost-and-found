import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

interface DeleteConfirmation {
  title: string;
  description: string;
  isPending?: boolean;
  onConfirm: () => void;
  buttonText?: string;
  defaultBtn?: boolean;
}

export function DeleteConfirmation({
  title,
  description,
  isPending,
  onConfirm,
  buttonText,
  defaultBtn,
}: DeleteConfirmation) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={defaultBtn ? "destructive" : "ghost"}
          className={` ${defaultBtn ? "" : "text-destructive hover:text-destructive focus:bg-destructive/10 w-full justify-start p-2 font-normal hover:bg-red-100"}`}
          size="sm"
        >
          <Trash className="mr-2 h-4 w-4" />
          {buttonText ? buttonText : "Delete"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
            disabled={isPending}
          >
            <>{isPending ? "Deleting..." : "Delete"}</>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

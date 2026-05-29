import { useParams } from "react-router-dom";
import { LostItemForm } from "../forms/lostItemForm";
import { useLostItem } from "@/hooks/useLostItems";
import { useAuth } from "@/contexts/AuthContext";

const EditLostItemPost = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="flex items-center justify-center">
        <p className="text-3xl font-semibold">Not Found</p>
      </div>
    );
  }

  const {
    data: itemData,
    isLoading,
    error,
  } = useLostItem(id, user?.college?.id!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <p className="text-3xl font-semibold">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center">
        <p className="text-3xl font-semibold">Error 404</p>
      </div>
    );
  }
  return (
    <div className="container mx-auto pt-6">
      <LostItemForm initialData={itemData?.data} />
    </div>
  );
};

export default EditLostItemPost;

import { CollegeForm } from "@/components/forms/collegeForm";
import { useGetCollegeById } from "@/hooks/useColleges";
import { useParams } from "react-router-dom";

const EditCollegePage = () => {
  const { id } = useParams<{ id: string }>();
  if (!id) return <div>Cannot edit College with out College ID.</div>;
  const { data, isLoading, isError } = useGetCollegeById(id);
  if (isLoading) return <div>Loading</div>;
  if (isError) return <div>Error</div>;
  return <CollegeForm initialData={data} />;
};

export default EditCollegePage;

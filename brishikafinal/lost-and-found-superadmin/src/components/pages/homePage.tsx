import { useAuth } from "@/contexts/AuthContext";

const HomePage = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-svh w-svw items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh min-w-svw flex-col items-center justify-center bg-red-300 text-2xl text-black">
      <p>User Email: {user?.email} </p>
      <p>User Role: {user?.role} </p>
      <p>User Loggedin: {user ? "Yes logged in" : "no user found"} </p>
    </div>
  );
};

export default HomePage;
